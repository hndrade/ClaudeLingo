"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  carregarProgresso,
  errosVencidos,
  hojeLocal,
  licoesConcluidas,
  minutosSemana,
  nivelMaxLiberado,
  salvarProgresso,
  trilhaLiberada,
  type Progresso,
} from "@/lib/progresso";

export type DadosMapa = {
  trilhas: {
    id: string;
    nome: string;
    descricao: string;
    licoes: { id: string; titulo: string; nivel: number; xp: number }[];
  }[];
};

type Estado = "concluida" | "disponivel" | "bloqueada";

type No =
  | { tipo: "licao"; estado: Estado; off: number; licao: { id: string; titulo: string; nivel: number } }
  | { tipo: "embreve"; off: number };

const OFFSETS = [0, -76, 0, 76];

function Circulo({ estado, emBreve }: { estado: Estado; emBreve?: boolean }) {
  const base = "flex h-16 w-16 items-center justify-center rounded-full text-2xl";
  if (estado === "concluida") return <div className={`${base} bg-acento font-bold text-white`}>✓</div>;
  if (estado === "disponivel")
    return <div className={`${base} border-4 border-acento bg-cartao text-acento`}>★</div>;
  return <div className={`${base} bg-tinta/10 text-tinta/40 ${emBreve ? "" : "opacity-80"}`}>🔒</div>;
}

function Conector({ off }: { off: number }) {
  return (
    <div
      className="mx-auto h-6 w-0 border-l-2 border-dashed border-tinta/20"
      style={{ transform: `translateX(${off}px)` }}
    />
  );
}

