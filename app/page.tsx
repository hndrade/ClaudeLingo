import { carregarIndice, carregarLicao } from "@/lib/content";
import Mapa, { type DadosMapa } from "@/components/Mapa";

export default function Home() {
  const indice = carregarIndice();
  const dados: DadosMapa = {
    trilhas: indice.trilhas.map((t) => ({
      id: t.id,
      nome: t.nome,
      descricao: t.descricao,
      licoes: t.licoes.map((id) => {
        const licao = carregarLicao(id);
        return { id: licao.id, titulo: licao.titulo, nivel: licao.nivel, xp: licao.xp };
      }),
    })),
  };
  return <Mapa dados={dados} />;
}
