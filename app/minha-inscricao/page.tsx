"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "../lib/supabase";

type Inscricao = {
  numero_inscricao: number;
  nome: string;
  nascimento: string | null;
  igreja: string | null;
  forma_pagamento: string | null;
  status: string | null;
  status_pagamento: string | null;
  valor_inscricao: number | null;
  valor_pago: number | null;
  pagamento_confirmado_em: string | null;
  checkin_realizado: boolean | null;
  checkin_em: string | null;
  qr_token: string | null;
};

function formatarMoeda(valor: number | null) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor ?? 0));
}

function formatarData(data: string | null) {
  if (!data) {
    return "Não informado";
  }

  const parteDaData = data.includes("T")
    ? data.split("T")[0]
    : data;

  const [ano, mes, dia] = parteDaData.split("-");

  if (!ano || !mes || !dia) {
    return "Não informado";
  }

  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(data: string | null) {
  if (!data) {
    return "Não registrado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data));
}

function formatarPagamento(pagamento: string | null) {
  if (pagamento === "pix") {
    return "PIX";
  }

  if (pagamento === "dinheiro") {
    return "Dinheiro";
  }

  if (pagamento === "cartao") {
    return "Cartão";
  }

  return pagamento || "Não informado";
}

function formatarStatus(status: string | null) {
  if (!status) {
    return "Pendente";
  }

  const nomes: Record<string, string> = {
    pendente: "Pendente",
    confirmado: "Confirmada",
    ativo: "Ativa",
    cancelado: "Cancelada",
    cancelada: "Cancelada",
    pago: "Pago",
    isento: "Isento",
    pagamento_em_analise: "Pagamento em análise",
    "pagamento em análise": "Pagamento em análise",
  };

  return nomes[status.toLowerCase()] ?? status;
}

function formatarCpfDigitado(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  return numeros
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export default function MinhaInscricaoPage() {
  const [documento, setDocumento] = useState("");
  const [inscricao, setInscricao] =
    useState<Inscricao | null>(null);
  const [erro, setErro] = useState("");
  const [consultando, setConsultando] = useState(false);
  const [consultou, setConsultou] = useState(false);
  const [qrCode, setQrCode] = useState("");

  async function consultarInscricao(event: FormEvent) {
    event.preventDefault();

    setErro("");
    setInscricao(null);
    setConsultou(false);

    const cpfSomenteNumeros = documento.replace(/\D/g, "");

    if (cpfSomenteNumeros.length !== 11) {
      setErro("Informe um CPF válido com 11 números.");
      return;
    }

    setConsultando(true);

    try {
      const { data, error } = await supabase.rpc(
        "consultar_inscricao_por_cpf",
        {
          cpf_informado: cpfSomenteNumeros,
        }
      );

      if (error) {
        console.error("Erro ao consultar inscrição:", error);
        setErro(
          "Não foi possível consultar a inscrição. Tente novamente."
        );
        return;
      }

      const resultado = Array.isArray(data)
        ? data[0]
        : data;

      setConsultou(true);

      if (!resultado) {
        setErro(
          "Não encontramos uma inscrição com esse CPF. Confira os números e tente novamente."
        );
        return;
      }

      const inscricaoEncontrada = resultado as Inscricao;
      setInscricao(inscricaoEncontrada);

      const statusPagamento = String(
        inscricaoEncontrada.status_pagamento ?? ""
      ).toLowerCase();

      const qrLiberado =
        statusPagamento === "pago" ||
        statusPagamento === "confirmado" ||
        statusPagamento === "gratuito" ||
        statusPagamento === "isento" ||
        statusPagamento === "cortesia" ||
        Number(inscricaoEncontrada.valor_inscricao ?? 0) === 0;

      if (qrLiberado && inscricaoEncontrada.qr_token) {
        const imagem = await QRCode.toDataURL(
          inscricaoEncontrada.qr_token,
          {
            width: 600,
            margin: 2,
            errorCorrectionLevel: "H",
          }
        );

        setQrCode(imagem);
      } else {
        setQrCode("");
      }
    } catch (erroInesperado) {
      console.error(
        "Erro inesperado na consulta:",
        erroInesperado
      );

      setErro(
        "Ocorreu um erro inesperado. Tente novamente."
      );
    } finally {
      setConsultando(false);
    }
  }

  function limparConsulta() {
    setDocumento("");
    setInscricao(null);
    setErro("");
    setConsultou(false);
    setQrCode("");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm font-semibold text-amber-300 transition hover:text-amber-200"
        >
          ← Voltar para o início
        </Link>

        <div className="mt-6 rounded-3xl border border-amber-200/20 bg-black/30 p-6 shadow-2xl md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
            Sistema de Eventos IEMPC
          </p>

          <h1 className="mt-3 text-3xl font-black md:text-4xl">
            Minha Inscrição
          </h1>

          <p className="mt-3 leading-7 text-amber-50/70">
            Consulte sua inscrição informando apenas o CPF utilizado
            no cadastro.
          </p>

          <form
            onSubmit={consultarInscricao}
            className="mt-8 space-y-5"
          >
            <label className="block">
              <span className="mb-2 block font-semibold">
                CPF
              </span>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={14}
                value={documento}
                onChange={(event) =>
                  setDocumento(formatarCpfDigitado(event.target.value))
                }
                placeholder="000.000.000-00"
                className="w-full rounded-xl border border-amber-200/15 bg-white/5 px-4 py-4 text-lg text-white outline-none transition placeholder:text-white/30 focus:border-amber-400"
              />

              <span className="mt-2 block text-sm text-amber-50/50">
                Digite o mesmo CPF usado no momento da inscrição.
              </span>
            </label>

            {erro && (
              <div className="rounded-2xl border border-red-300/30 bg-red-500/15 p-4 text-red-100">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={consultando}
              className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-7 py-3 font-bold text-[#2b180d] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {consultando
                ? "Consultando..."
                : "Consultar inscrição"}
            </button>
          </form>
        </div>

        {inscricao && (
          <section className="mt-8 rounded-3xl border border-amber-200/20 bg-black/30 p-6 shadow-2xl md:p-10">
            <div className="flex flex-col gap-4 border-b border-amber-200/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-amber-300">
                  Inscrição encontrada
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {inscricao.nome}
                </h2>

                <p className="mt-2 text-amber-50/70">
                  Inscrição nº{" "}
                  <strong className="text-amber-300">
                    {inscricao.numero_inscricao}
                  </strong>
                </p>
              </div>

              <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-200">
                {formatarStatus(inscricao.status_pagamento)}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Item
                titulo="Data de nascimento"
                valor={formatarData(inscricao.nascimento)}
              />

              <Item
                titulo="Igreja"
                valor={inscricao.igreja || "Não informada"}
              />

              <Item
                titulo="Forma de pagamento"
                valor={formatarPagamento(
                  inscricao.forma_pagamento
                )}
              />

              <Item
                titulo="Situação do pagamento"
                valor={formatarStatus(
                  inscricao.status_pagamento
                )}
              />

              <Item
                titulo="Valor da inscrição"
                valor={formatarMoeda(
                  inscricao.valor_inscricao
                )}
              />

              <Item
                titulo="Valor pago"
                valor={formatarMoeda(inscricao.valor_pago)}
              />

              <Item
                titulo="Pagamento confirmado em"
                valor={formatarDataHora(
                  inscricao.pagamento_confirmado_em
                )}
              />

              <Item
                titulo="Check-in"
                valor={
                  inscricao.checkin_realizado
                    ? "Realizado"
                    : "Ainda não realizado"
                }
              />

              {inscricao.checkin_realizado && (
                <Item
                  titulo="Check-in realizado em"
                  valor={formatarDataHora(
                    inscricao.checkin_em
                  )}
                />
              )}
            </div>

            {qrCode ? (
              <div className="mt-8 rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-6 text-center">
                <h3 className="text-xl font-black text-emerald-300">
                  🎫 QR Code liberado
                </h3>

                <img
                  src={qrCode}
                  alt="QR Code para check-in"
                  className="mx-auto mt-5 h-60 w-60 rounded-2xl bg-white p-3"
                />

                <p className="mt-4 text-sm text-amber-50/70">
                  Apresente este QR Code no check-in com um documento oficial com foto.
                </p>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-yellow-300/20 bg-yellow-500/10 p-5 text-center text-yellow-100">
                O QR Code será liberado após a confirmação do pagamento.
              </div>
            )}

            <button
              type="button"
              onClick={limparConsulta}
              className="mt-8 w-full rounded-xl border border-amber-200/20 px-6 py-3 font-semibold transition hover:bg-white/5"
            >
              Fazer outra consulta
            </button>
          </section>
        )}

        {consultou && !inscricao && !erro && (
          <div className="mt-8 rounded-2xl border border-amber-200/20 bg-black/30 p-6 text-center text-amber-50/70">
            Nenhuma inscrição foi localizada.
          </div>
        )}
      </div>
    </main>
  );
}

function Item({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-200/10 bg-white/5 p-5">
      <p className="text-sm text-amber-200/70">
        {titulo}
      </p>

      <p className="mt-1 font-semibold text-white">
        {valor}
      </p>
    </div>
  );
}