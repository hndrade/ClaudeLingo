"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [contas, setContas] = useState<string[]>([]);
  const [nome, setNome] = useState("");
  const [entrando, setEntrando] = useState(false);

  useEffect(() => {
    fetch("/api/perfil")
      .then((r) => r.json())
      .then((d) => setContas(d.contas.filter((c: string) => c !== "visitante")));
  }, []);

  async function entrar(quem: string) {
    if (entrando) return;
    setEntrando(true);
    await fetch("/api/perfil", { method: "POST", body: JSON.stringify({ nome: quem }) });
    router.push("/");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <h1 className="text-3xl font-bold text-acento">ClaudeLingo</h1>
      <p className="mt-1 text-sm text-tinta/70">IA aplicada, do zero ao prompt de alto impacto.</p>

      <button
        type="button"
        onClick={() => entrar("visitante")}
        className="mt-8 w-full rounded-xl bg-acento py-3 font-semibold text-white"
      >
        Continuar como visitante
      </button>

      {contas.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-tinta/60">Suas contas</p>
          {contas.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => entrar(c)}
              className="mb-2 w-full rounded-xl border border-tinta/15 bg-cartao px-4 py-3 text-left font-semibold text-tinta"
            >
              👤 {c}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-tinta/60">Criar conta</p>
        <div className="flex gap-2">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
            className="min-w-0 flex-1 rounded-xl border border-tinta/15 bg-cartao px-4 py-3 text-tinta placeholder:text-tinta/40"
          />
          <button
            type="button"
            disabled={nome.trim() === ""}
            onClick={() => entrar(nome)}
            className="rounded-xl bg-acento px-5 py-3 font-semibold text-white disabled:opacity-40"
          >
            Criar
          </button>
        </div>
        <p className="mt-1 text-xs text-tinta/60">Cada conta guarda o próprio progresso neste computador.</p>
      </div>

      <div className="mt-6">
        <button
          type="button"
          disabled
          className="w-full rounded-xl border border-tinta/15 bg-cartao py-3 font-semibold text-tinta/40"
        >
          Entrar com Google (em breve)
        </button>
        <p className="mt-1 text-xs text-tinta/50">
          Login Google exige credenciais OAuth e um servidor. Neste app local, o progresso das contas acima já fica salvo no seu computador.
        </p>
      </div>
    </main>
  );
}
