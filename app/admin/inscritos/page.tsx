"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { gerarComprovante } from "../../lib/gerarComprovante";
import { supabase } from "../../lib/supabase";
import SearchBar from "../components/SearchBar";
import ActionButtons from "../components/ActionButtons";
import FormularioEdicao, {
  DadosEdicao,
} from "../components/FormularioEdicao";

type Inscricao = {
  numero_inscricao: number | string;
  qr_token: string | null;
  nome: string;
  cpf: string;
  nascimento: string | null;
  telefone: string;
  email: string;
  igreja: string;

  medicamento_controlado: string | null;
  qual_medicamento: string | null;

  alergia_remedio: string | null;
  qual_alergia_remedio: string | null;

  alergia_alimento: string | null;
  qual_alergia_alimento: string | null;

  necessidade_especial: string | null;

  contato_emergencia_nome: string | null;
  contato_emergencia_telefone: string | null;

  menor_idade: string | null;
  responsavel_nome: string | null;
  responsavel_telefone: string | null;

  todos_os_dias: string | null;
  primeira_vez: string | null;
  forma_pagamento: string | null;
  valor_inscricao: number | null;
status_pagamento: string | null;

  checkin_realizado: boolean;
  checkin_em: string | null;
};

const camposInscricao = `
  numero_inscricao,
  qr_token,
  nome,
  cpf,
  nascimento,
  telefone,
  email,
  igreja,
  medicamento_controlado,
  qual_medicamento,
  alergia_remedio,
  qual_alergia_remedio,
  alergia_alimento,
  qual_alergia_alimento,
  necessidade_especial,
  contato_emergencia_nome,
  contato_emergencia_telefone,
  menor_idade,
  responsavel_nome,
  responsavel_telefone,
  todos_os_dias,
  primeira_vez,
  forma_pagamento,
  valor_inscricao,
status_pagamento,
  checkin_realizado,
  checkin_em
`;

export default function InscritosPage() {
  const [inscritos, setInscritos] = useState<Inscricao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pesquisa, setPesquisa] = useState("");

  const [inscricaoSelecionada, setInscricaoSelecionada] =
    useState<Inscricao | null>(null);

  const [imagemQrCode, setImagemQrCode] = useState("");
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [fazendoCheckin, setFazendoCheckin] = useState(false);

  useEffect(() => {
    async function carregarInscritos() {
      setCarregando(true);
      setErro("");

      const { data, error } = await supabase
        .from("inscricoes")
        .select(camposInscricao)
        .order("numero_inscricao", { ascending: false });

      if (error) {
        console.error(error);
        setErro("Não foi possível carregar os inscritos.");
        setCarregando(false);
        return;
      }

      setInscritos((data as Inscricao[]) ?? []);
      setCarregando(false);
    }

    carregarInscritos();
  }, []);

  useEffect(() => {
    async function gerarQrCode() {
      if (!inscricaoSelecionada?.qr_token) {
        setImagemQrCode("");
        return;
      }

      try {
        const imagem = await QRCode.toDataURL(
          inscricaoSelecionada.qr_token,
          {
            width: 500,
            margin: 2,
          }
        );

        setImagemQrCode(imagem);
      } catch (error) {
        console.error(error);
        setImagemQrCode("");
      }
    }

    gerarQrCode();
  }, [inscricaoSelecionada]);

  function abrirFicha(inscricao: Inscricao) {
    setEditando(false);
    setInscricaoSelecionada(inscricao);
  }

  function abrirEdicao(inscricao: Inscricao) {
    setInscricaoSelecionada(inscricao);
    setEditando(true);
  }

  function fecharFicha() {
    if (salvando || excluindo || fazendoCheckin) {
      return;
    }

    setEditando(false);
    setInscricaoSelecionada(null);
  }

  function atualizarInscricaoNaLista(
    inscricaoAtualizada: Inscricao
  ) {
    setInscritos((listaAnterior) =>
      listaAnterior.map((inscricao) =>
        String(inscricao.numero_inscricao) ===
        String(inscricaoAtualizada.numero_inscricao)
          ? inscricaoAtualizada
          : inscricao
      )
    );

    setInscricaoSelecionada(inscricaoAtualizada);
  }

  async function salvarEdicao(dados: DadosEdicao) {
    if (!inscricaoSelecionada) {
      return;
    }

    setSalvando(true);

    const { data, error } = await supabase
      .from("inscricoes")
      .update({
        nome: dados.nome.trim(),
        telefone: dados.telefone.trim(),
        email: dados.email.trim(),
        igreja: dados.igreja.trim(),

        forma_pagamento:
          dados.forma_pagamento?.trim() || null,

        contato_emergencia_nome:
          dados.contato_emergencia_nome?.trim() || null,

        contato_emergencia_telefone:
          dados.contato_emergencia_telefone?.trim() || null,

        necessidade_especial:
          dados.necessidade_especial?.trim() || null,

        responsavel_nome:
          dados.responsavel_nome?.trim() || null,

        responsavel_telefone:
          dados.responsavel_telefone?.trim() || null,
      })
      .eq(
        "numero_inscricao",
        inscricaoSelecionada.numero_inscricao
      )
      .select(camposInscricao)
      .single();

    setSalvando(false);

    if (error) {
      console.error(error);
      alert("Não foi possível salvar as alterações.");
      return;
    }

    const inscricaoAtualizada = data as Inscricao;

    atualizarInscricaoNaLista(inscricaoAtualizada);
    setEditando(false);

    alert("Inscrição atualizada com sucesso!");
  }

