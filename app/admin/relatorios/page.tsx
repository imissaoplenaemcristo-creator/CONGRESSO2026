"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import ExcelButton from "./ExcelButton";

type Inscricao = {
  id?: string | null;
  numero_inscricao?: string | null;
  nome?: string | null;
  cpf?: string | null;
  telefone?: string | null;
  email?: string | null;
  idade?: number | string | null;
  status_pagamento?: string | null;
  checkin_realizado?: boolean | null;
  checkin_em?: string | null;
  created_at?: string | null;
  valor?: number | string | null;
  valor_pago?: number | string | null;
  valor_total?: number | string | null;
  valor_inscricao?: number | string | null;
  [chave: string]: unknown;
};

type ResumoFinanceiro = {
  total_previsto: number;
  total_arrecadado: number;
  total_restante: number;
};

type FiltroPagamento = "todos" | "pagos" | "pendentes";
type FiltroCheckin = "todos" | "realizados" | "pendentes";

function normalizarTexto(valor: unknown) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function pagamentoConfirmado(status: unknown) {
  const valor = normalizarTexto(status);

  return [
    "pago",
    "aprovado",
    "aprovada",
    "confirmado",
    "confirmada",
    "paid",
    "approved",
    "concluido",
    "concluida",
  ].includes(valor);
}

function pagamentoCancelado(status: unknown) {
  const valor = normalizarTexto(status);

  return [
    "cancelado",
    "cancelada",
    "rejeitado",
    "rejeitada",
    "recusado",
    "recusada",
    "estornado",
    "estornada",
  ].includes(valor);
}

function converterNumero(valor: unknown) {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : 0;
  }

  if (typeof valor !== "string") {
    return 0;
  }

  const texto = valor.trim();

  if (!texto) {
    return 0;
  }

  const limpo = texto
    .replace(/[R$\s]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");

  const numero = Number(limpo);

  return Number.isFinite(numero) ? numero : 0;
}

