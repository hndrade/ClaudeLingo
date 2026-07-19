import Link from "next/link";
import { listarBibliotecaMd } from "@/lib/bibliotecaMd";

export default function Biblioteca() {
  const arquivos = listarBibliotecaMd();
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/" className="text-sm font-semibold text-tinta/60">
        Voltar
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-tinta">Biblioteca de instruções .md</h1>
      <p className="mt-1 text-sm text-tinta/70">
        Arquivos prontos para usar como instrução de projeto ou system prompt num Claude de verdade. Um por área de
        trabalho.
      </p>

      <ul className="mt-6 space-y-2">
        {arquivos.map((a) => (
          <li key={a.arquivo}>
            <a
              href={`/api/biblioteca-md/${a.arquivo}`}
              download
              className="flex items-center justify-between rounded-xl border border-tinta/10 bg-cartao px-4 py-3"
            >
              <span className="font-medium text-tinta">{a.titulo}</span>
              <span className="text-sm font-semibold text-acento">Baixar .md</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
