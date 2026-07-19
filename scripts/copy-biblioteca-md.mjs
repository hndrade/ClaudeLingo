// Copia content/biblioteca-md/*.md (fonte única) para public/biblioteca-md/,
// de onde o export estático serve os arquivos para download. Roda antes do
// build para a cópia nunca ficar desatualizada em relação ao conteúdo.
import fs from "fs";
import path from "path";

const origem = path.join(process.cwd(), "content", "biblioteca-md");
const destino = path.join(process.cwd(), "public", "biblioteca-md");

fs.mkdirSync(destino, { recursive: true });
for (const arquivo of fs.readdirSync(origem).filter((f) => f.endsWith(".md"))) {
  fs.copyFileSync(path.join(origem, arquivo), path.join(destino, arquivo));
}
console.log(`Copiados ${fs.readdirSync(destino).length} arquivos .md para public/biblioteca-md/`);
