import Header from "../components/Header";

const regrasNaoPermitidas = [
  "Brincadeiras de mau gosto, brigas ou discussões.",
  "Passeios noturnos desacompanhados.",
  "Permanecer em locais isolados ou escondidos.",
  "Namoro durante o período do Congresso.",
  "Deixar crianças livres nas dependências do sítio sem o acompanhamento de um adulto.",
];

const orientacoesGerais = [
  "Durante as ministrações, os quartos permanecerão fechados.",
  "A chave de cada quarto ficará sob a responsabilidade de uma pessoa do próprio quarto.",
  "Todos os congressistas deverão respeitar os horários das ministrações e das refeições.",
];

const itensParaLevar = [
  "Bíblia.",
  "Caneta e caderno para anotações.",
  "Roupa de cama: lençol, travesseiro, cobertor ou edredom.",
  "Toalha de banho e toalha para piscina.",
  "Itens de higiene pessoal: sabonete, creme dental, escova dental e demais itens necessários.",
  "Medicamentos de uso pessoal, incluindo remédios para febre, dor e medicamentos controlados.",
  "Documento oficial com foto, preferencialmente RG ou CNH.",
];

export default function AvisosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-300">
            Congresso 2026
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            Avisos importantes
          </h1>

          <p className="mt-6 text-lg leading-8 text-amber-50/75 md:text-xl">
            Leia atentamente todas as orientações antes de participar do
            Congresso. Elas ajudarão você a aproveitar o evento com mais
            organização, tranquilidade e segurança.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-amber-200/10 bg-white/5 p-6 shadow-xl md:p-8">
            <div className="text-5xl">🏊</div>

            <h2 className="mt-5 text-2xl font-black text-amber-300">
              Trajes para uso da piscina
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-200/10 bg-black/20 p-5">
                <p className="font-black text-white">Homens</p>
                <p className="mt-2 leading-7 text-amber-50/75">
                  Obrigatório o uso de short ou bermuda e regata para utilizar a piscina.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200/10 bg-black/20 p-5">
                <p className="font-black text-white">Mulheres</p>
                <p className="mt-2 leading-7 text-amber-50/75">
                  Obrigatório o uso de short e regata sobre o biquíni para utilizar a piscina.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-red-300/15 bg-red-500/10 p-6 shadow-xl md:p-8">
            <div className="text-5xl">🚫</div>

            <h2 className="mt-5 text-2xl font-black text-red-200">
              Não será permitido
            </h2>

            <ul className="mt-6 space-y-3">
              {regrasNaoPermitidas.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-xl border border-red-200/10 bg-black/15 p-4 text-red-50/90"
                >
                  <span className="font-black text-red-300">◆</span>
                  <span className="leading-7">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-amber-200/10 bg-white/5 p-6 shadow-xl md:p-8">
          <div className="text-5xl">📋</div>

          <h2 className="mt-5 text-2xl font-black text-amber-300">
            Orientações gerais
          </h2>

          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {orientacoesGerais.map((item, index) => (
              <li
                key={item}
                className="rounded-2xl border border-amber-200/10 bg-black/20 p-5"
              >
                <p className="text-sm font-black uppercase tracking-wider text-amber-300">
                  Orientação {index + 1}
                </p>

                <p className="mt-3 leading-7 text-amber-50/75">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-3xl border border-amber-200/10 bg-white/5 p-6 shadow-xl md:p-8">
          <div className="text-5xl">🎒</div>

          <h2 className="mt-5 text-2xl font-black text-amber-300">
            O que é preciso levar
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {itensParaLevar.map((item, index) => (
              <div
                key={item}
                className="flex gap-4 rounded-2xl border border-amber-200/10 bg-black/20 p-5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 font-black text-[#2b180d]">
                  {index + 1}
                </div>

                <p className="leading-7 text-amber-50/80">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-blue-300/15 bg-blue-500/10 p-6 shadow-xl md:p-8">
          <div className="text-5xl">🎟️</div>

          <h2 className="mt-5 text-2xl font-black text-blue-200">
            Check-in
          </h2>

          <div className="mt-6 space-y-3 text-blue-50/90">
            <p>• Apresente o QR Code da sua inscrição na entrada.</p>
            <p>• Tenha um documento oficial com foto em mãos.</p>
            <p>• O QR Code é individual e intransferível.</p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-amber-200/15 bg-gradient-to-r from-amber-400/10 to-yellow-600/10 p-6 text-center md:p-10">
          <div className="text-6xl">⚠️</div>

          <h2 className="mt-5 text-3xl font-black">
            Importante
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-amber-50/75">
            Cuide dos espaços e equipamentos do local, mantenha um ambiente
            de respeito, comunhão e organização e, em caso de dúvidas,
            procure um membro da equipe do Congresso.
          </p>

          <p className="mx-auto mt-4 max-w-3xl leading-7 text-amber-200/80">
            A organização poderá atualizar estas informações sempre que
            necessário. Recomendamos consultar esta página periodicamente
            até o início do Congresso 2026.
          </p>
        </section>
      </section>
    </main>
  );
}