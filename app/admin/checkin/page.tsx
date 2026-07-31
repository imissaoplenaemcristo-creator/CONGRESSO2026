"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Participante = {
  id: string;
  qr_token: string | null;
  numero_inscricao: string | null;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  status_pagamento: string | null;
  checkin_realizado: boolean;
  checkin_em: string | null;
};

export default function CheckinPage() {
  const [busca, setBusca] = useState("");
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [cameraAtiva, setCameraAtiva] = useState(false);

  const scannerRef = useRef<any>(null);
  const leituraEmAndamento = useRef(false);

  async function buscarParticipantePorQrToken(token: string) {
    const codigo = token.trim();

    if (!codigo || leituraEmAndamento.current) {
      return;
    }

    leituraEmAndamento.current = true;
    setCarregando(true);
    setMensagem("QR Code lido. Buscando participante...");

    const { data, error } = await supabase
      .from("inscricoes")
      .select(
        `
          id,
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
      .single();

    if (error || !data) {
  console.error("ERRO SUPABASE:", error);
  alert(JSON.stringify(error));

  setMensagem("QR Code inválido ou participante não encontrado.");
  setParticipantes([]);
  setCarregando(false);

  setTimeout(() => {
    leituraEmAndamento.current = false;
  }, 2000);

  return;
}

    if ("vibrate" in navigator) {
      navigator.vibrate(150);
    }

    setParticipantes([data]);
    setMensagem(`Participante encontrado: ${data.nome}`);
    setCarregando(false);

    await pararCamera();
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
          id,
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

    if (error) {
      console.error(error);
      setMensagem("Não foi possível buscar o participante.");
      setParticipantes([]);
      setCarregando(false);
      return;
    }

    if (!data || data.length === 0) {
      setMensagem("Nenhum participante encontrado.");
      setParticipantes([]);
      setCarregando(false);
      return;
    }

    setParticipantes(data);
    setMensagem("");
    setCarregando(false);
  }

  async function iniciarCamera() {
    try {
      setMensagem("");
      setParticipantes([]);
      leituraEmAndamento.current = false;

      const { Html5Qrcode } = await import("html5-qrcode");

      if (scannerRef.current) {
        await pararCamera();
      }

      const scanner = new Html5Qrcode("leitor-qr-code");
      scannerRef.current = scanner;

      setCameraAtiva(true);

      await scanner.start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1,
        },
       async (codigoLido) => {
  console.log("QR LIDO:", codigoLido);
  alert(codigoLido);

  await buscarParticipantePorQrToken(codigoLido);
} ,
        () => {
          // Ignora tentativas sem leitura válida.
        }
      );
    } catch (error) {
  console.error(error);

  scannerRef.current = null;
  setCameraAtiva(false);

  const nomeErro =
    error instanceof Error ? error.name : "";

  if (nomeErro === "NotFoundError") {
    setMensagem(
      "Nenhuma câmera foi encontrada neste dispositivo. Use um celular, conecte uma webcam ou faça a busca manual."
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
    "Não foi possível abrir a câmera. Verifique o dispositivo e as permissões do navegador."
  );
}
  }

  async function pararCamera() {
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
  }

  async function confirmarCheckin(participante: Participante) {
    if (participante.checkin_realizado) {
      setMensagem("Este participante já realizou o check-in.");
      return;
    }

    setCarregando(true);
    setMensagem("");

    const horarioCheckin = new Date().toISOString();

    const { data, error } = await supabase
      .from("inscricoes")
      .update({
        checkin_realizado: true,
        checkin_em: horarioCheckin,
      })
      .eq("id", participante.id)
      .eq("checkin_realizado", false)
      .select(
        `
          id,
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
      .single();

    if (error || !data) {
      console.error(error);
      setMensagem(
        "Não foi possível confirmar o check-in. Ele pode já ter sido realizado."
      );
      setCarregando(false);
      return;
    }

    setParticipantes((listaAtual) =>
      listaAtual.map((item) =>
        item.id === data.id ? data : item
      )
    );

    setMensagem(
      `Check-in de ${participante.nome} realizado com sucesso!`
    );

    setCarregando(false);
  }

  function formatarData(data: string | null) {
    if (!data) {
      return "";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(data));
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-amber-400">
          Check-in
        </h1>

        <p className="mt-3 text-amber-100/70">
          Leia o QR Code ou pesquise o participante para confirmar
          sua entrada.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-amber-300/20 bg-[#2a1a12] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Leitor de QR Code
              </h2>

              <p className="mt-1 text-sm text-amber-100/60">
                Aponte a câmera para o QR Code do participante.
              </p>
            </div>

            {!cameraAtiva ? (
              <button
                type="button"
                onClick={iniciarCamera}
                className="rounded-xl bg-amber-400 px-5 py-3 font-black text-[#24140c] transition hover:bg-amber-300"
              >
                Abrir câmera
              </button>
            ) : (
              <button
                type="button"
                onClick={pararCamera}
                className="rounded-xl border border-red-400/40 bg-red-500/10 px-5 py-3 font-bold text-red-300 transition hover:bg-red-500/20"
              >
                Fechar câmera
              </button>
            )}
          </div>

          <div
            id="leitor-qr-code"
            className={`mt-6 overflow-hidden rounded-xl bg-black ${
              cameraAtiva ? "min-h-72" : ""
            }`}
          />

          {!cameraAtiva && (
            <div className="mt-6 flex min-h-72 items-center justify-center rounded-xl border-2 border-dashed border-amber-300/20 bg-[#1a110d] p-6">
              <div className="text-center">
                <p className="text-5xl">📷</p>

                <p className="mt-4 text-amber-100/60">
                  Clique em “Abrir câmera” para escanear o QR Code.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-amber-300/20 bg-[#2a1a12] p-6">
          <h2 className="text-xl font-bold text-white">
            Buscar participante
          </h2>

          <p className="mt-1 text-sm text-amber-100/60">
            Use esta opção quando não for possível ler o QR Code.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              onKeyDown={(evento) => {
                if (evento.key === "Enter") {
                  buscarParticipanteManual();
                }
              }}
              placeholder="Nome, CPF, telefone ou número da inscrição..."
              className="w-full rounded-xl border border-amber-300/20 bg-[#1a110d] px-4 py-3 text-white outline-none placeholder:text-amber-100/40 focus:border-amber-400"
            />

            <button
              type="button"
              onClick={buscarParticipanteManual}
              disabled={carregando}
              className="rounded-xl bg-amber-400 px-6 py-3 font-black text-[#24140c] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? "Aguarde..." : "Buscar"}
            </button>
          </div>
        </div>
      </div>

      {mensagem && (
        <div className="rounded-xl border border-amber-300/20 bg-[#2a1a12] p-4 text-amber-100">
          {mensagem}
        </div>
      )}

      <div className="space-y-4">
        {participantes.map((participante) => (
          <div
            key={participante.id}
            className="rounded-2xl border border-amber-300/20 bg-[#2a1a12] p-6"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  {participante.numero_inscricao
                    ? `Inscrição ${participante.numero_inscricao}`
                    : "Participante"}
                </p>

                <h2 className="mt-2 text-2xl font-black text-white">
                  {participante.nome}
                </h2>

                <div className="mt-4 space-y-1 text-sm text-amber-100/70">
                  <p>
                    CPF: {participante.cpf || "Não informado"}
                  </p>

                  <p>
                    Telefone:{" "}
                    {participante.telefone || "Não informado"}
                  </p>

                  <p>
                    Pagamento:{" "}
                    <span className="font-bold capitalize text-white">
                      {participante.status_pagamento || "Pendente"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="min-w-60">
                {participante.checkin_realizado ? (
                  <div className="rounded-xl border border-green-400/30 bg-green-400/10 p-4 text-center">
                    <p className="font-black text-green-400">
                      Check-in realizado
                    </p>

                    {participante.checkin_em && (
                      <p className="mt-1 text-sm text-green-100/70">
                        {formatarData(participante.checkin_em)}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => confirmarCheckin(participante)}
                    disabled={carregando}
                    className="w-full rounded-xl bg-green-500 px-6 py-3 font-black text-white transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Confirmar check-in
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}