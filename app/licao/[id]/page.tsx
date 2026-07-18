import { notFound } from "next/navigation";
import { carregarLicao } from "@/lib/content";
import LessonPlayer from "@/components/LessonPlayer";

export default async function PaginaLicao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let licao;
  try {
    licao = carregarLicao(decodeURIComponent(id));
  } catch {
    notFound();
  }
  return <LessonPlayer licao={licao} />;
}
