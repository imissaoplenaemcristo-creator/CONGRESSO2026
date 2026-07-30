import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#1d120d] text-white">
      <div className="flex">

        {/* Menu */}
        <aside className="w-72 min-h-screen border-r border-amber-500/20 bg-[#21150f]">

          <div className="border-b border-amber-500/20 p-6">

            <h1 className="text-2xl font-black text-amber-400">
              Congresso 2026
            </h1>

            <p className="text-sm text-amber-200">
              Painel Administrativo
            </p>

          </div>

          <nav className="flex flex-col gap-2 p-4">

            <Link
              href="/admin"
              className="rounded-xl px-4 py-3 hover:bg-amber-500/10"
            >
              📊 Dashboard
            </Link>

            <Link
              href="/admin/inscritos"
              className="rounded-xl px-4 py-3 hover:bg-amber-500/10"
            >
              👥 Inscritos
            </Link>

            <Link
              href="/admin/pagamentos"
              className="rounded-xl px-4 py-3 hover:bg-amber-500/10"
            >
              💳 Pagamentos
            </Link>

            <Link
              href="/admin/checkin"
              className="rounded-xl px-4 py-3 hover:bg-amber-500/10"
            >
              🎫 Check-in
            </Link>

            <Link
              href="/admin/relatorios"
              className="rounded-xl px-4 py-3 hover:bg-amber-500/10"
            >
              📈 Relatórios
            </Link>

          </nav>

        </aside>

        {/* Conteúdo */}

        <section className="flex-1 p-8">
          {children}
        </section>

      </div>
    </main>
  );
}