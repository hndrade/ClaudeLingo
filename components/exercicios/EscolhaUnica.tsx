"use client";
import { useState } from "react";
import { BotaoVerificar, Md } from "@/components/ui";

type Opcao = { texto: string; correta: boolean; explicacao: string };

export function EscolhaUnica({
  enunciado,
  opcoes,
  onResponder,
}: {
  enunciado: string;
  opcoes: Opcao[];
  onResponder: (correto: boolean) => void;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const [verificado, setVerificado] = useState(false);

  function verificar() {
    if (sel === null || verificado) return;
    setVerificado(true);
    onResponder(opcoes[sel].correta);
  }

  function classes(i: number) {
    if (!verificado) return i === sel ? "border-acento bg-acento-fundo" : "border-tinta/10 bg-white";
    if (opcoes[i].correta) return "border-certo bg-certo-fundo";
    if (i === sel) return "border-erro bg-erro-fundo";
    return "border-tinta/10 bg-white opacity-70";
  }

  return (
    <div>
      <Md texto={enunciado} className="mb-3 font-medium" />
      <div className="flex flex-col gap-2">
        {opcoes.map((op, i) => (
          <button
            key={i}
            type="button"
            disabled={verificado}
            onClick={() => setSel(i)}
            className={`rounded-xl border p-3 text-left text-[15px] leading-relaxed ${classes(i)}`}
          >
            {op.texto}
            {verificado && (
              <span
                className={`mt-2 block text-[13px] ${
                  op.correta ? "text-certo" : i === sel ? "text-erro" : "text-tinta/70"
                }`}
              >
                {op.explicacao}
              </span>
            )}
          </button>
        ))}
      </div>
      {!verificado && <BotaoVerificar disabled={sel === null} onClick={verificar} />}
    </div>
  );
}

export default EscolhaUnica;
