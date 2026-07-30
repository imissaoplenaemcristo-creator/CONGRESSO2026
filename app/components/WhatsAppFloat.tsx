"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  X,
  User,
  CreditCard,
  Circle,
} from "lucide-react";

export default function WhatsAppFloat() {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />

          <div
            ref={cardRef}
            className="fixed bottom-24 right-6 z-50 w-[340px] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/10 transition-all"
          >
            {/* Header */}
            <div className="bg-green-600 p-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold">
                    Sistema de Eventos IEMPC
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Circle
                      size={10}
                      className="fill-green-300 text-green-300"
                    />

                    <span>Online agora</span>
                  </div>

                  <p className="mt-3 text-sm text-green-100">
                    Como podemos ajudar você?
                  </p>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 transition hover:bg-white/20"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="space-y-4 p-5">
              <a
                href="https://wa.me/5531993825517"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border p-4 transition hover:border-green-500 hover:bg-green-50"
              >
                <div className="rounded-full bg-green-100 p-3">
                  <User className="text-green-700" size={22} />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">
                    Pastor Alexandre
                  </h3>

                  <p className="text-sm text-gray-500">
                    Informações gerais
                  </p>
                </div>

                <MessageCircle className="text-green-600" />
              </a>

              <a
                href="https://wa.me/5531983539512"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border p-4 transition hover:border-green-500 hover:bg-green-50"
              >
                <div className="rounded-full bg-green-100 p-3">
                  <CreditCard className="text-green-700" size={22} />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">
                    Irmã Martha
                  </h3>

                  <p className="text-sm text-gray-500">
                    Pagamentos e inscrições
                  </p>
                </div>

                <MessageCircle className="text-green-600" />
              </a>
            </div>
          </div>
        </>
      )}

      {/* Botão Flutuante */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white shadow-2xl transition duration-300 hover:scale-110 hover:bg-green-700 active:scale-95"
        aria-label="Abrir atendimento pelo WhatsApp"
      >
        <MessageCircle size={30} />
      </button>
    </>
  );
}