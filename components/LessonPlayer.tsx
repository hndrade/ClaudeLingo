"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Exercicio, Licao } from "@/lib/schema";
import { carregarProgresso, concluirLicao, licoesConcluidas, registrarErros, salvarProgresso } from "@/lib/progresso";
import { Md } from "@/components/ui";
import EscolhaUnica from "@/components/exercicios/EscolhaUnica";
import Associacao from "@/components/exercicios/Associacao";
import Ordenacao from "@/components/exercicios/Ordenacao";
import PreencherLacuna from "@/components/exercicios/PreencherLacuna";
import CompararPromptsEx from "@/components/exercicios/CompararPrompts";
import ConsertarPromptEx from "@/components/exercicios/ConsertarPrompt";

export default function LessonPlayer({ licao }: { licao: Licao }) {
  const total = licao.exercicios.length;
  const [etapa, setEtapa] = useState(-1);
  const [resultados, setResultados] = useState<boolean[]>([]);
  const [respondido, setRespondido] = useState<boolean | null>(null);
  const [salvo, setSalvo] = useState<{ primeiraVez: boolean; streak: number } | null>(null);
  const inicioRef = useRef(Date.now());
  const salvouRef = useRef(false);

  // Registra a conclusão no progresso uma única vez por tela final.
  useEffect(() => {
    if (etapa < total || salvouRef.current) return;
    salvouRef.current = true;
    const minutos = Math.max(1, Math.round((Date.now() - inicioRef.current) / 60000));
    const acertos = resultados.filter(Boolean).length;
    carregarProgresso().then(async (p) => {
      const primeiraVez = !licoesConcluidas(p).has(licao.id);
      const errados = resultados.flatMap((ok, i) => (ok ? [] : [i]));
      const novo = registrarErros(
        concluirLicao(p, { id: licao.id, acertos, total, xp: licao.xp }, minutos),
        licao.id,
        errados
      );
      await salvarProgresso(novo);
      setSalvo({ primeiraVez, streak: novo.streak.atual });
    });
  }, [etapa, total, resultados, licao]);

  function aoResponder(correto: boolean) {
    setRespondido(correto);
    setResultados((r) => [...r, correto]);
  }

  function continuar() {
    setRespondido(null);
    setEtapa((e) => e + 1);
  }

  function refazer() {
    setEtapa(-1);
    setResultados([]);
    setRespondido(null);
    setSalvo(null);
    inicioRef.current = Date.now();
    salvouRef.current = false;
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

  if (etapa === -1) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <span className="mb-3 inline-block rounded-full bg-acento-fundo px-3 py-1 text-xs font-bold text-acento">
          Nível {licao.nivel}
        </span>
        <h1 className="mb-4 text-2xl font-bold text-tinta">{licao.titulo}</h1>
        <div className="rounded-xl border border-tinta/10 bg-cartao p-4">
          <Md texto={licao.conceito} />
        </div>
        <button
          type="button"
          onClick={() => setEtapa(0)}
          className="mt-6 w-full rounded-xl bg-acento py-3 font-semibold text-white"
        >
          Começar
        </button>
      </main>
    );
  }

  if (etapa >= total) {
    const acertos = resultados.filter(Boolean).length;
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="mb-2 text-2xl font-bold text-tinta">Lição concluída</h1>
        <p className="mb-4 text-tinta/80">
          Você acertou {acertos} de {total} exercícios.
        </p>
        {salvo?.primeiraVez && <p className="mb-8 text-3xl font-bold text-acento">+{licao.xp} XP</p>}
        {salvo && !salvo.primeiraVez && (
          <div className="mb-8">
            <p className="text-sm text-tinta/70">Lição já concluída antes: XP não se repete</p>
            <p className="mt-2 text-xl font-bold text-acento">
              🔥 {salvo.streak} {salvo.streak === 1 ? "dia" : "dias"}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={refazer}
          className="w-full rounded-xl bg-acento py-3 font-semibold text-white"
        >
          Refazer lição
        </button>
        <Link href="/" className="mt-4 inline-block font-semibold text-acento underline">
          Voltar ao início
        </Link>
      </main>
    );
  }

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-tinta/10 bg-papel px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link href="/" className="text-sm font-semibold text-tinta/60">
            Sair
          </Link>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-tinta/10">
            <div
              className="h-full rounded-full bg-acento transition-all"
              style={{ width: `${(etapa / total) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-tinta/60">
            {etapa + 1} de {total}
          </span>
        </div>
      </header>

      <main className={`mx-auto max-w-2xl px-4 py-6 ${respondido !== null ? "pb-40" : ""}`}>
        <div key={etapa}>{renderExercicio(licao.exercicios[etapa])}</div>
      </main>

      {respondido !== null && (
        <div className={`fixed inset-x-0 bottom-0 z-20 ${respondido ? "bg-certo-fundo" : "bg-erro-fundo"}`}>
          <div className="mx-auto max-w-2xl px-4 py-4">
            <p className={`mb-3 font-bold ${respondido ? "text-certo" : "text-erro"}`}>
              {respondido ? "Certo!" : "Quase. Leia o porquê acima."}
            </p>
            <button
              type="button"
              onClick={continuar}
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
