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
              Neste ano, o tema <strong>"Até Transbordar"</strong> nos convida a viver uma entrega completa ao Senhor. Transbordar significa ir além do superficial, permitindo que Deus encha completamente nossa vida, sem reservas, sem limites e sem áreas escondidas. É uma entrega total, onde o Espírito Santo encontra espaço para agir plenamente em nosso coração, transformando-nos de dentro para fora.
            </p>

            <div className="mt-10 space-y-5">
              <div className="flex items-start gap-4 rounded-2xl border border-amber-200/10 bg-white/5 p-5"><div className="text-3xl">📅</div><div><h3 className="font-bold text-amber-300">Quando?</h3><p className="mt-1 text-amber-50/80">19 a 22 de novembro de 2026</p></div></div>
              <div className="flex items-start gap-4 rounded-2xl border border-amber-200/10 bg-white/5 p-5"><div className="text-3xl">📍</div><div><h3 className="font-bold text-amber-300">Local</h3><p className="mt-1 text-amber-50/80">Sítio Arca Centro<br/>Mateus Leme • Minas Gerais</p></div></div>
              <div className="flex items-start gap-4 rounded-2xl border border-amber-200/10 bg-white/5 p-5"><div className="text-3xl">🙏</div><div><h3 className="font-bold text-amber-300">Objetivo</h3><p className="mt-1 text-amber-50/80">Proporcionar dias de adoração, comunhão, ensino da Palavra e fortalecimento espiritual, para que cada pessoa viva uma experiência marcante na presença de Deus e saia preparada para transbordar Sua graça por onde passar.</p></div></div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-amber-200/20 bg-black/30 p-3 shadow-2xl">
            <Image src="/flyer-congresso-2026.jpg" alt="Congresso 2026" width={1200} height={1600} className="w-full rounded-2xl" priority />
          </div>
        </div>
      </section>

      <section className="border-y border-amber-200/10 bg-black/20">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Nossa Missão</p>
            <h2 className="mt-4 text-4xl font-black">Mais do que um evento</h2>
            <p className="mx-auto mt-8 max-w-4xl text-xl leading-10 text-amber-50/80">Mais do que um evento, o Congresso 2026 é um tempo de comunhão, aprendizado e busca pela presença de Deus. Com o tema <strong>"Até Transbordar"</strong>, queremos conduzir cada participante a uma entrega total, sem reservas, permitindo que Deus encha completamente sua vida e transforme seu coração.</p>
          </div>
        </div>
      </section>
    </main>
  );
}