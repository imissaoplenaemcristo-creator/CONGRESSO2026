"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  {
    nome: "Início",
    href: "/",
  },
  {
    nome: "Sobre",
    href: "/sobre",
  },
  {
    nome: "Programação",
    href: "/programacao",
  },
  {
    nome: "Avisos",
    href: "/avisos",
  },
  {
    nome: "Dúvidas",
    href: "/duvidas",
  },
];

export default function Header() {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  function paginaAtiva(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  function fecharMenu() {
    setMenuAberto(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-amber-200/10 bg-[#21150f]/95 shadow-lg backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-6">
        {/* Identidade */}
        <Link
          href="/"
          onClick={fecharMenu}
          className="group flex min-w-0 items-center gap-3"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-gradient-to-br from-amber-300 to-yellow-600 font-black text-[#29180d] shadow-lg shadow-amber-950/30">
            I
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
              IEMPC
            </p>

            <p className="truncate text-base font-black text-white sm:text-lg">
              Congresso 2026
            </p>
          </div>
        </Link>

        {/* Menu de computador */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const ativo = paginaAtiva(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  ativo
                    ? "bg-amber-300 text-[#2b180d] shadow-lg shadow-amber-950/20"
                    : "text-amber-50/75 hover:bg-white/5 hover:text-amber-300"
                }`}
              >
                {link.nome}
              </Link>
            );
          })}
        </nav>

        {/* Botões do computador */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/minha-inscricao"
            className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
              pathname.startsWith("/minha-inscricao")
                ? "border-amber-300 bg-amber-300/10 text-amber-300"
                : "border-amber-200/20 text-amber-50 hover:border-amber-300 hover:text-amber-300"
            }`}
          >
            Minha inscrição
          </Link>

          <Link
            href="/inscricao"
            className={`rounded-xl px-5 py-3 text-sm font-black transition ${
              pathname.startsWith("/inscricao")
                ? "bg-white text-[#2b180d]"
                : "bg-gradient-to-r from-amber-300 to-yellow-500 text-[#2b180d] shadow-lg shadow-amber-950/30 hover:-translate-y-0.5 hover:shadow-xl"
            }`}
          >
            Inscreva-se
          </Link>
        </div>

        {/* Botão do celular */}
        <button
          type="button"
          onClick={() => setMenuAberto((estadoAtual) => !estadoAtual)}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-200/15 bg-white/5 text-2xl text-amber-200 transition hover:border-amber-300 lg:hidden"
        >
          {menuAberto ? "×" : "☰"}
        </button>
      </div>

      {/* Menu do celular */}
      {menuAberto && (
        <div className="border-t border-amber-200/10 bg-[#21150f] px-5 pb-6 pt-4 shadow-2xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2">
            {links.map((link) => {
              const ativo = paginaAtiva(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={fecharMenu}
                  className={`rounded-xl px-4 py-3 font-semibold transition ${
                    ativo
                      ? "bg-amber-300 text-[#2b180d]"
                      : "border border-transparent text-amber-50/80 hover:border-amber-200/10 hover:bg-white/5 hover:text-amber-300"
                  }`}
                >
                  {link.nome}
                </Link>
              );
            })}

            <div className="my-2 h-px bg-amber-200/10" />

            <Link
              href="/minha-inscricao"
              onClick={fecharMenu}
              className={`rounded-xl border px-4 py-3 text-center font-bold transition ${
                pathname.startsWith("/minha-inscricao")
                  ? "border-amber-300 bg-amber-300/10 text-amber-300"
                  : "border-amber-200/20 text-amber-50 hover:border-amber-300 hover:text-amber-300"
              }`}
            >
              Minha inscrição
            </Link>

            <Link
              href="/inscricao"
              onClick={fecharMenu}
              className="rounded-xl bg-gradient-to-r from-amber-300 to-yellow-500 px-4 py-3 text-center font-black text-[#2b180d] shadow-lg"
            >
              Inscreva-se
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}