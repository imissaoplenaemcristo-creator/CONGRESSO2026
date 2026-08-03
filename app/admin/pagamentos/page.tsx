"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import SearchBar from "../components/SearchBar";

type Inscricao = {
  numero_inscricao: number;
  nome: string;
  cpf: string;
  telefone: string;
  igreja: string;
  forma_pagamento: string | null;
  status_pagamento: string | null;
  valor_inscricao: number | null;
  valor_pago: number | null;
  pagamento_confirmado_em: string | null;
};

type PagamentoParcial = {
  id: string;
  numero_inscricao: number;
  valor: number;
  comprovante_url: string;
  status: "em_analise" | "aprovado" | "recusado";
  motivo_recusa: string | null;
  criado_em: string;
  analisado_em: string | null;
  forma_pagamento: string | null;
  observacao: string | null;
  origem: string | null;
};

type InscricaoComPagamentos = Inscricao & {
  pagamentos: PagamentoParcial[];
  total_aprovado: number;
  valor_em_analise: number;
  saldo_restante: number;
};

type FiltroStatus =
  | "todos"
  | "pendente"
  | "parcial"
  | "pago"
  | "em_analise"
  | "cortesia"
  | "cancelado";

const camposInscricao = `
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
  const [inscricoes, setInscricoes] =
    useState<InscricaoComPagamentos[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] =
    useState<FiltroStatus>("todos");

  const [selecionada, setSelecionada] =
    useState<InscricaoComPagamentos | null>(null);

  const [pagamentoAberto, setPagamentoAberto] =
    useState<PagamentoParcial | null>(null);

  const [urlComprovante, setUrlComprovante] = useState("");
  const [carregandoComprovante, setCarregandoComprovante] =
    useState(false);

  const [processandoId, setProcessandoId] =
    useState<string | null>(null);

  const [valorManual, setValorManual] = useState("");
  const [formaManual, setFormaManual] = useState("dinheiro");
  const [observacaoManual, setObservacaoManual] = useState("");
  const [registrandoManual, setRegistrandoManual] = useState(false);
  const [valorConfirmadoComprovante, setValorConfirmadoComprovante] =
    useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    const [inscricoesResposta, pagamentosResposta] =
      await Promise.all([
        supabase.rpc("admin_listar_pagamentos_parciais"),
        supabase
          .from("pagamentos_parciais")
          .select(
            "id, numero_inscricao, valor, comprovante_url, status, motivo_recusa, criado_em, analisado_em, forma_pagamento, observacao, origem"
          )
          .order("criado_em", { ascending: false }),
      ]);

    if (inscricoesResposta.error) {
      console.error(inscricoesResposta.error);
      setErro(
        `Não foi possível carregar as inscrições: ${inscricoesResposta.error.message}`
      );
      setCarregando(false);
      return;
    }

    if (pagamentosResposta.error) {
      console.error(pagamentosResposta.error);
      setErro(
        `Não foi possível carregar os pagamentos parciais: ${pagamentosResposta.error.message}`
      );
      setCarregando(false);
      return;
    }

    const pagamentos =
      ((pagamentosResposta.data ?? []) as PagamentoParcial[]).map(
        (pagamento) => ({
          ...pagamento,
          numero_inscricao: Number(pagamento.numero_inscricao),
          valor: Number(pagamento.valor ?? 0),
        })
      );

    const lista = ((inscricoesResposta.data ?? []) as Inscricao[]).map(
      (inscricao) => {
        const pagamentosDaInscricao = pagamentos.filter(
          (pagamento) =>
            Number(pagamento.numero_inscricao) ===
            Number(inscricao.numero_inscricao)
        );

        const totalAprovado = pagamentosDaInscricao
          .filter((pagamento) => pagamento.status === "aprovado")
          .reduce(
            (total, pagamento) => total + Number(pagamento.valor),
            0
          );

        const valorEmAnalise = pagamentosDaInscricao
          .filter((pagamento) => pagamento.status === "em_analise")
          .reduce(
            (total, pagamento) => total + Number(pagamento.valor),
            0
          );

        const valorTotal = Number(inscricao.valor_inscricao ?? 0);

        return {
          ...inscricao,
          numero_inscricao: Number(inscricao.numero_inscricao),
          valor_inscricao: valorTotal,
          valor_pago: Number(inscricao.valor_pago ?? totalAprovado),
          pagamentos: pagamentosDaInscricao,
          total_aprovado: totalAprovado,
          valor_em_analise: valorEmAnalise,
          saldo_restante: Math.max(valorTotal - totalAprovado, 0),
        };
      }
    );

    setInscricoes(lista);

    if (selecionada) {
      const atualizada =
        lista.find(
          (item) =>
            item.numero_inscricao === selecionada.numero_inscricao
        ) ?? null;

      setSelecionada(atualizada);
    }

    setCarregando(false);
  }

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function abrirComprovante(pagamento: PagamentoParcial) {
    if (
      pagamento.comprovante_url ===
      "registrado-manualmente-pelo-admin"
    ) {
      alert("Este pagamento foi registrado manualmente e não possui comprovante.");
      return;
    }

    setPagamentoAberto(pagamento);
    setValorConfirmadoComprovante("");
    setUrlComprovante("");
    setCarregandoComprovante(true);

    const buckets = [
      "comprovantes-parciais",
      "comprovantes-pix",
    ];

    let signedUrl = "";
    let ultimoErro = "";

    for (const bucket of buckets) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(pagamento.comprovante_url, 60 * 10);

      if (data?.signedUrl) {
        signedUrl = data.signedUrl;
        break;
      }

      ultimoErro = error?.message ?? ultimoErro;
    }

    setCarregandoComprovante(false);

    if (!signedUrl) {
      alert(
        ultimoErro ||
          "Não foi possível abrir o comprovante."
      );
      setPagamentoAberto(null);
      return;
    }

    setUrlComprovante(signedUrl);
  }

  function fecharComprovante() {
    if (processandoId) {
      return;
    }

    setPagamentoAberto(null);
    setUrlComprovante("");
    setValorConfirmadoComprovante("");
  }

  async function aprovarPagamento(pagamento: PagamentoParcial) {
    const valorConfirmado = Number(
      valorConfirmadoComprovante.replace(",", ".")
    );

    if (!Number.isFinite(valorConfirmado) || valorConfirmado <= 0) {
      alert("Informe o valor realmente recebido.");
      return;
    }

    const inscricaoDoPagamento = inscricoes.find(
      (item) =>
        item.numero_inscricao === pagamento.numero_inscricao
    );

    if (
      inscricaoDoPagamento &&
      valorConfirmado > inscricaoDoPagamento.saldo_restante
    ) {
      alert(
        `O valor não pode ultrapassar o saldo restante de ${formatarMoeda(
          inscricaoDoPagamento.saldo_restante
        )}.`
      );
      return;
    }

    const confirmou = window.confirm(
      `Confirmar o recebimento de ${formatarMoeda(
        valorConfirmado
      )}?`
    );

    if (!confirmou) {
      return;
    }

    setProcessandoId(pagamento.id);

    const { error } = await supabase.rpc(
      "aprovar_pagamento_com_valor",
      {
        pagamento_id: pagamento.id,
        valor_confirmado: valorConfirmado,
      }
    );

    setProcessandoId(null);

    if (error) {
      console.error(error);
      alert(
        `Não foi possível confirmar o pagamento:

