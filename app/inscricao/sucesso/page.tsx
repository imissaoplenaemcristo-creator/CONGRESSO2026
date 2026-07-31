"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

type StatusPagamento =
  | "pago"
  | "confirmado"
  | "pendente"
  | "aguardando"
  | "gratuito"
  | "isento"
  | "analise";

const TELEFONE_ORGANIZACAO = "(31) 9XXXX-XXXX";

async function carregarImagemBase64(caminho: string): Promise<string> {
  const resposta = await fetch(caminho);

  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar a imagem: ${caminho}`);
  }

  const arquivo = await resposta.blob();

  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onloadend = () => {
      if (typeof leitor.result === "string") {
        resolve(leitor.result);
      } else {
        reject(new Error("Não foi possível converter a imagem."));
      }
    };

    leitor.onerror = () => {
      reject(new Error("Não foi possível ler a imagem."));
    };

    leitor.readAsDataURL(arquivo);
  });
}

function normalizarStatus(status: string): StatusPagamento {
  const valor = status.toLowerCase().trim();

  if (valor === "pago" || valor === "confirmado") {
    return "confirmado";
  }

  if (valor === "gratuito" || valor === "isento") {
    return "gratuito";
  }

  if (
    valor === "analise" ||
    valor === "em_analise" ||
    valor === "pagamento_em_analise"
  ) {
    return "analise";
  }

  return "aguardando";
}

export default function SucessoPage() {
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [statusPagamento, setStatusPagamento] =
    useState<StatusPagamento>("aguardando");
  const [carregando, setCarregando] = useState(true);
  const [compartilhando, setCompartilhando] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        const parametros = new URLSearchParams(window.location.search);

        const numeroRecebido = parametros.get("numero") ?? "";
        const nomeRecebido = parametros.get("nome") ?? "";
        const tokenRecebido = parametros.get("token") ?? "";
        const statusRecebido = parametros.get("status") ?? "aguardando";

        setNumero(numeroRecebido);
        setNome(nomeRecebido);
        setStatusPagamento(normalizarStatus(statusRecebido));

        if (tokenRecebido) {
          const imagemQrCode = await QRCode.toDataURL(tokenRecebido, {
            width: 600,
            margin: 2,
            errorCorrectionLevel: "H",
          });

          setQrCode(imagemQrCode);
        }
      } catch (erro) {
        console.error("Erro ao gerar o QR Code:", erro);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  const statusVisual = useMemo(() => {
    if (statusPagamento === "confirmado") {
      return {
        texto: "Pagamento confirmado",
        icone: "🟢",
        classes: "border-emerald-300 bg-emerald-100 text-emerald-800",
        pdfTexto: "PAGAMENTO CONFIRMADO",
        pdfCor: [48, 120, 78] as [number, number, number],
      };
    }

    if (statusPagamento === "gratuito") {
      return {
        texto: "Inscrição gratuita",
        icone: "🔵",
        classes: "border-blue-300 bg-blue-100 text-blue-800",
        pdfTexto: "INSCRIÇÃO GRATUITA",
        pdfCor: [37, 99, 235] as [number, number, number],
      };
    }

    if (statusPagamento === "analise") {
      return {
        texto: "Pagamento em análise",
        icone: "🟠",
        classes: "border-orange-300 bg-orange-100 text-orange-800",
        pdfTexto: "PAGAMENTO EM ANÁLISE",
        pdfCor: [217, 119, 6] as [number, number, number],
      };
    }

    return {
      texto: "Aguardando pagamento",
      icone: "🟡",
      classes: "border-yellow-300 bg-yellow-100 text-yellow-800",
      pdfTexto: "AGUARDANDO PAGAMENTO",
      pdfCor: [202, 138, 4] as [number, number, number],
    };
  }, [statusPagamento]);

  const numeroFormatado = numero ? numero.padStart(5, "0") : "-----";

  async function baixarComprovante() {
    if (!numero || !qrCode) {
      alert("Aguarde o carregamento dos dados da inscrição.");
      return;
    }

    try {
      const [banner, logo] = await Promise.all([
        carregarImagemBase64("/flyer-congresso-2026.jpg"),
        carregarImagemBase64("/logo-iempc.png").catch(() => ""),
      ]);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const larguraPagina = 210;
      const marrom: [number, number, number] = [57, 34, 21];
      const dourado: [number, number, number] = [188, 136, 54];
      const bege: [number, number, number] = [249, 244, 234];
      const branco: [number, number, number] = [255, 255, 255];
      const dataEmissao = new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date());

      pdf.setFillColor(...bege);
      pdf.rect(0, 0, 210, 297, "F");

      pdf.setDrawColor(...dourado);
      pdf.setLineWidth(1);
      pdf.roundedRect(8, 8, 194, 281, 4, 4);

      pdf.addImage(banner, "JPEG", 12, 12, 186, 55);

      if (logo) {
        pdf.setFillColor(...branco);
        pdf.circle(28, 77, 9, "F");
        pdf.addImage(logo, "PNG", 20, 69, 16, 16);
      }

      pdf.setTextColor(...marrom);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("COMPROVANTE OFICIAL DE INSCRIÇÃO", larguraPagina / 2, 79, {
        align: "center",
      });

      pdf.setFillColor(...statusVisual.pdfCor);
      pdf.roundedRect(57, 85, 96, 12, 3, 3, "F");

      pdf.setTextColor(...branco);
      pdf.setFontSize(8.5);
      pdf.text(statusVisual.pdfTexto, larguraPagina / 2, 93, {
        align: "center",
      });

      pdf.setFillColor(...branco);
      pdf.setDrawColor(...dourado);
      pdf.roundedRect(18, 103, 174, 30, 4, 4, "FD");

      pdf.setTextColor(120, 82, 40);
      pdf.setFontSize(8);
      pdf.text("PARTICIPANTE", larguraPagina / 2, 113, { align: "center" });

      pdf.setTextColor(...marrom);
      pdf.setFontSize(14);
      const linhasNome = pdf.splitTextToSize(nome || "Nome não informado", 150);
      pdf.text(linhasNome, larguraPagina / 2, 125, { align: "center" });

      pdf.setFillColor(...branco);
      pdf.setDrawColor(...dourado);
      pdf.roundedRect(18, 139, 174, 31, 4, 4, "FD");

      pdf.setTextColor(120, 82, 40);
      pdf.setFontSize(8);
      pdf.text("NÚMERO DA INSCRIÇÃO", larguraPagina / 2, 149, {
        align: "center",
      });

      pdf.setTextColor(...marrom);
      pdf.setFontSize(25);
      pdf.text(numeroFormatado, larguraPagina / 2, 164, { align: "center" });

      pdf.setFillColor(...branco);
      pdf.setDrawColor(...dourado);
      pdf.roundedRect(18, 176, 174, 36, 4, 4, "FD");

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...marrom);
      pdf.setFontSize(8.5);
      pdf.text("DATA", 27, 188);
      pdf.text("LOCAL", 27, 199);
      pdf.text("STATUS", 27, 209);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.2);
      pdf.text("19 a 22 de novembro de 2026", 55, 188);
      pdf.text("Sítio Arca Centro — Mateus Leme/MG", 55, 199);
      pdf.text(statusVisual.texto, 55, 209);

      pdf.setFillColor(...branco);
      pdf.setDrawColor(...dourado);
      pdf.roundedRect(53, 218, 104, 51, 4, 4, "FD");

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...marrom);
      pdf.setFontSize(8);
      pdf.text("QR CODE PARA CHECK-IN", larguraPagina / 2, 226, {
        align: "center",
      });

      pdf.addImage(qrCode, "PNG", 80, 229, 50, 37);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text("ATENÇÃO: ESTE QR CODE É INDIVIDUAL", larguraPagina / 2, 276, {
        align: "center",
      });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.8);
      pdf.text(
        "Apresente-o na entrada juntamente com um documento oficial com foto.",
        larguraPagina / 2,
        281,
        { align: "center" }
      );

      pdf.text(
        `Emitido em ${dataEmissao} • Organização: ${TELEFONE_ORGANIZACAO}`,
        larguraPagina / 2,
        286,
        { align: "center" }
      );

      pdf.save(`comprovante-${numeroFormatado}.pdf`);
    } catch (erro) {
      console.error("Erro ao gerar o comprovante:", erro);
      alert("Não foi possível gerar o comprovante. Tente novamente.");
    }
  }

  async function compartilharComprovante() {
    if (!numero) {
      alert("Aguarde o carregamento dos dados da inscrição.");
      return;
    }

    const texto = [
      "Congresso 2026 - IEMPC",
      "",
      `Participante: ${nome || "Nome não informado"}`,
      `Número da inscrição: ${numeroFormatado}`,
      `Status: ${statusVisual.texto}`,
      "Data: 19 a 22 de novembro de 2026",
      "Local: Sítio Arca Centro - Mateus Leme/MG",
      "",
      "O QR Code é individual e deve ser apresentado com documento oficial com foto.",
    ].join("\n");

    try {
      setCompartilhando(true);

      if (navigator.share) {
        await navigator.share({
          title: "Comprovante de inscrição - Congresso 2026",
          text: texto,
        });
        return;
      }

      await navigator.clipboard.writeText(texto);
      alert("Informações do comprovante copiadas.");
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === "AbortError") {
        return;
      }

      console.error("Erro ao compartilhar:", erro);
      alert("Não foi possível compartilhar o comprovante.");
    } finally {
      setCompartilhando(false);
    }
  }

  function adicionarNaAgenda() {
    const conteudo = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//IEMPC//Congresso 2026//PT-BR",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:congresso-2026@iempc",
      "DTSTAMP:20260731T061300Z",
      "DTSTART:20261119T193000",
      "DTEND:20261122T120000",
      "SUMMARY:Congresso 2026 - IEMPC",
      "LOCATION:Sítio Arca Centro - Mateus Leme/MG",
      "DESCRIPTION:Congresso 2026 da IEMPC.",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([conteudo], {
      type: "text/calendar;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Congresso2026-IEMPC.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] px-4 py-10 text-white print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-[28px] border-2 border-[#c38a38] bg-[#f8f1e6] text-[#3d2416] shadow-2xl print:rounded-none print:border-0 print:shadow-none">
          <img
            src="/flyer-congresso-2026.jpg"
            alt="Arte oficial do Congresso 2026"
            className="h-auto w-full object-cover"
          />

          <div className="px-6 py-8 text-center md:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              ✅
            </div>

            <h1 className="mt-4 text-3xl font-black">Inscrição confirmada!</h1>

            <p className="mt-3 text-lg font-semibold">
              {nome || "Nome não informado"}
            </p>

            <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-[#81542e]">
              Número da inscrição
            </p>

            <p className="mt-2 text-5xl font-black">{numeroFormatado}</p>

            <div
              className={`mx-auto mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black ${statusVisual.classes}`}
            >
              <span>{statusVisual.icone}</span>
              <span>{statusVisual.texto}</span>
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl border border-[#d9b276] bg-[#fffaf1] p-5 text-left sm:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#81542e]">
                  Data
                </p>
                <p className="mt-1 font-bold">📅 19 a 22 de novembro de 2026</p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#81542e]">
                  Local
                </p>
                <p className="mt-1 font-bold">
                  📍 Sítio Arca Centro
                  <br />
                  <span className="pl-6">Mateus Leme - MG</span>
                </p>
              </div>
            </div>

            {statusPagamento === "confirmado" || statusPagamento === "gratuito" ? (
  <div className="mt-7 rounded-2xl border border-[#d9b276] bg-white p-5 shadow-xl">
    <p className="text-sm font-black uppercase tracking-[0.15em] text-[#81542e]">
      QR Code para check-in
    </p>

    {carregando ? (
      <p className="mt-6 font-semibold">Gerando QR Code...</p>
    ) : qrCode ? (
      <img
        src={qrCode}
        alt="QR Code de check-in"
        className="mx-auto mt-4 h-60 w-60 rounded-2xl bg-white p-3 shadow-lg"
      />
    ) : (
      <p className="mt-6 font-semibold text-red-700">
        Não foi possível gerar o QR Code.
      </p>
    )}
  </div>
) : statusPagamento === "analise" ? (
  <div className="mt-7 rounded-2xl border-2 border-orange-300 bg-orange-50 p-6 text-center">
    <h3 className="text-2xl font-black text-orange-700">
      🟡 Pagamento em análise
    </h3>

    <p className="mt-4 text-orange-900">
      Recebemos seu comprovante de pagamento.
    </p>

    <p className="mt-2 text-orange-900">
      Nossa equipe fará a conferência em breve.
    </p>

    <p className="mt-4 font-bold text-orange-800">
      Após a aprovação, seu QR Code será liberado automaticamente.
    </p>
  </div>
) : (
  <div className="mt-7 rounded-2xl border-2 border-yellow-300 bg-yellow-50 p-6 text-center">
    <h3 className="text-2xl font-black text-yellow-700">
      🟡 Aguardando pagamento
    </h3>

    <p className="mt-4 text-yellow-900">
      Seu pagamento ainda não foi confirmado.
    </p>

    <p className="mt-2 text-yellow-900">
      Assim que o pagamento for aprovado, seu QR Code será liberado automaticamente.
    </p>
  </div>
)}

            <div className="mt-6 rounded-2xl border-2 border-yellow-400 bg-yellow-50 p-5 text-left text-yellow-950">
              <p className="text-lg font-black">⚠️ Este QR Code é individual.</p>
              <p className="mt-2 font-medium">
                Apresente-o na entrada juntamente com um documento oficial com
                foto. Não compartilhe o seu QR Code com outras pessoas.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 print:hidden sm:grid-cols-2">
          <button
            type="button"
            onClick={baixarComprovante}
            disabled={!numero || !qrCode}
            className="rounded-xl border border-amber-200/20 px-6 py-3 font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            📄 Baixar comprovante
          </button>

          <button
            type="button"
            onClick={compartilharComprovante}
            disabled={!numero || compartilhando}
            className="rounded-xl border border-amber-200/20 px-6 py-3 font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {compartilhando ? "Compartilhando..." : "📲 Compartilhar comprovante"}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-amber-200/20 px-6 py-3 font-semibold transition hover:bg-white/10"
          >
            🖨️ Imprimir comprovante
          </button>

          <button
            type="button"
            onClick={adicionarNaAgenda}
            className="rounded-xl border border-amber-200/20 px-6 py-3 font-semibold transition hover:bg-white/10"
          >
            📅 Adicionar à agenda
          </button>

          <Link
            href="/"
            className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-7 py-3 text-center font-bold text-[#2b180d] sm:col-span-2"
          >
            🏠 Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}