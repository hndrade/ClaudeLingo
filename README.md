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
