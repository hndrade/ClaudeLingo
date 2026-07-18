"use client";
import { useMemo, useState } from "react";
import type { Associacao as AssociacaoEx } from "@/lib/schema";
import { BotaoVerificar, Md, embaralhar } from "@/components/ui";

function Badge({ n, cor }: { n: number; cor: string }) {
  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${cor}`}
    >
      {n}
    </span>
  );
}

export function Associacao({
  ex,
  onResponder,
}: {
  ex: AssociacaoEx;
  onResponder: (correto: boolean) => void;
}) {
  const defs = useMemo(
    () => embaralhar(ex.pares.map((p) => p.definicao), ex.enunciado),
    [ex]
  );
  // par[i] = índice em defs atribuído ao conceito i, ou null
  const [par, setPar] = useState<(number | null)[]>(() => ex.pares.map(() => null));
  const [sel, setSel] = useState(0);
  const [verificado, setVerificado] = useState(false);

  const completo = par.every((v) => v !== null);
  const acertou = (i: number) => {
    const d = par[i];
    return d !== null && defs[d] === ex.pares[i].definicao;
  };

  function tocarDef(d: number) {
    if (verificado) return;
    const novo = par.map((v) => (v === d ? null : v));
    novo[sel] = d;
    setPar(novo);
    const prox = novo.findIndex((v) => v === null);
    if (prox !== -1) setSel(prox);
  }

  function verificar() {
    if (!completo || verificado) return;
    setVerificado(true);
    onResponder(ex.pares.every((_, i) => acertou(i)));
  }

  return (
    <div>
      <Md texto={ex.enunciado} className="mb-2 font-medium" />

      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-tinta/60">Conceitos</div>
      <div className="mb-3 flex flex-col gap-2">
        {ex.pares.map((p, i) => {
          const classes = verificado
            ? acertou(i)
              ? "border-certo bg-certo-fundo"
              : "border-erro bg-erro-fundo"
            : i === sel
              ? "border-acento bg-acento-fundo"
              : "border-tinta/10 bg-cartao";
          return (
            <button
              key={i}
              type="button"
              disabled={verificado}
              onClick={() => setSel(i)}
              className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-left text-sm leading-snug ${classes}`}
            >
              <Badge n={i + 1} cor={verificado ? (acertou(i) ? "bg-certo" : "bg-erro") : par[i] !== null ? "bg-acento" : "bg-tinta/25"} />
              <span className="min-w-0">
                {p.conceito}
                {verificado && !acertou(i) && (
                  <span className="mt-1 block text-[13px] leading-snug text-erro">Correto: {p.definicao}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-tinta/60">Definições</div>
      <div className="flex flex-col gap-2">
        {defs.map((d, di) => {
          const dono = par.indexOf(di); // conceito ao qual esta definição foi atribuída
          const classes = verificado
            ? dono !== -1 && acertou(dono)
              ? "border-certo bg-certo-fundo"
              : dono !== -1
                ? "border-erro bg-erro-fundo"
                : "border-tinta/10 bg-cartao opacity-70"
            : dono !== -1
              ? "border-acento bg-acento-fundo"
              : "border-tinta/10 bg-cartao";
          return (
            <button
              key={di}
              type="button"
              disabled={verificado}
              onClick={() => tocarDef(di)}
              className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-left text-sm leading-snug ${classes}`}
            >
              {dono !== -1 && (
                <Badge n={dono + 1} cor={verificado ? (acertou(dono) ? "bg-certo" : "bg-erro") : "bg-acento"} />
              )}
              <span className="min-w-0">{d}</span>
            </button>
          );
        })}
      </div>

      {!verificado && <BotaoVerificar disabled={!completo} onClick={verificar} />}
    </div>
  );
}

export default Associacao;