${error.message}`
      );
      return;
    }

    fecharComprovante();
    await carregarDados();
    alert("Pagamento confirmado com sucesso!");
  }

  async function recusarPagamento(pagamento: PagamentoParcial) {
    const motivo = window.prompt(
      "Informe o motivo da recusa:",
      "Comprovante ilegível ou pagamento não localizado."
    );

    if (motivo === null) {
      return;
    }

    const motivoLimpo = motivo.trim();

    if (!motivoLimpo) {
      alert("Informe o motivo da recusa.");
      return;
    }

    setProcessandoId(pagamento.id);

    const { error } = await supabase.rpc(
      "recusar_pagamento_parcial",
      {
        pagamento_id: pagamento.id,
        motivo_informado: motivoLimpo,
      }
    );

    setProcessandoId(null);

    if (error) {
      console.error(error);
      alert(
        `Não foi possível recusar o pagamento:\n\n${error.message}`
      );
      return;
    }

    fecharComprovante();
    await carregarDados();
    alert("Pagamento recusado. O motivo ficará visível ao participante.");
  }

  async function editarPagamentoManual(
    pagamento: PagamentoParcial
  ) {
    if (pagamento.origem !== "admin") {
      alert(
        "Somente pagamentos registrados manualmente pelo admin podem ser editados."
      );
      return;
    }

    const valorAtual = String(pagamento.valor).replace(".", ",");
    const novoValorTexto = window.prompt(
      "Informe o novo valor do pagamento:",
      valorAtual
    );

    if (novoValorTexto === null) {
      return;
    }

    const novoValor = Number(
      novoValorTexto
        .trim()
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    );

    if (!Number.isFinite(novoValor) || novoValor <= 0) {
      alert("Informe um valor válido maior que zero.");
      return;
    }

    const novaForma = window.prompt(
      "Informe a forma de pagamento: pix, dinheiro, cartao ou carne",
      pagamento.forma_pagamento || "dinheiro"
    );

    if (novaForma === null) {
      return;
    }

    const formaLimpa = novaForma.trim().toLowerCase();

    if (!["pix", "dinheiro", "cartao", "carne"].includes(formaLimpa)) {
      alert("Forma inválida. Use pix, dinheiro, cartao ou carne.");
      return;
    }

    const novaObservacao = window.prompt(
      "Observação do pagamento:",
      pagamento.observacao || ""
    );

    if (novaObservacao === null) {
      return;
    }

    const confirmou = window.confirm(
      `Salvar as alterações deste pagamento para ${formatarMoeda(
        novoValor
      )}?`
    );

    if (!confirmou) {
      return;
    }

    setProcessandoId(pagamento.id);

    const { error } = await supabase.rpc(
      "editar_pagamento_manual_admin",
      {
        pagamento_id: pagamento.id,
        novo_valor: novoValor,
        nova_forma: formaLimpa,
        nova_observacao: novaObservacao.trim() || null,
      }
    );

    setProcessandoId(null);

    if (error) {
      console.error(error);
      alert(
        `Não foi possível editar o pagamento:\n\n${error.message}`
      );
      return;
    }

    await carregarDados();
    alert("Pagamento manual atualizado com sucesso!");
  }

  async function excluirPagamentoManual(
    pagamento: PagamentoParcial
  ) {
    if (pagamento.origem !== "admin") {
      alert(
        "Somente pagamentos registrados manualmente pelo admin podem ser excluídos."
      );
      return;
    }

    const confirmou = window.confirm(
      `Excluir o pagamento manual de ${formatarMoeda(
        pagamento.valor
      )}? O saldo da inscrição será recalculado.`
    );

    if (!confirmou) {
      return;
    }

    setProcessandoId(pagamento.id);

    const { error } = await supabase.rpc(
      "excluir_pagamento_manual_admin",
      {
        pagamento_id: pagamento.id,
      }
    );

    setProcessandoId(null);

    if (error) {
      console.error(error);
      alert(
        `Não foi possível excluir o pagamento:\n\n${error.message}`
      );
      return;
    }

    await carregarDados();
    alert("Pagamento manual excluído com sucesso!");
  }

  async function registrarPagamentoManual() {
    if (!selecionada) {
      return;
    }

    const valor = Number(valorManual.replace(",", "."));

    if (!Number.isFinite(valor) || valor <= 0) {
      alert("Informe um valor válido maior que zero.");
      return;
    }

    if (valor > selecionada.saldo_restante) {
      alert(
        `O valor não pode ultrapassar o saldo restante de ${formatarMoeda(
          selecionada.saldo_restante
        )}.`
      );
      return;
    }

    if (!formaManual) {
      alert("Escolha a forma de pagamento.");
      return;
    }

    setRegistrandoManual(true);

    const { error } = await supabase.rpc(
      "registrar_pagamento_manual_admin",
      {
        numero_informado: selecionada.numero_inscricao,
        valor_informado: valor,
        forma_informada: formaManual,
        observacao_informada:
          observacaoManual.trim() || null,
      }
    );

    setRegistrandoManual(false);

    if (error) {
      console.error(error);
      alert(
        `Não foi possível registrar o pagamento:\n\n${error.message}`
      );
      return;
    }

    setValorManual("");
    setFormaManual("dinheiro");
    setObservacaoManual("");

    await carregarDados();
    alert("Pagamento manual registrado com sucesso!");
  }

  const termo = pesquisa.toLowerCase().trim();

  const inscricoesFiltradas = useMemo(() => {
    return inscricoes.filter((inscricao) => {
      const correspondePesquisa =
        inscricao.nome?.toLowerCase().includes(termo) ||
        inscricao.cpf?.toLowerCase().includes(termo) ||
        inscricao.igreja?.toLowerCase().includes(termo) ||
        String(inscricao.numero_inscricao).includes(termo);

      const statusNormalizado = normalizarStatus(
        inscricao.status_pagamento
      );

      const correspondeFiltro =
        filtroStatus === "todos" ||
        (filtroStatus === "em_analise"
          ? inscricao.pagamentos.some(
              (pagamento) => pagamento.status === "em_analise"
            )
          : statusNormalizado === filtroStatus);

      return correspondePesquisa && correspondeFiltro;
    });
  }, [inscricoes, termo, filtroStatus]);

  const resumo = useMemo(() => {
    const validas = inscricoes.filter(
      (inscricao) =>
        normalizarStatus(inscricao.status_pagamento) !== "cancelado" &&
        normalizarStatus(inscricao.status_pagamento) !== "cortesia"
    );

    const totalPrevisto = validas.reduce(
      (total, inscricao) =>
        total + Number(inscricao.valor_inscricao ?? 0),
      0
    );

    const totalAprovado = validas.reduce(
      (total, inscricao) =>
        total + Number(inscricao.total_aprovado ?? 0),
      0
    );

    return {
      totalPrevisto,
      totalAprovado,
      totalRestante: Math.max(totalPrevisto - totalAprovado, 0),
      pagos: inscricoes.filter(
        (item) => normalizarStatus(item.status_pagamento) === "pago"
      ).length,
      parciais: inscricoes.filter(
        (item) => normalizarStatus(item.status_pagamento) === "parcial"
      ).length,
      emAnalise: inscricoes.reduce(
        (total, item) =>
          total +
          item.pagamentos.filter(
            (pagamento) => pagamento.status === "em_analise"
          ).length,
        0
      ),
      recusados: inscricoes.reduce(
        (total, item) =>
          total +
          item.pagamentos.filter(
            (pagamento) => pagamento.status === "recusado"
          ).length,
        0
      ),
    };
  }, [inscricoes]);

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black text-amber-400">
            Pagamentos
          </h1>

          <p className="mt-3 text-amber-100/70">
            Controle de pagamentos parciais e comprovantes PIX.
          </p>
        </div>

        <SearchBar
          value={pesquisa}
          onChange={setPesquisa}
          placeholder="Pesquisar por nome, CPF, número ou igreja..."
        />
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumo
          titulo="Total previsto"
          valor={formatarMoeda(resumo.totalPrevisto)}
          destaque="text-amber-300"
        />

        <CardResumo
          titulo="Total aprovado"
          valor={formatarMoeda(resumo.totalAprovado)}
          destaque="text-green-300"
        />

        <CardResumo
          titulo="Total restante"
          valor={formatarMoeda(resumo.totalRestante)}
          destaque="text-yellow-300"
        />

        <CardResumo
          titulo="Pagos"
          valor={String(resumo.pagos)}
          destaque="text-green-300"
        />

        <CardResumo
          titulo="Parciais"
          valor={String(resumo.parciais)}
          destaque="text-blue-300"
        />

        <CardResumo
          titulo="Comprovantes em análise"
          valor={String(resumo.emAnalise)}
          destaque="text-orange-300"
        />

        <CardResumo
          titulo="Comprovantes recusados"
          valor={String(resumo.recusados)}
          destaque="text-red-300"
        />
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        {(
          [
            ["todos", "Todos"],
            ["pendente", "Pendentes"],
            ["parcial", "Parciais"],
            ["pago", "Pagos"],
            ["em_analise", "Em análise"],
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
        inscricoesFiltradas.length === 0 && (
          <div className="mt-8 rounded-2xl border border-amber-400/20 bg-white/5 p-6">
            Nenhum pagamento encontrado.
          </div>
        )}

      {!carregando &&
        !erro &&
        inscricoesFiltradas.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-amber-400/20 bg-white/5">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-amber-400/20 bg-black/20 text-amber-300">
                <tr>
                  <th className="px-4 py-4">Número</th>
                  <th className="px-4 py-4">Nome</th>
                  <th className="px-4 py-4">Forma</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Total</th>
                  <th className="px-4 py-4">Aprovado</th>
                  <th className="px-4 py-4">Restante</th>
                  <th className="px-4 py-4">Em análise</th>
                  <th className="px-4 py-4 text-center">Ações</th>
                </tr>
              </thead>

              <tbody>
                {inscricoesFiltradas.map((inscricao) => (
                  <tr
                    key={`${inscricao.numero_inscricao}-${inscricao.cpf}`}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="px-4 py-4 font-bold text-amber-300">
                      {String(inscricao.numero_inscricao).padStart(
                        5,
                        "0"
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-semibold">{inscricao.nome}</p>
                      <p className="mt-1 text-xs text-white/50">
                        {inscricao.igreja}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      {formatarForma(inscricao.forma_pagamento)}
                    </td>

                    <td className="px-4 py-4">
                      <BadgeStatus
                        status={normalizarStatus(
                          inscricao.status_pagamento
                        )}
                      />
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {formatarMoeda(
                        Number(inscricao.valor_inscricao ?? 0)
                      )}
                    </td>

                    <td className="px-4 py-4 text-green-300">
                      {formatarMoeda(inscricao.total_aprovado)}
                    </td>

                    <td className="px-4 py-4 text-yellow-300">
                      {formatarMoeda(inscricao.saldo_restante)}
                    </td>

                    <td className="px-4 py-4">
                      {inscricao.valor_em_analise > 0 ? (
                        <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-300">
                          {formatarMoeda(inscricao.valor_em_analise)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelecionada(inscricao)}
                        className="rounded-lg bg-blue-500/15 px-4 py-2 font-bold text-blue-200 transition hover:bg-blue-500/30"
                      >
                        Ver pagamentos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {selecionada && (
        <>
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setSelecionada(null)}
            className="fixed inset-0 z-40 bg-black/60"
          />

          <aside className="fixed right-0 top-0 z-50 h-screen w-full max-w-2xl overflow-y-auto border-l border-amber-400/20 bg-[#21150f] p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
                  Pagamentos da inscrição
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  {selecionada.nome}
                </h2>

                <p className="mt-2 text-amber-100/60">
                  Inscrição{" "}
                  {String(selecionada.numero_inscricao).padStart(
                    5,
                    "0"
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelecionada(null)}
                className="rounded-xl border border-white/10 px-3 py-2 text-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <ResumoPequeno
                titulo="Valor total"
                valor={formatarMoeda(
                  Number(selecionada.valor_inscricao ?? 0)
                )}
              />

              <ResumoPequeno
                titulo="Total aprovado"
                valor={formatarMoeda(selecionada.total_aprovado)}
              />

              <ResumoPequeno
                titulo="Saldo restante"
                valor={formatarMoeda(selecionada.saldo_restante)}
              />
            </div>

            <section className="mt-8 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
              <h3 className="text-xl font-black text-amber-300">
                💰 Registrar pagamento manual
              </h3>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block font-semibold">
                    Valor recebido
                  </span>

                  <input
                    type="text"
                    inputMode="decimal"
                    value={valorManual}
                    onChange={(event) =>
                      setValorManual(
                        event.target.value.replace(
                          /[^0-9,.]/g,
                          ""
                        )
                      )
                    }
                    placeholder="Ex.: 50,00"
                    className="w-full rounded-xl border border-amber-200/20 bg-black/20 px-4 py-3 outline-none focus:border-amber-400"
                  />

                  <span className="mt-2 block text-sm text-amber-100/60">
                    Saldo máximo:{" "}
                    {formatarMoeda(selecionada.saldo_restante)}
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block font-semibold">
                    Forma de pagamento
                  </span>

                  <select
                    value={formaManual}
                    onChange={(event) =>
                      setFormaManual(event.target.value)
                    }
                    className="w-full rounded-xl border border-amber-200/20 bg-[#2b180d] px-4 py-3 outline-none focus:border-amber-400"
                  >
                    <option value="pix">PIX</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao">Cartão</option>
                    <option value="carne">Carnê</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block font-semibold">
                    Observação
                  </span>

                  <textarea
                    value={observacaoManual}
                    onChange={(event) =>
                      setObservacaoManual(event.target.value)
                    }
                    rows={3}
                    placeholder="Ex.: Pagamento recebido pela irmã Martha."
                    className="w-full resize-none rounded-xl border border-amber-200/20 bg-black/20 px-4 py-3 outline-none focus:border-amber-400"
                  />
                </label>

                <button
                  type="button"
                  onClick={registrarPagamentoManual}
                  disabled={
                    registrandoManual ||
                    !valorManual ||
                    selecionada.saldo_restante <= 0
                  }
                  className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-5 py-4 font-black text-[#2b180d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {registrandoManual
                    ? "Registrando..."
                    : "Registrar pagamento"}
                </button>
              </div>
            </section>

            <section className="mt-8">
              <h3 className="text-xl font-black text-amber-300">
                Histórico de pagamentos
              </h3>

              {selecionada.pagamentos.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-amber-200/10 bg-white/5 p-5 text-amber-100/60">
                  Nenhum pagamento parcial enviado.
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {selecionada.pagamentos.map((pagamento) => (
                    <article
                      key={pagamento.id}
                      className="rounded-2xl border border-amber-200/10 bg-white/5 p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-2xl font-black">
                            {formatarMoeda(pagamento.valor)}
                          </p>

                          <p className="mt-1 text-sm text-amber-100/60">
                            Enviado em{" "}
                            {formatarDataHora(pagamento.criado_em)}
                          </p>
                        </div>

                        <BadgeParcela status={pagamento.status} />
                      </div>

                      {pagamento.status === "recusado" && (
                        <div className="mt-4 rounded-xl border border-red-300/20 bg-red-500/10 p-4 text-red-100">
                          <strong>Motivo:</strong>{" "}
                          {pagamento.motivo_recusa ||
                            "Não informado."}
                        </div>
                      )}

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-amber-300">
                            Forma
                          </p>
                          <p className="mt-2">
                            {formatarForma(
                              pagamento.forma_pagamento
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-amber-300">
                            Origem
                          </p>
                          <p className="mt-2">
                            {pagamento.origem === "admin"
                              ? "Registrado pelo admin"
                              : "Enviado pelo participante"}
                          </p>
                        </div>
                      </div>

                      {pagamento.observacao && (
                        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4">
                          <strong>Observação:</strong>{" "}
                          {pagamento.observacao}
                        </div>
                      )}

                      {pagamento.comprovante_url !==
                        "registrado-manualmente-pelo-admin" && (
                        <button
                          type="button"
                          onClick={() =>
                            abrirComprovante(pagamento)
                          }
                          className="mt-4 w-full rounded-xl border border-blue-400/30 bg-blue-500/10 px-5 py-3 font-bold text-blue-200 hover:bg-blue-500/20"
                        >
                          📎 Ver comprovante
                        </button>
                      )}

                      {pagamento.origem === "admin" && (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() =>
                              editarPagamentoManual(pagamento)
                            }
                            disabled={processandoId === pagamento.id}
                            className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-5 py-3 font-bold text-blue-200 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {processandoId === pagamento.id
                              ? "Salvando..."
                              : "✏️ Editar pagamento"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              excluirPagamentoManual(pagamento)
                            }
                            disabled={processandoId === pagamento.id}
                            className="rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-3 font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {processandoId === pagamento.id
                              ? "Excluindo..."
                              : "🗑️ Excluir pagamento"}
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </>
      )}

      {pagamentoAberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6">
          <button
            type="button"
            aria-label="Fechar comprovante"
            onClick={fecharComprovante}
            className="absolute inset-0"
          />

          <section className="relative z-10 flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-amber-300/20 bg-[#21150f] shadow-2xl">
            <header className="flex items-center justify-between gap-4 border-b border-amber-300/15 p-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
                  Comprovante
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {pagamentoAberto.status === "em_analise" &&
                  pagamentoAberto.valor === 0
                    ? "Valor ainda não confirmado"
                    : formatarMoeda(pagamentoAberto.valor)}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharComprovante}
                className="rounded-xl border border-white/10 px-3 py-2 text-lg hover:bg-white/10"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto bg-black/30 p-4 sm:p-6">
              {carregandoComprovante && (
                <p className="py-16 text-center text-amber-100/70">
                  Abrindo comprovante...
                </p>
              )}

              {urlComprovante &&
                (pagamentoAberto.comprovante_url
                  .toLowerCase()
                  .endsWith(".pdf") ? (
                  <iframe
                    src={urlComprovante}
                    title="Comprovante de pagamento"
                    className="h-[65vh] w-full rounded-xl bg-white"
                  />
                ) : (
                  <img
                    src={urlComprovante}
                    alt="Comprovante de pagamento"
                    className="mx-auto max-h-[65vh] max-w-full rounded-xl bg-white object-contain"
                  />
                ))}
            </div>

            <footer className="border-t border-amber-300/15 p-4 sm:p-6">
              {pagamentoAberto.status === "em_analise" && (
                <div className="mb-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                  <label className="block">
                    <span className="mb-2 block font-black text-amber-300">
                      Valor realmente recebido
                    </span>

                    <input
                      type="text"
                      inputMode="decimal"
                      value={valorConfirmadoComprovante}
                      onChange={(event) =>
                        setValorConfirmadoComprovante(
                          event.target.value.replace(
                            /[^0-9,.]/g,
                            ""
                          )
                        )
                      }
                      placeholder="Ex.: 100,00"
                      className="w-full rounded-xl border border-amber-200/20 bg-black/20 px-4 py-3 text-lg outline-none focus:border-amber-400"
                    />

                    <span className="mt-2 block text-sm text-amber-100/60">
                      Confira o comprovante e informe exatamente o valor
                      recebido antes de aprovar.
                    </span>
                  </label>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                {pagamentoAberto.status === "em_analise" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        aprovarPagamento(pagamentoAberto)
                      }
                      disabled={
                        processandoId === pagamentoAberto.id ||
                        !valorConfirmadoComprovante
                      }
                      className="rounded-xl bg-green-500 px-5 py-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ✅ Confirmar valor
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        recusarPagamento(pagamentoAberto)
                      }
                      disabled={
                        processandoId === pagamentoAberto.id
                      }
                      className="rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-4 font-black text-red-200 disabled:opacity-50"
                    >
                      ❌ Recusar
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={fecharComprovante}
                  className="rounded-xl border border-white/10 px-5 py-4 font-bold hover:bg-white/10"
                >
                  Fechar
                </button>
              </div>
            </footer>
          </section>
        </div>
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
      <p className="text-sm text-amber-100/70">{titulo}</p>
      <p className={`mt-3 text-3xl font-black ${destaque}`}>
        {valor}
      </p>
    </article>
  );
}

function ResumoPequeno({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-200/10 bg-white/5 p-4">
      <p className="text-sm text-amber-100/60">{titulo}</p>
      <p className="mt-2 text-xl font-black">{valor}</p>
    </div>
  );
}

function BadgeStatus({ status }: { status: string }) {
  const estilos: Record<string, string> = {
    pago: "bg-green-500/15 text-green-300",
    parcial: "bg-blue-500/15 text-blue-300",
    pendente: "bg-yellow-500/15 text-yellow-300",
    "pagamento em análise":
      "bg-orange-500/15 text-orange-300",
    cortesia: "bg-purple-500/15 text-purple-300",
    cancelado: "bg-red-500/15 text-red-300",
  };

  const rotulos: Record<string, string> = {
    pago: "Pago",
    parcial: "Parcial",
    pendente: "Pendente",
    "pagamento em análise": "Em análise",
    cortesia: "Cortesia",
    cancelado: "Cancelado",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        estilos[status] ?? "bg-white/10 text-white"
      }`}
    >
      {rotulos[status] ?? status}
    </span>
  );
}

function BadgeParcela({
  status,
}: {
  status: PagamentoParcial["status"];
}) {
  const mapa = {
    em_analise: {
      texto: "Em análise",
      classe: "bg-orange-500/15 text-orange-300",
    },
    aprovado: {
      texto: "Aprovado",
      classe: "bg-green-500/15 text-green-300",
    },
    recusado: {
      texto: "Recusado",
      classe: "bg-red-500/15 text-red-300",
    },
  }[status];

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${mapa.classe}`}
    >
      {mapa.texto}
    </span>
  );
}

function normalizarStatus(status: string | null) {
  return String(status ?? "pendente")
    .trim()
    .toLowerCase()
    .replaceAll("_", " ");
}

function formatarForma(forma: string | null) {
  const mapa: Record<string, string> = {
    pix: "PIX",
    dinheiro: "Dinheiro",
    cartao: "Cartão",
    carne: "Carnê",
  };

  return mapa[String(forma ?? "").toLowerCase()] || forma || "Não informado";
}

function formatarMoeda(valor: number) {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarDataHora(data: string) {
  return new Date(data).toLocaleString("pt-BR");
}