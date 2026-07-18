import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { indiceSchema, licaoSchema, type Licao } from "../lib/schema";

const raiz = path.join(__dirname, "..", "content", "trilhas");
const indice = indiceSchema.parse(JSON.parse(fs.readFileSync(path.join(raiz, "indice.json"), "utf-8")));

const registradas = indice.trilhas.flatMap((t) => t.licoes.map((id) => ({ trilha: t.id, id })));
const faltantes = registradas.filter((r) => !fs.existsSync(path.join(raiz, r.trilha, `${r.id}.json`)));

const licoes: [string, Licao][] = registradas
  .filter((r) => !faltantes.includes(r))
  .map((r) => {
    const bruto = JSON.parse(fs.readFileSync(path.join(raiz, r.trilha, `${r.id}.json`), "utf-8"));
    return [r.id, licaoSchema.parse(bruto)];
  });

function textos(valor: unknown): string[] {
  if (typeof valor === "string") return [valor];
  if (Array.isArray(valor)) return valor.flatMap(textos);
  if (valor && typeof valor === "object") return Object.values(valor).flatMap(textos);
  return [];
}

describe("conteúdo das lições", () => {
  it("todas as lições registradas no índice existem em disco", () => {
    expect(faltantes.map((f) => f.id)).toEqual([]);
  });

  it.each(licoes)("%s: id do arquivo bate com o campo id", (id, licao) => {
    expect(licao.id).toBe(id);
  });

  it.each(licoes)("%s: conceito tem no máximo 6 linhas de texto", (_id, licao) => {
    const linhas = licao.conceito.split("\n").filter((l) => l.trim() !== "");
    expect(linhas.length).toBeLessThanOrEqual(6);
  });

  it.each(licoes)("%s: sem travessão longo nem -- em texto visível", (_id, licao) => {
    for (const t of textos(licao)) {
      expect(t, `texto com travessão: ${t.slice(0, 60)}`).not.toMatch(/—|(?<![-\w])--(?![-\w])/);
    }
  });

  it.each(licoes)("%s: múltipla escolha tem exatamente 1 correta; cenário, 1 melhor", (_id, licao) => {
    for (const ex of licao.exercicios) {
      if (ex.tipo === "multipla_escolha") {
        expect(ex.alternativas.filter((a) => a.correta)).toHaveLength(1);
      }
      if (ex.tipo === "cenario") {
        expect(ex.alternativas.filter((a) => a.melhor)).toHaveLength(1);
        expect(ex.alternativas).toHaveLength(3);
      }
      if (ex.tipo === "comparar_prompts") {
        expect(ex.prompts.filter((p) => p.melhor)).toHaveLength(1);
      }
      if (ex.tipo === "preencher_lacuna") {
        expect(ex.opcoes.filter((o) => o.correta)).toHaveLength(1);
      }
    }
  });

  it("trilha prompt cobre os níveis 1 a 4 da escada", () => {
    const niveis = new Set(licoes.filter(([, l]) => l.trilha === "prompt").map(([, l]) => l.nivel));
    for (const n of [1, 2, 3, 4]) expect(niveis, `nível ${n} ausente`).toContain(n);
  });
});