function obterValor(inscricao: Inscricao) {
  const candidatos = [
    inscricao.valor_pago,
    inscricao.valor_total,
    inscricao.valor_inscricao,
    inscricao.valor,
  ];

  for (const candidato of candidatos) {
    const valor = converterNumero(candidato);

    if (valor > 0) {
      return valor;
    }
  }

  const idade = converterNumero(inscricao.idade);

  if (idade > 0 && idade <= 5) {
    return 0;
  }

  if (idade >= 6 && idade <= 12) {
    return 150;
  }

  if (idade >= 13) {
    return 350;
  }

  return 0;
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarData(valor: unknown) {
  if (!valor) {
    return "—";
  }

  const data = new Date(String(valor));

  if (Number.isNaN(data.getTime())) {
    return String(valor);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function CardEstatistica({
  titulo,
  valor,
  descricao,
  icone,
}: {
  titulo: string;
  valor: string | number;
  descricao: string;
  icone: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-300/20 bg-[#2a1a12] p-5 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-amber-100/60">
            {titulo}
          </p>

          <p className="mt-3 text-3xl font-black text-white">{valor}</p>

          <p className="mt-2 text-sm text-amber-100/50">{descricao}</p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-2xl">
          {icone}
        </div>
      </div>
    </div>
  );
}

function BarraProgresso({
  titulo,
  quantidade,
  total,
}: {
  titulo: string;
  quantidade: number;
  total: number;
}) {
  const percentual =
    total > 0 ? Math.min(100, Math.round((quantidade / total) * 100)) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="font-bold text-amber-100">{titulo}</span>

        <span className="text-amber-100/60">
          {quantidade} · {percentual}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-[#1a110d]">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  );
}

export default function RelatoriosPage() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [resumoFinanceiro, setResumoFinanceiro] =
    useState<ResumoFinanceiro>({
      total_previsto: 0,
      total_arrecadado: 0,
      total_restante: 0,
    });
  const [busca, setBusca] = useState("");
  const [filtroPagamento, setFiltroPagamento] =
    useState<FiltroPagamento>("todos");
  const [filtroCheckin, setFiltroCheckin] =
    useState<FiltroCheckin>("todos");

  const carregarRelatorio = useCallback(async () => {
    setCarregando(true);
    setMensagem("");

    const [inscricoesResposta, resumoResposta] = await Promise.all([
      supabase.from("inscricoes").select("*"),
      supabase.rpc("admin_resumo_financeiro"),
    ]);

    if (inscricoesResposta.error) {
      console.error(
        "Erro ao carregar inscrições do relatório:",
        inscricoesResposta.error
      );

      setMensagem(
        "Não foi possível carregar os relatórios. Verifique a conexão e as permissões do Supabase."
      );
      setInscricoes([]);
      setCarregando(false);
      return;
    }

    if (resumoResposta.error) {
      console.error(
        "Erro ao carregar resumo financeiro:",
        resumoResposta.error
      );

      setMensagem(
        "Não foi possível carregar o resumo financeiro do relatório."
      );
      setInscricoes([]);
      setCarregando(false);
      return;
    }

    const resumoBruto = Array.isArray(resumoResposta.data)
      ? resumoResposta.data[0]
      : resumoResposta.data;

    setInscricoes(
      (inscricoesResposta.data ?? []) as Inscricao[]
    );

    setResumoFinanceiro({
      total_previsto: Number(resumoBruto?.total_previsto ?? 0),
      total_arrecadado: Number(
        resumoBruto?.total_arrecadado ?? 0
      ),
      total_restante: Number(
        resumoBruto?.total_restante ?? 0
      ),
    });

    setCarregando(false);
  }, []);

  useEffect(() => {
    carregarRelatorio();
  }, [carregarRelatorio]);

  const estatisticas = useMemo(() => {
    const total = inscricoes.length;

    const pagos = inscricoes.filter((item) =>
      pagamentoConfirmado(item.status_pagamento)
    ).length;

    const cancelados = inscricoes.filter((item) =>
      pagamentoCancelado(item.status_pagamento)
    ).length;

    const pendentes = Math.max(0, total - pagos - cancelados);

    const checkinsRealizados = inscricoes.filter(
      (item) => item.checkin_realizado === true
    ).length;

    const checkinsPendentes = Math.max(0, total - checkinsRealizados);

    const valorArrecadado =
      resumoFinanceiro.total_arrecadado;

    const valorPrevisto =
      resumoFinanceiro.total_previsto;

    return {
      total,
      pagos,
      pendentes,
      cancelados,
      checkinsRealizados,
      checkinsPendentes,
      valorArrecadado,
      valorPrevisto,
      valorRestante: resumoFinanceiro.total_restante,
    };
  }, [inscricoes, resumoFinanceiro]);

  const inscricoesFiltradas = useMemo(() => {
    const termo = normalizarTexto(busca);

    return inscricoes.filter((item) => {
      const correspondeBusca =
        !termo ||
        [
          item.nome,
          item.cpf,
          item.telefone,
          item.email,
          item.numero_inscricao,
        ].some((valor) => normalizarTexto(valor).includes(termo));

      const estaPago = pagamentoConfirmado(item.status_pagamento);

      const correspondePagamento =
        filtroPagamento === "todos" ||
        (filtroPagamento === "pagos" && estaPago) ||
        (filtroPagamento === "pendentes" && !estaPago);

      const correspondeCheckin =
        filtroCheckin === "todos" ||
        (filtroCheckin === "realizados" &&
          item.checkin_realizado === true) ||
        (filtroCheckin === "pendentes" &&
          item.checkin_realizado !== true);

      return (
        correspondeBusca &&
        correspondePagamento &&
        correspondeCheckin
      );
    });
  }, [inscricoes, busca, filtroPagamento, filtroCheckin]);

  function imprimirRelatorio() {
    window.print();
  }

  function limparFiltros() {
    setBusca("");
    setFiltroPagamento("todos");
    setFiltroCheckin("todos");
  }

  return (
    <div className="space-y-8">
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }

          aside,
          nav,
          header,
          .nao-imprimir {
            display: none !important;
          }

          main {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }

          .area-relatorio {
            color: black !important;
          }

          .area-relatorio > div,
          .area-relatorio section {
            break-inside: avoid;
          }

          .area-relatorio * {
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black text-amber-400">
            Relatórios
          </h1>

          <p className="mt-3 text-amber-100/70">
            Estatísticas, acompanhamento e sincronização dos dados do
            congresso.
          </p>
        </div>

        <div className="nao-imprimir flex flex-col gap-3 sm:flex-row sm:items-start">
          <button
            type="button"
            onClick={carregarRelatorio}
            disabled={carregando}
            className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-5 py-3 font-bold text-amber-300 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? "Atualizando..." : "Atualizar dados"}
          </button>

          <ExcelButton />

          <button
            type="button"
            onClick={imprimirRelatorio}
            className="rounded-xl bg-amber-400 px-5 py-3 font-black text-[#24140c] transition hover:bg-amber-300"
          >
            Salvar em PDF
          </button>
        </div>
      </div>

      {mensagem && (
        <div className="nao-imprimir rounded-xl border border-amber-300/20 bg-[#2a1a12] p-4 text-amber-100">
          {mensagem}
        </div>
      )}

      {carregando ? (
        <div className="flex min-h-80 items-center justify-center rounded-2xl border border-amber-300/20 bg-[#2a1a12]">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-400/20 border-t-amber-400" />

            <p className="mt-4 text-amber-100/70">
              Carregando relatórios...
            </p>
          </div>
        </div>
      ) : (
        <div className="area-relatorio space-y-8">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <CardEstatistica
              titulo="Total de inscritos"
              valor={estatisticas.total}
              descricao="Participantes cadastrados"
              icone="👥"
            />

            <CardEstatistica
              titulo="Pagamentos confirmados"
              valor={estatisticas.pagos}
              descricao="Inscrições pagas"
              icone="✅"
            />

            <CardEstatistica
              titulo="Pagamentos pendentes"
              valor={estatisticas.pendentes}
              descricao="Aguardando confirmação"
              icone="⏳"
            />

            <CardEstatistica
              titulo="Check-ins realizados"
              valor={estatisticas.checkinsRealizados}
              descricao="Participantes presentes"
              icone="🎫"
            />

            <CardEstatistica
              titulo="Ainda não entraram"
              valor={estatisticas.checkinsPendentes}
              descricao="Check-in pendente"
              icone="🚪"
            />

            <CardEstatistica
              titulo="Inscrições canceladas"
              valor={estatisticas.cancelados}
              descricao="Pagamentos cancelados"
              icone="❌"
            />

            <CardEstatistica
              titulo="Valor arrecadado"
              valor={formatarMoeda(estatisticas.valorArrecadado)}
              descricao="Somente pagamentos confirmados"
              icone="💰"
            />

            <CardEstatistica
              titulo="Valor previsto"
              valor={formatarMoeda(estatisticas.valorPrevisto)}
              descricao="Total estimado das inscrições"
              icone="📈"
            />

            <CardEstatistica
              titulo="Valor restante"
              valor={formatarMoeda(estatisticas.valorRestante)}
              descricao="Total que ainda falta receber"
              icone="🧾"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-amber-300/20 bg-[#2a1a12] p-6">
              <h2 className="text-xl font-black text-white">
                Situação dos pagamentos
              </h2>

              <p className="mt-1 text-sm text-amber-100/50">
                Comparação em relação ao total de inscritos.
              </p>

              <div className="mt-7 space-y-6">
                <BarraProgresso
                  titulo="Confirmados"
                  quantidade={estatisticas.pagos}
                  total={estatisticas.total}
                />

                <BarraProgresso
                  titulo="Pendentes"
                  quantidade={estatisticas.pendentes}
                  total={estatisticas.total}
                />

                <BarraProgresso
                  titulo="Cancelados"
                  quantidade={estatisticas.cancelados}
                  total={estatisticas.total}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-300/20 bg-[#2a1a12] p-6">
              <h2 className="text-xl font-black text-white">
                Situação do check-in
              </h2>

              <p className="mt-1 text-sm text-amber-100/50">
                Participantes que já deram entrada no evento.
              </p>

              <div className="mt-7 space-y-6">
                <BarraProgresso
                  titulo="Check-ins realizados"
                  quantidade={estatisticas.checkinsRealizados}
                  total={estatisticas.total}
                />

                <BarraProgresso
                  titulo="Check-ins pendentes"
                  quantidade={estatisticas.checkinsPendentes}
                  total={estatisticas.total}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-amber-300/20 bg-[#2a1a12] p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-xl font-black text-white">
                  Lista de participantes
                </h2>

                <p className="mt-1 text-sm text-amber-100/50">
                  {inscricoesFiltradas.length} participante(s)
                  encontrado(s).
                </p>
              </div>

              <div className="nao-imprimir grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <input
                  type="text"
                  value={busca}
                  onChange={(evento) => setBusca(evento.target.value)}
                  placeholder="Buscar participante..."
                  className="rounded-xl border border-amber-300/20 bg-[#1a110d] px-4 py-3 text-white outline-none placeholder:text-amber-100/30 focus:border-amber-400"
                />

                <select
                  value={filtroPagamento}
                  onChange={(evento) =>
                    setFiltroPagamento(
                      evento.target.value as FiltroPagamento
                    )
                  }
                  className="rounded-xl border border-amber-300/20 bg-[#1a110d] px-4 py-3 text-white outline-none focus:border-amber-400"
                >
                  <option value="todos">Todos os pagamentos</option>
                  <option value="pagos">Pagamentos confirmados</option>
                  <option value="pendentes">Pagamentos pendentes</option>
                </select>

                <select
                  value={filtroCheckin}
                  onChange={(evento) =>
                    setFiltroCheckin(
                      evento.target.value as FiltroCheckin
                    )
                  }
                  className="rounded-xl border border-amber-300/20 bg-[#1a110d] px-4 py-3 text-white outline-none focus:border-amber-400"
                >
                  <option value="todos">Todos os check-ins</option>
                  <option value="realizados">Check-in realizado</option>
                  <option value="pendentes">Check-in pendente</option>
                </select>

                <button
                  type="button"
                  onClick={limparFiltros}
                  className="rounded-xl border border-amber-300/20 px-4 py-3 font-bold text-amber-200 transition hover:bg-amber-400/10"
                >
                  Limpar filtros
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-amber-300/20 text-xs uppercase tracking-wider text-amber-100/50">
                    <th className="px-3 py-4">Inscrição</th>
                    <th className="px-3 py-4">Participante</th>
                    <th className="px-3 py-4">Telefone</th>
                    <th className="px-3 py-4">Pagamento</th>
                    <th className="px-3 py-4">Valor</th>
                    <th className="px-3 py-4">Check-in</th>
                    <th className="px-3 py-4">Data</th>
                  </tr>
                </thead>

                <tbody>
                  {inscricoesFiltradas.map((item, index) => {
                    const pago = pagamentoConfirmado(
                      item.status_pagamento
                    );

                    const chave =
                      item.id ||
                      item.numero_inscricao ||
                      `${item.nome ?? "participante"}-${index}`;

                    return (
                      <tr
                        key={chave}
                        className="border-b border-amber-300/10 text-sm text-amber-100/70 transition hover:bg-amber-400/5"
                      >
                        <td className="px-3 py-4 font-bold text-amber-300">
                          {item.numero_inscricao || "—"}
                        </td>

                        <td className="px-3 py-4">
                          <p className="font-bold text-white">
                            {item.nome || "Sem nome"}
                          </p>

                          <p className="mt-1 text-xs text-amber-100/40">
                            {item.cpf || item.email || "Sem documento"}
                          </p>
                        </td>

                        <td className="px-3 py-4">
                          {item.telefone || "—"}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                              pago
                                ? "bg-green-500/15 text-green-400"
                                : pagamentoCancelado(
                                      item.status_pagamento
                                    )
                                  ? "bg-red-500/15 text-red-400"
                                  : "bg-yellow-500/15 text-yellow-300"
                            }`}
                          >
                            {item.status_pagamento || "Pendente"}
                          </span>
                        </td>

                        <td className="px-3 py-4 font-bold text-white">
                          {formatarMoeda(obterValor(item))}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                              item.checkin_realizado
                                ? "bg-green-500/15 text-green-400"
                                : "bg-slate-500/15 text-slate-300"
                            }`}
                          >
                            {item.checkin_realizado
                              ? "Realizado"
                              : "Pendente"}
                          </span>

                          {item.checkin_em && (
                            <p className="mt-1 text-xs text-amber-100/40">
                              {formatarData(item.checkin_em)}
                            </p>
                          )}
                        </td>

                        <td className="px-3 py-4">
                          {item.created_at
                            ? formatarData(item.created_at)
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {inscricoesFiltradas.length === 0 && (
                <div className="py-14 text-center text-amber-100/50">
                  Nenhum participante encontrado com esses filtros.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}