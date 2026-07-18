"use client";

import { useEffect, useState } from "react";
import { carregarProgresso, salvarProgresso, hojeLocal, type Progresso } from "@/lib/progresso";

const janelas = { manha: [7, 11], meiodia: [11, 15], noite: [18, 22] } as const;

export default function Notificacoes() {
  const [progresso, setProgresso] = useState<Progresso | null>(null);
  const [dispensado, setDispensado] = useState(false);

  useEffect(() => {
    carregarProgresso().then(setProgresso).catch(() => null);

    async function verificar() {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const p = await carregarProgresso().catch(() => null);
      if (!p?.compromisso) return;
      const hoje = hojeLocal();
      const [ini, fim] = janelas[p.compromisso.periodo];
      const hora = new Date().getHours();
      const estudado = p.minutosPorDia[hoje] ?? 0;
      if (hora < ini || hora >= fim || estudado >= p.compromisso.minutosDia || p.ultimaNotificacao === hoje) return;
      new Notification("ClaudeLingo", {
        body: `Ainda dá tempo de estudar seus ${p.compromisso.minutosDia} minutos de hoje. Vamos lá?`,
      });
      await salvarProgresso({ ...p, ultimaNotificacao: hoje });
    }

    const id = setInterval(verificar, 60000);
    return () => clearInterval(id);
  }, []);

  const ultima = progresso?.streak.ultimaSessao;
  const ausente = ultima ? (Date.parse(hojeLocal()) - Date.parse(ultima)) / 86400000 >= 2 : false;
  if (!ausente || dispensado) return null;

  return (
    <div className="flex items-center gap-3 bg-acento-fundo px-4 py-2.5 text-sm text-acento">
      <p className="flex-1">Sentimos sua falta. Sua sequência foi interrompida, que tal 5 minutos agora?</p>
      <button type="button" onClick={() => setDispensado(true)} aria-label="Dispensar" className="font-semibold">
        ✕
      </button>
    </div>
  );
}
