"use client";

import { FormEvent, useState } from "react";

export type DadosEdicao = {
  nome: string;
  telefone: string;
  email: string;
  igreja: string;
  forma_pagamento: string | null;
  contato_emergencia_nome: string | null;
  contato_emergencia_telefone: string | null;
  necessidade_especial: string | null;
  responsavel_nome: string | null;
  responsavel_telefone: string | null;
};

type FormularioEdicaoProps = {
  dados: DadosEdicao;
  salvando: boolean;
  onSalvar: (dados: DadosEdicao) => Promise<void>;
  onCancelar: () => void;
};

export default function FormularioEdicao({
  dados,
  salvando,
  onSalvar,
  onCancelar,
}: FormularioEdicaoProps) {
  const [form, setForm] = useState<DadosEdicao>({
    nome: dados.nome ?? "",
    telefone: dados.telefone ?? "",
    email: dados.email ?? "",
    igreja: dados.igreja ?? "",
    forma_pagamento: dados.forma_pagamento ?? "",
    contato_emergencia_nome:
      dados.contato_emergencia_nome ?? "",
    contato_emergencia_telefone:
      dados.contato_emergencia_telefone ?? "",
    necessidade_especial:
      dados.necessidade_especial ?? "",
    responsavel_nome:
      dados.responsavel_nome ?? "",
    responsavel_telefone:
      dados.responsavel_telefone ?? "",
  });

  function atualizarCampo(
    campo: keyof DadosEdicao,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function enviar(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();
    await onSalvar(form);
  }

  return (
    <form onSubmit={enviar} className="mt-6 space-y-4">
      <Campo
        label="Nome"
        value={form.nome}
        onChange={(valor) =>
          atualizarCampo("nome", valor)
        }
      />

      <Campo
        label="Telefone"
        value={form.telefone}
        onChange={(valor) =>
          atualizarCampo("telefone", valor)
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

      <Campo
        label="Forma de pagamento"
        value={form.forma_pagamento ?? ""}
        onChange={(valor) =>
          atualizarCampo("forma_pagamento", valor)
        }
      />

      <Campo
        label="Contato de emergência"
        value={form.contato_emergencia_nome ?? ""}
        onChange={(valor) =>
          atualizarCampo(
            "contato_emergencia_nome",
            valor
          )
        }
      />

      <Campo
        label="Telefone de emergência"
        value={
          form.contato_emergencia_telefone ?? ""
        }
        onChange={(valor) =>
          atualizarCampo(
            "contato_emergencia_telefone",
            valor
          )
        }
      />

      <Campo
        label="Necessidade especial"
        value={form.necessidade_especial ?? ""}
        onChange={(valor) =>
          atualizarCampo(
            "necessidade_especial",
            valor
          )
        }
      />

      <Campo
        label="Nome do responsável"
        value={form.responsavel_nome ?? ""}
        onChange={(valor) =>
          atualizarCampo("responsavel_nome", valor)
        }
      />

      <Campo
        label="Telefone do responsável"
        value={form.responsavel_telefone ?? ""}
        onChange={(valor) =>
          atualizarCampo(
            "responsavel_telefone",
            valor
          )
        }
      />

      <div className="grid gap-3 pt-2">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-[#2b180d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {salvando
            ? "Salvando..."
            : "💾 Salvar alterações"}
        </button>

        <button
          type="button"
          onClick={onCancelar}
          disabled={salvando}
          className="rounded-xl border border-amber-200/20 px-5 py-3 font-semibold hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-amber-300">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(evento) =>
          onChange(evento.target.value)
        }
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-amber-400"
      />
    </label>
  );
}