async function realizarCheckin(inscricao: Inscricao) {
  if (inscricao.checkin_realizado) {
    alert("Este participante já realizou o check-in.");
    return;
  }

  if (!inscricao.qr_token) {
    alert("Este participante não possui QR Code.");
    return;
  }

  const confirmou = window.confirm(
    `Confirmar o check-in de ${inscricao.nome}?`
  );

  if (!confirmou) {
    return;
  }

  setFazendoCheckin(true);

  const { data: retornoRpc, error } = await supabase
    .rpc("confirmar_checkin", {
      token_informado: inscricao.qr_token,
    })
    .maybeSingle();

  setFazendoCheckin(false);

  if (error) {
    console.error("Erro ao realizar check-in:", error);
    alert(error.message || "Não foi possível realizar o check-in.");
    return;
  }

  if (!retornoRpc) {
    alert("O banco de dados não retornou o participante atualizado.");
    return;
  }

  const inscricaoAtualizada = retornoRpc as Inscricao;

  atualizarInscricaoNaLista(inscricaoAtualizada);

  alert("Check-in realizado com sucesso!");
}

  async function excluirInscricao(inscricao: Inscricao) {
    const confirmou = window.confirm(
      `Deseja realmente excluir a inscrição de ${inscricao.nome}?\n\nEsta ação não poderá ser desfeita.`
    );

    if (!confirmou) {
      return;
    }

    setExcluindo(true);

    const { error } = await supabase
      .from("inscricoes")
      .delete()
      .eq("numero_inscricao", inscricao.numero_inscricao);

    setExcluindo(false);

    if (error) {
      console.error(error);
      alert("Não foi possível excluir a inscrição.");
      return;
    }

    setInscritos((listaAnterior) =>
      listaAnterior.filter(
        (item) =>
          String(item.numero_inscricao) !==
          String(inscricao.numero_inscricao)
      )
    );

    setEditando(false);
    setInscricaoSelecionada(null);

    alert("Inscrição excluída com sucesso.");
  }

  const termoPesquisa = pesquisa.toLowerCase().trim();

  const inscritosFiltrados = inscritos.filter((inscricao) => {
    return (
      inscricao.nome
        ?.toLowerCase()
        .includes(termoPesquisa) ||
      inscricao.cpf
        ?.toLowerCase()
        .includes(termoPesquisa) ||
      inscricao.igreja
        ?.toLowerCase()
        .includes(termoPesquisa) ||
      String(inscricao.numero_inscricao).includes(
        termoPesquisa
      )
    );
  });

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black text-amber-400">
            Inscritos
          </h1>

          <p className="mt-3 text-amber-100/70">
            Lista de participantes cadastrados no congresso.
          </p>

          <p className="mt-2 text-sm font-semibold text-amber-300">
            Total exibido: {inscritosFiltrados.length}
          </p>
        </div>

        <SearchBar
          value={pesquisa}
          onChange={setPesquisa}
          placeholder="Pesquisar por nome, CPF, número ou igreja..."
        />
      </div>

      {carregando && (
        <p className="mt-8 text-amber-100/70">
          Carregando inscritos...
        </p>
      )}

      {erro && (
        <div className="mt-8 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
          {erro}
        </div>
      )}

      {!carregando && !erro && inscritos.length === 0 && (
        <div className="mt-8 rounded-2xl border border-amber-400/20 bg-white/5 p-6">
          Nenhum inscrito encontrado.
        </div>
      )}

      {!carregando &&
        !erro &&
        inscritos.length > 0 &&
        inscritosFiltrados.length === 0 && (
          <div className="mt-8 rounded-2xl border border-amber-400/20 bg-white/5 p-6">
            Nenhum inscrito corresponde à pesquisa.
          </div>
        )}

      {!carregando &&
        !erro &&
        inscritosFiltrados.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-amber-400/20 bg-white/5">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-amber-400/20 bg-black/20 text-amber-300">
                <tr>
                  <th className="px-4 py-4">Número</th>
                  <th className="px-4 py-4">Nome</th>
                  <th className="px-4 py-4">CPF</th>
                  <th className="px-4 py-4">Telefone</th>
                  <th className="px-4 py-4">E-mail</th>
                  <th className="px-4 py-4">Igreja</th>

<th className="px-4 py-4">
  Forma
</th>

<th className="px-4 py-4">
  Valor
</th>

<th className="px-4 py-4">
  Status do pagamento
</th>

<th className="px-4 py-4">
  Check-in
</th>
                  <th className="px-4 py-4 text-center">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {inscritosFiltrados.map((inscricao) => (
                  <tr
                    key={`${inscricao.numero_inscricao}-${inscricao.cpf}`}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="px-4 py-4 font-bold text-amber-300">
                      {String(
                        inscricao.numero_inscricao
                      ).padStart(5, "0")}
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {inscricao.nome}
                    </td>

                    <td className="px-4 py-4">
                      {inscricao.cpf}
                    </td>

                    <td className="px-4 py-4">
                      {inscricao.telefone}
                    </td>

                    <td className="px-4 py-4">
                      {inscricao.email}
                    </td>

                    <td className="px-4 py-4">
                      {inscricao.igreja}
                    </td>

                    <td className="px-4 py-4">
  {inscricao.forma_pagamento || "Não informado"}
</td>

<td className="px-4 py-4 font-semibold">
  {Number(inscricao.valor_inscricao ?? 0) === 0
    ? "Gratuito"
    : formatarMoeda(
        Number(inscricao.valor_inscricao)
      )}
</td>

<td className="px-4 py-4">
  <BadgePagamento
    status={inscricao.status_pagamento}
    gratuito={
      Number(inscricao.valor_inscricao ?? 0) === 0
    }
  />
</td>

<td className="px-4 py-4">
  {inscricao.checkin_realizado ? (
                        <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-bold text-green-300">
                          Realizado
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-bold text-yellow-300">
                          Pendente
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <ActionButtons
                        onView={() =>
                          abrirFicha(inscricao)
                        }
                        onEdit={() =>
                          abrirEdicao(inscricao)
                        }
                        onDelete={() =>
                          excluirInscricao(inscricao)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {inscricaoSelecionada && (
        <>
          <button
            type="button"
            aria-label="Fechar detalhes"
            onClick={fecharFicha}
            className="fixed inset-0 z-40 bg-black/60"
          />

          <aside className="fixed right-0 top-0 z-50 h-screen w-full max-w-xl overflow-y-auto border-l border-amber-400/20 bg-[#21150f] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
                  {editando
                    ? "Editar participante"
                    : "Ficha do participante"}
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  {inscricaoSelecionada.nome}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharFicha}
                disabled={
                  salvando ||
                  excluindo ||
                  fazendoCheckin
                }
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
                  inscricaoSelecionada.numero_inscricao
                ).padStart(5, "0")}
              </p>

              <div className="mt-4">
                {inscricaoSelecionada.checkin_realizado ? (
                  <span className="inline-flex rounded-full bg-green-500/15 px-4 py-2 text-sm font-bold text-green-300">
                    ✅ Check-in realizado
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-yellow-500/15 px-4 py-2 text-sm font-bold text-yellow-300">
                    ⏳ Check-in pendente
                  </span>
                )}
              </div>
            </div>

            {editando ? (
              <FormularioEdicao
                dados={inscricaoSelecionada}
                salvando={salvando}
                onSalvar={salvarEdicao}
                onCancelar={() => setEditando(false)}
              />
            ) : (
              <>
                <Secao titulo="📋 Dados pessoais">
                  <Detalhe
                    label="CPF ou RG"
                    valor={inscricaoSelecionada.cpf}
                  />

                  <Detalhe
                    label="Nascimento"
                    valor={formatarData(
                      inscricaoSelecionada.nascimento
                    )}
                  />

                  <Detalhe
                    label="Telefone"
                    valor={
                      inscricaoSelecionada.telefone
                    }
                  />

                  <Detalhe
                    label="E-mail"
                    valor={inscricaoSelecionada.email}
                  />

                  <Detalhe
                    label="Igreja"
                    valor={inscricaoSelecionada.igreja}
                  />
                </Secao>

                <Secao titulo="❤️ Saúde">
                  <Detalhe
                    label="Medicamento controlado"
                    valor={
                      inscricaoSelecionada.medicamento_controlado
                    }
                  />

                  <Detalhe
                    label="Qual medicamento"
                    valor={
                      inscricaoSelecionada.qual_medicamento
                    }
                  />

                  <Detalhe
                    label="Alergia a remédio"
                    valor={
                      inscricaoSelecionada.alergia_remedio
                    }
                  />

                  <Detalhe
                    label="Qual alergia a remédio"
                    valor={
                      inscricaoSelecionada.qual_alergia_remedio
                    }
                  />

                  <Detalhe
                    label="Alergia a alimento"
                    valor={
                      inscricaoSelecionada.alergia_alimento
                    }
                  />

                  <Detalhe
                    label="Qual alergia a alimento"
                    valor={
                      inscricaoSelecionada.qual_alergia_alimento
                    }
                  />

                  <Detalhe
                    label="Necessidade especial"
                    valor={
                      inscricaoSelecionada.necessidade_especial
                    }
                  />
                </Secao>

                <Secao titulo="🚨 Contato de emergência">
                  <Detalhe
                    label="Nome"
                    valor={
                      inscricaoSelecionada.contato_emergencia_nome
                    }
                  />

                  <Detalhe
                    label="Telefone"
                    valor={
                      inscricaoSelecionada.contato_emergencia_telefone
                    }
                  />
                </Secao>

                <Secao titulo="👨‍👩‍👧 Responsável">
                  <Detalhe
                    label="Menor de idade"
                    valor={
                      inscricaoSelecionada.menor_idade
                    }
                  />

                  <Detalhe
                    label="Nome do responsável"
                    valor={
                      inscricaoSelecionada.responsavel_nome
                    }
                  />

                  <Detalhe
                    label="Telefone do responsável"
                    valor={
                      inscricaoSelecionada.responsavel_telefone
                    }
                  />
                </Secao>

                <Secao titulo="🎫 Congresso">
                  <Detalhe
  label="Idade"
  valor={`${calcularIdade(
    inscricaoSelecionada.nascimento
  )} anos`}
/>

<Detalhe
  label="Valor da inscrição"
  valor={
    Number(
      inscricaoSelecionada.valor_inscricao ?? 0
    ) === 0
      ? "Gratuito"
      : formatarMoeda(
          Number(
            inscricaoSelecionada.valor_inscricao
          )
        )
  }
/>

<div className="rounded-xl border border-white/10 bg-white/5 p-4">
  <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-300">
    Status do pagamento
  </p>

  <div className="mt-3">
    <BadgePagamento
      status={inscricaoSelecionada.status_pagamento}
      gratuito={
        Number(
          inscricaoSelecionada.valor_inscricao ?? 0
        ) === 0
      }
    />
  </div>
</div>
                  <Detalhe
                    label="Participará todos os dias"
                    valor={
                      inscricaoSelecionada.todos_os_dias
                    }
                  />

                  <Detalhe
                    label="Primeira vez no congresso"
                    valor={
                      inscricaoSelecionada.primeira_vez
                    }
                  />

                  <Detalhe
                    label="Forma de pagamento"
                    valor={
                      inscricaoSelecionada.forma_pagamento
                    }
                  />

                  <Detalhe
                    label="Status do check-in"
                    valor={
                      inscricaoSelecionada.checkin_realizado
                        ? "Realizado"
                        : "Pendente"
                    }
                  />

                  {inscricaoSelecionada.checkin_realizado &&
                    inscricaoSelecionada.checkin_em && (
                      <Detalhe
                        label="Data e horário do check-in"
                        valor={formatarDataHora(
                          inscricaoSelecionada.checkin_em
                        )}
                      />
                    )}
                </Secao>

                <section className="mt-6 rounded-2xl border border-amber-400/20 bg-white/5 p-5 text-center">
                  <h3 className="text-lg font-black text-amber-300">
                    📱 QR Code para check-in
                  </h3>

                  {imagemQrCode ? (
                    <img
                      src={imagemQrCode}
                      alt="QR Code do participante"
                      className="mx-auto mt-4 h-56 w-56 rounded-2xl bg-white p-3"
                    />
                  ) : (
                    <p className="mt-4 text-amber-100/70">
                      QR Code indisponível.
                    </p>
                  )}

                  <p className="mt-4 text-sm text-amber-100/70">
                    Use este código para identificar o
                    participante no check-in.
                  </p>
                </section>

                <div className="mt-8 grid gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      gerarComprovante(
                        inscricaoSelecionada
                      )
                    }
                    className="rounded-xl border border-amber-300/30 bg-white/5 px-5 py-3 font-bold text-amber-200 hover:bg-white/10"
                  >
                    📄 Baixar comprovante
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditando(true)}
                    className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-[#2b180d]"
                  >
                    ✏️ Editar inscrição
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      realizarCheckin(
                        inscricaoSelecionada
                      )
                    }
                    disabled={
                      inscricaoSelecionada.checkin_realizado ||
                      fazendoCheckin
                    }
                    className="rounded-xl border border-green-400/30 bg-green-500/10 px-5 py-3 font-bold text-green-200 hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {fazendoCheckin
                      ? "Realizando check-in..."
                      : inscricaoSelecionada.checkin_realizado
                        ? "✅ Check-in realizado"
                        : "🎫 Realizar check-in"}
                  </button>

                  {inscricaoSelecionada.checkin_realizado &&
                    inscricaoSelecionada.checkin_em && (
                      <p className="text-center text-sm text-green-200">
                        Realizado em{" "}
                        {formatarDataHora(
                          inscricaoSelecionada.checkin_em
                        )}
                      </p>
                    )}

                  <button
                    type="button"
                    onClick={() =>
                      excluirInscricao(
                        inscricaoSelecionada
                      )
                    }
                    disabled={excluindo}
                    className="rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-3 font-bold text-red-200 hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {excluindo
                      ? "Excluindo..."
                      : "🗑️ Excluir inscrição"}
                  </button>

                  <button
                    type="button"
                    onClick={fecharFicha}
                    className="rounded-xl border border-amber-200/20 px-5 py-3 font-semibold hover:bg-white/10"
                  >
                    Fechar
                  </button>
                </div>
              </>
            )}
          </aside>
        </>
      )}
    </div>
  );
}

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h3 className="text-lg font-black text-amber-300">
        {titulo}
      </h3>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function BadgePagamento({
  status,
  gratuito,
}: {
  status: string | null;
  gratuito: boolean;
}) {
  if (gratuito) {
    return (
      <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-300">
        Gratuito
      </span>
    );
  }

  const statusNormalizado = status
    ?.trim()
    .toLowerCase();

  const estilos: Record<string, string> = {
    pago: "bg-green-500/15 text-green-300",
    pendente: "bg-yellow-500/15 text-yellow-300",
    cortesia: "bg-blue-500/15 text-blue-300",
    isento: "bg-blue-500/15 text-blue-300",
    cancelado: "bg-red-500/15 text-red-300",
    "pagamento em análise":
      "bg-orange-500/15 text-orange-300",
  };

  const rotulos: Record<string, string> = {
    pago: "Pago",
    pendente: "Pendente",
    cortesia: "Cortesia",
    isento: "Isento",
    cancelado: "Cancelado",
    "pagamento em análise": "Em análise",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        estilos[statusNormalizado ?? ""] ??
        "bg-white/10 text-white"
      }`}
    >
      {rotulos[statusNormalizado ?? ""] ??
        status ??
        "Não informado"}
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

function formatarData(data: string | null) {
  if (!data) {
    return "Não informado";
  }

  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarDataHora(data: string | null) {
  if (!data) {
    return "Não informado";
  }

  return new Date(data).toLocaleString("pt-BR");
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function calcularIdade(nascimento: string | null) {
  if (!nascimento) {
    return 0;
  }

  const hoje = new Date();
  const dataNascimento = new Date(
    `${nascimento}T12:00:00`
  );

  let idade =
    hoje.getFullYear() -
    dataNascimento.getFullYear();

  const aniversarioAindaNaoPassou =
    hoje.getMonth() < dataNascimento.getMonth() ||
    (hoje.getMonth() === dataNascimento.getMonth() &&
      hoje.getDate() < dataNascimento.getDate());

  if (aniversarioAindaNaoPassou) {
    idade--;
  }

  return idade;
}