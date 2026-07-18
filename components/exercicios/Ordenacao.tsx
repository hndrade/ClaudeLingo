"use client";
import { useState } from "react";
import type { Ordenacao as OrdenacaoEx } from "@/lib/schema";
import { BotaoVerificar, Md, embaralhar } from "@/components/ui";

export function Ordenacao({
  ex,
  onResponder,
}: {
  ex: OrdenacaoEx;
  onResponder: (correto: boolean) => void;
}) {
  const [ordem, setOrdem] = useState<string[]>(() => {
    const arr = embaralhar(ex.etapas, ex.enunciado);
    // Se o embaralhado coincidir com a ordem correta, rotaciona 1 posição
    if (arr.every((v, i) => v === ex.etapas[i])) arr.push(arr.shift() as string);
    return arr;
  });
  const [verificado, setVerificado] = useState(false);

  function mover(i: number, delta: number) {
    if (verificado) return;
    const j = i + delta;
    if (j < 0 || j >= ordem.length) return;
    const novo = [...ordem];
    [novo[i], novo[j]] = [novo[j], novo[i]];
    setOrdem(novo);
  }

  function verificar() {
    if (verificado) return;
    setVerificado(true);
    onResponder(ordem.every((v, i) => v === ex.etapas[i]));
  }

  return (
    <div>
      <Md texto={ex.enunciado} className="mb-2 font-medium" />
      <div className="flex flex-col gap-1.5">
        {ordem.map((etapa, i) => {
          const classes = verificado
            ? etapa === ex.etapas[i]
              ? "border-certo bg-certo-fundo"
              : "border-erro bg-erro-fundo"
            : "border-tinta/10 bg-cartao";
          return (
            <div key={etapa} className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${classes}`}>
              <span className="min-w-0 flex-1 break-words text-sm leading-snug">{etapa}</span>
              {!verificado && (
                <span className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => mover(i, -1)}
                    aria-label="Mover para cima"
                    className="h-7 w-7 rounded-lg border border-tinta/15 bg-cartao text-tinta disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={i === ordem.length - 1}
                    onClick={() => mover(i, 1)}
                    aria-label="Mover para baixo"
                    className="h-7 w-7 rounded-lg border border-tinta/15 bg-cartao text-tinta disabled:opacity-30"
                  >
                    ↓
                  </button>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {verificado && (
        <div className="mt-3 rounded-xl border border-tinta/10 bg-cartao p-3">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-tinta/60">Ordem correta</div>
          <ol className="list-decimal pl-5 text-sm leading-snug">
            {ex.etapas.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ol>
          <Md texto={ex.explicacao} className="mt-2 text-tinta/80" />
        </div>
      )}

      {!verificado && <BotaoVerificar onClick={verificar} />}
    </div>
  );
}

export default Ordenacao;
