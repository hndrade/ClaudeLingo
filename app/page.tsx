import Link from "next/link";
import { carregarIndice, carregarLicao } from "@/lib/content";

export default function Home() {
  const indice = carregarIndice();
  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold">ClaudeLingo</h1>
      <p className="mt-1 text-sm text-tinta/70">IA aplicada, do zero ao prompt de alto impacto.</p>

      {indice.trilhas.map((trilha) => (
        <section key={trilha.id} className="mt-8">
          <h2 className="font-semibold">{trilha.nome}</h2>
          <p className="text-sm text-tinta/70">{trilha.descricao}</p>
          <ul className="mt-3 space-y-2">
            {trilha.licoes.map((id) => {
              const licao = carregarLicao(id);
              return (
                <li key={id}>
                  <Link
                    href={`/licao/${id}`}
                    className="flex items-center justify-between rounded-xl border border-tinta/10 bg-white px-4 py-3 shadow-sm active:bg-acento-fundo"
                  >
                    <span className="font-medium">{licao.titulo}</span>
                    <span className="rounded-full bg-acento-fundo px-2 py-0.5 text-xs font-semibold text-acento">
                      Nível {licao.nivel}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
