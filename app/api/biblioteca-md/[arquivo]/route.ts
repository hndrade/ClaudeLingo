import fs from "fs";
import path from "path";

const raiz = path.join(process.cwd(), "content", "biblioteca-md");

export async function GET(_req: Request, { params }: { params: Promise<{ arquivo: string }> }) {
  const { arquivo } = await params;
  if (!/^[a-z0-9-]+\.md$/.test(arquivo)) {
    return new Response("Arquivo inválido", { status: 400 });
  }
  const caminho = path.join(raiz, arquivo);
  if (!fs.existsSync(caminho)) {
    return new Response("Não encontrado", { status: 404 });
  }
  const conteudo = fs.readFileSync(caminho, "utf-8");
  return new Response(conteudo, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${arquivo}"`,
    },
  });
}
