"use client";
import { useState } from "react";
import type { CompararPrompts } from "@/lib/schema";
import { Md, PromptBloco, PainelSaida, BotaoVerificar } from "@/components/ui";

export default function CompararPromptsEx({
  ex,
  onResponder,
}: {
  ex: CompararPrompts;
  onResponder: (correto: boolean) => void;
}) {
  const [escolhido, setEscolhido] = useState<number | null>(null);
  const [verificado, setVerificado] = useState(false);

  function verificar() {
    if (escolhido === null || verificado) return;
    setVerificado(true);
    onResponder(ex.prompts[escolhido].melhor);
  }

  return (
    <div>
      <Md texto={ex.enunciado} className="mb-3" />
      <div className="grid gap-2 md:grid-cols-2">
        {ex.prompts.map((p, i) => {
          const selecionado = escolhido === i;
          let borda = "border-tinta/10";
          let badge: React.ReactNode = null;
          if (!verificado && selecionado) borda = "border-acento";
          if (verificado && p.melhor) {
            borda = "border-certo";
            badge = (
              <span className="rounded-full bg-certo-fundo px-2 py-0.5 text-xs font-bold text-certo">
                Melhor escolha
              </span>
            );
          } else if (verificado && selecionado) {
            borda = "border-erro";
            badge = (
              <span className="rounded-full bg-erro-fundo px-2 py-0.5 text-xs font-bold text-erro">
                Sua escolha
              </span>
            );
          }
          return (
            <button
              key={i}
              type="button"
              disabled={verificado}
              onClick={() => setEscolhido(i)}
              className={`rounded-xl border-2 bg-cartao p-3 text-left ${borda}`}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm font-bold text-tinta">{p.rotulo}</span>
                {badge}
              </div>
              <PromptBloco texto={p.texto} />
              {verificado && (
                <div className="mt-3 space-y-2">
                  <PainelSaida texto={p.saida_esperada} />
                  <p className="text-[13px] leading-relaxed text-tinta/80">{p.explicacao}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {!verificado && (
        <BotaoVerificar disabled={escolhido === null} onClick={verificar}>
          Esse é o melhor
        </BotaoVerificar>
      )}
    </div>
  );
}
