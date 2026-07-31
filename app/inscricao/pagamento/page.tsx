"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
    setCarregando(false);
  }, []);

  const inscricaoGratuita = valor === 0;

  const formaPagamentoValida = useMemo(() => {
    if (inscricaoGratuita) {
      return true;
    }

    return ["pix", "dinheiro", "cartao"].includes(pagamento);
  }, [inscricaoGratuita, pagamento]);

  const formaPagamentoFormatada = useMemo(() => {
    if (inscricaoGratuita) {
      return "Inscrição gratuita";
    }

    const formas: Record<string, string> = {
      pix: "PIX",
      dinheiro: "Dinheiro",
      cartao: "Cartão",
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

  function continuar() {
    if (!numero || !token) {
      alert(
        "Não foi possível localizar os dados da inscrição. Volte e tente novamente."
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
                        Após realizar o pagamento, guarde o comprovante. A
                        confirmação poderá levar alguns minutos.
                      </p>
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
              disabled={!numero || !token}
              className="mt-7 w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-6 py-4 text-lg font-black text-[#2b180d] shadow-lg transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar para o comprovante →
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