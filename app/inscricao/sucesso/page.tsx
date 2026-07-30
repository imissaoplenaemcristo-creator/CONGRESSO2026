"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

async function carregarImagemBase64(
  caminho: string
): Promise<string> {
  const resposta = await fetch(caminho);

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar a imagem.");
  }

  const arquivo = await resposta.blob();

  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onloadend = () => {
      if (typeof leitor.result === "string") {
        resolve(leitor.result);
      } else {
        reject(
          new Error("Não foi possível converter a imagem.")
        );
      }
    };

    leitor.onerror = () => {
      reject(new Error("Não foi possível ler a imagem."));
    };

    leitor.readAsDataURL(arquivo);
  });
}

export default function SucessoPage() {
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const parametros = new URLSearchParams(
          window.location.search
        );

        const numeroRecebido =
          parametros.get("numero") ?? "";

        const nomeRecebido =
          parametros.get("nome") ?? "";

        const tokenRecebido =
          parametros.get("token") ?? "";

        setNumero(numeroRecebido);
        setNome(nomeRecebido);

        if (tokenRecebido) {
          const imagemQrCode = await QRCode.toDataURL(
            tokenRecebido,
            {
              width: 500,
              margin: 2,
            }
          );

          setQrCode(imagemQrCode);
        }
      } catch (erro) {
        console.error(
          "Erro ao gerar o QR Code:",
          erro
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  async function baixarComprovante() {
    if (!numero || !qrCode) {
      alert(
        "Aguarde o carregamento dos dados da inscrição."
      );
      return;
    }
    try {
      const banner = await carregarImagemBase64(
        "/flyer-congresso-2026.jpg"
      );

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const larguraPagina = 210;

      const marrom: [number, number, number] = [
        57, 34, 21,
      ];

      const dourado: [number, number, number] = [
        188, 136, 54,
      ];

      const bege: [number, number, number] = [
        249, 244, 234,
      ];

      const branco: [number, number, number] = [
        255, 255, 255,
      ];

      const verde: [number, number, number] = [
        48, 120, 78,
      ];

      pdf.setFillColor(...bege);
      pdf.rect(0, 0, 210, 297, "F");

      pdf.setDrawColor(...dourado);
      pdf.setLineWidth(1);
      pdf.roundedRect(8, 8, 194, 281, 4, 4);

      pdf.addImage(
        banner,
        "JPEG",
        12,
        12,
        186,
        60
      );

      pdf.setTextColor(...marrom);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);

      pdf.text(
        "COMPROVANTE OFICIAL DE INSCRIÇÃO",
        larguraPagina / 2,
        82,
        {
          align: "center",
        }
      );

      pdf.setFillColor(...verde);
      pdf.roundedRect(62, 88, 86, 12, 3, 3, "F");

      pdf.setTextColor(...branco);
      pdf.setFontSize(9);

      pdf.text(
        "INSCRIÇÃO CONFIRMADA",
        larguraPagina / 2,
        96,
        {
          align: "center",
        }
      );

      pdf.setFillColor(...branco);
      pdf.setDrawColor(...dourado);
      pdf.roundedRect(18, 107, 174, 31, 4, 4, "FD");

      pdf.setTextColor(120, 82, 40);
      pdf.setFontSize(8);

      pdf.text(
        "PARTICIPANTE",
        larguraPagina / 2,
        117,
        {
          align: "center",
        }
      );

      pdf.setTextColor(...marrom);
      pdf.setFontSize(15);

      const linhasNome = pdf.splitTextToSize(
        nome || "Nome não informado",
        150
      );

      pdf.text(
        linhasNome,
        larguraPagina / 2,
        129,
        {
          align: "center",
        }
      );

      pdf.setFillColor(...branco);
      pdf.setDrawColor(...dourado);
      pdf.roundedRect(18, 145, 174, 36, 4, 4, "FD");

      pdf.setTextColor(120, 82, 40);
      pdf.setFontSize(8);

      pdf.text(
        "NÚMERO DA INSCRIÇÃO",
        larguraPagina / 2,
        156,
        {
          align: "center",
        }
      );

      pdf.setTextColor(...marrom);
      pdf.setFontSize(27);

      pdf.text(
        numero.padStart(5, "0"),
        larguraPagina / 2,
        174,
        {
          align: "center",
        }
      );

      pdf.setFillColor(...branco);
      pdf.setDrawColor(...dourado);
      pdf.roundedRect(18, 188, 174, 40, 4, 4, "FD");

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...marrom);
      pdf.setFontSize(9);

      pdf.text("DATA", 27, 200);
      pdf.text("LOCAL", 27, 212);
      pdf.text("HORÁRIO", 27, 224);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);

      pdf.text(
        "19, 20, 21 e 22 de novembro de 2026",
        55,
        200
      );

      pdf.text(
        "Sítio Arca Centro — Mateus Leme/MG",
        55,
        212
      );

      pdf.text(
        "Consulte a programação oficial",
        55,
        224
      );

      pdf.setFillColor(...branco);
      pdf.setDrawColor(...dourado);
      pdf.roundedRect(53, 235, 104, 43, 4, 4, "FD");

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...marrom);
      pdf.setFontSize(8);

      pdf.text(
        "QR CODE PARA CHECK-IN",
        larguraPagina / 2,
        243,
        {
          align: "center",
        }
      );

      pdf.addImage(
        qrCode,
        "PNG",
        79,
        246,
        52,
        27
      );

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);

      pdf.text(
        "INFORMAÇÕES IMPORTANTES",
        larguraPagina / 2,
        283,
        {
          align: "center",
        }
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);

      pdf.text(
        "Leve documento com foto, não compartilhe o QR Code e guarde este comprovante.",
        larguraPagina / 2,
        288,
        {
          align: "center",
        }
      );

      pdf.save(
        `comprovante-${numero.padStart(5, "0")}.pdf`
      );
    } catch (erro) {
      console.error(
        "Erro ao gerar o comprovante:",
        erro
      );

      alert(
        "Não foi possível gerar o comprovante. Tente novamente."
      );
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
    "DTSTAMP:20260729T000000Z",
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
    <main className="min-h-screen bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-[28px] border-2 border-[#c38a38] bg-[#f8f1e6] text-[#3d2416] shadow-2xl">
          <img
            src="/flyer-congresso-2026.jpg"
            alt="Arte oficial do Congresso 2026"
            className="h-auto w-full object-cover"
          />

          <div className="px-6 py-8 text-center md:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              ✅
            </div>

            <h1 className="mt-4 text-3xl font-black">
              Inscrição realizada!
            </h1>

            <p className="mt-3 text-lg font-semibold">
              {nome || "Nome não informado"}
            </p>

            <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-[#81542e]">
              Número da inscrição
            </p>

            <p className="mt-2 text-5xl font-black">
              {numero
                ? numero.padStart(5, "0")
                : "-----"}
            </p>

            <div className="mt-7 rounded-2xl border border-[#d9b276] bg-white p-5">
              <p className="text-sm font-black uppercase tracking-[0.15em] text-[#81542e]">
                QR Code para check-in
              </p>

              {carregando ? (
                <p className="mt-6 font-semibold">
                  Gerando QR Code...
                </p>
              ) : qrCode ? (
                <img
                  src={qrCode}
                  alt="QR Code de check-in"
                  className="mx-auto mt-4 h-56 w-56 rounded-2xl bg-white p-3"
                />
              ) : (
                <p className="mt-6 font-semibold text-red-700">
                  Não foi possível gerar o QR Code.
                </p>
              )}

              <p className="mt-3 text-sm font-medium text-[#6e4a32]">
                Apresente este QR Code na entrada do
                congresso.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-[#d9b276] bg-[#fffaf1] p-5">
              <p className="font-bold text-[#3d2416]">
                Guarde seu número de inscrição e não
                compartilhe seu QR Code.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3">
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
  onClick={adicionarNaAgenda}
  className="rounded-xl border border-amber-200/20 px-6 py-3 font-semibold transition hover:bg-white/10"
>
  📅 Adicionar à agenda
</button>
          <Link
            href="/"
            className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-7 py-3 text-center font-bold text-[#2b180d]"
          >
            🏠 Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}