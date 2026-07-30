"use client";

import { useState } from "react";

export default function ExcelButton() {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState("");

  async function baixarExcel() {
    try {
      setBaixando(true);
      setErro("");

      const resposta = await fetch("/api/exportar-excel", {
        method: "GET",
        cache: "no-store",
      });

      if (!resposta.ok) {
        const resultado = await resposta
          .json()
          .catch(() => null);

        throw new Error(
          resultado?.erro ||
            resultado?.mensagem ||
            "Não foi possível gerar o arquivo Excel."
        );
      }

      const arquivo = await resposta.blob();

      const url = window.URL.createObjectURL(arquivo);
      const link = document.createElement("a");

      const hoje = new Date()
        .toISOString()
        .slice(0, 10);

      link.href = url;
      link.download =
        `inscricoes-congresso-2026-${hoje}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao baixar o Excel."
      );
    } finally {
      setBaixando(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={baixarExcel}
        disabled={baixando}
        className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {baixando
          ? "Gerando Excel..."
          : "Exportar Excel"}
      </button>

      {erro ? (
        <p className="mt-2 text-sm text-red-600">
          {erro}
        </p>
      ) : null}
    </div>
  );
}