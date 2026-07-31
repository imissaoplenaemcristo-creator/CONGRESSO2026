"use client";

import { useEffect } from "react";

type TermoResponsabilidadeModalProps = {
  aberto: boolean;
  onFechar: () => void;
};

export default function TermoResponsabilidadeModal({
  aberto,
  onFechar,
}: TermoResponsabilidadeModalProps) {
  useEffect(() => {
    if (!aberto) {
      return;
    }

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function fecharComEsc(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        onFechar();
      }
    }

    window.addEventListener("keydown", fecharComEsc);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", fecharComEsc);
    };
  }, [aberto, onFechar]);

  if (!aberto) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-termo"
    >
      <button
        type="button"
        aria-label="Fechar termo"
        onClick={onFechar}
        className="absolute inset-0"
      />

      <section className="relative z-10 flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-amber-300/25 bg-[#21150f] text-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-amber-300/15 px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
              Congresso 2026
            </p>

            <h2
              id="titulo-termo"
              className="mt-2 text-2xl font-black sm:text-3xl"
            >
              Termo de Responsabilidade e Compromisso
            </h2>

            <p className="mt-2 text-sm text-amber-100/60">
              Igreja Missão Plena em Cristo
            </p>
          </div>

          <button
            type="button"
            onClick={onFechar}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl transition hover:bg-white/10"
            aria-label="Fechar termo"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 text-sm leading-7 text-amber-50/90 sm:px-7 sm:text-base">
          <p className="rounded-xl border border-amber-300/15 bg-amber-300/10 p-4 text-sm font-semibold text-amber-100">
            Última atualização: 31 de julho de 2026
          </p>

          <div className="mt-6 space-y-7">
            <Secao titulo="I – DA ORGANIZAÇÃO">
              O Congresso 2026 é promovido pela Igreja Missão Plena em
              Cristo, inscrita no CNPJ 14.847.657/0001-01, sob a
              responsabilidade do Pastor Alexandre Faria.
            </Secao>

            <Secao titulo="II – DO EVENTO">
              O Congresso 2026 será realizado nas datas e no local divulgados
              oficialmente pela organização. Ao realizar sua inscrição, o
              congressista declara que leu, compreendeu e concorda
              integralmente com este termo. O evento tem como objetivo promover
              comunhão, crescimento espiritual, edificação, integração cristã
              e momentos de lazer entre os participantes.
            </Secao>

            <Secao titulo="III – DAS RESPONSABILIDADES DO CONGRESSISTA">
              <ul className="list-disc space-y-1 pl-5">
                <li>Zelar pelo patrimônio utilizado durante o evento.</li>
                <li>Respeitar líderes, voluntários e demais congressistas.</li>
                <li>Manter conduta compatível com os princípios cristãos.</li>
                <li>Cumprir os horários estabelecidos pela organização.</li>
                <li>Responder por danos materiais causados.</li>
                <li>
                  Permanecer no local do evento, salvo autorização expressa.
                </li>
                <li>
                  Informar condições de saúde, medicamentos e necessidades
                  especiais relevantes.
                </li>
              </ul>
            </Secao>

            <Secao titulo="IV – DOS MENORES DE IDADE">
              Participantes menores de 18 anos somente poderão participar
              mediante autorização do responsável legal, realizada por meio do
              próprio sistema de inscrição do Congresso.
            </Secao>

            <Secao titulo="V – DAS BAGAGENS E OBJETOS PESSOAIS">
              O congressista deverá levar apenas os itens necessários para sua
              permanência no evento. Recomenda-se evitar excesso de bagagem,
              objetos de alto valor e grandes quantias em dinheiro. A
              organização não se responsabiliza por perdas, furtos ou danos a
              objetos pessoais.
            </Secao>

            <Secao titulo="VI – DAS ROUPAS E PERTENCES">
              Recomenda-se levar roupas confortáveis, adequadas às atividades,
              calçados apropriados e peças extras. Solicita-se vestimenta
              compatível com os princípios cristãos adotados pela Igreja.
            </Secao>

            <Secao titulo="VII – DA BÍBLIA E DOS MATERIAIS ESPIRITUAIS">
              Recomenda-se que todos os congressistas levem sua Bíblia e façam
              uso dela durante as ministrações, estudos, cultos e demais
              atividades espirituais.
            </Secao>

            <Secao titulo="VIII – DO USO DE IMAGEM">
              Ao participar do Congresso 2026, o congressista autoriza,
              gratuitamente, o uso de sua imagem, voz e nome em fotografias,
              vídeos e demais registros para divulgação institucional da
              Igreja Missão Plena em Cristo, sem qualquer ônus para a
              organização.
            </Secao>

            <Secao titulo="IX – DO CANCELAMENTO">
              Em caso de desistência, os valores pagos não serão restituídos.
              A substituição do participante dependerá de autorização expressa
              da organização. Fica eleito o foro da Comarca de Belo
              Horizonte/MG para dirimir eventuais dúvidas oriundas deste termo.
            </Secao>

            <Secao titulo="X – DAS REGRAS GERAIS">
              O congressista compromete-se a cumprir as normas, participar das
              atividades programadas, respeitar horários, líderes, voluntários
              e participantes, mantendo comportamento compatível com os
              princípios cristãos. O descumprimento poderá resultar no
              desligamento do evento, sem direito à restituição dos valores
              pagos.
            </Secao>

            <Secao titulo="XI – DOS ITENS NECESSÁRIOS">
              O congressista declara estar ciente da lista oficial de
              materiais e pertences recomendados para participação no
              Congresso, comprometendo-se a providenciá-los antes do evento.
            </Secao>

            <Secao titulo="XII – DA DECLARAÇÃO">
              Ao concluir sua inscrição, o participante declara que leu
              integralmente este termo, compreendeu todas as informações,
              concorda com as regras estabelecidas, confirma a veracidade dos
              dados fornecidos e compromete-se a cumprir as normas do Congresso
              2026.
            </Secao>
          </div>
        </div>

        <footer className="border-t border-amber-300/15 bg-[#1a110d] px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={onFechar}
            className="w-full rounded-xl bg-amber-400 px-6 py-4 font-black text-[#2b180d] transition hover:bg-amber-300"
          >
            Concluir leitura e fechar
          </button>
        </footer>
      </section>
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
    <section className="rounded-2xl border border-amber-300/10 bg-white/5 p-5">
      <h3 className="font-black text-amber-300">{titulo}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}