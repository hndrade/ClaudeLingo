import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const raiz = path.join(__dirname, "..", "content", "biblioteca-md");
const arquivos = fs.readdirSync(raiz).filter((f) => f.endsWith(".md"));

const secoesObrigatorias = ["## Contexto", "## Regras duras", "## Exemplos", "## Formato de saída", "## O que não fazer"];

describe("biblioteca de instruções .md", () => {
  it("tem entre 6 e 8 arquivos", () => {
    expect(arquivos.length).toBeGreaterThanOrEqual(6);
    expect(arquivos.length).toBeLessThanOrEqual(8);
  });

  it.each(arquivos)("%s: nome de arquivo em minúsculas com extensão .md", (arquivo) => {
    expect(arquivo).toMatch(/^[a-z0-9-]+\.md$/);
  });

  it.each(arquivos)("%s: tem as 5 seções obrigatórias da anatomia de um .md", (arquivo) => {
    const texto = fs.readFileSync(path.join(raiz, arquivo), "utf-8");
    for (const secao of secoesObrigatorias) {
      expect(texto, `faltando "${secao}" em ${arquivo}`).toContain(secao);
    }
  });

  it.each(arquivos)("%s: não é decorativo (tamanho mínimo real)", (arquivo) => {
    const texto = fs.readFileSync(path.join(raiz, arquivo), "utf-8");
    expect(texto.length).toBeGreaterThan(800);
  });

  it.each(arquivos)("%s: sem travessão longo nem -- em texto visível", (arquivo) => {
    const texto = fs.readFileSync(path.join(raiz, arquivo), "utf-8");
    expect(texto).not.toMatch(/—|(?<![-\w])--(?![-\w])/);
  });
});
