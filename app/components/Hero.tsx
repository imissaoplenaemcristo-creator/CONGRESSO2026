"use client";

import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-950 via-stone-900 to-black">
      {/* Luzes de fundo */}
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl items-center px-6 py-20">
        <div className="max-w-3xl">

          <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 backdrop-blur">
            Congresso 2026 • Sistema de Eventos IEMPC
          </span>

          <h1 className="mt-8 text-5xl font-extrabold leading-tight text-white md:text-7xl">
            Congresso
            <span className="block text-amber-400">
              2026
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-gray-300 md:text-xl">
            Um tempo preparado por Deus para comunhão,
            crescimento espiritual e transformação de vidas.
            Faça sua inscrição e participe conosco deste grande congresso.
          </p>

          <div className="mt-10 flex flex-wrap gap-6 text-gray-200">

            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-5 py-3 backdrop-blur">
              <CalendarDays className="text-amber-400" size={22} />
              <span>2026 (data a definir)</span>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-5 py-3 backdrop-blur">
              <MapPin className="text-amber-400" size={22} />
              <span>Sítio Arca Centro</span>
            </div>

          </div>

          <div className="mt-12 flex flex-wrap gap-5">

            <Link
              href="/inscricao"
              className="inline-flex items-center gap-3 rounded-xl bg-amber-500 px-8 py-4 text-lg font-bold text-black transition hover:scale-105 hover:bg-amber-400"
            >
              Fazer Inscrição
              <ArrowRight size={22} />
            </Link>

            <Link
              href="/programacao"
              className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Ver Programação
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}