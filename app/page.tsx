"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import Footer from "./components/footer";
import WhatsAppFloat from "./components/WhatsAppFloat";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const eventDate = new Date("2026-11-19T19:30:00");

    function updateCountdown() {
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });

        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference / (1000 * 60 * 60)) % 24
        ),
        minutes: Math.floor(
          (difference / (1000 * 60)) % 60
        ),
        seconds: Math.floor(
          (difference / 1000) % 60
        ),
      });
    }

    updateCountdown();

    const interval = window.setInterval(
      updateCountdown,
      1000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] text-white">
      <header className="border-b border-amber-200/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <Image
              src="/logo-iempc.png"
              alt="Logo da IEMPC"
              width={58}
              height={58}
              priority
              className="h-14 w-14 object-contain"
            />

            <div>
              <p className="text-sm text-amber-200">
                Sistema de Eventos
              </p>

              <h1 className="text-xl font-bold tracking-wide">
                IEMPC
              </h1>
            </div>
          </Link>

         <nav className="hidden items-center gap-6 text-sm md:flex">
  <a
    href="/"
    className="cursor-pointer transition hover:text-amber-300"
  >
    Início
  </a>

  <a
    href="/sobre"
    className="cursor-pointer transition hover:text-amber-300"
  >
    Sobre
  </a>

  <a
    href="/programacao"
    className="cursor-pointer transition hover:text-amber-300"
  >
    Programação
  </a>

  <a
    href="/avisos"
    className="cursor-pointer transition hover:text-amber-300"
  >
    Avisos
  </a>

  <a
    href="/duvidas"
    className="cursor-pointer transition hover:text-amber-300"
  >
    Dúvidas
  </a>
</nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">
            Congresso 2026
          </p>

          <h2 className="text-5xl font-black leading-tight md:text-7xl">
            Até Transbordar
          </h2>

          <p className="mt-5 max-w-xl text-lg leading-8 text-amber-50/80">
            Quatro dias de comunhão, adoração,
            palavra e experiências inesquecíveis na
            presença de Deus.
          </p>

          <div className="mt-8 space-y-3 text-lg">
            <p>
              📅{" "}
              <strong>
                19 a 22 de novembro de 2026
              </strong>
            </p>

            <p>
              📍{" "}
              <strong>
                Arca Centro de Convenções — BR-262,
                km 388
              </strong>
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/inscricao/formulario"
              className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-7 py-4 font-bold text-[#2b180d] shadow-lg shadow-amber-900/30 transition hover:scale-[1.02]"
            >
              Fazer minha inscrição
            </Link>

            <Link
              href="/minha-inscricao"
              className="rounded-xl border border-amber-300 bg-black/20 px-7 py-4 font-bold text-white transition hover:bg-amber-500 hover:text-[#2b180d]"
            >
              Minha inscrição
            </Link>

            <Link
              href="/programacao"
              className="rounded-xl border border-amber-200/30 px-7 py-4 font-semibold transition hover:bg-white/10"
            >
              Ver programação
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-amber-200/20 bg-black/30 p-2 shadow-2xl">
          <Image
            src="/flyer-congresso-2026.jpg"
            alt="Flyer do Congresso 2026 Até Transbordar"
            width={1920}
            height={1080}
            priority
            className="h-auto w-full rounded-2xl"
          />
        </div>
      </section>

      <section className="border-y border-amber-100/10 bg-black/20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
              Contagem regressiva
            </p>

            <h3 className="mt-3 text-3xl font-bold">
              Faltam {timeLeft.days} dias para o
              Congresso 2026
            </h3>
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                label: "Dias",
                value: timeLeft.days,
              },
              {
                label: "Horas",
                value: timeLeft.hours,
              },
              {
                label: "Minutos",
                value: timeLeft.minutes,
              },
              {
                label: "Segundos",
                value: timeLeft.seconds,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-amber-200/10 bg-white/5 p-5 text-center"
              >
                <p className="text-4xl font-black text-amber-300">
                  {item.value}
                </p>

                <p className="mt-2 text-sm text-amber-50/70">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/sobre"
            className="rounded-3xl border border-amber-200/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-amber-400"
          >
            <div className="text-5xl">📖</div>

            <h3 className="mt-5 text-3xl font-bold">
              Sobre o Congresso
            </h3>

            <p className="mt-4 leading-7 text-amber-50/70">
              Conheça a visão, o propósito e tudo o
              que Deus tem preparado para o
              Congresso 2026.
            </p>

            <p className="mt-8 font-bold text-amber-300">
              Saiba mais →
            </p>
          </Link>

          <Link
            href="/programacao"
            className="rounded-3xl border border-amber-200/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-amber-400"
          >
            <div className="text-5xl">📅</div>

            <h3 className="mt-5 text-3xl font-bold">
              Programação
            </h3>

            <p className="mt-4 leading-7 text-amber-50/70">
              Veja os horários de todos os dias do
              congresso.
            </p>

            <p className="mt-8 font-bold text-amber-300">
              Ver programação →
            </p>
          </Link>

          <Link
            href="/avisos"
            className="rounded-3xl border border-amber-200/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-amber-400"
          >
            <div className="text-5xl">📢</div>

            <h3 className="mt-5 text-3xl font-bold">
              Avisos
            </h3>

            <p className="mt-4 leading-7 text-amber-50/70">
              Confira todas as orientações
              importantes para os participantes.
            </p>

            <p className="mt-8 font-bold text-amber-300">
              Ver avisos →
            </p>
          </Link>

          <Link
            href="/duvidas"
            className="rounded-3xl border border-amber-200/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-amber-400"
          >
            <div className="text-5xl">❓</div>

            <h3 className="mt-5 text-3xl font-bold">
              Dúvidas Frequentes
            </h3>

            <p className="mt-4 leading-7 text-amber-50/70">
              Tire suas principais dúvidas antes de
              realizar sua inscrição.
            </p>

            <p className="mt-8 font-bold text-amber-300">
              Abrir FAQ →
            </p>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-amber-400 to-yellow-600 p-8 text-center text-[#2b180d] md:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.3em]">
            Inscrição
          </p>

          <h3 className="mt-3 text-4xl font-black">
            Seja bem-vindo ao Congresso 2026!
          </h3>

          <p className="mx-auto mt-5 max-w-2xl text-lg">
            Antes de começar sua inscrição, reserve
            aproximadamente 3 minutos para preencher
            seus dados.
          </p>

          <div className="mx-auto mt-8 max-w-md rounded-2xl bg-white/45 p-6 text-left">
            <p className="font-bold">
              O que você vai precisar:
            </p>

            <ul className="mt-4 space-y-2">
              <li>✅ CPF ou RG</li>
              <li>✅ Telefone</li>
              <li>✅ Contato de emergência</li>
              <li>
                ✅ Aceitar o termo de responsabilidade
              </li>
            </ul>
          </div>

          <Link
            href="/inscricao/formulario"
            className="mt-8 inline-flex rounded-xl bg-[#2b180d] px-8 py-4 font-bold text-white transition hover:scale-[1.02]"
          >
            Começar inscrição
          </Link>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </main>
  );
}