export default function Mapa({ dados }: { dados: DadosMapa }) {
  const router = useRouter();
  const [progresso, setProgresso] = useState<Progresso | null>(null);
  const [popupReforco, setPopupReforco] = useState(false);
  const [perfil, setPerfil] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { atual } = await (await fetch("/api/perfil")).json();
      if (!atual) {
        router.replace("/login");
        return;
      }
      setPerfil(atual);
      const p = await carregarProgresso();
      if (p.compromisso === null) {
        router.replace("/onboarding");
        return;
      }
      setProgresso(p);
      // Popup de fim de semana: reforço ou seguir com a trilha, uma vez por dia.
      const fimDeSemana = [0, 6].includes(new Date().getDay());
      if (fimDeSemana && p.licoes.length > 0 && p.ultimoPopupReforco !== hojeLocal()) {
        setPopupReforco(true);
        salvarProgresso({ ...p, ultimoPopupReforco: hojeLocal() });
      }
    })();
  }, [router]);

  if (!progresso || !progresso.compromisso) return null;

  function fecharPopup(destino: string | null) {
    setPopupReforco(false);
    if (destino) router.push(destino);
  }

  const concluidas = licoesConcluidas(progresso);
  const minutosHoje = progresso.minutosPorDia[hojeLocal()] ?? 0;
  const metaDia = progresso.compromisso.minutosDia;
  const pctDia = Math.min(100, (minutosHoje / metaDia) * 100);

  const vencidos = errosVencidos(progresso).length;
  const { estaSemana, semanaPassada } = minutosSemana(progresso);
  const maxSemana = Math.max(estaSemana, semanaPassada, 1);
  const naFrente = estaSemana > semanaPassada;
  const frase = naFrente
    ? `Você está ${estaSemana - semanaPassada} min à frente da semana passada`
    : `Faltam ${semanaPassada - estaSemana + 1} min para superar a semana passada`;

  // Nós do caminho, com zigue-zague contínuo entre trilhas. Uma trilha só abre
  // quando as anteriores foram concluídas; dentro dela, a escada de 80% define
  // até que nível as lições ficam disponíveis.
  const idsTrilhas = dados.trilhas.map((t) => ({ id: t.id, licoes: t.licoes.map((l) => l.id) }));
  let idx = 0;
  const trilhas = dados.trilhas.map((t) => {
    const liberada = trilhaLiberada(idsTrilhas, progresso, t.id);
    const niv = nivelMaxLiberado(t.licoes.map(({ id, nivel }) => ({ id, nivel })), progresso);
    const nos: No[] =
      t.licoes.length === 0
        ? [{ tipo: "embreve", off: OFFSETS[idx++ % OFFSETS.length] }]
        : t.licoes.map((l) => {
            let estado: Estado = "bloqueada";
            if (liberada && concluidas.has(l.id)) estado = "concluida";
            else if (liberada && l.nivel <= niv) estado = "disponivel";
            return { tipo: "licao", estado, off: OFFSETS[idx++ % OFFSETS.length], licao: l };
          });
    return { ...t, liberada, nos };
  });

  return (
    <div className="min-h-screen bg-papel">
      <header className="sticky top-0 z-10 border-b border-tinta/10 bg-papel px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-tinta">⚡ {progresso.xp} XP</span>
            <Link href="/login" className="text-xs font-semibold text-tinta/60">
              👤 {perfil}
            </Link>
            <span className="text-sm font-bold text-tinta">
              🔥 {progresso.streak.atual} {progresso.streak.atual === 1 ? "dia" : "dias"}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-tinta/10">
              <div className="h-full rounded-full bg-acento" style={{ width: `${pctDia}%` }} />
            </div>
            <span className="text-xs font-medium text-tinta/70">
              hoje: {minutosHoje} de {metaDia} min
            </span>
          </div>
        </div>
      </header>

      {popupReforco && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-tinta/50 px-6">
          <div className="w-full max-w-sm rounded-2xl border border-tinta/10 bg-papel p-5">
            <h2 className="text-lg font-bold text-tinta">Fim de semana!</h2>
            <p className="mt-1 text-sm text-tinta/70">
              Quer fazer uma aula de reforço sobre o que já estudou, ou seguir com a trilha?
            </p>
            <button
              type="button"
              onClick={() => fecharPopup(progresso.erros.length > 0 ? "/repescagem" : `/licao/${progresso.licoes[progresso.licoes.length - 1].id}`)}
              className="mt-4 w-full rounded-xl bg-acento py-3 font-semibold text-white"
            >
              Aula de reforço
            </button>
            <button
              type="button"
              onClick={() => fecharPopup(null)}
              className="mt-2 w-full rounded-xl border border-tinta/15 bg-cartao py-3 font-semibold text-tinta"
            >
              Seguir com a trilha
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-md px-4 py-6 pb-16">
        {vencidos > 0 ? (
          <Link
            href="/repescagem"
            className="mb-4 flex items-center justify-between rounded-xl border border-acento/40 bg-acento-fundo px-4 py-3"
          >
            <span className="font-semibold text-acento">Repescagem: repita o que errou</span>
            <span className="rounded-full bg-acento px-2 py-0.5 text-xs font-bold text-white">
              {vencidos}
            </span>
          </Link>
        ) : progresso.erros.length > 0 ? (
          <div className="mb-4 rounded-xl border border-tinta/10 bg-cartao px-4 py-3 text-sm text-tinta/60">
            Revisão agendada: {progresso.erros.length}{" "}
            {progresso.erros.length === 1 ? "exercício volta" : "exercícios voltam"} em breve
          </div>
        ) : null}
        <section className="rounded-xl border border-tinta/10 bg-cartao p-4">
          <h2 className="font-bold text-tinta">Você contra você</h2>
          <div className="mt-3 space-y-2">
            {[
              { rotulo: "Esta semana", min: estaSemana, cor: "bg-acento" },
              { rotulo: "Semana passada", min: semanaPassada, cor: "bg-tinta/30" },
            ].map((b) => (
              <div key={b.rotulo}>
                <div className="flex justify-between text-xs text-tinta/70">
                  <span>{b.rotulo}</span>
                  <span>{b.min} min</span>
                </div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-tinta/10">
                  <div className={`h-full rounded-full ${b.cor}`} style={{ width: `${(b.min / maxSemana) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm font-medium text-acento">{frase}</p>
        </section>

        {trilhas.map((t) => (
          <section key={t.id} className="mt-8">
            <div className="rounded-xl border border-tinta/10 bg-cartao px-4 py-3 text-center">
              <h2 className="font-bold text-tinta">{t.nome}</h2>
              <p className="mt-0.5 text-sm text-tinta/70">{t.descricao}</p>
            </div>

            <div className="mt-4">
              {t.nos.map((no, i) => {
                const anterior = i > 0 ? t.nos[i - 1] : null;
                return (
                  <div key={no.tipo === "licao" ? no.licao.id : `${t.id}-embreve`}>
                    {anterior && <Conector off={(anterior.off + no.off) / 2} />}
                    <div className="flex justify-center">
                      <div className="flex w-36 flex-col items-center" style={{ transform: `translateX(${no.off}px)` }}>
                        {no.tipo === "embreve" ? (
                          <>
                            <Circulo estado="bloqueada" emBreve />
                            <span className="mt-2 text-xs font-medium text-tinta/50">Em breve</span>
                          </>
                        ) : no.estado === "disponivel" ? (
                          <Link href={`/licao/${no.licao.id}`} className="flex flex-col items-center">
                            <Circulo estado="disponivel" />
                            <span className="mt-2 text-center text-xs font-semibold text-tinta">
                              {no.licao.titulo}
                            </span>
                            <span className="mt-1 rounded-full bg-acento-fundo px-2 py-0.5 text-[11px] font-semibold text-acento">
                              Nível {no.licao.nivel}
                            </span>
                          </Link>
                        ) : (
                          <>
                            <Circulo estado={no.estado} />
                            <span
                              className={`mt-2 text-center text-xs font-semibold ${
                                no.estado === "concluida" ? "text-tinta" : "text-tinta/50"
                              }`}
                            >
                              {no.licao.titulo}
                            </span>
                            <span
                              className="mt-1 rounded-full bg-tinta/10 px-2 py-0.5 text-[11px] font-semibold text-tinta/60"
                              title={
                                t.liberada && no.estado === "bloqueada"
                                  ? "Acerte 80% do nível anterior para liberar"
                                  : undefined
                              }
                            >
                              Nível {no.licao.nivel}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
