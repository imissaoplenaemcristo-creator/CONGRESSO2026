"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CHAVE_PIX = "14.847.657/0001-01";

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
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

    const numeroRecebido = parametros.get("numero") ?? "";
    const nomeRecebido = parametros.get("nome") ?? "";
    const tokenRecebido = parametros.get("token") ?? "";
    const pagamentoRecebido =
      parametros.get("pagamento")?.toLowerCase() ?? "";
    const valorRecebido = Number(parametros.get("valor") ?? 0);

    setNumero(numeroRecebido);
    setNome(nomeRecebido);
    setToken(tokenRecebido);
    setPagamento(pagamentoRecebido);
    setValor(Number.isFinite(valorRecebido) ? valorRecebido : 0);
    setCarregando(false);
  }, []);

  async function copiarChavePix() {
    try {
      await navigator.clipboard.writeText(CHAVE_PIX);
      setChaveCopiada(true);

      window.setTimeout(() => {
        setChaveCopiada(false);
      }, 2500);
    } catch (erro) {
      console.error(erro);
      alert(`Chave PIX: ${CHAVE_PIX}`);
    }
  }

  function continuar() {
    if (!numero || !token) {
      alert(
        "Não foi possível localizar os dados da inscrição. Volte e tente novamente."
      );
      return;
    }

    router.push(
      `/inscricao/sucesso?numero=${encodeURIComponent(
        numero
      )}&token=${encodeURIComponent(
        token
      )}&nome=${encodeURIComponent(nome)}`
    );
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] px-4 text-white">
        <p className="text-lg font-semibold">
          Carregando dados da inscrição...
        </p>
      </main>
    );
  }

  const inscricaoGratuita = valor === 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-[28px] border-2 border-[#c38a38] bg-[#f8f1e6] text-[#3d2416] shadow-2xl">
          <img
            src="/flyer-congresso-2026.jpg"
            alt="Arte oficial do Congresso 2026"
            className="h-auto w-full object-cover"
          />

          <div className="px-6 py-8 text-center md:px-10">
            <h1 className="text-3xl font-black">
              Pagamento da inscrição
            </h1>

            <p className="mt-3 text-lg font-semibold">
              {nome || "Participante"}
            </p>

            <p className="mt-2 text-sm font-bold text-[#81542e]">
              Inscrição nº{" "}
              {numero ? numero.padStart(5, "0") : "-----"}
            </p>

            <div className="mt-6 rounded-2xl border-2 border-[#c38a38] bg-white p-6">
              <p className="text-sm font-black uppercase tracking-[0.15em] text-[#81542e]">
                Valor do Congresso
              </p>

              <p className="mt-2 text-4xl font-black">
                {inscricaoGratuita
                  ? "Gratuito"
                  : formatarMoeda(valor)}
              </p>
            </div>

            {inscricaoGratuita && (
              <div className="mt-6 rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-6">
                <p className="text-xl font-black text-emerald-700">
                  Inscrição gratuita
                </p>

                <p className="mt-2 font-semibold text-emerald-800">
                  Não é necessário realizar pagamento.
                </p>
              </div>
            )}

            {pagamento === "pix" && !inscricaoGratuita && (
              <div className="mt-6 rounded-2xl border-2 border-[#c38a38] bg-white p-6">
                <h2 className="text-2xl font-black">
                  Pagamento via PIX
                </h2>

                <p className="mt-2 text-sm font-semibold text-[#6e4a32]">
                  Escaneie o QR Code abaixo para realizar o
                  pagamento.
                </p>

                <img
                  src="/qr-code-pix.png"
                  alt="QR Code para pagamento via PIX"
                  className="mx-auto mt-5 h-64 w-64 rounded-2xl border border-[#ead8b8] bg-white p-3"
                />

                <div className="mt-6 rounded-2xl bg-[#f8f1e6] p-5">
                  <p className="text-sm font-black uppercase tracking-[0.12em] text-[#81542e]">
                    Chave PIX — CNPJ
                  </p>

                  <p className="mt-2 break-all text-xl font-black">
                    {CHAVE_PIX}
                  </p>

                  <button
                    type="button"
                    onClick={copiarChavePix}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-5 py-3 font-black text-[#2b180d]"
                  >
                    {chaveCopiada
                      ? "✅ Chave copiada"
                      : "📋 Copiar chave PIX"}
                  </button>
                </div>

                <p className="mt-4 text-sm font-semibold text-[#6e4a32]">
                  Após realizar o pagamento, guarde o comprovante.
                </p>
              </div>
            )}

            {pagamento === "dinheiro" &&
              !inscricaoGratuita && (
                <div className="mt-6 rounded-2xl border-2 border-[#c38a38] bg-white p-6">
                  <h2 className="text-2xl font-black">
                    Pagamento em dinheiro
                  </h2>

                  <p className="mt-3 font-semibold text-[#6e4a32]">
                    Procure a irmã Martha para realizar o
                    pagamento.
                  </p>
                </div>
              )}

            {pagamento === "cartao" &&
              !inscricaoGratuita && (
                <div className="mt-6 rounded-2xl border-2 border-[#c38a38] bg-white p-6">
                  <h2 className="text-2xl font-black">
                    Pagamento com cartão
                  </h2>

                  <p className="mt-3 font-semibold text-[#6e4a32]">
                    Procure o pastor Alexandre para realizar o
                    pagamento.
                  </p>
                </div>
              )}

            {!inscricaoGratuita &&
              pagamento !== "pix" &&
              pagamento !== "dinheiro" &&
              pagamento !== "cartao" && (
                <div className="mt-6 rounded-2xl border-2 border-red-500 bg-red-50 p-6 text-red-800">
                  <p className="font-bold">
                    Forma de pagamento não identificada.
                  </p>
                </div>
              )}

            <button
              type="button"
              onClick={continuar}
              disabled={!numero || !token}
              className="mt-8 w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-6 py-4 text-lg font-black text-[#2b180d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar para o comprovante
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}