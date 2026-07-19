// Lista lições com verificado_em há mais de 90 dias, para revalidar fatos datáveis.
import fs from "fs";
import path from "path";

const raiz = path.join(process.cwd(), "content", "trilhas");
const LIMITE_DIAS = 90;
const hoje = new Date();

function diasDesde(data) {
  return Math.floor((hoje.getTime() - new Date(data).getTime()) / 86400000);
}

const indice = JSON.parse(fs.readFileSync(path.join(raiz, "indice.json"), "utf-8"));
const desatualizadas = [];

for (const trilha of indice.trilhas) {
  for (const id of trilha.licoes) {
    const arq = path.join(raiz, trilha.id, `${id}.json`);
    if (!fs.existsSync(arq)) continue;
    const licao = JSON.parse(fs.readFileSync(arq, "utf-8"));
    if (!licao.verificado_em) continue;
    const dias = diasDesde(licao.verificado_em);
    if (dias > LIMITE_DIAS) {
      desatualizadas.push({ id, trilha: trilha.id, verificado_em: licao.verificado_em, dias });
    }
  }
}

if (desatualizadas.length === 0) {
  console.log(`Nenhuma lição com mais de ${LIMITE_DIAS} dias sem revalidar.`);
} else {
  console.log(`${desatualizadas.length} lição(ões) precisando revalidar (mais de ${LIMITE_DIAS} dias):\n`);
  for (const d of desatualizadas) {
    console.log(`  ${d.id} (${d.trilha}): verificado em ${d.verificado_em}, há ${d.dias} dias`);
  }
  process.exitCode = 1;
}
