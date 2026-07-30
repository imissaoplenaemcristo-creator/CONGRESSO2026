import QRCode from "qrcode";
import { jsPDF } from "jspdf";

export type DadosComprovante = {
  numero_inscricao: number | string;
  nome: string;
  qr_token: string | null;
};

async function carregarImagemBase64(caminho: string): Promise<string> {
  const resposta = await fetch(caminho);

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar o banner.");
  }

  const arquivo = await resposta.blob();

  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onloadend = () => {
      if (typeof leitor.result === "string") {
        resolve(leitor.result);
      } else {
        reject(new Error("Não foi possível converter o banner."));
      }
    };

    leitor.onerror = () => reject(new Error("Erro ao ler o banner."));
    leitor.readAsDataURL(arquivo);
  });
}

export async function gerarComprovante(
  inscricao: DadosComprovante
) {
  if (!inscricao.qr_token) {
    throw new Error("QR Code indisponível.");
  }

  const imagemQrCode = await QRCode.toDataURL(
    inscricao.qr_token,
    {
      width: 500,
      margin: 2,
    }
  );

  const banner = await carregarImagemBase64(
    "/flyer-congresso-2026.jpg"
  );

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  pdf.setFillColor(249, 244, 234);
  pdf.rect(0, 0, 210, 297, "F");

  pdf.setDrawColor(188, 136, 54);
  pdf.setLineWidth(1);
  pdf.roundedRect(8, 8, 194, 281, 4, 4);

  pdf.addImage(banner, "JPEG", 12, 12, 186, 60);

  pdf.setTextColor(57, 34, 21);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("COMPROVANTE OFICIAL DE INSCRIÇÃO", 105, 82, {
    align: "center",
  });

  pdf.setFillColor(48, 120, 78);
  pdf.roundedRect(62, 88, 86, 12, 3, 3, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.text("INSCRIÇÃO CONFIRMADA", 105, 96, {
    align: "center",
  });

  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(188, 136, 54);
  pdf.roundedRect(18, 107, 174, 31, 4, 4, "FD");

  pdf.setTextColor(120, 82, 40);
  pdf.setFontSize(8);
  pdf.text("PARTICIPANTE", 105, 117, {
    align: "center",
  });

  pdf.setTextColor(57, 34, 21);
  pdf.setFontSize(15);

  const linhasNome = pdf.splitTextToSize(
    inscricao.nome || "Nome não informado",
    150
  );

  pdf.text(linhasNome, 105, 129, {
    align: "center",
  });

  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(188, 136, 54);
  pdf.roundedRect(18, 145, 174, 36, 4, 4, "FD");

  pdf.setTextColor(120, 82, 40);
  pdf.setFontSize(8);
  pdf.text("NÚMERO DA INSCRIÇÃO", 105, 156, {
    align: "center",
  });

  pdf.setTextColor(57, 34, 21);
  pdf.setFontSize(27);
  pdf.text(
    String(inscricao.numero_inscricao).padStart(5, "0"),
    105,
    174,
    { align: "center" }
  );

  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(188, 136, 54);
  pdf.roundedRect(18, 188, 174, 40, 4, 4, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(57, 34, 21);
  pdf.setFontSize(9);

  pdf.text("DATA", 27, 200);
  pdf.text("LOCAL", 27, 212);
  pdf.text("HORÁRIO", 27, 224);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);

  pdf.text("19, 20, 21 e 22 de novembro de 2026", 55, 200);
  pdf.text("Sítio Arca Centro — Mateus Leme/MG", 55, 212);
  pdf.text("Consulte a programação oficial", 55, 224);

  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(188, 136, 54);
  pdf.roundedRect(53, 235, 104, 43, 4, 4, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(57, 34, 21);
  pdf.setFontSize(8);
  pdf.text("QR CODE PARA CHECK-IN", 105, 243, {
    align: "center",
  });

  pdf.addImage(imagemQrCode, "PNG", 79, 246, 52, 27);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.text(
    "Leve documento com foto, não compartilhe o QR Code e guarde este comprovante.",
    105,
    288,
    { align: "center" }
  );

  pdf.save(
    `comprovante-${String(inscricao.numero_inscricao).padStart(
      5,
      "0"
    )}.pdf`
  );
}