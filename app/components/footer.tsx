import Image from "next/image";
import Link from "next/link";

const linksRapidos = [
  { nome: "Início", href: "/" },
  { nome: "Sobre", href: "/sobre" },
  { nome: "Programação", href: "/programacao" },
  { nome: "Avisos", href: "/avisos" },
  { nome: "Dúvidas", href: "/duvidas" },
];

export default function Footer() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="border-t border-amber-200/10 bg-[#120b07] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-3">
             <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg">
  <Image
    src="/logo-iempc.png"
    alt="Logo IEMPC"
    width={48}
    height={48}
    className="h-full w-full object-contain"
    priority
  />
</div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">
                  IEMPC
                </p>

                <p className="text-lg font-black">
                  Congresso 2026
                </p>
              </div>
            </Link>

            <p className="mt-6 max-w-sm leading-7 text-amber-50/65">
              Congresso 2026 — Até Transbordar.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-black text-amber-300">
              Links rápidos
            </h2>

            <nav className="mt-5 flex flex-col gap-3">
              {linksRapidos.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-fit text-amber-50/70 transition hover:translate-x-1 hover:text-amber-300"
                >
                  {link.nome}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-lg font-black text-amber-300">
              Informações
            </h2>

            <div className="mt-5 space-y-4 text-amber-50/70">
              <div className="flex items-start gap-3">
                <span className="text-xl">📅</span>
                <p>19 a 22 de novembro de 2026</p>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <p>Arca Centro de Convenções</p>
              </div>

              <a
                href="https://www.instagram.com/iempc3?igsh=ZDd5dzA3ZHNpaTFl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 transition hover:text-amber-300"
              >
                <span className="text-xl">📷</span>
                <span>@iempc3</span>
              </a>

              <a
                href="mailto:imissaoplenaemcristo@gmail.com"
                className="flex items-start gap-3 transition hover:text-amber-300"
              >
                <span className="text-xl">📧</span>

                <span className="break-all">
                  imissaoplenaemcristo@gmail.com
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-amber-200/10 pt-7">
          <div className="flex flex-col gap-3 text-center text-sm text-amber-50/50 md:flex-row md:items-center md:justify-between md:text-left">
            <p>
              © {anoAtual} IEMPC. Todos os direitos reservados.
            </p>

            <p>Sistema de Eventos IEMPC</p>
          </div>
        </div>
      </div>
    </footer>
  );
}