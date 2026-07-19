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

### Fase 7: T1, T2, T3 (concluída)

Feito:

- T1. Fundamentos de IA: 6 lições (nível 1, conteúdo atemporal, sem verificado_em): machine learning, redes neurais, transformer, tokens, embeddings, treino/inferência/data de corte.
- T2. LLM 101: 6 lições (nível 1, atemporal): janela de contexto, temperatura e determinismo, alucinação, custo por token, latência e streaming, o que o modelo não sabe sobre si mesmo. Onde um preço aparece, está marcado como fictício, sem citar valor real de mercado.
- T3. Claude 101: 5 lições (níveis 1-2), com verificado_em: 2026-07-19 e fontes reais pesquisadas nas fontes primárias da Anthropic: família de modelos (platform.claude.com/docs, tabela oficial de modelos e preços), Projects e Artifacts (anthropic.com/news/projects, support.claude.com), Skills (platform.claude.com/docs, arquitetura de carregamento em camadas), Claude Code e Cowork (code.claude.com/docs, anthropic.com/product/claude-cowork), e quando NÃO usar Claude (sem fonte: é julgamento pedagógico, não fato datável).
- Escada de trilhas passou a valer de verdade: como T1, T2 e T3 agora têm conteúdo, a trilha T4 (prompt engineering) fica bloqueada até as três anteriores serem concluídas, seguindo a regra "trilha destrava trilha" da spec. Isso muda o comportamento em runtime (verificado em teste), sem exigir nenhuma mudança de código no motor de progresso, que já suportava a regra desde a Fase 2.

Verificação da fase: 344 testes verdes, build ok, e um script Playwright que confirma o novo bloqueio (T4 inacessível sem T1-T3, abre depois de concluídas) e que o mapa, agora bem mais longo, continua sem scroll horizontal e sem erro de página em 375px.

Decisão de escopo registrada: para T1-T3 usei majoritariamente nível 1 (Reconhecer) com um pouco de nível 2 em T3, em vez de forçar a escada completa de 5 níveis (Reconhecer a Sistematizar) elaborada para prompt engineering. Esses conteúdos são conceituais, não de construção de prompt, então "consertar" e "construir do zero" não se aplicam bem; achei que forçar a escada completa aqui seria abstração superdimensionada para o tipo de conteúdo. Detalhado em NOTAS.md.

### Fase 6: bloco 4D + biblioteca de .md baixável (concluída)

Feito:

- 5 lições novas na trilha "prompt", nível 5 (Sistematizar): por que um .md vale mais que repetir prompt, anatomia de um bom .md (contexto, regras duras, exemplos, formato de saída, o que não fazer), instrução de projeto vs system prompt vs Skill, como testar um .md (rodar 3 vezes e checar estabilidade), e como versionar quando a saída degrada.
- content/biblioteca-md/ com 8 arquivos .md reais, um por área de trabalho (financeiro, comercial, RH, jurídico, marketing, operações, dados, atendimento), cada um seguindo as 5 seções da anatomia ensinada na Fase 6, com regras duras concretas (ex: jurídico nunca conclui parecer, dados nunca afirma valor sem ter rodado, atendimento nunca responde caso sensível sozinho).
- Download pela interface: rota /api/biblioteca-md/[arquivo] serve o .md como anexo (com validação de nome de arquivo contra path traversal), e a página /biblioteca lista os 8 com botão de baixar. A tela de conclusão de qualquer lição de nível 5 da trilha prompt mostra um link direto para a biblioteca.
- Teste de estrutura (tests/biblioteca-md.test.ts): garante 6 a 8 arquivos, as 5 seções obrigatórias em cada um, tamanho mínimo (não decorativo) e ausência de travessão. Suíte total: 276 testes verdes.

Verificação da fase: build ok, rota de download testada (headers corretos, path traversal bloqueado, 404 para arquivo inexistente), percurso Playwright login → lição de nível 5 → link de biblioteca → 8 downloads listados, sem scroll horizontal em 375px.

Limitação honesta: não tenho acesso a chamar a API da Claude neste ambiente para validar de fato colando os .md num Claude real. A verificação foi estrutural (as 5 seções, regras duras concretas e verificáveis, exemplos bom/ruim). Recomendo ao dono do projeto colar pelo menos um arquivo num Claude real antes de considerar o requisito "funcionam de verdade" fechado.

### Fase 5: Cases por área (concluída)

Feito:

- Trilha "Cases por área" com 24 lições: 8 áreas (financeiro, comercial, RH, jurídico, marketing, operações, dados, atendimento), cada uma com um personagem recorrente (Jorge, Beatriz, Carla, Henrique, Rafael, Sônia, Lucas, Paula) nos níveis 2, 3 e 4, o mesmo problema ficando mais cru a cada nível.
- Regra de honestidade cumprida: cada área tem exatamente um case cuja resposta certa é não usar IA ou usar de forma limitada, marcado com o campo nao_usar_ia no JSON e verificado por teste. Exemplos: conciliação sem rastreabilidade (Jorge), triagem de currículo (Carla), parecer de risco jurídico (Henrique), roteirização que é trabalho de solver (Sônia), rodar SQL gerado às cegas (Lucas), escalonar caso sensível (Paula).
- Schema ganhou o campo opcional nao_usar_ia; o teste de conteúdo passou a exigir cobertura de níveis 2 a 4 e ao menos um case nao_usar_ia por área. Suíte total: 223 testes verdes.

Verificação da fase: testes cobrindo cobertura por área e a marca nao_usar_ia, mais checagem visual do mapa (trilha nova visível) e de um case renderizando em 375px.

Nota de processo: a escrita foi tentada com subagentes em duas ondas; o limite de sessão da conta interrompeu a maioria no meio, então parte das 24 lições foi escrita direto pelo orquestrador. Registrado em NOTAS.md.

### Fase 4: Trilha 4 completa + login por perfis (concluída)

Feito:

- 22 lições na T4: as 12 boas práticas (4A), os 9 prompts de efeito (4B) e um capstone de construção, distribuídas na escada: 4 lições nível 1, 7 nível 2, 8 nível 3, 3 nível 4. Toda lição de prompt traz saídas esperadas (4C) nos comparar_prompts e consertar_prompt.
- Teste de validação de conteúdo (tests/conteudo.test.ts): schema, id, conceito até 6 linhas, sem travessão, contagens de alternativas. Suíte total: 111 testes verdes.
- Login por perfis: /login com "Continuar como visitante", contas locais nomeadas (um arquivo de progresso por perfil em data/) e troca de conta pelo topo do mapa. Botão "Entrar com Google" visível e desabilitado: OAuth real exige credenciais e servidor; num app local as contas nomeadas cumprem o papel de salvar progresso por pessoa.
- NOTAS.md: caderno de trabalho curto com decisões e pendências.

Verificação da fase: escada conferida por script no mapa (nível 1 com 4 disponíveis; concluir nível N destrava exatamente as lições do nível N+1: 7, depois 8, depois 3) e percurso completo login → onboarding → lição → repescagem sem falhas.

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
