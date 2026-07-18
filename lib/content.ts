import fs from "fs";
import path from "path";
import { indiceSchema, licaoSchema, type Indice, type Licao } from "./schema";

const raiz = path.join(process.cwd(), "content", "trilhas");

export function carregarIndice(): Indice {
  const bruto = JSON.parse(fs.readFileSync(path.join(raiz, "indice.json"), "utf-8"));
  return indiceSchema.parse(bruto);
}

export function carregarLicao(id: string): Licao {
  const trilha = carregarIndice().trilhas.find((t) => t.licoes.includes(id));
  if (!trilha) throw new Error(`Licao "${id}" nao registrada no indice`);
  const bruto = JSON.parse(fs.readFileSync(path.join(raiz, trilha.id, `${id}.json`), "utf-8"));
  return licaoSchema.parse(bruto);
}
