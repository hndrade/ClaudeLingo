// Modelo de progresso do usuário (single-player, salvo em data/progresso.json
// via /api/progresso). Funções puras para facilitar os testes da Fase 2.

export type Periodo = "manha" | "meiodia" | "noite";

export type Compromisso = {
  minutosDia: 5 | 10 | 15;
  periodo: Periodo;
};

export type LicaoConcluida = {
  id: string;
  acertos: number;
  total: number;
  xp: number;
  data: string; // YYYY-MM-DD local
};

export type Progresso = {
  xp: number;
  streak: { atual: number; ultimaSessao: string | null };
  compromisso: Compromisso | null;
  licoes: LicaoConcluida[]; // histórico; a mesma lição pode aparecer mais de uma vez
  minutosPorDia: Record<string, number>;
  ultimaNotificacao: string | null; // data da última notificação de ausência
  // Exercícios errados aguardando repescagem (removidos quando acertados lá).
  erros: { licao: string; exercicio: number; data: string }[];
  ultimoPopupReforco: string | null; // data do último popup de fim de semana
};

export const progressoVazio: Progresso = {
  xp: 0,
  streak: { atual: 0, ultimaSessao: null },
  compromisso: null,
  licoes: [],
  minutosPorDia: {},
  ultimaNotificacao: null,
  erros: [],
  ultimoPopupReforco: null,
};

export function hojeLocal(agora = new Date()): string {
  const d = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
}

function diasEntre(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

// Registra uma conclusão de lição: XP só na primeira conclusão daquela lição,
// streak sobe se a última sessão foi ontem, reinicia se foi antes disso.
export function concluirLicao(
  p: Progresso,
  resultado: { id: string; acertos: number; total: number; xp: number },
  minutos: number,
  hoje = hojeLocal()
): Progresso {
  const primeiraVez = !p.licoes.some((l) => l.id === resultado.id);
  const ultima = p.streak.ultimaSessao;
  const atual =
    ultima === hoje ? p.streak.atual : ultima && diasEntre(ultima, hoje) === 1 ? p.streak.atual + 1 : 1;
  return {
    ...p,
    xp: p.xp + (primeiraVez ? resultado.xp : 0),
    streak: { atual, ultimaSessao: hoje },
    licoes: [...p.licoes, { ...resultado, data: hoje }],
    minutosPorDia: { ...p.minutosPorDia, [hoje]: (p.minutosPorDia[hoje] ?? 0) + minutos },
  };
}

// Registra os exercícios errados de uma lição para a repescagem (sem duplicar).
export function registrarErros(p: Progresso, licao: string, indices: number[], hoje = hojeLocal()): Progresso {
  const novos = indices
    .filter((i) => !p.erros.some((e) => e.licao === licao && e.exercicio === i))
    .map((i) => ({ licao, exercicio: i, data: hoje }));
  return { ...p, erros: [...p.erros, ...novos] };
}

// Remove um erro da fila quando o usuário acerta na repescagem.
export function resolverErro(p: Progresso, licao: string, exercicio: number): Progresso {
  return { ...p, erros: p.erros.filter((e) => !(e.licao === licao && e.exercicio === exercicio)) };
}

export function licoesConcluidas(p: Progresso): Set<string> {
  return new Set(p.licoes.map((l) => l.id));
}

// Minutos estudados nos últimos 7 dias e nos 7 anteriores (competição consigo mesmo).
export function minutosSemana(p: Progresso, hoje = hojeLocal()): { estaSemana: number; semanaPassada: number } {
  let estaSemana = 0;
  let semanaPassada = 0;
  for (const [data, min] of Object.entries(p.minutosPorDia)) {
    const d = diasEntre(data, hoje);
    if (d >= 0 && d < 7) estaSemana += min;
    else if (d >= 7 && d < 14) semanaPassada += min;
  }
  return { estaSemana, semanaPassada };
}

export async function carregarProgresso(): Promise<Progresso> {
  const r = await fetch("/api/progresso");
  return r.json();
}

export async function salvarProgresso(p: Progresso): Promise<void> {
  await fetch("/api/progresso", { method: "PUT", body: JSON.stringify(p) });
}
