"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Participante = {
  qr_token: string | null;
  numero_inscricao: string | null;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  status_pagamento: string | null;
  checkin_realizado: boolean | string | number | null;
  checkin_em: string | null;
};

type TipoRetorno = "sucesso" | "erro" | "pendente" | "duplicado" | null;

type HistoricoCheckin = {
  id: string;
  nome: string;
  numero: string;
  horario: string;
  status: "sucesso" | "bloqueado" | "duplicado";
};

const TEMPO_RETORNO_CAMERA = 1800;
const LIMITE_HISTORICO = 8;

function normalizarStatus(status: string | null) {
  return (status ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
}

function checkinJaRealizado(valor: Participante["checkin_realizado"]) {
  if (valor === true || valor === 1) return true;

  if (typeof valor === "string") {
    const normalizado = valor.trim().toLowerCase();

    return ["true", "1", "sim", "yes"].includes(normalizado);
  }

  return false;
}

function pagamentoLiberado(status: string | null) {
  const normalizado = normalizarStatus(status);

  return [
    "pago",
    "confirmado",
    "pagamento_confirmado",
    "gratuito",
    "isento",
  ].includes(normalizado);
}

function textoStatusPagamento(status: string | null) {
  const normalizado = normalizarStatus(status);

  if (["pago", "confirmado", "pagamento_confirmado"].includes(normalizado)) {
    return "Pagamento confirmado";
  }

  if (["gratuito", "isento"].includes(normalizado)) {
    return "Inscrição gratuita";
  }

  if (["analise", "em_analise", "pagamento_em_analise"].includes(normalizado)) {
    return "Pagamento em análise";
  }

  if (normalizado === "cancelado") {
    return "Inscrição cancelada";
  }

  return "Pagamento pendente";
}

export default function CheckinPage() {
  const [busca, setBusca] = useState("");
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [tipoRetorno, setTipoRetorno] = useState<TipoRetorno>(null);
  const [participanteRetorno, setParticipanteRetorno] =
    useState<Participante | null>(null);
  const [historico, setHistorico] = useState<HistoricoCheckin[]>([]);
  const [modoTelaCheia, setModoTelaCheia] = useState(false);

  const scannerRef = useRef<any>(null);
  const leituraEmAndamento = useRef(false);
  const cameraDesejada = useRef(false);
  const reinicioTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const totalSucesso = useMemo(
    () => historico.filter((item) => item.status === "sucesso").length,
    [historico]
  );

  const tocarSom = useCallback((tipo: "sucesso" | "erro") => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextClass) return;

      const contexto =
        audioContextRef.current ?? new AudioContextClass();

      audioContextRef.current = contexto;

      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();

      oscilador.connect(ganho);
      ganho.connect(contexto.destination);

      oscilador.type = tipo === "sucesso" ? "sine" : "square";
      oscilador.frequency.setValueAtTime(
        tipo === "sucesso" ? 880 : 220,
        contexto.currentTime
      );

      if (tipo === "sucesso") {
        oscilador.frequency.exponentialRampToValueAtTime(
          1320,
          contexto.currentTime + 0.18
        );
      }

      ganho.gain.setValueAtTime(0.18, contexto.currentTime);
      ganho.gain.exponentialRampToValueAtTime(
        0.001,
        contexto.currentTime + 0.28
      );

      oscilador.start();
      oscilador.stop(contexto.currentTime + 0.3);
    } catch (erro) {
      console.error("Não foi possível reproduzir o som:", erro);
    }
  }, []);

  const vibrar = useCallback((tipo: "sucesso" | "erro") => {
    if (!("vibrate" in navigator)) return;

    navigator.vibrate(
      tipo === "sucesso" ? [120, 60, 120] : [250, 100, 250]
    );
  }, []);

  const adicionarHistorico = useCallback(
    (
      participante: Participante,
      status: HistoricoCheckin["status"]
    ) => {
      setHistorico((atual) => [
        {
          id: `${participante.qr_token ?? participante.numero_inscricao}-${Date.now()}`,
          nome: participante.nome,
          numero: participante.numero_inscricao ?? "Sem número",
          horario: new Intl.DateTimeFormat("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }).format(new Date()),
          status,
        },
        ...atual,
      ].slice(0, LIMITE_HISTORICO));
    },
    []
  );

  const limparRetorno = useCallback(() => {
    setTipoRetorno(null);
    setParticipanteRetorno(null);
    setMensagem("");
    setParticipantes([]);
    leituraEmAndamento.current = false;
  }, []);

  const pararCamera = useCallback(async () => {
    if (!scannerRef.current) {
      setCameraAtiva(false);
      return;
    }

    try {
      const scanner = scannerRef.current;

      if (scanner.isScanning) {
        await scanner.stop();
      }

      await scanner.clear();
    } catch (error) {
      console.error("Erro ao fechar a câmera:", error);
    } finally {
      scannerRef.current = null;
      setCameraAtiva(false);
    }
  }, []);

  const iniciarCamera = useCallback(async () => {
    if (scannerRef.current?.isScanning) return;

    try {
      setMensagem("");
      leituraEmAndamento.current = false;
      cameraDesejada.current = true;

      const { Html5Qrcode } = await import("html5-qrcode");

      if (scannerRef.current) {
        await pararCamera();
      }

      const scanner = new Html5Qrcode("leitor-qr-code");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 12,
          qrbox: (largura: number, altura: number) => {
            const tamanho = Math.floor(Math.min(largura, altura) * 0.72);

            return {
              width: Math.max(220, Math.min(tamanho, 320)),
              height: Math.max(220, Math.min(tamanho, 320)),
            };
          },
          aspectRatio: 1,
          disableFlip: false,
        },
        async (codigoLido: string) => {
          await processarQrCode(codigoLido);
        },
        () => {
          // Leituras incompletas são esperadas enquanto a câmera procura o QR Code.
        }
      );

      setCameraAtiva(true);
    } catch (error) {
      console.error(error);

      scannerRef.current = null;
      setCameraAtiva(false);
      cameraDesejada.current = false;

      const nomeErro = error instanceof Error ? error.name : "";

      if (nomeErro === "NotFoundError") {
        setMensagem(
          "Nenhuma câmera foi encontrada. Use um celular, conecte uma webcam ou faça a busca manual."
        );
        return;
      }

      if (nomeErro === "NotAllowedError") {
        setMensagem(
          "O acesso à câmera foi bloqueado. Autorize a câmera nas permissões do navegador."
        );
        return;
      }

      setMensagem(
        "Não foi possível abrir a câmera. Verifique o dispositivo, o HTTPS e as permissões do navegador."
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pararCamera]);

  const agendarRetornoCamera = useCallback(() => {
    if (reinicioTimeout.current) {
      clearTimeout(reinicioTimeout.current);
    }

    reinicioTimeout.current = setTimeout(async () => {
      limparRetorno();

      if (cameraDesejada.current) {
        await iniciarCamera();
      }
    }, TEMPO_RETORNO_CAMERA);
  }, [iniciarCamera, limparRetorno]);

  const mostrarRetorno = useCallback(
    async (
      tipo: Exclude<TipoRetorno, null>,
      participante: Participante | null,
      texto: string
    ) => {
      setTipoRetorno(tipo);
      setParticipanteRetorno(participante);
      setMensagem(texto);

      if (tipo === "sucesso") {
        tocarSom("sucesso");
        vibrar("sucesso");
      } else {
        tocarSom("erro");
        vibrar("erro");
      }

      await pararCamera();
      agendarRetornoCamera();
    },
    [agendarRetornoCamera, pararCamera, tocarSom, vibrar]
  );

  async function processarQrCode(token: string) {
    const codigo = token.trim();

    if (!codigo || leituraEmAndamento.current) return;

    leituraEmAndamento.current = true;
    setCarregando(true);
    setMensagem("QR Code lido. Validando inscrição...");

    const { data, error } = await supabase
      .from("inscricoes")
      .select(
        `
          qr_token,
          numero_inscricao,
          nome,
          cpf,
          telefone,
          status_pagamento,
          checkin_realizado,
          checkin_em
        `
      )
      .eq("qr_token", codigo)
      .maybeSingle();

    setCarregando(false);

    if (error || !data) {
      console.error("Erro ao consultar QR Code:", error);

      await mostrarRetorno(
        "erro",
        null,
        "QR Code inválido ou participante não encontrado."
      );
      return;
    }

    if (checkinJaRealizado(data.checkin_realizado)) {
      adicionarHistorico(data, "duplicado");

      await mostrarRetorno(
        "duplicado",
        data,
        "Check-in já realizado anteriormente."
      );
      return;
    }

    if (!pagamentoLiberado(data.status_pagamento)) {
      adicionarHistorico(data, "bloqueado");

      await mostrarRetorno(
        "pendente",
        data,
        `${textoStatusPagamento(data.status_pagamento)}. Entrada não liberada.`
      );
      return;
    }

    const horarioCheckin = new Date().toISOString();

    const { data: atualizado, error: erroAtualizacao } = await supabase
      .from("inscricoes")
      .update({
        checkin_realizado: true,
        checkin_em: horarioCheckin,
      })
      .eq("qr_token", data.qr_token)
      .select(
        `
          qr_token,
          numero_inscricao,
          nome,
          cpf,
          telefone,
          status_pagamento,
          checkin_realizado,
          checkin_em
        `
      )
      .maybeSingle();

    if (erroAtualizacao || !atualizado) {
      console.error("Erro ao confirmar check-in:", erroAtualizacao);

      const { data: consultaAtual } = await supabase
        .from("inscricoes")
        .select(
          `
            qr_token,
            numero_inscricao,
            nome,
            cpf,
            telefone,
            status_pagamento,
            checkin_realizado,
            checkin_em
          `
        )
        .eq("qr_token", data.qr_token)
        .maybeSingle();

      if (consultaAtual && checkinJaRealizado(consultaAtual.checkin_realizado)) {
        adicionarHistorico(consultaAtual, "duplicado");

        await mostrarRetorno(
          "duplicado",
          consultaAtual,
          "Check-in já realizado anteriormente."
        );
        return;
      }

      await mostrarRetorno(
        "erro",
        data,
        "Não foi possível confirmar o check-in. Tente novamente."
      );
      return;
    }

    setParticipantes([atualizado]);
    adicionarHistorico(atualizado, "sucesso");

    await mostrarRetorno(
      "sucesso",
      atualizado,
      `Entrada liberada para ${atualizado.nome}.`
    );
  }

  async function buscarParticipanteManual() {
    const termo = busca.trim();

    if (!termo) {
      setMensagem(
        "Digite o nome, CPF, telefone ou número da inscrição."
      );
      setParticipantes([]);
      return;
    }

    setCarregando(true);
    setMensagem("");

    const termoSeguro = termo.replace(/[,()]/g, "");

    const { data, error } = await supabase
      .from("inscricoes")
      .select(
        `
          qr_token,
          numero_inscricao,
          nome,
          cpf,
          telefone,
          status_pagamento,
          checkin_realizado,
          checkin_em
        `
      )
      .or(
        `nome.ilike.%${termoSeguro}%,cpf.ilike.%${termoSeguro}%,telefone.ilike.%${termoSeguro}%,numero_inscricao.ilike.%${termoSeguro}%`
      )
      .limit(10);

    setCarregando(false);

    if (error) {
      console.error(error);
      setMensagem("Não foi possível buscar o participante.");
      setParticipantes([]);
      return;
    }

    if (!data?.length) {
      setMensagem("Nenhum participante encontrado.");
      setParticipantes([]);
      return;
    }

    setParticipantes(data);
  }

  async function confirmarCheckinManual(participante: Participante) {
    if (checkinJaRealizado(participante.checkin_realizado)) {
      adicionarHistorico(participante, "duplicado");

      await mostrarRetorno(
        "duplicado",
        participante,
        "Este participante já realizou o check-in."
      );
      return;
    }

    if (!pagamentoLiberado(participante.status_pagamento)) {
      adicionarHistorico(participante, "bloqueado");

      await mostrarRetorno(
        "pendente",
        participante,
        `${textoStatusPagamento(participante.status_pagamento)}. Entrada não liberada.`
      );
      return;
    }

    setCarregando(true);

    const horarioCheckin = new Date().toISOString();

    const { data, error } = await supabase
      .from("inscricoes")
      .update({
        checkin_realizado: true,
        checkin_em: horarioCheckin,
      })
      .eq("qr_token", participante.qr_token)
      .select(
        `
          qr_token,
          numero_inscricao,
          nome,
          cpf,
          telefone,
          status_pagamento,
          checkin_realizado,
          checkin_em
        `
      )
      .maybeSingle();

    setCarregando(false);

    if (error || !data) {
      console.error(error);

      await mostrarRetorno(
        "erro",
        participante,
        "Não foi possível confirmar o check-in. Ele pode já ter sido realizado."
      );
      return;
    }

    setParticipantes((listaAtual) =>
      listaAtual.map((item) =>
        item.qr_token === data.qr_token ? data : item
      )
    );

    adicionarHistorico(data, "sucesso");

    await mostrarRetorno(
      "sucesso",
      data,
      `Entrada liberada para ${data.nome}.`
    );
  }

  function formatarData(data: string | null) {
    if (!data) return "";

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(data));
  }

  async function alternarTelaCheia() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (erro) {
      console.error("Não foi possível alterar a tela cheia:", erro);
    }
  }

  useEffect(() => {
    const aoAlterarTelaCheia = () => {
      setModoTelaCheia(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", aoAlterarTelaCheia);

    return () => {
      document.removeEventListener("fullscreenchange", aoAlterarTelaCheia);
    };
  }, []);

  useEffect(() => {
    return () => {
      cameraDesejada.current = false;

      if (reinicioTimeout.current) {
        clearTimeout(reinicioTimeout.current);
      }

      if (scannerRef.current?.isScanning) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }

      audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  const estilosRetorno = {
    sucesso: {
      fundo: "bg-emerald-600",
      icone: "✅",
      titulo: "ENTRADA LIBERADA",
    },
    erro: {
      fundo: "bg-red-600",
      icone: "❌",
      titulo: "QR CODE INVÁLIDO",
    },
    pendente: {
      fundo: "bg-blue-700",
      icone: "🔒",
      titulo: "ENTRADA BLOQUEADA",
    },
    duplicado: {
      fundo: "bg-orange-600",
      icone: "⚠️",
      titulo: "CHECK-IN DUPLICADO",
    },
  };

  return (
    <div className="space-y-6 pb-10">
      {tipoRetorno && (
        <div
          className={`fixed inset-0 z-[100] flex animate-[fadeIn_.15s_ease-out] items-center justify-center p-5 text-white ${estilosRetorno[tipoRetorno].fundo}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="w-full max-w-3xl animate-[zoomIn_.18s_ease-out] text-center">
            <div className="text-7xl sm:text-9xl">
              {estilosRetorno[tipoRetorno].icone}
            </div>

            <p className="mt-5 text-sm font-black uppercase tracking-[0.3em] text-white/80 sm:text-lg">
              {estilosRetorno[tipoRetorno].titulo}
            </p>

            {participanteRetorno && (
              <>
                <h2 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
                  {participanteRetorno.nome}
                </h2>

                <p className="mt-4 text-2xl font-black sm:text-4xl">
                  Inscrição{" "}
                  {participanteRetorno.numero_inscricao ?? "sem número"}
                </p>

                <p className="mt-3 text-lg font-bold text-white/85 sm:text-2xl">
                  {textoStatusPagamento(
                    participanteRetorno.status_pagamento
                  )}
                </p>
              </>
            )}

            <p className="mx-auto mt-6 max-w-2xl text-xl font-bold sm:text-3xl">
              {mensagem}
            </p>

            <p className="mt-8 text-sm font-semibold text-white/70">
              A câmera será reaberta automaticamente...
            </p>

            <button
              type="button"
              onClick={async () => {
                if (reinicioTimeout.current) {
                  clearTimeout(reinicioTimeout.current);
                }

                limparRetorno();

                if (cameraDesejada.current) {
                  await iniciarCamera();
                }
              }}
              className="mt-6 rounded-2xl bg-white px-7 py-4 text-lg font-black text-black shadow-xl transition active:scale-95"
            >
              Continuar agora
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-amber-400 sm:text-4xl">
            Check-in profissional
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-amber-100/70 sm:text-base">
            A leitura confirma automaticamente participantes com pagamento
            liberado e reabre a câmera após cada resultado.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Nesta sessão
            </p>
            <p className="text-2xl font-black text-white">{totalSucesso}</p>
          </div>

          <button
            type="button"
            onClick={alternarTelaCheia}
            className="rounded-xl border border-amber-300/20 bg-[#2a1a12] px-4 py-3 font-bold text-amber-100 transition hover:bg-[#382218] active:scale-95"
          >
            {modoTelaCheia ? "↙️ Sair da tela cheia" : "⛶ Tela cheia"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <section className="overflow-hidden rounded-3xl border border-amber-300/20 bg-[#2a1a12] shadow-xl">
          <div className="flex flex-col gap-4 border-b border-amber-300/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-black text-white">
                Leitor automático
              </h2>

              <p className="mt-1 text-sm text-amber-100/60">
                Mantenha o QR Code dentro do quadrado.
              </p>
            </div>

            {!cameraAtiva ? (
              <button
                type="button"
                onClick={iniciarCamera}
                className="rounded-xl bg-amber-400 px-5 py-3 font-black text-[#24140c] transition hover:bg-amber-300 active:scale-95"
              >
                📷 Abrir câmera
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  cameraDesejada.current = false;
                  await pararCamera();
                }}
                className="rounded-xl border border-red-400/40 bg-red-500/10 px-5 py-3 font-bold text-red-300 transition hover:bg-red-500/20 active:scale-95"
              >
                Fechar câmera
              </button>
            )}
          </div>

          <div className="relative bg-black">
            <div
              id="leitor-qr-code"
              className={`w-full overflow-hidden ${
                cameraAtiva ? "min-h-[360px] sm:min-h-[500px]" : ""
              }`}
            />

            {!cameraAtiva && (
              <div className="flex min-h-[360px] items-center justify-center p-6 sm:min-h-[500px]">
                <div className="text-center">
                  <p className="text-6xl">📷</p>
                  <p className="mt-4 font-bold text-white">
                    Câmera desligada
                  </p>
                  <p className="mt-2 max-w-sm text-sm text-white/55">
                    Abra a câmera em um celular ou tablet e autorize a
                    permissão no navegador.
                  </p>
                </div>
              </div>
            )}

            {cameraAtiva && carregando && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/65">
                <div className="rounded-2xl bg-white px-6 py-4 text-center text-black shadow-2xl">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-black/20 border-t-black" />
                  <p className="mt-3 font-black">Validando inscrição...</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-amber-300/20 bg-[#2a1a12] p-5 shadow-xl sm:p-6">
            <h2 className="text-xl font-black text-white">
              Busca manual
            </h2>

            <p className="mt-1 text-sm text-amber-100/60">
              Use quando o QR Code não puder ser lido.
            </p>

            <div className="mt-5 space-y-3">
              <input
                type="text"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter") {
                    buscarParticipanteManual();
                  }
                }}
                placeholder="Nome, CPF, telefone ou inscrição"
                className="w-full rounded-xl border border-amber-300/20 bg-[#1a110d] px-4 py-4 text-base text-white outline-none placeholder:text-amber-100/35 focus:border-amber-400"
              />

              <button
                type="button"
                onClick={buscarParticipanteManual}
                disabled={carregando}
                className="w-full rounded-xl bg-amber-400 px-6 py-4 font-black text-[#24140c] transition hover:bg-amber-300 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando ? "Aguarde..." : "🔎 Buscar participante"}
              </button>
            </div>

            {mensagem && !tipoRetorno && (
              <div className="mt-4 rounded-xl border border-amber-300/20 bg-[#1a110d] p-4 text-sm font-semibold text-amber-100">
                {mensagem}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-amber-300/20 bg-[#2a1a12] p-5 shadow-xl sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">
                  Últimas leituras
                </h2>
                <p className="mt-1 text-sm text-amber-100/60">
                  Histórico desta sessão.
                </p>
              </div>

              {historico.length > 0 && (
                <button
                  type="button"
                  onClick={() => setHistorico([])}
                  className="text-xs font-bold text-amber-300 hover:text-amber-200"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {historico.length === 0 ? (
                <div className="rounded-xl border border-dashed border-amber-300/15 p-5 text-center text-sm text-amber-100/45">
                  Nenhuma leitura nesta sessão.
                </div>
              ) : (
                historico.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl bg-[#1a110d] p-3"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                        item.status === "sucesso"
                          ? "bg-emerald-500/15"
                          : item.status === "duplicado"
                            ? "bg-orange-500/15"
                            : "bg-red-500/15"
                      }`}
                    >
                      {item.status === "sucesso"
                        ? "✅"
                        : item.status === "duplicado"
                          ? "⚠️"
                          : "🔒"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-white">
                        {item.nome}
                      </p>
                      <p className="text-xs text-amber-100/50">
                        Inscrição {item.numero} • {item.horario}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {participantes.length > 0 && !tipoRetorno && (
        <section className="space-y-4">
          <h2 className="text-xl font-black text-white">
            Resultado da busca
          </h2>

          {participantes.map((participante) => {
            const liberado = pagamentoLiberado(
              participante.status_pagamento
            );

            return (
              <div
                key={
                  participante.qr_token ??
                  participante.numero_inscricao ??
                  participante.nome
                }
                className="rounded-2xl border border-amber-300/20 bg-[#2a1a12] p-5 shadow-lg sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                      {participante.numero_inscricao
                        ? `Inscrição ${participante.numero_inscricao}`
                        : "Participante"}
                    </p>

                    <h3 className="mt-2 text-2xl font-black text-white">
                      {participante.nome}
                    </h3>

                    <div className="mt-3 space-y-1 text-sm text-amber-100/65">
                      <p>CPF: {participante.cpf || "Não informado"}</p>
                      <p>
                        Telefone:{" "}
                        {participante.telefone || "Não informado"}
                      </p>
                    </div>

                    <div
                      className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-sm font-black ${
                        liberado
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-red-500/15 text-red-300"
                      }`}
                    >
                      {liberado ? "✅" : "🔒"}{" "}
                      {textoStatusPagamento(
                        participante.status_pagamento
                      )}
                    </div>
                  </div>

                  <div className="w-full lg:w-72">
                    {checkinJaRealizado(participante.checkin_realizado) ? (
                      <div className="rounded-xl border border-orange-400/30 bg-orange-400/10 p-4 text-center">
                        <p className="font-black text-orange-300">
                          Check-in já realizado
                        </p>

                        {participante.checkin_em && (
                          <p className="mt-1 text-sm text-orange-100/70">
                            {formatarData(participante.checkin_em)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          confirmarCheckinManual(participante)
                        }
                        disabled={carregando || !liberado}
                        className={`w-full rounded-xl px-6 py-4 font-black text-white transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60 ${
                          liberado
                            ? "bg-emerald-500 hover:bg-emerald-400"
                            : "bg-red-700"
                        }`}
                      >
                        {liberado
                          ? "✅ Confirmar check-in"
                          : "🔒 Pagamento não liberado"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.94);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        #leitor-qr-code video {
          width: 100% !important;
          min-height: 360px;
          object-fit: cover;
        }

        #leitor-qr-code img {
          display: none;
        }

        #leitor-qr-code__dashboard {
          display: none;
        }

        @media (min-width: 640px) {
          #leitor-qr-code video {
            min-height: 500px;
          }
        }
      `}</style>
    </div>
  );
}