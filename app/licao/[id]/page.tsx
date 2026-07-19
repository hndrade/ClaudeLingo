import { carregarIndice, carregarLicao } from "@/lib/content";
import LessonPlayer from "@/components/LessonPlayer";

export function generateStaticParams() {
  return carregarIndice().trilhas.flatMap((t) => t.licoes.map((id) => ({ id })));
}

export default async function PaginaLicao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const licao = carregarLicao(decodeURIComponent(id));
  return <LessonPlayer licao={licao} />;
}
