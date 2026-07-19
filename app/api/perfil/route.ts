import fs from "fs";
import path from "path";
import { cookies } from "next/headers";

const dirDados = path.join(process.cwd(), "data");

function slug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const atual = (await cookies()).get("perfil")?.value ?? null;
  const contas = fs.existsSync(dirDados)
    ? fs
        .readdirSync(dirDados)
        .filter((f) => f.startsWith("progresso-") && f.endsWith(".json"))
        .map((f) => f.slice("progresso-".length, -".json".length))
    : [];
  return Response.json({ atual, contas });
}

export async function POST(req: Request) {
  const { nome } = await req.json();
  const perfil = slug(String(nome ?? ""));
  if (!perfil) return Response.json({ erro: "nome inválido" }, { status: 400 });
  (await cookies()).set("perfil", perfil, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return Response.json({ ok: true, perfil });
}
