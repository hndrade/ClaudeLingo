import { carregarIndice, carregarLicao } from "@/lib/content";
import Repescagem from "@/components/Repescagem";
import type { Licao } from "@/lib/schema";

export default function PaginaRepescagem() {
  const licoes: Record<string, Licao> = {};
  for (const trilha of carregarIndice().trilhas) {
    for (const id of trilha.licoes) licoes[id] = carregarLicao(id);
  }
  return <Repescagem licoes={licoes} />;
}
