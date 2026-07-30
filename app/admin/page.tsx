export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#1d120d] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-300">
          Congresso 2026 — Até Transbordar
        </p>

        <h1 className="mt-3 text-4xl font-black md:text-5xl">
          Painel Administrativo
        </h1>

        <p className="mt-3 text-amber-50/70">
          Visão geral das inscrições, pagamentos e check-ins.
        </p>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-amber-400/20 bg-white/5 p-6">
            <p className="text-sm text-amber-100/70">Inscritos</p>
            <p className="mt-3 text-4xl font-black text-amber-300">0</p>
          </article>

          <article className="rounded-2xl border border-green-400/20 bg-white/5 p-6">
            <p className="text-sm text-green-100/70">Pagos</p>
            <p className="mt-3 text-4xl font-black text-green-300">0</p>
          </article>

          <article className="rounded-2xl border border-yellow-400/20 bg-white/5 p-6">
            <p className="text-sm text-yellow-100/70">Pendentes</p>
            <p className="mt-3 text-4xl font-black text-yellow-300">0</p>
          </article>

          <article className="rounded-2xl border border-blue-400/20 bg-white/5 p-6">
            <p className="text-sm text-blue-100/70">Check-ins</p>
            <p className="mt-3 text-4xl font-black text-blue-300">0</p>
          </article>
        </section>
      </div>
    </main>
  );
}