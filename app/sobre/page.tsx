import Header from "../components/Header";
import Image from "next/image";

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-300">
              Congresso 2026
            </p>

            <h1 className="mt-4 text-5xl font-black leading-tight md:text-6xl">
              Até Transbordar
            </h1>

            <p className="mt-8 text-xl leading-9 text-amber-50/80">
              Um congresso preparado para proporcionar dias de comunhão,
              crescimento espiritual, adoração e experiências marcantes na
              presença de Deus.
            </p>

            <div className="mt-10 space-y-5">
              <div className="flex items-start gap-4 rounded-2xl border border-amber-200/10 bg-white/5 p-5">
                <div className="text-3xl">📅</div>

                <div>
                  <h3 className="font-bold text-amber-300">
                    Quando?
                  </h3>

                  <p className="mt-1 text-amber-50/80">
                    19 a 22 de novembro de 2026
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-amber-200/10 bg-white/5 p-5">
                <div className="text-3xl">📍</div>

                <div>
                  <h3 className="font-bold text-amber-300">
                    Local
                  </h3>

                  <p className="mt-1 text-amber-50/80">
                    Sítio Arca Centro
                    <br />
                    Mateus Leme • Minas Gerais
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-amber-200/10 bg-white/5 p-5">
                <div className="text-3xl">🙏</div>

                <div>
                  <h3 className="font-bold text-amber-300">
                    Objetivo
                  </h3>

                  <p className="mt-1 text-amber-50/80">
                    Promover dias de adoração, comunhão, ensino da Palavra
                    e fortalecimento espiritual para toda a igreja.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-amber-200/20 bg-black/30 p-3 shadow-2xl">
            <Image
              src="/flyer-congresso-2026.jpg"
              alt="Congresso 2026"
              width={1200}
              height={1600}
              className="w-full rounded-2xl"
              priority
            />
          </div>
        </div>
      </section>

      <section className="border-y border-amber-200/10 bg-black/20">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300">
              Nossa missão
            </p>

            <h2 className="mt-4 text-4xl font-black">
              Mais do que um evento
            </h2>

            <p className="mx-auto mt-8 max-w-4xl text-xl leading-10 text-amber-50/80">
              O Congresso 2026 foi preparado para reunir pessoas de todas
              as idades em um ambiente de comunhão, aprendizado e busca
              pela presença de Deus. Nosso desejo é que cada participante
              volte para casa renovado, fortalecido na fé e preparado para
              viver um novo tempo.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">

          <div className="rounded-3xl border border-amber-200/10 bg-white/5 p-8 text-center">
            <div className="text-5xl">🤝</div>

            <h3 className="mt-5 text-2xl font-bold">
              Comunhão
            </h3>

            <p className="mt-4 leading-7 text-amber-50/70">
              Fortaleça amizades e conheça pessoas que compartilham da
              mesma fé.
            </p>
          </div>

          <div className="rounded-3xl border border-amber-200/10 bg-white/5 p-8 text-center">
            <div className="text-5xl">🎵</div>

            <h3 className="mt-5 text-2xl font-bold">
              Adoração
            </h3>

            <p className="mt-4 leading-7 text-amber-50/70">
              Momentos especiais de louvor e adoração durante todo o
              congresso.
            </p>
          </div>

          <div className="rounded-3xl border border-amber-200/10 bg-white/5 p-8 text-center">
            <div className="text-5xl">📖</div>

            <h3 className="mt-5 text-2xl font-bold">
              Palavra
            </h3>

            <p className="mt-4 leading-7 text-amber-50/70">
              Ministrações inspiradoras para fortalecer sua caminhada com
              Cristo.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}