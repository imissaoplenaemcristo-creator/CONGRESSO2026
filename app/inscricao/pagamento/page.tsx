"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const CHAVE_PIX = "14.847.657/0001-01";

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function normalizarFormaPagamento(valor: string) {
  return valor
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function PagamentoPage() {
  const router = useRouter();

  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [token, setToken] = useState("");
  const [pagamento, setPagamento] = useState("");
  const [valor, setValor] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [chaveCopiada, setChaveCopiada] = useState(false);
  const [arquivoComprovante, setArquivoComprovante] =
    useState<File | null>(null);
  const [enviandoComprovante, setEnviandoComprovante] =
    useState(false);
  const [comprovanteEnviado, setComprovanteEnviado] =
    useState(false);
  const [mensagemComprovante, setMensagemComprovante] =
    useState("");
  const [statusComprovante, setStatusComprovante] =
    useState("");
  const [motivoRecusa, setMotivoRecusa] = useState("");

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);

    const numeroRecebido = parametros.get("numero")?.trim() ?? "";
    const nomeRecebido = parametros.get("nome")?.trim() ?? "";
    const tokenRecebido = parametros.get("token")?.trim() ?? "";
    const pagamentoRecebido = normalizarFormaPagamento(
      parametros.get("pagamento") ?? ""
    );

    const valorParametro = parametros.get("valor");
    const valorRecebido = Number(valorParametro ?? 0);

    setNumero(numeroRecebido);
    setNome(nomeRecebido);
    setToken(tokenRecebido);
    setPagamento(pagamentoRecebido);
    setValor(
      Number.isFinite(valorRecebido) && valorRecebido >= 0
        ? valorRecebido
        : 0
    );
    async function verificarComprovanteExistente() {
      if (!tokenRecebido) {
        setCarregando(false);
        return;
      }

      const { data, error } = await supabase.rpc(
        "consultar_status_comprovante_pix",
        {
          token_informado: tokenRecebido,
        }
      );

      if (!error && data) {
        const statusAtual = String(
          data.comprovante_status ?? ""
        ).toLowerCase();

        const pagamentoAtual = String(
          data.status_pagamento ?? ""
        ).toLowerCase();

        setStatusComprovante(statusAtual);
        setMotivoRecusa(
          String(data.comprovante_recusado_motivo ?? "")
        );

        if (pagamentoAtual === "pago") {
          setComprovanteEnviado(true);
          setMensagemComprovante(
            "Pagamento confirmado. Seu QR Code está liberado para o check-in."
          );
        } else if (statusAtual === "recusado") {
          setComprovanteEnviado(false);
          setMensagemComprovante(
            "O comprovante foi recusado. Envie um novo arquivo."
          );
        } else if (
          statusAtual === "em_analise" ||
          data.comprovante_path
        ) {
          setComprovanteEnviado(true);
          setMensagemComprovante(
            "Recebemos seu comprovante. O pagamento está em análise."
          );
        }
      }

      setCarregando(false);
    }

    verificarComprovanteExistente();
  }, []);

  const inscricaoGratuita = valor === 0;

  const formaPagamentoValida = useMemo(() => {
    if (inscricaoGratuita) {
      return true;
    }

    return ["pix", "dinheiro", "cartao", "carne"].includes(pagamento);
  }, [inscricaoGratuita, pagamento]);

  const formaPagamentoFormatada = useMemo(() => {
    if (inscricaoGratuita) {
      return "Inscrição gratuita";
    }

    const formas: Record<string, string> = {
      pix: "PIX",
      dinheiro: "Dinheiro",
      cartao: "Cartão",
      carne: "Carnê",
    };

    return formas[pagamento] ?? "Não identificada";
  }, [inscricaoGratuita, pagamento]);

  async function copiarChavePix() {
    try {
      await navigator.clipboard.writeText(CHAVE_PIX);
      setChaveCopiada(true);

      window.setTimeout(() => {
        setChaveCopiada(false);
      }, 2500);
    } catch (erro) {
      console.error("Erro ao copiar chave PIX:", erro);

      window.prompt("Copie a chave PIX abaixo:", CHAVE_PIX);
    }
  }

  function selecionarComprovante(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const arquivo = event.target.files?.[0] ?? null;

    setMensagemComprovante("");

    if (!arquivo) {
      setArquivoComprovante(null);
      return;
    }

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      setArquivoComprovante(null);
      setMensagemComprovante(
        "Formato não aceito. Envie JPG, PNG, WEBP ou PDF."
      );
      event.target.value = "";
      return;
    }

    if (arquivo.size > 10 * 1024 * 1024) {
      setArquivoComprovante(null);
      setMensagemComprovante(
        "O arquivo deve ter no máximo 10 MB."
      );
      event.target.value = "";
      return;
    }

    setArquivoComprovante(arquivo);
  }

  async function enviarComprovantePix() {
    if (!arquivoComprovante) {
      setMensagemComprovante(
        "Selecione uma imagem ou PDF do comprovante."
      );
      return;
    }

    if (!token) {
      setMensagemComprovante(
        "Não foi possível identificar a inscrição."
      );
      return;
    }

    setEnviandoComprovante(true);
    setMensagemComprovante("");

    try {
      const extensaoOriginal =
        arquivoComprovante.name.split(".").pop()?.toLowerCase() ||
        (arquivoComprovante.type === "application/pdf"
          ? "pdf"
          : "jpg");

      const extensaoSegura = extensaoOriginal.replace(
        /[^a-z0-9]/g,
        ""
      );

      const caminhoArquivo = `${token}/${Date.now()}-comprovante.${extensaoSegura}`;

      const { error: erroUpload } = await supabase.storage
        .from("comprovantes-pix")
        .upload(caminhoArquivo, arquivoComprovante, {
          cacheControl: "3600",
          upsert: false,
          contentType: arquivoComprovante.type,
        });

      if (erroUpload) {
        console.error("Erro no upload:", erroUpload);
        setMensagemComprovante(
          `Não foi possível enviar o comprovante: ${erroUpload.message}`
        );
        return;
      }

      const { data, error: erroRegistro } = await supabase.rpc(
        "registrar_comprovante_pix",
        {
          token_informado: token,
          caminho_arquivo: caminhoArquivo,
        }
      );

      if (erroRegistro || !data) {
        console.error("Erro ao registrar comprovante:", erroRegistro);
        setMensagemComprovante(
          erroRegistro?.message ||
            "O arquivo foi enviado, mas não foi possível registrar o comprovante."
        );
        return;
      }

      setComprovanteEnviado(true);
      setStatusComprovante("em_analise");
      setMotivoRecusa("");
      setArquivoComprovante(null);
      setMensagemComprovante(
        "Comprovante enviado com sucesso! O pagamento está em análise."
      );
    } catch (erro) {
      console.error("Erro inesperado ao enviar comprovante:", erro);
      setMensagemComprovante(
        "Ocorreu um erro inesperado. Tente novamente."
      );
    } finally {
      setEnviandoComprovante(false);
    }
  }

  function continuar() {
    if (!numero || !token) {
      alert(
        "Não foi possível localizar os dados da inscrição. Volte e tente novamente."
      );
      return;
    }

    if (
      pagamento === "pix" &&
      !inscricaoGratuita &&
      !comprovanteEnviado
    ) {
      alert(
        "Envie o comprovante do PIX antes de continuar."
      );
      return;
    }

    const parametros = new URLSearchParams({
      numero,
      token,
      nome,
    });

    router.push(`/inscricao/sucesso?${parametros.toString()}`);
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] px-4 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amber-300/30 border-t-amber-300" />

          <p className="mt-5 text-lg font-semibold">
            Carregando dados da inscrição...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] px-4 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-amber-100/70 sm:text-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
            ✓
          </span>

          <span className="h-px w-8 bg-amber-300/40 sm:w-14" />

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-[#2b180d]">
            2
          </span>

          <span className="h-px w-8 bg-amber-300/40 sm:w-14" />

          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300/40 bg-white/5 text-amber-100">
            3
          </span>
        </div>

        <div className="mb-6 flex justify-center gap-7 text-xs font-semibold text-amber-100/60 sm:gap-12">
          <span>Cadastro</span>
          <span>Pagamento</span>
          <span>Comprovante</span>
        </div>

        <div className="overflow-hidden rounded-[28px] border-2 border-[#c38a38] bg-[#f8f1e6] text-[#3d2416] shadow-2xl">
          <img
            src="/flyer-congresso-2026.jpg"
            alt="Arte oficial do Congresso 2026"
            className="h-auto w-full object-cover"
          />

          <div className="px-5 py-8 text-center sm:px-8 md:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-600 text-3xl shadow-lg">
              💳
            </div>

            <h1 className="mt-5 text-3xl font-black sm:text-4xl">
              Pagamento da inscrição
            </h1>

            <p className="mt-3 text-lg font-bold">
              {nome || "Participante"}
            </p>

            <p className="mt-2 text-sm font-black uppercase tracking-[0.1em] text-[#81542e]">
              Inscrição nº{" "}
              {numero ? numero.padStart(5, "0") : "-----"}
            </p>

            {!numero || !token ? (
              <div className="mt-6 rounded-2xl border-2 border-red-500 bg-red-50 p-5 text-left text-red-800">
                <p className="font-black">
                  Não foi possível identificar a inscrição
                </p>

                <p className="mt-2 text-sm font-semibold">
                  Volte ao formulário e tente realizar a inscrição novamente.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border-2 border-[#c38a38] bg-white p-5">
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-[#81542e]">
                      Valor
                    </p>

                    <p className="mt-2 text-3xl font-black">
                      {inscricaoGratuita
                        ? "Gratuito"
                        : formatarMoeda(valor)}
                    </p>
                  </div>

                  <div className="rounded-2xl border-2 border-[#c38a38] bg-white p-5">
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-[#81542e]">
                      Forma escolhida
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      {formaPagamentoFormatada}
                    </p>
                  </div>
                </div>

                {inscricaoGratuita && (
                  <div className="mt-6 rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-6">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">
                      ✓
                    </div>

                    <p className="mt-4 text-2xl font-black text-emerald-700">
                      Inscrição gratuita
                    </p>

                    <p className="mt-2 font-semibold text-emerald-800">
                      Não é necessário realizar nenhum pagamento.
                    </p>

                    <p className="mt-2 text-sm text-emerald-700">
                      Continue para acessar o comprovante e o QR Code de
                      entrada.
                    </p>
                  </div>
                )}

                {pagamento === "pix" && !inscricaoGratuita && (
                  <div className="mt-6 rounded-2xl border-2 border-[#c38a38] bg-white p-5 sm:p-6">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">
                      ◆
                    </div>

                    <h2 className="mt-4 text-2xl font-black">
                      Pagamento via PIX
                    </h2>

                    <p className="mt-2 text-sm font-semibold text-[#6e4a32]">
                      Escaneie o QR Code pelo aplicativo do seu banco.
                    </p>

                    <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-[#ead8b8] bg-white p-3 shadow-sm">
                      <img
                        src="/qr-code-pix.png"
                        alt="QR Code para pagamento via PIX"
                        className="mx-auto h-auto w-full max-w-[280px]"
                      />
                    </div>

                    <div className="mt-6 rounded-2xl border border-[#e4cfaa] bg-[#f8f1e6] p-5">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#81542e]">
                        Chave PIX — CNPJ
                      </p>

                      <p className="mt-3 break-all text-xl font-black sm:text-2xl">
                        {CHAVE_PIX}
                      </p>

                      <button
                        type="button"
                        onClick={copiarChavePix}
                        className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-5 py-3 font-black text-[#2b180d] shadow-md transition hover:brightness-105 active:scale-[0.99]"
                      >
                        {chaveCopiada
                          ? "✅ Chave PIX copiada"
                          : "📋 Copiar chave PIX"}
                      </button>
                    </div>

                    <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-50 p-4 text-left">
                      <p className="font-black text-amber-900">
                        Importante
                      </p>

                      <p className="mt-1 text-sm font-semibold text-amber-800">
                        Após realizar o pagamento, anexe o comprovante abaixo.
                        O pagamento ficará em análise até a conferência da
                        organização.
                      </p>
                    </div>

                    <div className="mt-6 rounded-2xl border-2 border-dashed border-[#c38a38] bg-[#fffaf2] p-5 text-left">
                      <h3 className="text-xl font-black text-[#3d2416]">
                        📎 Enviar comprovante
                      </h3>

                      <p className="mt-2 text-sm font-semibold text-[#6e4a32]">
                        Envie uma foto ou PDF. Formatos aceitos: JPG, PNG,
                        WEBP e PDF, com até 10 MB.
                      </p>

                      {statusComprovante === "em_analise" &&
                      comprovanteEnviado ? (
                        <div className="mt-5 rounded-xl border-2 border-amber-500 bg-amber-50 p-5 text-center">
                          <p className="text-xl font-black text-amber-800">
                            🟡 Pagamento em análise
                          </p>

                          <p className="mt-3 text-sm font-semibold leading-6 text-amber-900">
                            Recebemos seu comprovante de pagamento.
                            Nossa equipe fará a conferência em breve.
                          </p>

                          <p className="mt-2 text-sm font-semibold text-amber-800">
                            Aguarde a aprovação para liberação do QR Code.
                          </p>
                        </div>
                      ) : statusComprovante === "recusado" ? (
                        <>
                          <div className="mt-5 rounded-xl border-2 border-red-500 bg-red-50 p-5 text-center">
                            <p className="text-xl font-black text-red-700">
                              🔴 Comprovante recusado
                            </p>

                            <p className="mt-3 text-sm font-bold text-red-800">
                              Motivo:
                            </p>

                            <p className="mt-1 text-sm font-semibold leading-6 text-red-800">
                              {motivoRecusa ||
                                "O comprovante não pôde ser aprovado."}
                            </p>

                            <p className="mt-3 text-sm font-semibold text-red-700">
                              Envie um novo comprovante para uma nova análise.
                            </p>
                          </div>

                          <label className="mt-5 block cursor-pointer rounded-xl border-2 border-[#c38a38] bg-white p-4 text-center font-black transition hover:bg-amber-50">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              onChange={selecionarComprovante}
                              className="hidden"
                            />

                            📎 Escolher novo comprovante
                          </label>

                          {arquivoComprovante && (
                            <div className="mt-4 rounded-xl bg-[#f8f1e6] p-4">
                              <p className="text-sm font-black text-[#81542e]">
                                Arquivo selecionado
                              </p>

                              <p className="mt-1 break-all font-semibold">
                                {arquivoComprovante.name}
                              </p>

                              <p className="mt-1 text-sm text-[#6e4a32]">
                                {(arquivoComprovante.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={enviarComprovantePix}
                            disabled={
                              !arquivoComprovante ||
                              enviandoComprovante
                            }
                            className="mt-4 w-full rounded-xl bg-emerald-600 px-5 py-4 font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {enviandoComprovante
                              ? "Enviando novo comprovante..."
                              : "Enviar novo comprovante"}
                          </button>
                        </>
                      ) : comprovanteEnviado ? (
                        <div className="mt-5 rounded-xl border-2 border-emerald-600 bg-emerald-50 p-5 text-center">
                          <p className="text-xl font-black text-emerald-700">
                            ✅ Pagamento confirmado
                          </p>

                          <p className="mt-2 text-sm font-semibold text-emerald-800">
                            Seu QR Code está liberado para o check-in.
                          </p>
                        </div>
                      ) : (
                        <>
                          <label className="mt-5 block cursor-pointer rounded-xl border-2 border-[#c38a38] bg-white p-4 text-center font-black transition hover:bg-amber-50">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              onChange={selecionarComprovante}
                              className="hidden"
                            />

                            📷 Selecionar foto ou PDF
                          </label>

                          {arquivoComprovante && (
                            <div className="mt-4 rounded-xl bg-[#f8f1e6] p-4">
                              <p className="text-sm font-black text-[#81542e]">
                                Arquivo selecionado
                              </p>

                              <p className="mt-1 break-all font-semibold">
                                {arquivoComprovante.name}
                              </p>

                              <p className="mt-1 text-sm text-[#6e4a32]">
                                {(arquivoComprovante.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={enviarComprovantePix}
                            disabled={
                              !arquivoComprovante ||
                              enviandoComprovante
                            }
                            className="mt-4 w-full rounded-xl bg-emerald-600 px-5 py-4 font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {enviandoComprovante
                              ? "Enviando comprovante..."
                              : "Enviar comprovante"}
                          </button>
                        </>
                      )}

                      {mensagemComprovante && (
                        <div
                          className={`mt-4 rounded-xl p-4 text-sm font-bold ${
                            comprovanteEnviado
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {mensagemComprovante}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {pagamento === "dinheiro" && !inscricaoGratuita && (
                  <div className="mt-6 rounded-2xl border-2 border-[#c38a38] bg-white p-6">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl text-white">
                      💵
                    </div>

                    <h2 className="mt-4 text-2xl font-black">
                      Pagamento em dinheiro
                    </h2>

                    <p className="mt-3 font-semibold text-[#6e4a32]">
                      Procure a irmã Martha para realizar o pagamento.
                    </p>

                    <div className="mt-5 rounded-xl bg-[#f8f1e6] p-4">
                      <p className="text-sm font-black text-[#81542e]">
                        Valor a pagar
                      </p>

                      <p className="mt-1 text-3xl font-black">
                        {formatarMoeda(valor)}
                      </p>
                    </div>

                    <p className="mt-4 text-sm font-semibold text-[#6e4a32]">
                      Sua inscrição ficará pendente até a confirmação do
                      recebimento.
                    </p>
                  </div>
                )}

                {pagamento === "cartao" && !inscricaoGratuita && (
                  <div className="mt-6 rounded-2xl border-2 border-[#c38a38] bg-white p-6">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white">
                      💳
                    </div>

                    <h2 className="mt-4 text-2xl font-black">
                      Pagamento com cartão
                    </h2>

                    <p className="mt-3 font-semibold text-[#6e4a32]">
                      Procure o pastor Alexandre para realizar o pagamento.
                    </p>

                    <div className="mt-5 rounded-xl bg-[#f8f1e6] p-4">
                      <p className="text-sm font-black text-[#81542e]">
                        Valor a pagar
                      </p>

                      <p className="mt-1 text-3xl font-black">
                        {formatarMoeda(valor)}
                      </p>
                    </div>

                    <p className="mt-4 text-sm font-semibold text-[#6e4a32]">
                      Sua inscrição ficará pendente até a confirmação do
                      pagamento.
                    </p>
                  </div>
                )}

                {pagamento === "carne" && !inscricaoGratuita && (
                  <div className="mt-6 rounded-2xl border-2 border-[#c38a38] bg-white p-6">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-2xl text-white">
                      📒
                    </div>

                    <h2 className="mt-4 text-2xl font-black">
                      Pagamento por Carnê
                    </h2>

                    <p className="mt-3 font-semibold text-[#6e4a32]">
                      Procure o Pastor Alexandre para retirar o carnê e
                      realizar o pagamento.
                    </p>

                    <div className="mt-5 rounded-xl bg-[#f8f1e6] p-4">
                      <p className="text-sm font-black text-[#81542e]">
                        Valor da inscrição
                      </p>

                      <p className="mt-1 text-3xl font-black">
                        {formatarMoeda(valor)}
                      </p>
                    </div>

                    <p className="mt-4 text-sm font-semibold text-[#6e4a32]">
                      Sua inscrição ficará pendente até a confirmação do
                      pagamento.
                    </p>
                  </div>
                )}

                {!formaPagamentoValida && (
                  <div className="mt-6 rounded-2xl border-2 border-red-500 bg-red-50 p-6 text-red-800">
                    <p className="text-xl font-black">
                      Forma de pagamento não identificada
                    </p>

                    <p className="mt-2 font-semibold">
                      Entre em contato com a organização para concluir o
                      pagamento.
                    </p>
                  </div>
                )}

                <div className="mt-7 rounded-2xl border border-[#d9c39d] bg-[#fffaf2] p-5 text-left">
                  <h3 className="font-black text-[#5b3822]">
                    Próxima etapa
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-[#6e4a32]">
                    Clique no botão abaixo para acessar seu comprovante de
                    inscrição e o QR Code que será utilizado no check-in.
                  </p>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={continuar}
              disabled={
                !numero ||
                !token ||
                (pagamento === "pix" &&
                  !inscricaoGratuita &&
                  !comprovanteEnviado)
              }
              className="mt-7 w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-6 py-4 text-lg font-black text-[#2b180d] shadow-lg transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pagamento === "pix" &&
              !inscricaoGratuita &&
              !comprovanteEnviado
                ? statusComprovante === "recusado"
                  ? "Envie um novo comprovante para continuar"
                  : "Envie o comprovante para continuar"
                : "Continuar para o comprovante →"}
            </button>

            <p className="mt-4 text-xs font-semibold text-[#81542e]">
              Guarde o número da sua inscrição para futuras consultas.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}