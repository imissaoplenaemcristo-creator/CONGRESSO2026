import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Inscricao = {
  id?: string | null;
  numero_inscricao?: string | null;
  nome?: string | null;
  cpf?: string | null;
  telefone?: string | null;
  email?: string | null;
  idade?: number | null;
  status_pagamento?: string | null;
  valor_pago?: number | null;
  valor_inscricao?: number | null;
  checkin_realizado?: boolean | null;
  checkin_em?: string | null;
  created_at?: string | null;
};

function criarClienteSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL não foi configurada."
    );
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não foi configurada."
    );
  }

  return createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

function formatarData(valor?: string | null) {
  if (!valor) return "";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return data.toLocaleString("pt-BR");
}

export async function GET() {
  try {
    const supabase = criarClienteSupabase();

    const { data, error } = await supabase
  .from("inscricoes")
  .select("*");

    if (error) {
      throw new Error(
        `Erro ao buscar inscrições no Supabase: ${error.message}`
      );
    }

    const inscricoes = (data ?? []) as Inscricao[];

    const dadosExcel = inscricoes.map((inscricao) => ({
      "Número da inscrição":
        inscricao.numero_inscricao ?? "",
      Nome: inscricao.nome ?? "",
      CPF: inscricao.cpf ?? "",
      Telefone: inscricao.telefone ?? "",
      "E-mail": inscricao.email ?? "",
      Idade: inscricao.idade ?? "",
      "Status do pagamento":
        inscricao.status_pagamento ?? "",
      "Valor da inscrição":
        inscricao.valor_inscricao ?? "",
      "Valor pago":
        inscricao.valor_pago ?? "",
      "Check-in realizado":
        inscricao.checkin_realizado ? "Sim" : "Não",
      "Data do check-in":
        formatarData(inscricao.checkin_em),
      "Data da inscrição":
        formatarData(inscricao.created_at),
      ID: inscricao.id ?? "",
    }));

    const planilha = XLSX.utils.json_to_sheet(dadosExcel);

    planilha["!cols"] = [
      { wch: 22 },
      { wch: 35 },
      { wch: 18 },
      { wch: 18 },
      { wch: 35 },
      { wch: 10 },
      { wch: 22 },
      { wch: 20 },
      { wch: 16 },
      { wch: 20 },
      { wch: 22 },
      { wch: 22 },
      { wch: 38 },
    ];

    const arquivoExcel = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      arquivoExcel,
      planilha,
      "Inscrições"
    );

    const buffer = XLSX.write(arquivoExcel, {
      type: "buffer",
      bookType: "xlsx",
    });

    const dataAtual = new Date()
      .toISOString()
      .slice(0, 10);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          `attachment; filename="inscricoes-congresso-2026-${dataAtual}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erro ao gerar Excel:", error);

    return NextResponse.json(
      {
        sucesso: false,
        erro:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao gerar o Excel.",
      },
      {
        status: 500,
      }
    );
  }
}