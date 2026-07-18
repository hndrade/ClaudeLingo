"use client";
import { useState } from "react";
import type { ConsertarPrompt } from "@/lib/schema";
import { Md, PromptBloco, PainelSaida, BotaoVerificar } from "@/components/ui";

export default function ConsertarPromptEx({
  ex,
  onResponder,
}: {
  ex: ConsertarPrompt;
  onResponder: (correto: boolean) => void;
}) {
  const [fase, setFase] = useState<"editar" | "avaliar">("editar");
  const [versao, setVersao] = useState(ex.prompt_fraco);
  const [marcados, setMarcados] = useState<boolean[]>(ex.checklist.map(() => false));
  const [concluido, setConcluido] = useState(false);

  const total = ex.checklist.length;
  const minimo = Math.ceil(0.8 * total);
  const cobertos = marcados.filter(Boolean).length;

  function concluir() {
    if (concluido) return;
    setConcluido(true);
    onResponder(cobertos >= minimo);
  }

  if (fase === "editar") {
    return (
      <div className="space-y-3">
        <Md texto={ex.enunciado} />
        <PromptBloco texto={ex.prompt_fraco} rotulo="Prompt fraco" />
        <PainelSaida texto={ex.saida_fraca} titulo="O que ele devolve hoje" />
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-tinta/60">
            Reescreva aqui
          </div>
          <textarea
            value={versao}
            onChange={(e) => setVersao(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-tinta/15 bg-white p-3 font-mono text-[13px] leading-relaxed text-tinta"
          />
        </div>
        <BotaoVerificar onClick={() => setFase("avaliar")}>Comparar com a referência</BotaoVerificar>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PromptBloco texto={versao} rotulo="Sua versão" />
      <PromptBloco texto={ex.prompt_referencia} rotulo="Prompt de referência" />
      <PainelSaida texto={ex.saida_referencia} />
      <div className="rounded-xl border border-tinta/10 bg-white p-3">
        <p className="mb-3 text-[13px] leading-relaxed text-tinta/80">
          Autoavaliação honesta: compare as duas versões acima e marque o que a SUA versão cobre.
        </p>
        <div className="space-y-2">
          {ex.checklist.map((item, i) => (
            <label key={i} className="flex items-start gap-2 text-[14px] leading-relaxed text-tinta">
              <input
                type="checkbox"
                checked={marcados[i]}
                disabled={concluido}
                onChange={() => setMarcados((m) => m.map((v, j) => (j === i ? !v : v)))}
                className="mt-1 size-4 accent-acento"
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        {concluido && (
          <p className="mt-3 text-[13px] font-semibold text-tinta">
            Você cobriu {cobertos} de {total} itens da rubrica.
          </p>
        )}
      </div>
      {!concluido && <BotaoVerificar onClick={concluir}>Concluir autoavaliação</BotaoVerificar>}
    </div>
  );
}
