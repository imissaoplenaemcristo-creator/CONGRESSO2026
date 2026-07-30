import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data, error } = await supabase
    .from("inscricoes")
    .select(
      "numero_inscricao, nome, cpf, telefone, email, igreja, forma_pagamento"
    )
    .order("numero_inscricao", { ascending: false });

  if (error) {
    return NextResponse.json(
      {
        erro: error.message,
        detalhes: error,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    inscritos: data ?? [],
  });
}