"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: "📊",
    exact: true,
  },
  {
    href: "/admin/inscritos",
    label: "Inscritos",
    icon: "👥",
  },
  {
    href: "/admin/pagamentos",
    label: "Pagamentos",
    icon: "💳",
  },
  {
    href: "/admin/checkin",
    label: "Check-in",
    icon: "🎫",
  },
  {
    href: "/admin/relatorios",
    label: "Relatórios",
    icon: "📈",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuAberto ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

  function linkAtivo(href: string, exact?: boolean) {
    if (exact) {
      return pathname === href;
    }

    return pathname.startsWith(href);
  }

  const menu = (
    <>
      <div className="flex items-center justify-between border-b border-amber-500/20 p-5 lg:p-6">
        <div>
          <h1 className="text-xl font-black text-amber-400 lg:text-2xl">
            Congresso 2026
          </h1>

          <p className="mt-1 text-xs text-amber-200 lg:text-sm">
            Painel Administrativo
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMenuAberto(false)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-xl text-amber-100 transition hover:bg-amber-500/20 lg:hidden"
          aria-label="Fechar menu"
        >
          ✕
        </button>
      </div>

      <nav className="flex flex-col gap-2 p-4">
        {links.map((link) => {
          const ativo = linkAtivo(link.href, link.exact);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition lg:text-base ${
                ativo
                  ? "bg-amber-500 text-[#21150f] shadow-lg shadow-amber-950/30"
                  : "text-amber-50 hover:bg-amber-500/10 hover:text-amber-300"
              }`}
            >
              <span className="text-lg" aria-hidden="true">
                {link.icon}
              </span>

              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-amber-500/20 p-4">
        <div className="rounded-2xl bg-amber-500/10 p-4">
          <p className="text-sm font-bold text-amber-300">
            Sistema de Eventos IEMPC
          </p>

          <p className="mt-1 text-xs leading-5 text-amber-100/70">
            Administração do Congresso 2026
          </p>
        </div>
      </div>
    </>
  );

  return (
    <main className="min-h-screen bg-[#1d120d] text-white">
      {/* Menu lateral no computador */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-amber-500/20 bg-[#21150f] lg:flex">
        {menu}
      </aside>

      {/* Fundo escuro do menu no celular */}
      <button
        type="button"
        onClick={() => setMenuAberto(false)}
        aria-label="Fechar menu"
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          menuAberto
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Menu lateral no celular */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-72 flex-col border-r border-amber-500/20 bg-[#21150f] shadow-2xl transition-transform duration-300 lg:hidden ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {menu}
      </aside>

      {/* Área principal */}
      <div className="min-w-0 lg:pl-72">
        {/* Cabeçalho do celular */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-amber-500/20 bg-[#21150f]/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-2xl text-amber-300 transition hover:bg-amber-500/20"
            aria-label="Abrir menu"
          >
            ☰
          </button>

          <div className="min-w-0 px-3 text-center">
            <p className="truncate text-sm font-black text-amber-400">
              Congresso 2026
            </p>

            <p className="truncate text-xs text-amber-100/70">
              Painel Administrativo
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 font-black text-[#21150f]">
            A
          </div>
        </header>

        {/* Conteúdo das páginas */}
        <section className="min-w-0 overflow-x-hidden p-3 sm:p-5 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </section>
      </div>
    </main>
  );
}