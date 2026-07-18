# ClaudeLingo

App pessoal de aprendizado gamificado (estilo Duolingo) sobre IA aplicada, com foco em Claude e no ecossistema Anthropic. Single-player, local, sem auth e sem deploy.

## Rodar

```bash
npm install
npm run dev
```

## Estrutura

```
app/                    rotas Next.js (App Router)
components/             LessonPlayer e renderizadores de exercício
lib/                    schema Zod das lições e loader de conteúdo
content/trilhas/        lições em JSON, uma pasta por trilha + indice.json
```

Trilha nova = criar os JSONs da lição e registrar em `content/trilhas/indice.json`. Nenhum componente precisa mudar.

## Decisões registradas

- Níveis 4 e 5 (texto livre): opção A da spec, rubrica + prompt de referência + autoavaliação por checklist (acerto = cobrir 80% da rubrica). Sem dependência de API.
- Persistência de progresso: arquivo JSON local (corte do Prisma/SQLite aprovado). Entra na Fase 3.
- Regra dos 80%: nível N+1 destrava com todas as lições do nível N concluídas e acerto agregado dos exercícios do nível N maior ou igual a 80%.

## Log de fases

### Rodada de ajustes pós Fase 1 (concluída)

Pedidos do dono do projeto, implementados fora da ordem original das fases:

- Tema novo: laranja estilo Claude, modo claro (branco e laranja) e modo escuro (preto e laranja) automáticos pelo sistema. Tipografia com a pilha do iOS (SF Pro no Apple, fallbacks no resto).
- Layout também confortável em desktop (conteúdo centrado; o mapa segue vertical).
- Progresso salvo em `data/progresso.json` via `/api/progresso` (XP, streak, lições, minutos por dia, erros, compromisso).
- Onboarding de compromisso: dedicação diária (5, 10 ou 15 min) e melhor horário (manhã, meio do dia, noite).
- Metas e competição consigo mesmo: meta diária de minutos no topo e cartão "Você contra você" (esta semana vs semana passada).
- Notificações do navegador no horário escolhido quando a meta do dia não foi cumprida, mais banner de ausência (2+ dias sem estudar). Limitação honesta: app local sem servidor não notifica com o navegador fechado.
- Linha do tempo estilo Duolingo: caminho vertical com nós por lição (concluída, disponível, bloqueada) e as 9 trilhas do currículo visíveis, com as futuras marcadas como "Em breve".
- Múltipla escolha agora tem sempre 3 alternativas, e as telas de resposta cabem em 375x667 sem scroll antes de responder.
- Repescagem: exercícios errados entram numa fila; acertar na repescagem remove da fila. Atalho no mapa quando há pendências.
- Popup de fim de semana (sábado/domingo, uma vez por dia): aula de reforço ou seguir com a trilha.

Verificação: percurso completo via Playwright em 375x667, modos claro e escuro: onboarding, mapa, lição inteira, popup, repescagem, persistência em disco conferida no JSON.

### Fase 2: motor de progresso com testes (concluída)

Feito:

- Regras puras em `lib/progresso.ts`, cobertas por 21 testes Vitest (`npm test`):
  - XP: soma só na primeira conclusão de cada lição.
  - Streak: incrementa em dias consecutivos, mantém no mesmo dia, reinicia ao pular.
  - Revisão espaçada: erro entra no estágio 0 e vence em 1 dia; acertos avançam para 3, 7 e 21 dias; acertar no último estágio remove da fila; errar volta ao estágio 0.
  - Escada de dificuldade: nível N+1 libera com todas as lições do nível N concluídas e acerto agregado (melhor tentativa por lição) de 80% ou mais.
  - Trilha destrava trilha: libera quando as anteriores com conteúdo foram concluídas; trilhas vazias não bloqueiam.
- Vidas na lição: 5 por sessão, erro custa 1; ao zerar, tela "Suas vidas acabaram" sem salvar a conclusão, com opção de tentar de novo.
- Mapa com cadeados reais: trilha bloqueada trava todos os nós; dentro da trilha, só níveis liberados pela escada ficam disponíveis.
- Repescagem passou a respeitar os vencimentos (com botão "Adiantar revisão" quando nada venceu ainda).

Verificação da fase: `npm test` verde e percurso Playwright em 375x667 cobrindo onboarding, mapa, lição, vidas zeradas e repescagem agendada.

### Fase 1: esqueleto + schema + renderizador de 1 lição (concluída)

Feito:

- Esqueleto Next.js 15 + TypeScript + Tailwind v4 (sem Prisma, sem ESLint por ora).
- Schema Zod dos 7 tipos de exercício (`lib/schema.ts`), com validação de `verificado_em` exigindo `fontes`.
- Loader de conteúdo (`lib/content.ts`) lendo `content/trilhas/`.
- Lição demo real da T4 (`prompt-01-especificidade`, nível 1) cobrindo os 7 tipos.
- LessonPlayer com tela de conceito, barra de progresso, feedback fixo no rodapé (verde/vermelho) e tela final com XP de exibição.
- Renderizadores: escolha única (múltipla escolha e cenário), associação por toque, ordenação por setas, lacuna por chips, comparar prompts com saída esperada por cartão, consertar prompt com edição livre + referência + rubrica.
- Verificado ponta a ponta com Playwright em viewport 375px: percurso completo dos 7 exercícios, sem scroll horizontal em nenhuma tela; layout prompt vs saída esperada funciona empilhado no mobile.

Pendente (fases futuras):

- Motor de progresso (XP real, vidas, streak, escada 80%, revisão espaçada) e testes Vitest (Fase 2).
- Mapa de trilhas, navegação e persistência do progresso (Fase 3).
- Conteúdo das trilhas T1 a T9 (Fases 4 a 10).
- Favicon (404 inofensivo no console).
