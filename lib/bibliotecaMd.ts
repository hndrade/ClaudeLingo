import fs from "fs";
import path from "path";

const raiz = path.join(process.cwd(), "content", "biblioteca-md");

export type ArquivoMd = { arquivo: string; titulo: string; area: string };

export function listarBibliotecaMd(): ArquivoMd[] {
  return fs
    .readdirSync(raiz)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((arquivo) => {
      const primeiraLinha = fs.readFileSync(path.join(raiz, arquivo), "utf-8").split("\n")[0];
      return {
        arquivo,
        titulo: primeiraLinha.replace(/^#\s*/, ""),
        area: arquivo.replace(/\.md$/, ""),
      };
    });
}
