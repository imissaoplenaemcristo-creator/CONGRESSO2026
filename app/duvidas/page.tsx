import Header from "../components/Header";

const duvidas = [
  {
    pergunta: "Quem pode participar do Congresso 2026?",
    resposta:
      "O congresso é aberto para todas as pessoas que desejam participar. Basta realizar sua inscrição dentro do período disponível.",
  },
  {
    pergunta: "Crianças pagam inscrição?",
    resposta:
      "Sim. Os valores variam conforme a idade do participante: de 0 a 5 anos é isento, de 6 a 12 anos o valor é reduzido e a partir de 13 anos é aplicada a inscrição integral.",
  },
  {
    pergunta: "Posso cancelar minha inscrição?",
    resposta:
      "Sim. O cancelamento poderá ser solicitado diretamente à organização. Após o cancelamento, a inscrição ficará registrada como cancelada.",
  },
  {
    pergunta: "Posso transferir minha inscrição para outra pessoa?",
    resposta:
      "A transferência dependerá da análise da organização do congresso. Entre em contato antes de realizar qualquer alteração.",
  },
  {
    pergunta: "Quais são as formas de pagamento?",
    resposta:
      "Aceitamos PIX, dinheiro e cartão. Para pagamento em cartão procure o Pastor Alexandre. Para pagamento em dinheiro procure a irmã Martha.",
  },
  {
    pergunta: "Como sei se meu pagamento foi confirmado?",
    resposta:
      "Acesse a página 'Minha Inscrição'. Nela você poderá consultar a situação do pagamento utilizando o número da inscrição e o CPF ou RG informado no cadastro.",
  },
  {
    pergunta: "O que está incluso na inscrição?",
    resposta:
      "Todas as informações oficiais sobre hospedagem, alimentação e demais benefícios serão divulgadas pela organização do congresso.",
  },
  {
    pergunta: "Até quando posso pagar?",
    resposta:
      "O prazo para pagamento será divulgado pela equipe organizadora. Acompanhe a página de Avisos para futuras atualizações.",
  },
  {
    pergunta: "O que devo levar?",
    resposta:
      "Leve roupas para os quatro dias, itens de higiene pessoal, documentos, medicamentos de uso contínuo, toalha, roupa de cama e objetos de uso pessoal.",
  },
  {
    pergunta: "Como acompanho novidades do congresso?",
    resposta:
      "Acompanhe as páginas de Avisos e Programação, que serão atualizadas sempre que houver novas informações.",
  },
];

export default function DuvidasPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] text-white">
      <Header />

      <section className="mx-auto max-w-6xl px-6 py-16">

        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-300">
            Congresso 2026
          </p>

          <h1 className="mt-4 text-5xl font-black md:text-6xl">
            Perguntas Frequentes
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-xl leading-9 text-amber-50/75">
            Reunimos aqui as principais dúvidas sobre o Congresso 2026.
            Caso sua pergunta não esteja nesta lista, entre em contato
            com a organização.
          </p>
        </div>

        <div className="mt-14 space-y-5">

          {duvidas.map((duvida) => (
            <details
              key={duvida.pergunta}
              className="group rounded-3xl border border-amber-200/10 bg-white/5 p-6 transition hover:border-amber-400"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-xl font-bold">
                {duvida.pergunta}

                <span className="text-3xl text-amber-300 transition group-open:rotate-45">
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

        <div className="mt-16 rounded-3xl border border-amber-200/15 bg-gradient-to-r from-amber-400/10 to-yellow-600/10 p-10 text-center">

          <div className="text-6xl">
            🙋
          </div>

          <h2 className="mt-5 text-3xl font-black">
            Ainda ficou com alguma dúvida?
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-amber-50/75">
            Caso sua dúvida não tenha sido respondida nesta página,
            procure a equipe organizadora do Congresso 2026. Teremos
            prazer em ajudar você.
          </p>

          <a
            href="/avisos"
            className="mt-8 inline-flex rounded-xl border border-amber-300/30 px-6 py-3 font-bold text-amber-200 transition hover:bg-amber-400 hover:text-[#2b180d]"
          >
            Ver Avisos
          </a>

        </div>

      </section>
    </main>
  );
}