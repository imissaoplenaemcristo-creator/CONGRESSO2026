import Header from "../components/Header";

const avisos = [
  {
    icone: "💊",
    titulo: "Medicamentos",
    descricao:
      "Caso utilize medicamentos de uso contínuo, leve quantidade suficiente para todos os dias do congresso. A equipe não fornecerá medicamentos de uso pessoal.",
  },
  {
    icone: "🪪",
    titulo: "Documentos",
    descricao:
      "Leve um documento de identificação (CPF ou RG) utilizado no momento da inscrição.",
  },
  {
    icone: "🧳",
    titulo: "Bagagem",
    descricao:
      "Leve roupas, itens de higiene pessoal, toalha, roupa de cama e demais objetos necessários para os quatro dias de evento.",
  },
  {
    icone: "🚌",
    titulo: "Transporte",
    descricao:
      "Os horários e locais de saída serão divulgados pela organização antes do congresso.",
  },
  {
    icone: "🍽️",
    titulo: "Alimentação",
    descricao:
      "As refeições previstas pela organização serão informadas antes do evento. Caso possua restrição alimentar, informe durante a inscrição.",
  },
  {
    icone: "📱",
    titulo: "Comunicação",
    descricao:
      "Acompanhe sempre os avisos oficiais do Congresso 2026 para não perder nenhuma atualização importante.",
  },
];

export default function AvisosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16">

        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-300">
            Congresso 2026
          </p>

          <h1 className="mt-4 text-5xl font-black md:text-6xl">
            Avisos Importantes
          </h1>

          <p className="mt-6 text-xl leading-9 text-amber-50/75">
            Leia atentamente todas as orientações antes de participar do
            congresso. Elas ajudarão você a aproveitar o evento com mais
            tranquilidade e segurança.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">

          {avisos.map((aviso) => (
            <div
              key={aviso.titulo}
              className="rounded-3xl border border-amber-200/10 bg-white/5 p-8 shadow-xl transition hover:-translate-y-1 hover:border-amber-400"
            >
              <div className="text-5xl">
                {aviso.icone}
              </div>

              <h2 className="mt-6 text-2xl font-bold text-amber-300">
                {aviso.titulo}
              </h2>

              <p className="mt-4 leading-8 text-amber-50/75">
                {aviso.descricao}
              </p>
            </div>
          ))}

        </div>

        <div className="mt-16 rounded-3xl border border-amber-200/15 bg-gradient-to-r from-amber-400/10 to-yellow-600/10 p-10 text-center">

          <div className="text-6xl">
            ⚠️
          </div>

          <h2 className="mt-5 text-3xl font-black">
            Importante
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-amber-50/75">
            A organização poderá atualizar estas informações sempre que
            necessário. Recomendamos consultar esta página periodicamente
            até o início do Congresso 2026.
          </p>

        </div>

      </section>
    </main>
  );
}