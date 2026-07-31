import Header from "../components/Header";

const duvidas = [
  {
    pergunta: "Quem pode participar do Congresso 2026?",
    resposta:
      "O Congresso é aberto para todas as pessoas que desejam participar. Basta realizar a inscrição dentro do período disponível.",
  },
  {
    pergunta: "Crianças pagam inscrição?",
    resposta:
      "Os valores variam conforme a idade do participante: de 0 a 5 anos a inscrição é gratuita, de 6 a 12 anos o valor é reduzido e, a partir de 13 anos, é aplicado o valor integral.",
  },
  {
    pergunta: "Posso cancelar minha inscrição?",
    resposta:
      "Sim. O cancelamento poderá ser solicitado diretamente à organização. Conforme o Termo de Responsabilidade, não haverá devolução dos valores pagos em caso de cancelamento da inscrição. Após o cancelamento, a inscrição ficará registrada como Cancelada.",
  },
  {
    pergunta: "Posso transferir minha inscrição para outra pessoa?",
    resposta:
      "A substituição do congressista dependerá da análise e aprovação da organização. Entre em contato antes de realizar qualquer alteração.",
  },
  {
    pergunta: "Quais são as formas de pagamento?",
    resposta:
      "Aceitamos PIX, dinheiro, cartão e Carnê. Para pagamento em cartão ou por Carnê, procure o Pastor Alexandre. Para pagamento em dinheiro, procure a irmã Martha.",
  },
  {
    pergunta: "Como sei se meu pagamento foi confirmado?",
    resposta:
      "Acesse a página Minha Inscrição e informe o CPF utilizado no cadastro. Nessa página, você poderá consultar a situação do pagamento e verificar se o QR Code já foi liberado.",
  },
  {
    pergunta: "O que está incluso na inscrição?",
    resposta:
      "A inscrição dá direito à participação em toda a programação oficial do Congresso 2026, incluindo hospedagem durante todo o evento, café da manhã, almoço, café da tarde e jantar. As orientações sobre o que levar e demais informações importantes estão disponíveis na página Avisos.",
  },
  {
    pergunta: "Até quando posso pagar?",
    resposta:
      "O pagamento da inscrição poderá ser realizado até o dia 13 de novembro de 2026. Após essa data, a inscrição poderá ser cancelada pela organização caso o pagamento não tenha sido identificado.",
  },
  {
    pergunta: "O que devo levar?",
    resposta:
      "Leve roupas para os quatro dias, itens de higiene pessoal, documento oficial com foto, medicamentos de uso pessoal, toalhas, roupa de cama e demais objetos necessários para sua estadia. Consulte a página Avisos para conferir a lista completa.",
  },
  {
    pergunta: "Como acompanho as novidades do Congresso?",
    resposta:
      "Acompanhe as páginas Avisos e Programação, que serão atualizadas sempre que houver novas informações. As novidades também serão divulgadas no Instagram oficial da Igreja Missão Plena em Cristo.",
  },
];

export default function DuvidasPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] text-white">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-300">
            Congresso 2026
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            Perguntas frequentes
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-amber-50/75 md:text-xl">
            Reunimos aqui as principais dúvidas sobre o Congresso 2026.
            Caso sua pergunta não esteja nesta lista, entre em contato
            com a organização.
          </p>
        </div>

        <div className="mt-12 space-y-5">
          {duvidas.map((duvida) => (
            <details
              key={duvida.pergunta}
              className="group rounded-3xl border border-amber-200/10 bg-white/5 p-5 transition hover:border-amber-400 sm:p-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold sm:text-xl">
                <span>{duvida.pergunta}</span>

                <span
                  aria-hidden="true"
                  className="shrink-0 text-3xl text-amber-300 transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>

              <div className="mt-6 border-t border-amber-200/10 pt-5">
                <p className="leading-8 text-amber-50/75">
                  {duvida.resposta}
                </p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-amber-200/15 bg-gradient-to-r from-amber-400/10 to-yellow-600/10 p-6 text-center sm:p-10">
          <div className="text-6xl">🙋</div>

          <h2 className="mt-5 text-3xl font-black">
            Ainda ficou com alguma dúvida?
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-amber-50/75">
            Caso sua dúvida não tenha sido respondida nesta página,
            procure a equipe organizadora do Congresso 2026. Teremos
            prazer em ajudar você.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/avisos"
              className="inline-flex justify-center rounded-xl border border-amber-300/30 px-6 py-3 font-bold text-amber-200 transition hover:bg-amber-400 hover:text-[#2b180d]"
            >
              Ver avisos
            </a>

            <a
              href="/programacao"
              className="inline-flex justify-center rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-6 py-3 font-black text-[#2b180d] transition hover:brightness-110"
            >
              Ver programação
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}