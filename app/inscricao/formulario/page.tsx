"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import TermoResponsabilidadeModal from "../../components/TermoResponsabilidadeModal";


type FormData = {
  nome: string;
  documento: string;
  nascimento: string;
  telefone: string;
  email: string;
  igreja: string;
  medicamentoControlado: string;
  qualMedicamento: string;
  alergiaRemedio: string;
  qualAlergiaRemedio: string;
  alergiaAlimento: string;
  qualAlergiaAlimento: string;
  possuiNecessidadeEspecial: string;
  necessidadeEspecial: string;
  contatoEmergenciaNome: string;
  contatoEmergenciaTelefone: string;
  responsavelNome: string;
  responsavelTelefone: string;
  todosOsDias: string;
  primeiraVez: string;
  pagamento: string;
  aceitouTermo: boolean;
};

const initialData: FormData = {
  nome: "",
  documento: "",
  nascimento: "",
  telefone: "",
  email: "",
  igreja: "",
  medicamentoControlado: "",
  qualMedicamento: "",
  alergiaRemedio: "",
  qualAlergiaRemedio: "",
  alergiaAlimento: "",
  qualAlergiaAlimento: "",
  possuiNecessidadeEspecial: "",
  necessidadeEspecial: "",
  contatoEmergenciaNome: "",
  contatoEmergenciaTelefone: "",
  responsavelNome: "",
  responsavelTelefone: "",
  todosOsDias: "",
  primeiraVez: "",
  pagamento: "",
  aceitouTermo: false,
};

function calcularValorInscricao(dataNascimento: string): number {
  if (!dataNascimento) {
    return 0;
  }

  const [ano, mes, dia] = dataNascimento.split("-").map(Number);

  if (!ano || !mes || !dia) {
    return 0;
  }

  const dataDoCongresso = new Date(2026, 10, 19);
  const nascimento = new Date(ano, mes - 1, dia);

  let idade =
    dataDoCongresso.getFullYear() - nascimento.getFullYear();

  const aindaNaoFezAniversario =
    dataDoCongresso.getMonth() < nascimento.getMonth() ||
    (dataDoCongresso.getMonth() === nascimento.getMonth() &&
      dataDoCongresso.getDate() < nascimento.getDate());

  if (aindaNaoFezAniversario) {
    idade--;
  }

  if (idade <= 5) {
    return 0;
  }

  if (idade <= 12) {
    return 150;
  }

  return 350;
}

function calcularIdadeNoCongresso(dataNascimento: string): number {
  if (!dataNascimento) {
    return 0;
  }

  const [ano, mes, dia] = dataNascimento.split("-").map(Number);

  if (!ano || !mes || !dia) {
    return 0;
  }

  const dataDoCongresso = new Date(2026, 10, 19);
  const nascimento = new Date(ano, mes - 1, dia);

  let idade =
    dataDoCongresso.getFullYear() - nascimento.getFullYear();

  const aindaNaoFezAniversario =
    dataDoCongresso.getMonth() < nascimento.getMonth() ||
    (dataDoCongresso.getMonth() === nascimento.getMonth() &&
      dataDoCongresso.getDate() < nascimento.getDate());

  if (aindaNaoFezAniversario) {
    idade--;
  }

  return idade;
}
function formatarTelefone(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 6) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }

  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(
      2,
      6
    )}-${numeros.slice(6)}`;
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(
    2,
    7
  )}-${numeros.slice(7)}`;
}

