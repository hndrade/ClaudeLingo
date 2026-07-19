import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  INTERVALOS_REVISAO,
  acertarRevisao,
  calcularBadges,
  concluirLicao,
  progressoVazio,
  registrarErros,
  type Progresso,
} from "../lib/progresso";

// Acerta a revisão o número de vezes necessário para o item sair de vez da fila.
function resolverDeVezNaRevisao(p: Progresso, licao: string, exercicio: number): Progresso {
  for (let i = 0; i < INTERVALOS_REVISAO.length; i++) p = acertarRevisao(p, licao, exercicio);
  return p;
}

const trilhas = [
  { id: "prompt", licoes: ["p1", "p2"] },
  { id: "casos", licoes: ["c1"] },
  { id: "vazia", licoes: [] as string[] },
];

function completa(p: Progresso, id: string, acertos: number, total = 10, dia = "2026-07-18"): Progresso {
  return concluirLicao(p, { id, acertos, total, xp: 10 }, 1, dia);
}

describe("badges: no máximo 6, definidos em JSON", () => {
  const badges = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "content", "badges.json"), "utf-8"));

  it("tem no máximo 6 badges", () => {
    expect(badges.length).toBeLessThanOrEqual(6);
  });

  it("cada badge tem id, nome, descricao e icone", () => {
    for (const b of badges) {
      expect(b.id).toBeTruthy();
      expect(b.nome).toBeTruthy();
      expect(b.descricao).toBeTruthy();
      expect(b.icone).toBeTruthy();
    }
  });

  it("todo id que calcularBadges pode retornar existe no JSON", () => {
    // progresso que dispara todos os badges de uma vez
    let p = completa(progressoVazio, "p1", 9); // um erro nessa lição, para o badge sem-pendencia fazer sentido
    p = registrarErros(p, "p1", [0], "2026-07-18");
    p = completa(p, "p2", 10, 10, "2026-07-19");
    p = completa(p, "c1", 10, 10, "2026-07-20");
    p = resolverDeVezNaRevisao(p, "p1", 0);
    p = { ...p, streak: { atual: 7, ultimaSessao: "2026-07-20" } };
    const ids = calcularBadges(p, trilhas);
    const idsValidos = new Set(badges.map((b: { id: string }) => b.id));
    for (const id of ids) expect(idsValidos.has(id), `badge "${id}" retornado mas ausente do JSON`).toBe(true);
  });
});

describe("calcularBadges", () => {
  it("progresso vazio não conquista nenhum badge", () => {
    expect(calcularBadges(progressoVazio, trilhas)).toEqual([]);
  });

  it("primeiro-passo ao concluir uma lição qualquer", () => {
    const p = completa(progressoVazio, "p1", 8);
    expect(calcularBadges(p, trilhas)).toContain("primeiro-passo");
  });

  it("semana-de-fogo com streak de 7 dias ou mais", () => {
    const p: Progresso = { ...progressoVazio, streak: { atual: 7, ultimaSessao: "2026-07-18" } };
    expect(calcularBadges(p, trilhas)).toContain("semana-de-fogo");
    const p6: Progresso = { ...progressoVazio, streak: { atual: 6, ultimaSessao: "2026-07-18" } };
    expect(calcularBadges(p6, trilhas)).not.toContain("semana-de-fogo");
  });

  it("trilha-dominada só quando TODAS as lições de alguma trilha com conteúdo estão concluídas", () => {
    let p = completa(progressoVazio, "c1", 10);
    expect(calcularBadges(p, trilhas)).toContain("trilha-dominada");
    // trilha "prompt" incompleta não conta
    p = completa(progressoVazio, "p1", 10);
    expect(calcularBadges(p, trilhas)).not.toContain("trilha-dominada");
  });

  it("mestre-do-prompt exige a trilha prompt inteira, não qualquer trilha", () => {
    let p = completa(progressoVazio, "c1", 10);
    expect(calcularBadges(p, trilhas)).not.toContain("mestre-do-prompt");
    p = completa(p, "p1", 10, 10, "2026-07-19");
    p = completa(p, "p2", 10, 10, "2026-07-20");
    expect(calcularBadges(p, trilhas)).toContain("mestre-do-prompt");
  });

  it("sem-pendencia exige ter tido erro alguma vez E a fila estar zerada agora", () => {
    // nunca errou: sem badge, mesmo com fila vazia
    let p = completa(progressoVazio, "p1", 10);
    expect(calcularBadges(p, trilhas)).not.toContain("sem-pendencia");
    // errou (lição com acertos < total) e ainda está na fila: sem badge
    p = completa(progressoVazio, "p1", 9, 10, "2026-07-18");
    p = registrarErros(p, "p1", [2], "2026-07-18");
    expect(calcularBadges(p, trilhas)).not.toContain("sem-pendencia");
    // errou e resolveu de vez na revisão espaçada: badge
    p = resolverDeVezNaRevisao(p, "p1", 2);
    expect(calcularBadges(p, trilhas)).toContain("sem-pendencia");
  });

  it("maratonista com 100 exercícios respondidos no total", () => {
    let p = progressoVazio;
    for (let i = 0; i < 10; i++) p = completa(p, `licao-${i}`, 8, 10, "2026-07-18");
    expect(calcularBadges(p, trilhas)).toContain("maratonista");
  });

  it("maratonista não conta antes de bater 100", () => {
    let p = progressoVazio;
    for (let i = 0; i < 9; i++) p = completa(p, `licao-${i}`, 8, 10, "2026-07-18");
    expect(calcularBadges(p, trilhas)).not.toContain("maratonista");
  });
});
