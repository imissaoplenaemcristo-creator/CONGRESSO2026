"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type InscricaoDashboard = {
  numero_inscricao: number | string;
  valor_inscricao: number | null;
  status_pagamento: string | null;
  checkin_realizado: boolean | null;
};

export default function AdminPage() {
  const [inscricoes, setInscricoes] = useState<
    InscricaoDashboard[]
  >([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDashboard() {
      setCarregando(true);
      setErro("");

      const { data, error } = await supabase
        .from("inscricoes")
        .select(
          `
            numero_inscricao,
            valor_inscricao,
            status_pagamento,
            checkin_realizado
          `
        );

      if (error) {
        console.error("Erro ao carregar Dashboard:", error);
        setErro(
          "Não foi possível carregar os dados do painel."
        );
        setCarregando(false);
        return;
      }

      setInscricoes(
        (data as InscricaoDashboard[]) ?? []
      );

      setCarregando(false);
    }

    carregarDashboard();
  }, []);

  const indicadores = useMemo(() => {
    const totalInscritos = inscricoes.length;

    const gratuitos = inscricoes.filter(
      (inscricao) =>
        Number(inscricao.valor_inscricao ?? 0) === 0
    ).length;

    const pagos = inscricoes.filter((inscricao) => {
      const status = normalizarStatus(
        inscricao.status_pagamento
      );

      return status === "pago";
    }).length;

    const pendentes = inscricoes.filter((inscricao) => {
      const valor = Number(
        inscricao.valor_inscricao ?? 0
      );

      const status = normalizarStatus(
        inscricao.status_pagamento
      );

      return (
        valor > 0 &&
        status !== "pago" &&
        status !== "cancelado"
      );
    }).length;

    const checkins = inscricoes.filter(
      (inscricao) =>
        inscricao.checkin_realizado === true
    ).length;

    const valorPrevisto = inscricoes.reduce(
      (total, inscricao) => {
        const status = normalizarStatus(
          inscricao.status_pagamento
        );

        if (status === "cancelado") {
          return total;
        }

        return (
          total +
          Number(inscricao.valor_inscricao ?? 0)
        );
      },
      0
    );

    const valorArrecadado = inscricoes.reduce(
      (total, inscricao) => {
        const status = normalizarStatus(
          inscricao.status_pagamento
        );

        if (status !== "pago") {
          return total;
        }

        return (
          total +
          Number(inscricao.valor_inscricao ?? 0)
        );
      },
      0
    );

    const inscricoesPagantes =
      totalInscritos - gratuitos;

    const percentualPagamentos =
      inscricoesPagantes > 0
        ? Math.round(
            (pagos / inscricoesPagantes) * 100
          )
        : 0;

    const percentualCheckins =
      totalInscritos > 0
        ? Math.round(
            (checkins / totalInscritos) * 100
          )
        : 0;

    return {
      totalInscritos,
      pagos,
      pendentes,
      gratuitos,
      checkins,
      valorPrevisto,
      valorArrecadado,
      percentualPagamentos,
      percentualCheckins,
    };
  }, [inscricoes]);

  return (
    <main className="min-h-screen bg-[#1d120d] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300 sm:text-sm sm:tracking-[0.25em]">
            Congresso 2026 — Até Transbordar
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl md:text-5xl">
            Painel Administrativo
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-amber-50/70 sm:text-base">
            Acompanhe as inscrições, os pagamentos e
            os check-ins do congresso.
          </p>
        </header>

        {carregando && (
          <div className="mt-8 rounded-2xl border border-amber-400/20 bg-white/5 p-6">
            <p className="font-semibold text-amber-100/80">
              Carregando dados do painel...
            </p>
          </div>
        )}

        {erro && (
          <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-red-200">
            {erro}
          </div>
        )}

        {!carregando && !erro && (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <CardIndicador
                titulo="Total de inscritos"
                valor={String(
                  indicadores.totalInscritos
                )}
                descricao="Participantes cadastrados"
                icone="👥"
                classeCor="text-amber-300"
                classeBorda="border-amber-400/20"
              />

              <CardIndicador
                titulo="Pagos"
                valor={String(indicadores.pagos)}
                descricao={`${indicadores.percentualPagamentos}% dos pagantes`}
                icone="✅"
                classeCor="text-green-300"
                classeBorda="border-green-400/20"
              />

              <CardIndicador
                titulo="Pendentes"
                valor={String(
                  indicadores.pendentes
                )}
                descricao="Aguardando pagamento"
                icone="⏳"
                classeCor="text-yellow-300"
                classeBorda="border-yellow-400/20"
              />

              <CardIndicador
                titulo="Check-ins"
                valor={String(
                  indicadores.checkins
                )}
                descricao={`${indicadores.percentualCheckins}% dos inscritos`}
                icone="🎫"
                classeCor="text-blue-300"
                classeBorda="border-blue-400/20"
              />

              <CardIndicador
                titulo="Valor arrecadado"
                valor={formatarMoeda(
                  indicadores.valorArrecadado
                )}
                descricao="Pagamentos confirmados"
                icone="💰"
                classeCor="text-green-300"
                classeBorda="border-green-400/20"
              />

              <CardIndicador
                titulo="Valor previsto"
                valor={formatarMoeda(
                  indicadores.valorPrevisto
                )}
                descricao="Total das inscrições ativas"
                icone="💵"
                classeCor="text-amber-300"
                classeBorda="border-amber-400/20"
              />

              <CardIndicador
                titulo="Gratuitos"
                valor={String(
                  indicadores.gratuitos
                )}
                descricao="Inscrições sem cobrança"
                icone="🎁"
                classeCor="text-blue-300"
                classeBorda="border-blue-400/20"
              />

              <CardIndicador
                titulo="Pagamentos concluídos"
                valor={`${indicadores.percentualPagamentos}%`}
                descricao="Entre as inscrições pagantes"
                icone="📈"
                classeCor="text-purple-300"
                classeBorda="border-purple-400/20"
              />
            </section>

            <section className="mt-8 grid gap-5 lg:grid-cols-2">
              <PainelProgresso
                titulo="Situação dos pagamentos"
                atual={indicadores.pagos}
                total={
                  indicadores.totalInscritos -
                  indicadores.gratuitos
                }
                percentual={
                  indicadores.percentualPagamentos
                }
                descricao={`${indicadores.pagos} pagamentos confirmados e ${indicadores.pendentes} pendentes.`}
              />

              <PainelProgresso
                titulo="Andamento dos check-ins"
                atual={indicadores.checkins}
                total={indicadores.totalInscritos}
                percentual={
                  indicadores.percentualCheckins
                }
                descricao={`${indicadores.checkins} participantes já realizaram o check-in.`}
              />
            </section>

            <section className="mt-10">
              <div>
                <h2 className="text-2xl font-black text-amber-300">
                  Acessos rápidos
                </h2>

                <p className="mt-2 text-sm text-amber-100/70">
                  Escolha a área que deseja administrar.
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Atalho
                  href="/admin/inscritos"
                  icone="👥"
                  titulo="Inscritos"
                  descricao="Visualizar e editar participantes"
                />

                <Atalho
                  href="/admin/pagamentos"
                  icone="💳"
                  titulo="Pagamentos"
                  descricao="Controlar valores e situações"
                />

                <Atalho
                  href="/admin/checkin"
                  icone="📷"
                  titulo="Check-in"
                  descricao="Ler QR Code e registrar entrada"
                />

                <Atalho
                  href="/admin/relatorios"
                  icone="📊"
                  titulo="Relatórios"
                  descricao="Consultar e exportar resultados"
                />
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function CardIndicador({
  titulo,
  valor,
  descricao,
  icone,
  classeCor,
  classeBorda,
}: {
  titulo: string;
  valor: string;
  descricao: string;
  icone: string;
  classeCor: string;
  classeBorda: string;
}) {
  return (
    <article
      className={`rounded-2xl border bg-white/5 p-5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-white/[0.07] sm:p-6 ${classeBorda}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-amber-50/70">
            {titulo}
          </p>

          <p
            className={`mt-3 break-words text-3xl font-black sm:text-4xl ${classeCor}`}
          >
            {valor}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/20 text-xl"
        >
          {icone}
        </span>
      </div>

      <p className="mt-4 text-xs text-amber-50/50 sm:text-sm">
        {descricao}
      </p>
    </article>
  );
}

function PainelProgresso({
  titulo,
  atual,
  total,
  percentual,
  descricao,
}: {
  titulo: string;
  atual: number;
  total: number;
  percentual: number;
  descricao: string;
}) {
  const percentualSeguro = Math.min(
    Math.max(percentual, 0),
    100
  );

  return (
    <article className="rounded-2xl border border-amber-400/20 bg-white/5 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-black text-amber-200">
          {titulo}
        </h2>

        <span className="rounded-full bg-amber-400/10 px-3 py-1 text-sm font-bold text-amber-300">
          {percentualSeguro}%
        </span>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/30">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{
            width: `${percentualSeguro}%`,
          }}
        />
      </div>

      <p className="mt-4 text-sm text-amber-50/70">
        {descricao}
      </p>

      <p className="mt-2 text-xs font-semibold text-amber-300">
        {atual} de {total}
      </p>
    </article>
  );
}

function Atalho({
  href,
  icone,
  titulo,
  descricao,
}: {
  href: string;
  icone: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-amber-400/20 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-amber-300/40 hover:bg-white/10"
    >
      <span className="text-2xl" aria-hidden="true">
        {icone}
      </span>

      <h3 className="mt-4 text-lg font-black text-amber-300">
        {titulo}
      </h3>

      <p className="mt-2 text-sm text-amber-50/60">
        {descricao}
      </p>

      <p className="mt-4 text-sm font-bold text-amber-200 transition group-hover:translate-x-1">
        Acessar →
      </p>
    </Link>
  );
}

function normalizarStatus(
  status: string | null
) {
  return status?.trim().toLowerCase() ?? "";
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}