"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    setErro("");
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      console.error(error);
      setErro("E-mail ou senha incorretos.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#21150f] via-[#4a2d18] to-[#160e0a] px-6 text-white">
      <form
        onSubmit={entrar}
        className="w-full max-w-md rounded-3xl border border-amber-200/20 bg-black/30 p-8 shadow-2xl"
      >
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-300">
          Congresso 2026
        </p>

        <h1 className="mt-3 text-3xl font-black">
          Acesso administrativo
        </h1>

        <p className="mt-2 text-sm text-amber-50/70">
          Entre com o usuário criado no Supabase.
        </p>

        <label className="mt-8 block text-sm font-semibold text-amber-200">
          E-mail
        </label>

        <input
          type="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-amber-200/20 bg-white/10 px-4 py-3 outline-none focus:border-amber-400"
        />

        <label className="mt-5 block text-sm font-semibold text-amber-200">
          Senha
        </label>

        <input
          type="password"
          value={senha}
          onChange={(evento) => setSenha(evento.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-amber-200/20 bg-white/10 px-4 py-3 outline-none focus:border-amber-400"
        />

        {erro && (
          <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
            {erro}
          </div>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-6 py-3 font-bold text-[#2b180d] disabled:opacity-50"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}