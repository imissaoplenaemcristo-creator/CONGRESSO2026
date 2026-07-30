"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import SearchBar from "../components/SearchBar";

type Pagamento = {
  numero_inscricao: number | string;
  nome: string;
  cpf: string;
  telefone: string;
  igreja: string;
  forma_pagamento: string | null;
  status_pagamento: string;
  valor_inscricao: number | null;
  valor_pago: number | null;
  pagamento_confirmado_em: string | null;
};

type FiltroStatus =
  | "todos"
  | "pendente"
  | "pago"
  | "cortesia"
  | "cancelado";

const camposPagamento = `
  numero_inscricao,
  nome,
  cpf,
  telefone,
  igreja,
  forma_pagamento,
  status_pagamento,
  valor_inscricao,
  valor_pago,
  pagamento_confirmado_em
`;

export default function PagamentosPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] =
    useState<FiltroStatus>("todos");
  const [salvandoNumero, setSalvandoNumero] =
    useState<string | null>(null);
  const [pagamentoSelecionado, setPagamentoSelecionado] =
    useState<Pagamento | null>(null);

  useEffect(() => {
    async function carregarPagamentos() {
      setCarregando(true);
      setErro("");

      const { data, error } = await supabase
        .from("inscricoes")
        .select(camposPagamento)
        .order("numero_inscricao", { ascending: false });

      if (error) {
        console.error("ERRO AO CARREGAR PAGAMENTOS:", error);
        setErro(
          `Não foi possível carregar os pagamentos: ${error.message}`
        );
        setCarregando(false);
        return;
      }

      setPagamentos((data as Pagamento[]) ?? []);
      setCarregando(false);
    }

    carregarPagamentos();
  }, []);

  function abrirFicha(pagamento: Pagamento) {
    setPagamentoSelecionado(pagamento);
  }

  function fecharFicha() {
    if (salvandoNumero) {
      return;
    }

    setPagamentoSelecionado(null);
  }

  function atualizarPagamentoNaLista(
    pagamentoAtualizado: Pagamento
  ) {
    setPagamentos((listaAnterior) =>
      listaAnterior.map((pagamento) =>
        String(pagamento.numero_inscricao) ===
        String(pagamentoAtualizado.numero_inscricao)
          ? pagamentoAtualizado
          : pagamento
      )
    );

    setPagamentoSelecionado(pagamentoAtualizado);
  }

  async function atualizarPagamento(
    pagamento: Pagamento,
    novoStatus: Exclude<FiltroStatus, "todos">,
    valor: number | null
  ) {
    const numero = String(pagamento.numero_inscricao);
    setSalvandoNumero(numero);

    const confirmadoEm =
      novoStatus === "pago" ? new Date().toISOString() : null;

    const { data, error } = await supabase
      .from("inscricoes")
      .update({
        status_pagamento: novoStatus,
        valor_pago: novoStatus === "pago" ? valor : null,
        pagamento_confirmado_em: confirmadoEm,
      })
      .eq("numero_inscricao", pagamento.numero_inscricao)
      .select(camposPagamento)
      .single();

    setSalvandoNumero(null);

    if (error) {
      console.error(error);
      alert(
        `Não foi possível atualizar o pagamento:\n\n${error.message}`
      );
      return;
    }

    atualizarPagamentoNaLista(data as Pagamento);
    alert("Pagamento atualizado com sucesso!");
  }

  async function alterarFormaPagamento(
    pagamento: Pagamento
  ) {
    const formaAtual = pagamento.forma_pagamento ?? "";

    const novaForma = window.prompt(
      "Informe a forma de pagamento:",
      formaAtual
    );

    if (novaForma === null) {
      return;
    }

    const formaLimpa = novaForma.trim();

    if (!formaLimpa) {
      alert("Informe uma forma de pagamento válida.");
      return;
    }

    const numero = String(pagamento.numero_inscricao);
    setSalvandoNumero(numero);

    const { data, error } = await supabase
      .from("inscricoes")
      .update({
        forma_pagamento: formaLimpa,
      })
      .eq("numero_inscricao", pagamento.numero_inscricao)
      .select(camposPagamento)
      .single();

    setSalvandoNumero(null);

    if (error) {
      console.error(error);
      alert(
        `Não foi possível alterar a forma de pagamento:\n\n${error.message}`
      );
      return;
    }

    atualizarPagamentoNaLista(data as Pagamento);
    alert("Forma de pagamento atualizada com sucesso!");
  }

  function confirmarComoPago(pagamento: Pagamento) {
    const valorSugerido =
      pagamento.valor_pago !== null
        ? pagamento.valor_pago
        : pagamento.valor_inscricao ?? 0;

    const resposta = window.prompt(
      `Informe o valor pago por ${pagamento.nome}:`,
      String(valorSugerido).replace(".", ",")
    );

    if (resposta === null) {
      return;
    }

    const valorNormalizado = resposta
      .trim()
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

    const valor = Number(valorNormalizado);

    if (!Number.isFinite(valor) || valor < 0) {
      alert("Informe um valor válido.");
      return;
    }

    atualizarPagamento(pagamento, "pago", valor);
  }

  const termo = pesquisa.toLowerCase().trim();

  const pagamentosFiltrados = useMemo(() => {
    return pagamentos.filter((pagamento) => {
      const correspondePesquisa =
        pagamento.nome?.toLowerCase().includes(termo) ||
        pagamento.cpf?.toLowerCase().includes(termo) ||
        pagamento.igreja?.toLowerCase().includes(termo) ||
        String(pagamento.numero_inscricao).includes(termo);

      const correspondeStatus =
        filtroStatus === "todos" ||
        pagamento.status_pagamento === filtroStatus;

      return correspondePesquisa && correspondeStatus;
    });
  }, [pagamentos, termo, filtroStatus]);

  const totalPrevisto = useMemo(() => {
    return pagamentos
      .filter(
        (pagamento) =>
          pagamento.status_pagamento !== "cancelado" &&
          pagamento.status_pagamento !== "cortesia"
      )
      .reduce(
        (total, pagamento) =>
          total + Number(pagamento.valor_inscricao ?? 0),
        0
      );
  }, [pagamentos]);

  const totalPago = useMemo(() => {
    return pagamentos
      .filter(
        (pagamento) =>
          pagamento.status_pagamento === "pago"
      )
      .reduce(
        (total, pagamento) =>
          total + Number(pagamento.valor_pago ?? 0),
        0
      );
  }, [pagamentos]);

  const totalRestante = Math.max(totalPrevisto - totalPago, 0);

  const totalPagos = pagamentos.filter(
    (pagamento) => pagamento.status_pagamento === "pago"
  ).length;

  const totalPendentes = pagamentos.filter(
    (pagamento) => pagamento.status_pagamento === "pendente"
  ).length;

  const totalCortesias = pagamentos.filter(
    (pagamento) => pagamento.status_pagamento === "cortesia"
  ).length;

  const totalGratuitos = pagamentos.filter(
    (pagamento) =>
      Number(pagamento.valor_inscricao ?? 0) === 0 &&
      pagamento.status_pagamento !== "cancelado"
  ).length;

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black text-amber-400">
            Pagamentos
          </h1>

          <p className="mt-3 text-amber-100/70">
            Controle financeiro das inscrições do congresso.
          </p>
        </div>

        <SearchBar
          value={pesquisa}
          onChange={setPesquisa}
          placeholder="Pesquisar por nome, CPF, número ou igreja..."
        />
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <CardResumo
          titulo="Total previsto"
          valor={formatarMoeda(totalPrevisto)}
          destaque="text-amber-300"
        />

        <CardResumo
          titulo="Total arrecadado"
          valor={formatarMoeda(totalPago)}
          destaque="text-green-300"
        />

        <CardResumo
          titulo="Total restante"
          valor={formatarMoeda(totalRestante)}
          destaque="text-yellow-300"
        />

        <CardResumo
          titulo="Pagos"
          valor={String(totalPagos)}
          destaque="text-green-300"
        />

        <CardResumo
          titulo="Pendentes"
          valor={String(totalPendentes)}
          destaque="text-yellow-300"
        />

        <CardResumo
          titulo="Gratuitos"
          valor={String(totalGratuitos)}
          destaque="text-blue-300"
        />
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        {(
          [
            ["todos", "Todos"],
            ["pendente", "Pendentes"],
            ["pago", "Pagos"],
            ["cortesia", "Cortesias"],
            ["cancelado", "Cancelados"],
          ] as const
        ).map(([valor, rotulo]) => (
          <button
            key={valor}
            type="button"
            onClick={() => setFiltroStatus(valor)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              filtroStatus === valor
                ? "bg-amber-400 text-[#2b180d]"
                : "border border-amber-300/20 bg-white/5 text-amber-100 hover:bg-white/10"
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {carregando && (
        <p className="mt-8 text-amber-100/70">
          Carregando pagamentos...
        </p>
      )}

      {erro && (
        <div className="mt-8 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
          {erro}
        </div>
      )}

      {!carregando &&
        !erro &&
        pagamentosFiltrados.length === 0 && (
          <div className="mt-8 rounded-2xl border border-amber-400/20 bg-white/5 p-6">
            Nenhum pagamento encontrado.
          </div>
        )}

      {!carregando &&
        !erro &&
        pagamentosFiltrados.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-amber-400/20 bg-white/5">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-amber-400/20 bg-black/20 text-amber-300">
                <tr>
                  <th className="px-4 py-4">Número</th>
                  <th className="px-4 py-4">Nome</th>
                  <th className="px-4 py-4">Igreja</th>
                  <th className="px-4 py-4">Forma</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Inscrição</th>
                  <th className="px-4 py-4">Pago</th>
                  <th className="px-4 py-4">Restante</th>
                  <th className="px-4 py-4">Confirmação</th>
                  <th className="px-4 py-4 text-center">Ações</th>
                </tr>
              </thead>

              <tbody>
                {pagamentosFiltrados.map((pagamento) => {
                  const valorInscricao = Number(
                    pagamento.valor_inscricao ?? 0
                  );
                  const valorPago = Number(
                    pagamento.valor_pago ?? 0
                  );
                  const valorRestante = Math.max(
                    valorInscricao - valorPago,
                    0
                  );

                  return (
                    <tr
                      key={`${pagamento.numero_inscricao}-${pagamento.cpf}`}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="px-4 py-4 font-bold text-amber-300">
                        {String(
                          pagamento.numero_inscricao
                        ).padStart(5, "0")}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {pagamento.nome}
                      </td>

                      <td className="px-4 py-4">
                        {pagamento.igreja}
                      </td>

                      <td className="px-4 py-4">
                        {pagamento.forma_pagamento ||
                          "Não informado"}
                      </td>

                      <td className="px-4 py-4">
                        {valorInscricao === 0 &&
                        pagamento.status_pagamento !==
                          "cancelado" ? (
                          <span className="inline-flex rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-300">
                            Gratuito
                          </span>
                        ) : (
                          <BadgeStatus
                            status={
                              pagamento.status_pagamento
                            }
                          />
                        )}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {valorInscricao === 0
                          ? "Gratuito"
                          : formatarMoeda(valorInscricao)}
                      </td>

                      <td className="px-4 py-4">
                        {pagamento.valor_pago !== null
                          ? formatarMoeda(valorPago)
                          : "—"}
                      </td>

                      <td className="px-4 py-4">
                        {valorInscricao === 0
                          ? formatarMoeda(0)
                          : formatarMoeda(valorRestante)}
                      </td>

                      <td className="px-4 py-4">
                        {pagamento.pagamento_confirmado_em
                          ? formatarDataHora(
                              pagamento.pagamento_confirmado_em
                            )
                          : "—"}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            abrirFicha(pagamento)
                          }
                          className="rounded-lg bg-blue-500/15 px-3 py-2 transition hover:bg-blue-500/30"
                          title="Visualizar pagamento"
                        >
                          👁️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      {pagamentoSelecionado && (
        <>
          <button
            type="button"
            aria-label="Fechar ficha do pagamento"
            onClick={fecharFicha}
            className="fixed inset-0 z-40 bg-black/60"
          />

          <aside className="fixed right-0 top-0 z-50 h-screen w-full max-w-lg overflow-y-auto border-l border-amber-400/20 bg-[#21150f] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
                  Ficha do pagamento
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  {pagamentoSelecionado.nome}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharFicha}
                disabled={Boolean(salvandoNumero)}
                className="rounded-xl border border-white/10 px-3 py-2 text-lg hover:bg-white/10 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-white/5 p-5">
              <p className="text-sm text-amber-100/70">
                Número da inscrição
              </p>

              <p className="mt-2 text-4xl font-black text-amber-300">
                {String(
                  pagamentoSelecionado.numero_inscricao
                ).padStart(5, "0")}
              </p>

              <div className="mt-4">
                {Number(
                  pagamentoSelecionado.valor_inscricao ?? 0
                ) === 0 &&
                pagamentoSelecionado.status_pagamento !==
                  "cancelado" ? (
                  <span className="inline-flex rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-300">
                    Gratuito
                  </span>
                ) : (
                  <BadgeStatus
                    status={
                      pagamentoSelecionado.status_pagamento
                    }
                  />
                )}
              </div>
            </div>

            <section className="mt-6">
              <h3 className="text-lg font-black text-amber-300">
                👤 Participante
              </h3>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Detalhe
                  label="CPF"
                  valor={pagamentoSelecionado.cpf}
                />

                <Detalhe
                  label="Telefone"
                  valor={pagamentoSelecionado.telefone}
                />

                <Detalhe
                  label="Igreja"
                  valor={pagamentoSelecionado.igreja}
                />

                <Detalhe
                  label="Forma de pagamento"
                  valor={
                    pagamentoSelecionado.forma_pagamento
                  }
                />
              </div>
            </section>

            <section className="mt-6">
              <h3 className="text-lg font-black text-amber-300">
                💳 Informações do pagamento
              </h3>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Detalhe
                  label="Status"
                  valor={
                    Number(
                      pagamentoSelecionado.valor_inscricao ?? 0
                    ) === 0
                      ? "Gratuito"
                      : rotuloStatus(
                          pagamentoSelecionado.status_pagamento
                        )
                  }
                />

                <Detalhe
                  label="Valor da inscrição"
                  valor={
                    Number(
                      pagamentoSelecionado.valor_inscricao ?? 0
                    ) === 0
                      ? "Gratuito — R$ 0,00"
                      : formatarMoeda(
                          Number(
                            pagamentoSelecionado.valor_inscricao
                          )
                        )
                  }
                />

                <Detalhe
                  label="Valor pago"
                  valor={
                    pagamentoSelecionado.valor_pago !== null
                      ? formatarMoeda(
                          Number(
                            pagamentoSelecionado.valor_pago
                          )
                        )
                      : "Não informado"
                  }
                />

                <Detalhe
                  label="Valor restante"
                  valor={formatarMoeda(
                    Math.max(
                      Number(
                        pagamentoSelecionado.valor_inscricao ??
                          0
                      ) -
                        Number(
                          pagamentoSelecionado.valor_pago ?? 0
                        ),
                      0
                    )
                  )}
                />

                <Detalhe
                  label="Data da confirmação"
                  valor={
                    pagamentoSelecionado.pagamento_confirmado_em
                      ? formatarDataHora(
                          pagamentoSelecionado.pagamento_confirmado_em
                        )
                      : "Não confirmado"
                  }
                />
              </div>
            </section>

            <div className="mt-8 grid gap-3">
              <button
                type="button"
                onClick={() =>
                  confirmarComoPago(pagamentoSelecionado)
                }
                disabled={Boolean(salvandoNumero)}
                className="rounded-xl bg-green-500 px-5 py-3 font-bold text-white disabled:opacity-50"
              >
                ✅ Confirmar como pago
              </button>

              <button
                type="button"
                onClick={() =>
                  alterarFormaPagamento(
                    pagamentoSelecionado
                  )
                }
                disabled={Boolean(salvandoNumero)}
                className="rounded-xl border border-amber-300/30 bg-white/5 px-5 py-3 font-bold text-amber-200 hover:bg-white/10 disabled:opacity-50"
              >
                ✏️ Alterar forma de pagamento
              </button>

              <button
                type="button"
                onClick={() =>
                  atualizarPagamento(
                    pagamentoSelecionado,
                    "pendente",
                    null
                  )
                }
                disabled={Boolean(salvandoNumero)}
                className="rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-5 py-3 font-bold text-yellow-200 disabled:opacity-50"
              >
                ⏳ Marcar como pendente
              </button>

              <button
                type="button"
                onClick={() =>
                  atualizarPagamento(
                    pagamentoSelecionado,
                    "cortesia",
                    null
                  )
                }
                disabled={Boolean(salvandoNumero)}
                className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-5 py-3 font-bold text-blue-200 disabled:opacity-50"
              >
                🎁 Marcar como cortesia
              </button>

              <button
                type="button"
                onClick={() =>
                  atualizarPagamento(
                    pagamentoSelecionado,
                    "cancelado",
                    null
                  )
                }
                disabled={Boolean(salvandoNumero)}
                className="rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-3 font-bold text-red-200 disabled:opacity-50"
              >
                🚫 Cancelar pagamento
              </button>

              <button
                type="button"
                onClick={fecharFicha}
                disabled={Boolean(salvandoNumero)}
                className="rounded-xl border border-amber-200/20 px-5 py-3 font-semibold hover:bg-white/10 disabled:opacity-50"
              >
                Fechar
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function CardResumo({
  titulo,
  valor,
  destaque,
}: {
  titulo: string;
  valor: string;
  destaque: string;
}) {
  return (
    <article className="rounded-2xl border border-amber-400/20 bg-white/5 p-5">
      <p className="text-sm text-amber-100/70">
        {titulo}
      </p>

      <p className={`mt-3 text-3xl font-black ${destaque}`}>
        {valor}
      </p>
    </article>
  );
}

function BadgeStatus({ status }: { status: string }) {
  const estilos: Record<string, string> = {
    pago: "bg-green-500/15 text-green-300",
    pendente: "bg-yellow-500/15 text-yellow-300",
    cortesia: "bg-blue-500/15 text-blue-300",
    cancelado: "bg-red-500/15 text-red-300",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        estilos[status] ?? "bg-white/10 text-white"
      }`}
    >
      {rotuloStatus(status)}
    </span>
  );
}

function Detalhe({
  label,
  valor,
}: {
  label: string;
  valor: string | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-300">
        {label}
      </p>

      <p className="mt-2 break-words text-white">
        {valor || "Não informado"}
      </p>
    </div>
  );
}

function rotuloStatus(status: string) {
  const rotulos: Record<string, string> = {
    pago: "Pago",
    pendente: "Pendente",
    cortesia: "Cortesia",
    cancelado: "Cancelado",
  };

  return rotulos[status] ?? status;
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarDataHora(data: string) {
  return new Date(data).toLocaleString("pt-BR");
}