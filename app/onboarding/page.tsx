"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { carregarProgresso, salvarProgresso, type Periodo } from "@/lib/progresso";

const dedicacoes: { min: 5 | 10 | 15; rotulo: string }[] = [
  { min: 5, rotulo: "leve" },
  { min: 10, rotulo: "constante" },
  { min: 15, rotulo: "intenso" },
];

const periodos: { valor: Periodo; rotulo: string }[] = [
  { valor: "manha", rotulo: "Manhã" },
  { valor: "meiodia", rotulo: "Meio do dia" },
  { valor: "noite", rotulo: "Noite" },
];

export default function Onboarding() {
  const router = useRouter();
  const [minutos, setMinutos] = useState<5 | 10 | 15 | null>(null);
  const [periodo, setPeriodo] = useState<Periodo | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function comecar() {
    if (!minutos || !periodo || salvando) return;
    setSalvando(true);
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission().catch(() => null);
    }
    const p = await carregarProgresso();
    await salvarProgresso({ ...p, compromisso: { minutosDia: minutos, periodo } });
    router.push("/");
  }

  const cartao = (ativo: boolean) =>
    `w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
      ativo ? "border-acento bg-acento-fundo text-acento" : "border-tinta/10 bg-cartao"
    }`;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-5 py-6">
      <header>
        <h1 className="text-2xl font-bold">Seu compromisso</h1>
        <p className="mt-1 text-sm text-tinta/70">Defina sua meta para manter o ritmo.</p>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Dedicação diária</h2>
        {dedicacoes.map((d) => (
          <button key={d.min} type="button" onClick={() => setMinutos(d.min)} className={cartao(minutos === d.min)}>
            {d.min} min por dia <span className="text-tinta/50">({d.rotulo})</span>
          </button>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Melhor horário para estudar</h2>
        <div className="grid grid-cols-3 gap-2">
          {periodos.map((h) => (
            <button key={h.valor} type="button" onClick={() => setPeriodo(h.valor)} className={cartao(periodo === h.valor)}>
              {h.rotulo}
            </button>
          ))}
        </div>
      </section>

      <div>
        <button
          type="button"
          onClick={comecar}
          disabled={!minutos || !periodo || salvando}
          className="w-full rounded-xl bg-acento py-3 font-semibold text-white disabled:opacity-40"
        >
          Começar jornada
        </button>
        <p className="mt-2 text-center text-xs text-tinta/50">
          Usamos esse horário para lembrar você nos dias em que não estudar.
        </p>
      </div>
    </main>
  );
}
