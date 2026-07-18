"use client";
import { useState } from "react";
import type { PreencherLacuna as PreencherLacunaEx } from "@/lib/schema";
import { BotaoVerificar, Md } from "@/components/ui";

export function PreencherLacuna({
  ex,
  onResponder,
}: {
  ex: PreencherLacunaEx;
  onResponder: (correto: boolean) => void;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const [verificado, setVerificado] = useState(false);

  const partes = ex.texto.split("___");
  const idxCerta = ex.opcoes.findIndex((o) => o.correta);
  const acertou = sel !== null && ex.opcoes[sel].correta;

  function verificar() {
    if (sel === null || verificado) return;
    setVerificado(true);
    onResponder(ex.opcoes[sel].correta);
  }

  const slotClasses = verificado
    ? acertou
      ? "border-certo bg-certo-fundo text-certo"
      : "border-erro bg-erro-fundo text-erro"
    : sel !== null
      ? "border-acento bg-acento-fundo text-tinta"
      : "border-dashed border-papel/40 text-papel/50";

  function chipClasses(i: number) {
    if (!verificado) return i === sel ? "border-acento bg-acento-fundo" : "border-tinta/10 bg-white";
    if (ex.opcoes[i].correta) return "border-certo bg-certo-fundo text-certo";
    if (i === sel) return "border-erro bg-erro-fundo text-erro";
    return "border-tinta/10 bg-white opacity-60";
  }

  return (
    <div>
      <Md texto={ex.enunciado} className="mb-3 font-medium" />

      <div className="whitespace-pre-wrap break-words rounded-lg bg-tinta p-3 font-mono text-[13px] leading-relaxed text-papel">
        {partes[0]}
        <span className={`mx-0.5 inline-block rounded border-2 px-2 py-0.5 font-semibold ${slotClasses}`}>
          {sel !== null ? ex.opcoes[sel].texto : "escolha abaixo"}
        </span>
        {partes[1] ?? ""}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {ex.opcoes.map((op, i) => (
          <button
            key={i}
            type="button"
            disabled={verificado}
            onClick={() => setSel(i)}
            className={`rounded-full border px-3 py-2 text-[14px] ${chipClasses(i)}`}
          >
            {op.texto}
          </button>
        ))}
      </div>

      {verificado && sel !== null && (
        <div className="mt-3 flex flex-col gap-2">
          <div
            className={`rounded-xl border p-3 text-[14px] leading-relaxed ${
              acertou ? "border-certo bg-certo-fundo text-certo" : "border-erro bg-erro-fundo text-erro"
            }`}
          >
            {ex.opcoes[sel].explicacao}
          </div>
          {!acertou && idxCerta !== -1 && (
            <div className="rounded-xl border border-certo bg-certo-fundo p-3 text-[14px] leading-relaxed text-certo">
              <span className="font-semibold">Correta: {ex.opcoes[idxCerta].texto}. </span>
              {ex.opcoes[idxCerta].explicacao}
            </div>
          )}
        </div>
      )}

      {!verificado && <BotaoVerificar disabled={sel === null} onClick={verificar} />}
    </div>
  );
}

export default PreencherLacuna;
