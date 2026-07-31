import Header from "../components/Header";

const dias = [
  {
    dia: "Quinta-feira",
    data: "19 de novembro",
    destaque: "Abertura do congresso",
    itens: [
      {
        horario: "19h45",
        titulo: "Saída da Igreja Missão Plena em Cristo",
        descricao:
          "Saída oficial para o local do Congresso 2026.",
      },
      {
        horario: "Após a chegada",
        titulo: "Direcionamento para o auditório",
        descricao:
          "Recepção dos participantes e organização para o início das atividades.",
      },
      {
        horario: "Em seguida",
        titulo: "Informações gerais",
        descricao:
          "Orientações importantes para os dias do Congresso.",
      },
      {
        horario: "Após as informações",
        titulo: "Jantar",
        descricao:
          "Momento de alimentação e comunhão entre os participantes.",
      },
    ],
  },
  {
    dia: "Sexta-feira",
    data: "20 de novembro",
    destaque: "Primeiro dia completo",
    itens: [
      {
        horario: "07h30 às 08h30",
        titulo: "Café da manhã",
        descricao:
          "Momento de alimentação e comunhão entre os participantes.",
      },
      {
        horario: "08h45 às 11h50",
        titulo: "Culto",
        descricao:
          "Momento de louvor, palavra e crescimento espiritual.",
      },
      {
        horario: "Após o culto",
        titulo: "Batismo nas águas",
        descricao:
          "Celebração do batismo nas águas.",
      },
      {
        horario: "11h50",
        titulo: "Almoço",
        descricao:
          "Refeição e momento de comunhão.",
      },
      {
        horario: "Tarde",
        titulo: "Tarde livre",
        descricao:
          "Tempo livre para descanso, lazer e convivência.",
      },
      {
        horario: "16h30",
        titulo: "Café da tarde",
        descricao:
          "Momento de alimentação antes da programação da noite.",
      },
      {
        horario: "18h00",
        titulo: "Culto",
        descricao:
          "Culto da noite com louvor e ministração da Palavra.",
      },
      {
        horario: "21h00",
        titulo: "Jantar",
        descricao:
          "Encerramento das atividades do dia com jantar.",
      },
    ],
  },
  {
    dia: "Sábado",
    data: "21 de novembro",
    destaque: "Programação especial",
    itens: [
      {
        horario: "07h30 às 08h30",
        titulo: "Café da manhã",
        descricao:
          "Momento de alimentação e comunhão entre os participantes.",
      },
      {
        horario: "08h45 às 11h50",
        titulo: "Culto",
        descricao:
          "Momento de louvor, palavra e crescimento espiritual.",
      },
      {
        horario: "11h50",
        titulo: "Almoço",
        descricao:
          "Refeição e momento de comunhão.",
      },
      {
        horario: "Tarde",
        titulo: "Tarde livre",
        descricao:
          "Tempo livre para descanso, lazer e convivência.",
      },
      {
        horario: "16h30",
        titulo: "Café da tarde",
        descricao:
          "Momento de alimentação antes da programação da noite.",
      },
      {
        horario: "18h00",
        titulo: "Culto",
        descricao:
          "Culto da noite com louvor e ministração da Palavra.",
      },
      {
        horario: "21h00",
        titulo: "Jantar",
        descricao:
          "Encerramento das atividades do dia com jantar.",
      },
    ],
  },
  {
    dia: "Domingo",
    data: "22 de novembro",
    destaque: "Encerramento",
    itens: [
      {
        horario: "07h30 às 08h30",
        titulo: "Café da manhã",
        descricao:
          "Momento de alimentação e comunhão entre os participantes.",
      },
      {
        horario: "08h45 às 11h40",
        titulo: "Culto",
        descricao:
          "Culto de encerramento com louvor e ministração da Palavra.",
      },
      {
        horario: "11h50",
        titulo: "Almoço",
        descricao:
          "Refeição e momento de comunhão.",
      },
      {
        horario: "Tarde",
        titulo: "Tarde livre",
        descricao:
          "Tempo livre antes da organização para o retorno.",
      },
      {
        horario: "17h00",
        titulo: "Retorno",
        descricao:
          "Saída do local do Congresso e retorno para a Igreja Missão Plena em Cristo.",
      },
    ],
  },
];

export default function ProgramacaoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-300">
            Congresso 2026
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            Programação
          </h1>

          <p className="mt-6 text-lg leading-8 text-amber-50/75">
            Confira a programação oficial dos quatro dias do Congresso
            2026.
          </p>

          <p className="mt-3 text-sm italic leading-6 text-amber-200/80">
            A programação poderá sofrer alterações, se necessário, pela
            organização do Congresso.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-amber-200/15 bg-black/25 p-5 shadow-2xl md:p-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Resumo label="Período" valor="19 a 22 de novembro" />
            <Resumo label="Duração" valor="Quatro dias" />
            <Resumo label="Local" valor="Sítio Arca Centro" />
            <Resumo label="Cidade" valor="Mateus Leme/MG" />
          </div>
        </div>

        <div className="mt-12 space-y-8">
          {dias.map((programacao, index) => (
            <section
              key={programacao.dia}
              className="overflow-hidden rounded-3xl border border-amber-200/10 bg-white/5 shadow-xl"
            >
              <div className="border-b border-amber-200/10 bg-black/20 px-5 py-6 md:px-8">
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

              <div className="space-y-4 p-5 md:p-8">
                {programacao.itens.map((item) => (
                  <div
                    key={`${programacao.dia}-${item.horario}-${item.titulo}`}
                    className="grid gap-4 rounded-2xl border border-amber-200/10 bg-black/15 p-5 md:grid-cols-[170px_1fr] md:items-start"
                  >
                    <div className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-4 py-3 text-center text-sm font-black text-[#2b180d]">
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
            Acompanhe os avisos oficiais do Congresso 2026 para ficar
            informado sobre qualquer alteração.
          </p>

          <a
            href="/avisos"
            className="mt-7 inline-flex rounded-xl border border-amber-300/30 px-6 py-3 font-bold text-amber-200 transition hover:bg-amber-400 hover:text-[#2b180d]"
          >
            Ver avisos
          </a>
        </div>

        <div className="mt-10 text-center">
          <p className="text-lg font-semibold text-amber-100">
            Estamos preparando tudo com muito carinho para receber você.
          </p>

          <p className="mt-2 text-xl font-black text-amber-300">
            Nos vemos no Congresso 2026! ❤️
          </p>
        </div>
      </section>
    </main>
  );
}

function Resumo({
  label,
  valor,
}: {
  label: string;
  valor: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-200/10 bg-white/5 p-5">
      <p className="text-sm text-amber-200/70">{label}</p>
      <p className="mt-2 text-lg font-bold">{valor}</p>
    </div>
  );
}