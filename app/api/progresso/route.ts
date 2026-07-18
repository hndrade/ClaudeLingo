import fs from "fs";
import path from "path";
import { progressoVazio } from "@/lib/progresso";

const arquivo = path.join(process.cwd(), "data", "progresso.json");

export async function GET() {
  if (!fs.existsSync(arquivo)) return Response.json(progressoVazio);
  return Response.json(JSON.parse(fs.readFileSync(arquivo, "utf-8")));
}

export async function PUT(req: Request) {
  const corpo = await req.json();
  fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  fs.writeFileSync(arquivo, JSON.stringify(corpo, null, 2));
  return Response.json({ ok: true });
}
