"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Exercicio, Licao } from "@/lib/schema";
import { carregarProgresso, salvarProgresso, resolverErro } from "@/lib/progresso";
import EscolhaUnica from "@/components/exercicios/EscolhaUnica";
import Associacao from "@/components/exercicios/Associacao";
import Ordenacao from "@/components/exercicios/Ordenacao";
import PreencherLacuna from "@/components/exercicios/PreencherLacuna";
import CompararPromptsEx from "@/components/exercicios/CompararPrompts";
import ConsertarPromptEx from "@/components/exercicios/ConsertarPrompt";

type Item = { licao: string; exercicio: number };

export default function Repescagem({ licoes }: { licoes: Record<string, Licao> }) {
  const [fila, setFila] = useState<Item[] | null>(null);
  const [pos, setPos] = useState(0);
  const [respondido, setRespondido] = useState<boolean | null>(null);
  const [acertos, setAcertos] = useState(0);

  useEffect(() => {
    carregarProgresso().then((p) =>
      setFila(p.erros.filter((e) => licoes[e.licao]?.exercicios[e.exercicio]))
    );
  }, [licoes]);

  async function aoResponder(correto: boolean) {
    setRespondido(correto);
    if (!correto || !fila) return;
    setAcertos((a) => a + 1);
    const item = fila[pos];
    const p = await carregarProgresso();
    await salvarProgresso(resolverErro(p, item.licao, item.exercicio));
  }

  function renderExercicio(ex: Exercicio) {
    switch (ex.tipo) {
      case "multipla_escolha":
        return <EscolhaUnica enunciado={ex.enunciado} opcoes={ex.alternativas} onResponder={aoResponder} />;
      case "cenario":
        return (
          <EscolhaUnica
            enunciado={ex.enunciado}
            opcoes={ex.alternativas.map((a) => ({ texto: a.texto, correta: a.melhor, explicacao: a.feedback }))}
            onResponder={aoResponder}
          />
        );
      case "associacao":
        return <Associacao ex={ex} onResponder={aoResponder} />;
      case "ordenacao":
        return <Ordenacao ex={ex} onResponder={aoResponder} />;
      case "preencher_lacuna":
        return <PreencherLacuna ex={ex} onResponder={aoResponder} />;
      case "comparar_prompts":
        return <CompararPromptsEx ex={ex} onResponder={aoResponder} />;
      case "consertar_prompt":
        return <ConsertarPromptEx ex={ex} onResponder={aoResponder} />;
    }
  }

  if (fila === null) return null;

  if (fila.length === 0 || pos >= fila.length) {
    const fim = fila.length > 0;
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="mb-2 text-2xl font-bold">{fim ? "Repescagem concluída" : "Nada para repassar"}</h1>
        <p className="mb-8 text-tinta/70">
          {fim
            ? `Você acertou ${acertos} de ${fila.length}. O que acertou saiu da fila; o resto volta na próxima.`
            : "Você não tem exercícios errados pendentes. Siga com a trilha."}
        </p>
        <Link href="/" className="inline-block w-full rounded-xl bg-acento py-3 font-semibold text-white">
          Voltar ao início
        </Link>
      </main>
    );
  }

  const item = fila[pos];
  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-tinta/10 bg-papel px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link href="/" className="text-sm font-semibold text-tinta/60">
            Sair
          </Link>
          <span className="flex-1 text-center text-sm font-bold text-acento">Repescagem</span>
          <span className="text-sm font-semibold text-tinta/60">
            {pos + 1} de {fila.length}
          </span>
        </div>
      </header>
      <main className={`mx-auto max-w-2xl px-4 py-6 ${respondido !== null ? "pb-40" : ""}`}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-tinta/50">
          Da lição: {licoes[item.licao].titulo}
        </p>
        <div key={pos}>{renderExercicio(licoes[item.licao].exercicios[item.exercicio])}</div>
      </main>
      {respondido !== null && (
        <div className={`fixed inset-x-0 bottom-0 z-20 ${respondido ? "bg-certo-fundo" : "bg-erro-fundo"}`}>
          <div className="mx-auto max-w-2xl px-4 py-4">
            <p className={`mb-3 font-bold ${respondido ? "text-certo" : "text-erro"}`}>
              {respondido ? "Certo! Esse sai da fila." : "Ainda não. Ele volta na próxima repescagem."}
            </p>
            <button
              type="button"
              onClick={() => {
                setRespondido(null);
                setPos((n) => n + 1);
              }}
              className={`w-full rounded-xl py-3 font-semibold text-white ${respondido ? "bg-certo" : "bg-erro"}`}
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
