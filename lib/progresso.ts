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
  // Exercícios errados na fila de revisão espaçada. "data" é a data da última
  // resposta; o item vence em data + INTERVALOS_REVISAO[estagio] dias.
  erros: ErroRevisao[];
  ultimoPopupReforco: string | null; // data do último popup de fim de semana
};

export type ErroRevisao = { licao: string; exercicio: number; data: string; estagio: number };

export const VIDAS_POR_SESSAO = 5;
export const INTERVALOS_REVISAO = [1, 3, 7, 21]; // dias até a próxima revisão, por estágio
export const TAXA_LIBERACAO = 0.8; // acerto agregado mínimo para liberar o nível seguinte

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

// Registra os exercícios errados de uma lição na fila de revisão (sem duplicar;
// errar de novo um item que já está na fila reinicia a contagem do estágio dele).
export function registrarErros(p: Progresso, licao: string, indices: number[], hoje = hojeLocal()): Progresso {
  const erros = p.erros.map((e) =>
    e.licao === licao && indices.includes(e.exercicio) ? { ...e, data: hoje } : e
  );
  const novos = indices
    .filter((i) => !p.erros.some((e) => e.licao === licao && e.exercicio === i))
    .map((i) => ({ licao, exercicio: i, data: hoje, estagio: 0 }));
  return { ...p, erros: [...erros, ...novos] };
}

// Itens da fila já vencidos (prontos para revisar) na data de hoje.
export function errosVencidos(p: Progresso, hoje = hojeLocal()): ErroRevisao[] {
  return p.erros.filter((e) => diasEntre(e.data, hoje) >= INTERVALOS_REVISAO[e.estagio ?? 0]);
}

// Acertou na repescagem: avança o estágio; após o último intervalo (21 dias), sai da fila.
export function acertarRevisao(p: Progresso, licao: string, exercicio: number, hoje = hojeLocal()): Progresso {
  return {
    ...p,
    erros: p.erros.flatMap((e) => {
      if (e.licao !== licao || e.exercicio !== exercicio) return [e];
      const estagio = (e.estagio ?? 0) + 1;
      return estagio >= INTERVALOS_REVISAO.length ? [] : [{ ...e, estagio, data: hoje }];
    }),
  };
}

// Errou na repescagem: volta ao estágio inicial e reinicia a contagem.
export function errarRevisao(p: Progresso, licao: string, exercicio: number, hoje = hojeLocal()): Progresso {
  return {
    ...p,
    erros: p.erros.map((e) =>
      e.licao === licao && e.exercicio === exercicio ? { ...e, estagio: 0, data: hoje } : e
    ),
  };
}

export function licoesConcluidas(p: Progresso): Set<string> {
  return new Set(p.licoes.map((l) => l.id));
}

export type LicaoMeta = { id: string; nivel: number };

// Melhor tentativa (maior taxa de acerto) de cada lição concluída.
function melhorTentativa(p: Progresso, id: string): LicaoConcluida | undefined {
  return p.licoes
    .filter((l) => l.id === id)
    .sort((a, b) => b.acertos / b.total - a.acertos / a.total)[0];
}

// Escada de dificuldade: o nível 1 está sempre liberado; o nível N+1 libera quando
// todas as lições de nível N da trilha foram concluídas e o acerto agregado
// (melhor tentativa por lição) é de pelo menos 80%.
export function nivelMaxLiberado(metas: LicaoMeta[], p: Progresso): number {
  let liberado = 1;
  for (let nivel = 1; nivel < 5; nivel++) {
    const doNivel = metas.filter((m) => m.nivel === nivel);
    if (doNivel.length === 0) break;
    const tentativas = doNivel.map((m) => melhorTentativa(p, m.id));
    if (tentativas.some((t) => !t)) break;
    const acertos = tentativas.reduce((s, t) => s + (t as LicaoConcluida).acertos, 0);
    const total = tentativas.reduce((s, t) => s + (t as LicaoConcluida).total, 0);
    if (acertos / total < TAXA_LIBERACAO) break;
    liberado = nivel + 1;
  }
  return liberado;
}

// Trilha destrava trilha: uma trilha está liberada quando todas as trilhas
// anteriores COM conteúdo tiveram todas as suas lições concluídas.
export function trilhaLiberada(
  trilhas: { id: string; licoes: string[] }[],
  p: Progresso,
  trilhaId: string
): boolean {
  const feitas = licoesConcluidas(p);
  for (const t of trilhas) {
    if (t.id === trilhaId) return true;
    if (t.licoes.length > 0 && !t.licoes.every((id) => feitas.has(id))) return false;
  }
  return false;
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

export type Badge = { id: string; nome: string; descricao: string; icone: string };

export type TrilhaMeta = { id: string; licoes: string[] };

// Total de exercícios já respondidos (soma do total de cada conclusão de lição no histórico).
function exerciciosRespondidos(p: Progresso): number {
  return p.licoes.reduce((s, l) => s + l.total, 0);
}

// Calcula os ids dos badges conquistados a partir do progresso e da lista de trilhas
// (id + lições) vinda do índice de conteúdo. Função pura, sem acesso a disco ou rede.
export function calcularBadges(p: Progresso, trilhas: TrilhaMeta[]): string[] {
  const feitas = licoesConcluidas(p);
  const conquistados: string[] = [];

  if (feitas.size >= 1) conquistados.push("primeiro-passo");
  if (p.streak.atual >= 7) conquistados.push("semana-de-fogo");
  if (trilhas.some((t) => t.licoes.length > 0 && t.licoes.every((id) => feitas.has(id)))) {
    conquistados.push("trilha-dominada");
  }
  const prompt = trilhas.find((t) => t.id === "prompt");
  if (prompt && prompt.licoes.length > 0 && prompt.licoes.every((id) => feitas.has(id))) {
    conquistados.push("mestre-do-prompt");
  }
  if (p.erros.length === 0 && p.licoes.some((l) => l.acertos < l.total)) {
    conquistados.push("sem-pendencia");
  }
  if (exerciciosRespondidos(p) >= 100) conquistados.push("maratonista");

  return conquistados;
}

export async function carregarProgresso(): Promise<Progresso> {
  const r = await fetch("/api/progresso");
  return r.json();
}

export async function salvarProgresso(p: Progresso): Promise<void> {
  await fetch("/api/progresso", { method: "PUT", body: JSON.stringify(p) });
}
