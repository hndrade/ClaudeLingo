import { describe, expect, it } from "vitest";
import {
  concluirLicao,
  nivelMaxLiberado,
  progressoVazio,
  trilhaLiberada,
  type LicaoMeta,
  type Progresso,
} from "../lib/progresso";

// Trilha com 2 lições de nível 1 e 1 de nível 2, 10 exercícios cada.
const metas: LicaoMeta[] = [
  { id: "n1a", nivel: 1 },
  { id: "n1b", nivel: 1 },
  { id: "n2a", nivel: 2 },
];

function completa(p: Progresso, id: string, acertos: number, dia = "2026-07-18"): Progresso {
  return concluirLicao(p, { id, acertos, total: 10, xp: 10 }, 1, dia);
}

describe("escada de nível (80% para liberar o seguinte)", () => {
  it("nível 1 sempre liberado, nível 2 fechado sem conclusões", () => {
    expect(nivelMaxLiberado(metas, progressoVazio)).toBe(1);
  });

  it("não libera com o nível incompleto, mesmo com 100% na lição feita", () => {
    const p = completa(progressoVazio, "n1a", 10);
    expect(nivelMaxLiberado(metas, p)).toBe(1);
  });

  it("não libera com acerto agregado abaixo de 80%", () => {
    let p = completa(progressoVazio, "n1a", 8);
    p = completa(p, "n1b", 7); // 15 de 20 = 75%
    expect(nivelMaxLiberado(metas, p)).toBe(1);
  });

  it("libera com acerto agregado de exatamente 80%", () => {
    let p = completa(progressoVazio, "n1a", 8);
    p = completa(p, "n1b", 8); // 16 de 20 = 80%
    expect(nivelMaxLiberado(metas, p)).toBe(2);
  });

  it("usa a melhor tentativa de cada lição", () => {
    let p = completa(progressoVazio, "n1a", 5);
    p = completa(p, "n1b", 8);
    expect(nivelMaxLiberado(metas, p)).toBe(1); // 13 de 20 = 65%
    p = completa(p, "n1a", 9, "2026-07-19"); // refez e melhorou: 17 de 20 = 85%
    expect(nivelMaxLiberado(metas, p)).toBe(2);
  });

  it("não pula nível com lacuna: nível 2 incompleto trava o 3", () => {
    let p = completa(progressoVazio, "n1a", 10);
    p = completa(p, "n1b", 10);
    p = completa(p, "n2a", 10);
    const comNivel3 = [...metas, { id: "n3a", nivel: 3 }];
    expect(nivelMaxLiberado(comNivel3, p)).toBe(3);
    expect(nivelMaxLiberado(comNivel3, progressoVazio)).toBe(1);
  });
});

describe("trilha destrava trilha", () => {
  const trilhas = [
    { id: "t1", licoes: [] as string[] }, // sem conteúdo: não bloqueia
    { id: "t2", licoes: ["a", "b"] },
    { id: "t3", licoes: ["c"] },
  ];

  it("trilhas vazias não bloqueiam a primeira com conteúdo", () => {
    expect(trilhaLiberada(trilhas, progressoVazio, "t1")).toBe(true);
    expect(trilhaLiberada(trilhas, progressoVazio, "t2")).toBe(true);
  });

  it("trilha seguinte fecha até concluir todas as lições da anterior", () => {
    expect(trilhaLiberada(trilhas, progressoVazio, "t3")).toBe(false);
    let p = completa(progressoVazio, "a", 10);
    expect(trilhaLiberada(trilhas, p, "t3")).toBe(false);
    p = completa(p, "b", 10);
    expect(trilhaLiberada(trilhas, p, "t3")).toBe(true);
  });
});
