import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { progressoVazio } from "@/lib/progresso";

// Um arquivo de progresso por perfil (conta local); "visitante" é o padrão.
async function arquivo(): Promise<string> {
  const perfil = (await cookies()).get("perfil")?.value ?? "visitante";
  return path.join(process.cwd(), "data", `progresso-${perfil}.json`);
}

export async function GET() {
  const arq = await arquivo();
  if (!fs.existsSync(arq)) return Response.json(progressoVazio);
  return Response.json(JSON.parse(fs.readFileSync(arq, "utf-8")));
}

export async function PUT(req: Request) {
  const arq = await arquivo();
  const corpo = await req.json();
  fs.mkdirSync(path.dirname(arq), { recursive: true });
  fs.writeFileSync(arq, JSON.stringify(corpo, null, 2));
  return Response.json({ ok: true });
}
