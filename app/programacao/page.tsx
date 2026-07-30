import Header from "../components/Header";

const dias = [
  {
    dia: "Quinta-feira",
    data: "19 de novembro",
    destaque: "Abertura do congresso",
    itens: [
      {
        horario: "19h30",
        titulo: "Abertura oficial",
        descricao:
          "Início do Congresso 2026 — Até Transbordar, com momento de louvor, apresentação e palavra.",
      },
    ],
  },
  {
    dia: "Sexta-feira",
    data: "20 de novembro",
    destaque: "Primeiro dia completo",
    itens: [
      {
        horario: "08h00",
        titulo: "Café da manhã",
        descricao:
          "Momento de alimentação e comunhão entre os participantes.",
      },
      {
        horario: "09h30",
        titulo: "Palavra",
        descricao:
          "Ministração e momento de crescimento espiritual.",
      },
      {
        horario: "Em breve",
        titulo: "Demais atividades",
        descricao:
          "Os outros horários e atividades serão divulgados pela organização.",
      },
    ],
  },
  {
    dia: "Sábado",
    data: "21 de novembro",
    destaque: "Programação especial",
    itens: [
      {
        horario: "Em breve",
        titulo: "Programação em definição",
        descricao:
          "Os horários, ministrações e atividades de sábado serão divulgados em breve.",
      },
    ],
  },
  {
    dia: "Domingo",
    data: "22 de novembro",
    destaque: "Encerramento",
    itens: [
      {
        horario: "Em breve",
        titulo: "Programação de encerramento",
        descricao:
          "Os detalhes do último dia e do encerramento serão divulgados pela organização.",
      },
    ],
  },
];

export default function ProgramacaoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-300">
            Congresso 2026
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            Programação
          </h1>

          <p className="mt-6 text-lg leading-8 text-amber-50/75">
            Confira os horários já definidos para os quatro dias do
            Congresso 2026. A programação poderá receber atualizações
            conforme novas informações forem confirmadas pela organização.
          </p>
        </div>

        <div className="mt-12 rounded-3xl border border-amber-200/15 bg-black/25 p-6 shadow-2xl md:p-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-amber-200/10 bg-white/5 p-5">
              <p className="text-sm text-amber-200/70">Período</p>
              <p className="mt-2 text-lg font-bold">
                19 a 22 de novembro
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200/10 bg-white/5 p-5">
              <p className="text-sm text-amber-200/70">Duração</p>
              <p className="mt-2 text-lg font-bold">Quatro dias</p>
            </div>

            <div className="rounded-2xl border border-amber-200/10 bg-white/5 p-5">
              <p className="text-sm text-amber-200/70">Local</p>
              <p className="mt-2 text-lg font-bold">
                Sítio Arca Centro
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200/10 bg-white/5 p-5">
              <p className="text-sm text-amber-200/70">Cidade</p>
              <p className="mt-2 text-lg font-bold">
                Mateus Leme/MG
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-8">
          {dias.map((programacao, index) => (
            <section
              key={programacao.dia}
              className="overflow-hidden rounded-3xl border border-amber-200/10 bg-white/5 shadow-xl"
            >
              <div className="border-b border-amber-200/10 bg-black/20 px-6 py-6 md:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-300">
                      Dia {index + 1}
                    </p>

                    <h2 className="mt-2 text-3xl font-black">
                      {programacao.dia}
                    </h2>

                    <p className="mt-1 text-amber-50/60">
                      {programacao.data}
                    </p>
                  </div>

                  <div className="w-fit rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-200">
                    {programacao.destaque}
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 md:p-8">
                {programacao.itens.map((item) => (
                  <div
                    key={`${programacao.dia}-${item.horario}-${item.titulo}`}
                    className="grid gap-4 rounded-2xl border border-amber-200/10 bg-black/15 p-5 md:grid-cols-[130px_1fr] md:items-start"
                  >
                    <div className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-4 py-3 text-center font-black text-[#2b180d]">
                      {item.horario}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold">
                        {item.titulo}
                      </h3>

                      <p className="mt-2 leading-7 text-amber-50/70">
                        {item.descricao}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-amber-200/15 bg-gradient-to-r from-amber-400/10 to-yellow-600/10 p-6 text-center md:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-300">
            Atenção
          </p>

          <h2 className="mt-3 text-2xl font-black md:text-3xl">
            A programação poderá ser atualizada
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-amber-50/75">
            Acompanhe os avisos oficiais do Congresso 2026 para saber
            quando novos horários, ministrações e atividades forem
            confirmados.
          </p>

          <a
            href="/avisos"
            className="mt-7 inline-flex rounded-xl border border-amber-300/30 px-6 py-3 font-bold text-amber-200 transition hover:bg-amber-400 hover:text-[#2b180d]"
          >
            Ver avisos
          </a>
        </div>
      </section>
    </main>
  );
}