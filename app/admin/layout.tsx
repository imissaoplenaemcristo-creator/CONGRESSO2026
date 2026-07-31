"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

  const paginaAtual = useMemo(() => {
    const linkAtual = links.find((link) =>
      link.exact
        ? pathname === link.href
        : pathname.startsWith(link.href)
    );

    return linkAtual ?? {
      href: "/admin",
      label: "Painel Administrativo",
      icon: "⚙️",
    };
  }, [pathname]);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuAberto ? "hidden" : "";

    function fecharComEsc(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setMenuAberto(false);
      }
    }

    window.addEventListener("keydown", fecharComEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", fecharComEsc);
    };
  }, [menuAberto]);

  function linkAtivo(href: string, exact?: boolean) {
    if (exact) {
      return pathname === href;
    }

    return pathname.startsWith(href);
  }

  const conteudoMenu = (
    <>
      <div className="flex min-h-20 items-center justify-between border-b border-amber-500/20 px-5 py-4 lg:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-black text-amber-400 lg:text-2xl">
            Congresso 2026
          </h1>

          <p className="mt-1 truncate text-xs text-amber-200/80 lg:text-sm">
            Painel Administrativo
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMenuAberto(false)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-xl text-amber-100 transition hover:bg-amber-500/20 active:scale-95 lg:hidden"
          aria-label="Fechar menu"
        >
          ✕
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {links.map((link) => {
          const ativo = linkAtivo(link.href, link.exact);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={ativo ? "page" : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition lg:text-base ${
                ativo
                  ? "bg-amber-400 text-[#21150f] shadow-lg shadow-black/20"
                  : "text-amber-50 hover:bg-amber-500/10 hover:text-amber-300"
              }`}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center text-lg"
                aria-hidden="true"
              >
                {link.icon}
              </span>

              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-amber-500/20 p-4">
        <div className="rounded-2xl border border-amber-400/10 bg-amber-500/10 p-4">
          <p className="text-sm font-black text-amber-300">
            Sistema de Eventos IEMPC
          </p>

          <p className="mt-1 text-xs leading-5 text-amber-100/65">
            Administração do Congresso 2026
          </p>
        </div>
      </div>
    </>
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#1d120d] text-white">
      {/* Menu fixo no computador */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-amber-500/20 bg-[#21150f] lg:flex">
        {conteudoMenu}
      </aside>

      {/* Fundo escuro do menu no celular */}
      <button
        type="button"
        onClick={() => setMenuAberto(false)}
        aria-label="Fechar menu"
        tabIndex={menuAberto ? 0 : -1}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          menuAberto
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Menu móvel */}
      <aside
        aria-label="Menu administrativo"
        aria-hidden={!menuAberto}
        className={`fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-80 flex-col border-r border-amber-500/20 bg-[#21150f] shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {conteudoMenu}
      </aside>

      {/* Conteúdo principal */}
      <div className="min-w-0 lg:pl-72">
        {/* Cabeçalho no celular e tablet */}
        <header className="sticky top-0 z-30 border-b border-amber-500/20 bg-[#21150f]/95 backdrop-blur lg:hidden">
          <div className="flex min-h-16 items-center justify-between gap-3 px-3 sm:px-5">
            <button
              type="button"
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu"
              aria-expanded={menuAberto}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-2xl text-amber-300 transition hover:bg-amber-500/20 active:scale-95"
            >
              ☰
            </button>

            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-sm font-black text-amber-400">
                {paginaAtual.icon} {paginaAtual.label}
              </p>

              <p className="truncate text-xs text-amber-100/60">
                Congresso 2026
              </p>
            </div>

            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400 font-black text-[#21150f] shadow-lg"
              title="Administrador"
              aria-label="Perfil do administrador"
            >
              A
            </div>
          </div>
        </header>

        {/* Cabeçalho no computador */}
        <header className="sticky top-0 z-30 hidden min-h-20 items-center justify-between border-b border-amber-500/15 bg-[#1d120d]/95 px-8 backdrop-blur lg:flex">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-300/70">
              Área administrativa
            </p>

            <h2 className="mt-1 truncate text-2xl font-black text-white">
              {paginaAtual.icon} {paginaAtual.label}
            </h2>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-amber-400/15 bg-white/5 px-4 py-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 font-black text-[#21150f]">
              A
            </div>

            <div>
              <p className="text-sm font-black text-white">
                Administrador
              </p>

              <p className="text-xs text-amber-100/55">
                Sistema IEMPC
              </p>
            </div>
          </div>
        </header>

        {/* Conteúdo das páginas */}
        <section className="min-w-0 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}