export default function FormularioPage() {
  const router = useRouter();

  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState<FormData>(initialData);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [termoAberto, setTermoAberto] = useState(false);
  const [termoVisualizado, setTermoVisualizado] = useState(false);

  const menorDeIdade =
    Boolean(form.nascimento) &&
    calcularIdadeNoCongresso(form.nascimento) < 18;

  const totalEtapas = 8;
  const progresso = Math.round((etapa / totalEtapas) * 100);

  function atualizarCampo(
    campo: keyof FormData,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function avancar() {
    setErro("");

    if (etapa === 1) {
      if (form.nome.trim().length < 3) {
        setErro("Informe seu nome completo.");
        return;
      }

      if (form.documento.trim().length < 5) {
        setErro("Informe seu CPF ou RG.");
        return;
      }

      if (!form.nascimento) {
        setErro("Informe sua data de nascimento.");
        return;
      }
    }

    if (etapa === 2) {
      if (form.telefone.trim().length < 8) {
        setErro("Informe um telefone válido.");
        return;
      }

      if (
        !form.email.includes("@") ||
        !form.email.includes(".")
      ) {
        setErro("Informe um e-mail válido.");
        return;
      }

      if (form.igreja.trim().length < 2) {
        setErro("Informe o nome da sua igreja.");
        return;
      }
    }

    if (etapa === 3) {
      if (!form.medicamentoControlado) {
        setErro(
          "Informe se você toma medicamento controlado."
        );
        return;
      }

      if (
        form.medicamentoControlado === "sim" &&
        form.qualMedicamento.trim() === ""
      ) {
        setErro("Informe qual medicamento você utiliza.");
        return;
      }

      if (!form.alergiaRemedio) {
        setErro(
          "Informe se possui alergia a algum remédio."
        );
        return;
      }

      if (
        form.alergiaRemedio === "sim" &&
        form.qualAlergiaRemedio.trim() === ""
      ) {
        setErro("Informe qual remédio causa alergia.");
        return;
      }

      if (!form.alergiaAlimento) {
        setErro(
          "Informe se possui alergia a algum alimento."
        );
        return;
      }

      if (
        form.alergiaAlimento === "sim" &&
        form.qualAlergiaAlimento.trim() === ""
      ) {
        setErro("Informe qual alimento causa alergia.");
        return;
      }

      if (!form.possuiNecessidadeEspecial) {
        setErro(
          "Informe se possui alguma necessidade especial ou deficiência."
        );
        return;
      }

      if (
        form.possuiNecessidadeEspecial === "sim" &&
        form.necessidadeEspecial.trim() === ""
      ) {
        setErro(
          "Informe qual necessidade especial ou deficiência devemos saber."
        );
        return;
      }
    }

    if (etapa === 4) {
      if (form.contatoEmergenciaNome.trim() === "") {
        setErro(
          "Informe o nome do contato de emergência."
        );
        return;
      }

      if (
        form.contatoEmergenciaTelefone.trim().length < 8
      ) {
        setErro(
          "Informe um telefone válido para o contato de emergência."
        );
        return;
      }

      if (menorDeIdade) {
        if (form.responsavelNome.trim().length < 3) {
          setErro(
            "Informe o nome completo do responsável legal."
          );
          return;
        }

        if (form.responsavelTelefone.trim().length < 8) {
          setErro(
            "Informe um telefone válido para o responsável legal."
          );
          return;
        }
      }
    }

    if (etapa === 5) {
      if (!form.todosOsDias) {
        setErro(
          "Informe se você participará de todos os dias do congresso."
        );
        return;
      }

      if (!form.primeiraVez) {
        setErro(
          "Informe se é a primeira vez que participa do nosso congresso."
        );
        return;
      }
    }

    if (etapa === 6) {
      if (!form.pagamento) {
        setErro("Escolha uma forma de pagamento.");
        return;
      }
    }

    if (etapa === 7) {
      if (!form.aceitouTermo) {
        setErro(
          "Você precisa ler e aceitar o Termo de Responsabilidade."
        );
        return;
      }
    }

    if (etapa < totalEtapas) {
      setEtapa((anterior) => anterior + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  function voltar() {
    if (etapa === 1) {
      router.push("/inscricao");
      return;
    }

    setErro("");
    setEtapa((anterior) => anterior - 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function salvarInscricao() {
    if (enviando) {
      return;
    }

    setErro("");
    setEnviando(true);

    try {
      const { data, error } = await supabase.rpc(
        "criar_inscricao",
        {
          dados: {
            nome: form.nome,
            cpf: form.documento,
            nascimento: form.nascimento,
            telefone: form.telefone,
            email: form.email,
            igreja: form.igreja,

            medicamento_controlado:
              form.medicamentoControlado,

            qual_medicamento:
              form.medicamentoControlado === "sim"
                ? form.qualMedicamento
                : "",

            alergia_remedio: form.alergiaRemedio,

            qual_alergia_remedio:
              form.alergiaRemedio === "sim"
                ? form.qualAlergiaRemedio
                : "",

            alergia_alimento: form.alergiaAlimento,

            qual_alergia_alimento:
              form.alergiaAlimento === "sim"
                ? form.qualAlergiaAlimento
                : "",

            necessidade_especial:
              form.possuiNecessidadeEspecial === "sim"
                ? form.necessidadeEspecial
                : "",

            contato_emergencia_nome:
              form.contatoEmergenciaNome,

            contato_emergencia_telefone:
              form.contatoEmergenciaTelefone,

            menor_idade: menorDeIdade ? "sim" : "nao",

            responsavel_nome:
              menorDeIdade
                ? form.responsavelNome
                : "",

            responsavel_telefone:
              menorDeIdade
                ? form.responsavelTelefone
                : "",

            todos_os_dias: form.todosOsDias,
            primeira_vez: form.primeiraVez,
            forma_pagamento: form.pagamento,
            aceitou_termo: form.aceitouTermo,
          },
        }
      );

      if (error) {
        console.error(
          "Erro ao salvar inscrição:",
          error
        );

        setErro(
          "Não foi possível salvar a inscrição."
        );

        return;
      }

      const inscricao = Array.isArray(data)
        ? data[0]
        : data;

      if (!inscricao) {
        setErro(
          "Não foi possível recuperar os dados da inscrição."
        );

        return;
      }

      const valorInscricao =
        calcularValorInscricao(form.nascimento);

      const numeroInscricao = String(
        inscricao.numero_inscricao
      );

      router.push(
        `/inscricao/pagamento?numero=${encodeURIComponent(
          numeroInscricao
        )}&token=${encodeURIComponent(
          inscricao.qr_token
        )}&nome=${encodeURIComponent(
          form.nome
        )}&pagamento=${encodeURIComponent(
          form.pagamento
        )}&valor=${encodeURIComponent(
          String(valorInscricao)
        )}`
      );
    } catch (erroInesperado) {
      console.error(
        "Erro inesperado na inscrição:",
        erroInesperado
      );

      setErro(
        "Ocorreu um erro inesperado. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <button
      type="button"
      onClick={() => router.push("/")}
      className="inline-flex items-center gap-2 text-sm font-semibold text-amber-300 transition hover:text-amber-200"
    >
      ← Voltar para informações da inscrição
        </button>

        <div className="mt-6 rounded-3xl border border-amber-200/20 bg-black/30 p-5 shadow-2xl sm:p-6 md:p-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-amber-300">
                Congresso 2026
              </p>

              <h1 className="mt-2 text-3xl font-black">
                Formulário de inscrição
              </h1>
            </div>

            <p className="text-sm text-amber-50/70">
              Etapa {etapa} de {totalEtapas}
            </p>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-600 transition-all"
              style={{
                width: `${progresso}%`,
              }}
            />
          </div>

          <p className="mt-2 text-right text-sm text-amber-200">
            {progresso}% concluído
          </p>

          {erro && (
            <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-500/15 p-4 font-semibold text-red-100">
              {erro}
            </div>
          )}

          <div className="mt-8">
            {etapa === 1 && (
              <section>
                <h2 className="text-2xl font-bold text-amber-300">
                  Dados pessoais
                </h2>

                <div className="mt-6 space-y-5">
                  <Campo
                    label="Nome completo"
                    value={form.nome}
                    onChange={(valor) =>
                      atualizarCampo("nome", valor)
                    }
                  />

                  <Campo
                    label="CPF ou RG"
                    value={form.documento}
                    onChange={(valor) =>
                      atualizarCampo(
                        "documento",
                        valor
                      )
                    }
                  />

                  <Campo
                    label="Data de nascimento"
                    type="date"
                    value={form.nascimento}
                    onChange={(valor) =>
                      atualizarCampo(
                        "nascimento",
                        valor
                      )
                    }
                  />
                </div>
              </section>
            )}

            {etapa === 2 && (
              <section>
                <h2 className="text-2xl font-bold text-amber-300">
                  Contato
                </h2>

                <div className="mt-6 space-y-5">
<Campo
  label="Telefone"
  value={form.telefone}
  placeholder="(31) 99999-9999"
  inputMode="tel"
  onChange={(valor) =>
    atualizarCampo(
      "telefone",
      formatarTelefone(valor)
    )
  }
/>

                  <Campo
                    label="E-mail"
                    type="email"
                    value={form.email}
                    onChange={(valor) =>
                      atualizarCampo("email", valor)
                    }
                  />

                  <Campo
                    label="Igreja"
                    value={form.igreja}
                    onChange={(valor) =>
                      atualizarCampo("igreja", valor)
                    }
                  />
                </div>
              </section>
            )}

            {etapa === 3 && (
              <section>
                <h2 className="text-2xl font-bold text-amber-300">
                  Saúde e cuidados
                </h2>

                <div className="mt-6 space-y-6">
                  <PerguntaSimNao
                    label="Toma medicamento controlado?"
                    value={
                      form.medicamentoControlado
                    }
                    onChange={(valor) =>
                      atualizarCampo(
                        "medicamentoControlado",
                        valor
                      )
                    }
                  />

                  {form.medicamentoControlado ===
                    "sim" && (
                    <Campo
                      label="Qual medicamento?"
                      value={
                        form.qualMedicamento
                      }
                      onChange={(valor) =>
                        atualizarCampo(
                          "qualMedicamento",
                          valor
                        )
                      }
                    />
                  )}

                  <PerguntaSimNao
                    label="Tem alergia a algum remédio?"
                    value={form.alergiaRemedio}
                    onChange={(valor) =>
                      atualizarCampo(
                        "alergiaRemedio",
                        valor
                      )
                    }
                  />

                  {form.alergiaRemedio ===
                    "sim" && (
                    <Campo
                      label="Qual remédio?"
                      value={
                        form.qualAlergiaRemedio
                      }
                      onChange={(valor) =>
                        atualizarCampo(
                          "qualAlergiaRemedio",
                          valor
                        )
                      }
                    />
                  )}

                  <PerguntaSimNao
                    label="Tem alergia a algum alimento?"
                    value={form.alergiaAlimento}
                    onChange={(valor) =>
                      atualizarCampo(
                        "alergiaAlimento",
                        valor
                      )
                    }
                  />

                  {form.alergiaAlimento ===
                    "sim" && (
                    <Campo
                      label="Qual alimento?"
                      value={
                        form.qualAlergiaAlimento
                      }
                      onChange={(valor) =>
                        atualizarCampo(
                          "qualAlergiaAlimento",
                          valor
                        )
                      }
                    />
                  )}

                  <PerguntaSimNao
                    label="Possui alguma necessidade especial ou deficiência?"
                    value={
                      form.possuiNecessidadeEspecial
                    }
                    onChange={(valor) =>
                      atualizarCampo(
                        "possuiNecessidadeEspecial",
                        valor
                      )
                    }
                  />

                  {form.possuiNecessidadeEspecial ===
                    "sim" && (
                    <Campo
                      label="Qual necessidade especial ou deficiência devemos saber?"
                      value={
                        form.necessidadeEspecial
                      }
                      onChange={(valor) =>
                        atualizarCampo(
                          "necessidadeEspecial",
                          valor
                        )
                      }
                    />
                  )}
                </div>
              </section>
            )}

            {etapa === 4 && (
              <section>
                <h2 className="text-2xl font-bold text-amber-300">
                  Emergência e responsável
                </h2>

                <div className="mt-6 space-y-5">
                  <Campo
                    label="Nome do contato de emergência"
                    value={
                      form.contatoEmergenciaNome
                    }
                    onChange={(valor) =>
                      atualizarCampo(
                        "contatoEmergenciaNome",
                        valor
                      )
                    }
                  />

                  <Campo
  label="Telefone do contato de emergência"
  value={form.contatoEmergenciaTelefone}
  placeholder="(31) 99999-9999"
  inputMode="tel"
  onChange={(valor) =>
    atualizarCampo(
      "contatoEmergenciaTelefone",
      formatarTelefone(valor)
    )
  }
/>

                  {menorDeIdade && (
                    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5">
                      <h3 className="font-bold text-amber-300">
                        👨‍👩‍👧 Responsável legal
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-amber-100">
                        Por ser menor de 18 anos, é obrigatório informar os
                        dados do responsável legal.
                      </p>

                      <div className="mt-5 space-y-5">
                        <Campo
                          label="Nome completo do responsável legal"
                          value={form.responsavelNome}
                          onChange={(valor) =>
                            atualizarCampo("responsavelNome", valor)
                          }
                        />

                        <Campo
  label="Telefone do responsável legal"
  value={form.responsavelTelefone}
  placeholder="(31) 99999-9999"
  inputMode="tel"
  onChange={(valor) =>
    atualizarCampo(
      "responsavelTelefone",
      formatarTelefone(valor)
    )
  }
/>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {etapa === 5 && (
              <section>
                <h2 className="text-2xl font-bold text-amber-300">
                  Participação
                </h2>

                <div className="mt-6 space-y-6">
                  <PerguntaSimNao
                    label="Você vai participar de todos os dias do congresso?"
                    value={form.todosOsDias}
                    onChange={(valor) =>
                      atualizarCampo(
                        "todosOsDias",
                        valor
                      )
                    }
                  />

                  <PerguntaSimNao
                    label="É a primeira vez que participa do nosso congresso?"
                    value={form.primeiraVez}
                    onChange={(valor) =>
                      atualizarCampo(
                        "primeiraVez",
                        valor
                      )
                    }
                  />
                </div>
              </section>
            )}

            {etapa === 6 && (
              <section>
                <h2 className="text-2xl font-bold text-amber-300">
                  Forma de pagamento
                </h2>

                <div className="mt-6 grid gap-4">
                  {[
                    ["pix", "PIX"],
                    ["dinheiro", "Dinheiro"],
                    ["cartao", "Cartão"],
                    ["carne", "Carnê"],
                  ].map(([valor, titulo]) => (
                    <button
                      type="button"
                      key={valor}
                      onClick={() =>
                        atualizarCampo("pagamento", valor)
                      }
                      className={`rounded-2xl border p-5 text-left transition ${
                        form.pagamento === valor
                          ? "border-amber-400 bg-amber-400/15"
                          : "border-amber-200/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <p className="text-lg font-bold">
                        {titulo}
                      </p>
                    </button>
                  ))}
                </div>

                {form.pagamento === "pix" && (
                  <Aviso>
                    Após concluir a inscrição, você verá o QR Code e a chave PIX.
                  </Aviso>
                )}

                {form.pagamento === "dinheiro" && (
                  <Aviso>
                    Para pagamento em dinheiro, procure a irmã Martha.
                  </Aviso>
                )}

                {form.pagamento === "cartao" && (
                  <Aviso>
                    Para pagamento no cartão, procure o Pastor Alexandre.
                  </Aviso>
                )}

                {form.pagamento === "carne" && (
                  <Aviso>
                    Para pagamento por carnê, procure o Pastor Alexandre.
                  </Aviso>
                )}
              </section>
            )}

            {etapa === 7 && (
              <section>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Etapa obrigatória
                </p>

                <h2 className="mt-2 text-2xl font-bold text-amber-300">
                  Termo de Responsabilidade
                </h2>

                <p className="mt-3 leading-7 text-amber-50/75">
                  Antes de concluir sua inscrição, leia integralmente o
                  Termo de Responsabilidade e Compromisso do Congresso 2026.
                </p>

                <div className="mt-6 rounded-2xl border border-amber-300/20 bg-white/5 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-white">
                        Termo de Responsabilidade e Compromisso
                      </p>

                      <p className="mt-1 text-sm text-amber-100/60">
                        Congresso 2026 – Igreja Missão Plena em Cristo
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTermoAberto(true);
                        setTermoVisualizado(true);
                      }}
                      className="rounded-xl bg-amber-400 px-5 py-3 font-black text-[#2b180d] transition hover:bg-amber-300"
                    >
                      📖 Ler termo
                    </button>
                  </div>
                </div>

                <label
                  className={`mt-6 flex items-start gap-3 rounded-2xl border p-5 transition ${
                    termoVisualizado
                      ? "cursor-pointer border-amber-300/20 bg-amber-300/10"
                      : "cursor-not-allowed border-white/10 bg-white/5 opacity-60"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.aceitouTermo}
                    disabled={!termoVisualizado}
                    onChange={(event) =>
                      setForm((anterior) => ({
                        ...anterior,
                        aceitouTermo: event.target.checked,
                      }))
                    }
                    className="mt-1 h-5 w-5 shrink-0"
                  />

                  <span className="text-sm leading-7">
                    <strong>
                      Declaro que li integralmente o Termo de Responsabilidade
                      e Compromisso do Congresso 2026, compreendi todas as
                      regras estabelecidas pela organização e concordo com seu
                      conteúdo.
                    </strong>

                    <span className="mt-2 block text-amber-50/70">
                      Estou ciente de que este aceite eletrônico possui validade
                      equivalente à minha assinatura e assumo a responsabilidade
                      pela veracidade das informações prestadas.
                    </span>

                    {!termoVisualizado && (
                      <span className="mt-2 block font-semibold text-amber-300">
                        Abra o termo para habilitar esta opção.
                      </span>
                    )}
                  </span>
                </label>

                <TermoResponsabilidadeModal
                  aberto={termoAberto}
                  onFechar={() => setTermoAberto(false)}
                />
              </section>
            )}

            {etapa === 8 && (
              <section>
                <h2 className="text-2xl font-bold text-amber-300">
                  Revisar inscrição
                </h2>

                <p className="mt-3 text-amber-50/70">
                  Confira seus dados antes de
                  confirmar. Depois da confirmação,
                  somente a organização poderá
                  realizar alterações.
                </p>

                <div className="mt-8 space-y-4">
                  <ItemRevisao
                    titulo="Nome completo"
                    valor={form.nome}
                  />

                  <ItemRevisao
                    titulo="CPF ou RG"
                    valor={form.documento}
                  />

                  <ItemRevisao
                    titulo="Data de nascimento"
                    valor={form.nascimento}
                  />

                  <ItemRevisao
                    titulo="Telefone"
                    valor={form.telefone}
                  />

                  <ItemRevisao
                    titulo="E-mail"
                    valor={form.email}
                  />

                  <ItemRevisao
                    titulo="Igreja"
                    valor={form.igreja}
                  />

                  <ItemRevisao
                    titulo="Medicamento controlado"
                    valor={
                      form.medicamentoControlado ===
                      "sim"
                        ? `Sim — ${form.qualMedicamento}`
                        : "Não"
                    }
                  />

                  <ItemRevisao
                    titulo="Alergia a remédio"
                    valor={
                      form.alergiaRemedio === "sim"
                        ? `Sim — ${form.qualAlergiaRemedio}`
                        : "Não"
                    }
                  />

                  <ItemRevisao
                    titulo="Alergia alimentar"
                    valor={
                      form.alergiaAlimento === "sim"
                        ? `Sim — ${form.qualAlergiaAlimento}`
                        : "Não"
                    }
                  />

                  <ItemRevisao
                    titulo="Necessidade especial"
                    valor={
                      form.possuiNecessidadeEspecial ===
                      "sim"
                        ? form.necessidadeEspecial
                        : "Não"
                    }
                  />

                  <ItemRevisao
                    titulo="Contato de emergência"
                    valor={
                      form.contatoEmergenciaNome
                    }
                  />

                  <ItemRevisao
                    titulo="Telefone de emergência"
                    valor={
                      form.contatoEmergenciaTelefone
                    }
                  />

                  {menorDeIdade && (
                    <>
                      <ItemRevisao
                        titulo="Nome do responsável"
                        valor={
                          form.responsavelNome
                        }
                      />

                      <ItemRevisao
                        titulo="Telefone do responsável"
                        valor={
                          form.responsavelTelefone
                        }
                      />
                    </>
                  )}

                  <ItemRevisao
                    titulo="Participará de todos os dias?"
                    valor={
                      form.todosOsDias === "sim"
                        ? "Sim"
                        : "Não"
                    }
                  />

                  <ItemRevisao
                    titulo="Primeira vez no congresso?"
                    valor={
                      form.primeiraVez === "sim"
                        ? "Sim"
                        : "Não"
                    }
                  />

                  <ItemRevisao
                    titulo="Forma de pagamento"
                    valor={formatarFormaPagamento(form.pagamento)}
                  />

                  <ItemRevisao
                    titulo="Termo de responsabilidade"
                    valor={
                      form.aceitouTermo
                        ? "Aceito"
                        : "Não aceito"
                    }
                  />
                </div>
              </section>
            )}
          </div>

          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={voltar}
              className="rounded-xl border border-amber-200/20 px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Voltar
            </button>

            {etapa < totalEtapas ? (
              <button
                type="button"
                onClick={avancar}
                className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-7 py-3 font-bold text-[#2b180d]"
              >
                Continuar →
              </button>
            ) : (
              <button
                type="button"
                onClick={salvarInscricao}
                disabled={enviando}
                className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-7 py-3 font-bold text-[#2b180d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando
                  ? "Confirmando..."
                  : "Confirmar inscrição"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

type CampoProps = {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onChange: (valor: string) => void;
};

function Campo({
  label,
  value,
  type = "text",
  placeholder,
  inputMode,
  onChange,
}: CampoProps) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
inputMode={inputMode}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-amber-200/15 bg-white/5 px-4 py-3 outline-none transition placeholder:text-white/30 focus:border-amber-400"
      />
    </label>
  );
}

type PerguntaSimNaoProps = {
  label: string;
  value: string;
  onChange: (valor: string) => void;
};

function PerguntaSimNao({
  label,
  value,
  onChange,
}: PerguntaSimNaoProps) {
  return (
    <div>
      <p className="font-semibold">{label}</p>

      <div className="mt-3 flex gap-3">
        {[
          ["sim", "Sim"],
          ["nao", "Não"],
        ].map(([valor, titulo]) => (
          <button
            type="button"
            key={valor}
            onClick={() => onChange(valor)}
            className={`rounded-xl border px-5 py-3 font-semibold transition ${
              value === valor
                ? "border-amber-400 bg-amber-400/15 text-amber-200"
                : "border-amber-200/10 bg-white/5"
            }`}
          >
            {titulo}
          </button>
        ))}
      </div>
    </div>
  );
}

function formatarFormaPagamento(pagamento: string) {
  const formas: Record<string, string> = {
    pix: "PIX",
    dinheiro: "Dinheiro",
    cartao: "Cartão",
    carne: "Carnê",
  };

  return formas[pagamento] ?? "Não informado";
}

function Aviso({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5 text-amber-100">
      {children}
    </div>
  );
}

type ItemRevisaoProps = {
  titulo: string;
  valor: string;
};

function ItemRevisao({
  titulo,
  valor,
}: ItemRevisaoProps) {
  return (
    <div className="rounded-2xl border border-amber-200/10 bg-white/5 p-5">
      <p className="text-sm text-amber-200/70">
        {titulo}
      </p>

      <p className="mt-1 font-semibold text-white">
        {valor || "Não informado"}
      </p>
    </div>
  );
}