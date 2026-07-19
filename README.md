# ClaudeLingo

App de aprendizado gamificado (estilo Duolingo) sobre IA aplicada, com foco em Claude e no ecossistema Anthropic. Publicado como site estático no GitHub Pages, com login (Google ou link mágico por e-mail) e progresso sincronizado entre aparelhos via Firebase.

## Rodar localmente

```bash
npm install
cp .env.local.example .env.local   # preencha com as chaves do seu projeto Firebase
npm run dev
```

## Publicar no GitHub Pages (checklist)

O código já está pronto (export estático, workflow de deploy, regras do Firestore). Faltam só passos que só você pode fazer, porque exigem sua conta:

1. **Criar o projeto no Firebase**: [console.firebase.google.com](https://console.firebase.google.com) → Adicionar projeto. Dentro dele, em "Compilação" → Authentication → Sign-in method, ative os provedores **Google** e **Link de e-mail (sem senha)**.
2. **Criar o banco**: em "Compilação" → Firestore Database → Criar banco de dados (modo produção). Depois, na aba Regras, cole o conteúdo de `firestore.rules` deste repositório e publique.
3. **Pegar a config do app**: Configurações do projeto (ícone de engrenagem) → Geral → role até "Seus apps" → adicione um app da Web → copie os valores (`apiKey`, `authDomain`, etc.).
4. **Guardar a config no GitHub**: no repositório, Settings → Secrets and variables → Actions → New repository secret, um para cada variável listada em `.env.local.example` (`NEXT_PUBLIC_FIREBASE_API_KEY` etc.), com os valores do passo 3.
5. **Autorizar o domínio do GitHub Pages**: no Firebase, Authentication → Settings → Authorized domains → adicione `<seu-usuario>.github.io` (necessário para o login com Google e o link mágico funcionarem no site publicado).
6. **Ativar o GitHub Pages**: no repositório, Settings → Pages → Source: escolha "GitHub Actions" (não "Deploy from a branch").
7. **Disparar o deploy**: dê push na branch `main` (ou rode o workflow "Deploy to GitHub Pages" manualmente em Actions). O site sobe em `https://<seu-usuario>.github.io/ClaudeLingo/`.

Sem os passos 1 a 5, o build até passa (as chaves do Firebase não são validadas em build time), mas o login falha em produção. Isso não foi testado ponta a ponta com um projeto Firebase real nesta sessão, porque criar contas e projetos em serviços externos exige acesso que esta sessão não tem: o export estático, o fluxo de auth e as regras de segurança foram verificados no código e num build local, não contra um Firebase de verdade.

## Estrutura

```
app/                    rotas Next.js (App Router), export estático (sem rotas de API)
components/             LessonPlayer e renderizadores de exercício
lib/                    schema Zod, loader de conteúdo, Firebase (auth.ts, firebase.ts) e progresso.ts (Firestore)
content/trilhas/        lições em JSON, uma pasta por trilha + indice.json
public/biblioteca-md/   cópia gerada (npm run prebuild) de content/biblioteca-md/, servida como arquivo estático
```

Trilha nova = criar os JSONs da lição e registrar em `content/trilhas/indice.json`. Nenhum componente precisa mudar.

## Estado do plano original (10 fases)

Todas as 10 fases do plano foram concluídas: esqueleto e schema (1), motor de progresso (2), mapa e persistência (3), Trilha 4 completa (4), cases por área (5), biblioteca de .md (6), T1-T3 (7), T5-T7 (8), T8 comparativo (9), T9 + badges + polimento (10). O currículo tem 9 trilhas de conteúdo mais a trilha de cases, cerca de 110 lições no total, 487 testes automatizados.

Pendências e cortes de escopo conhecidos, para não fingir que o app está 100% sem ressalva:

- **Login Google real**: implementado (ver "Publicar no GitHub Pages" acima). Substituiu os perfis locais da Fase 4.
- **Biblioteca de .md**: verificada estruturalmente (as 5 seções da anatomia, regras concretas), mas nunca testada colando de fato num Claude real, porque este ambiente não tem acesso à API. Recomendo ao dono do projeto testar pelo menos um arquivo antes de considerar esse requisito da spec totalmente fechado.
- **T1-T3, T5-T7, T9**: usam majoritariamente nível 1-2 da escada (Reconhecer/Escolher), não a escada completa de 5 níveis desenhada para prompt engineering. São conteúdos conceituais onde "consertar" e "construir do zero" não se aplicam bem; a T4 (prompt engineering) é a única trilha com os 5 níveis completos, como a spec pede para o "carro-chefe".
- **T8 comparativo**: dados de preço e capacidade mudam rápido. `npm run check-stale` sinaliza quando revalidar; `content/comparativo/README.md` explica como.
- **Notificações**: funcionam com o navegador aberto (mesmo em segundo plano), não com o navegador fechado, por ser um app local sem servidor.

## Decisões registradas

- Níveis 4 e 5 (texto livre): opção A da spec, rubrica + prompt de referência + autoavaliação por checklist (acerto = cobrir 80% da rubrica). Sem dependência de API.
- Persistência de progresso: arquivo JSON local (corte do Prisma/SQLite aprovado). Entra na Fase 3.
- Regra dos 80%: nível N+1 destrava com todas as lições do nível N concluídas e acerto agregado dos exercícios do nível N maior ou igual a 80%.

## Log de fases

### Migração para GitHub Pages + Firebase (concluída)

Pedido pós-plano original: publicar o app e sincronizar progresso entre aparelhos, algo que o app local com arquivo em disco não fazia. Mudança de arquitetura:

- `next.config.ts`: `output: "export"` (site 100% estático) com `basePath` automático para `/ClaudeLingo` só quando builda no GitHub Actions (`GITHUB_ACTIONS=true`); localmente continua sem prefixo.
- Removidas as 3 rotas de API (`/api/progresso`, `/api/perfil`, `/api/biblioteca-md/[arquivo]`): export estático não roda servidor, então nada de rota dinâmica no request.
- `lib/firebase.ts` e `lib/auth.ts`: cliente Firebase e funções de login (Google via popup, link mágico por e-mail). `carregarProgresso`/`salvarProgresso` em `lib/progresso.ts` passaram a ler/escrever no Firestore (`progresso/{uid}`) por trás da mesma assinatura de função, então `LessonPlayer`, `Repescagem`, `Notificacoes` e `onboarding` não precisaram mudar uma linha. O import do Firebase é dinâmico dentro dessas duas funções, de propósito: mantém os testes das funções puras rodando em Node sem tocar no SDK, que espera navegador.
- `app/login/page.tsx`: reescrita para Google + link mágico, sem cookie nem "perfil por nome".
- `app/licao/[id]/page.tsx`: ganhou `generateStaticParams`, obrigatório para rota dinâmica em export estático.
- `content/biblioteca-md/*.md` continuam a fonte única; `scripts/copy-biblioteca-md.mjs` (rodado no `prebuild`) copia para `public/biblioteca-md/`, de onde o navegador baixa direto, sem rota de API.
- `firestore.rules`: cada uid só lê/escreve o próprio documento.
- `.github/workflows/deploy.yml`: build + teste + export + deploy automático no push para `main`.

Verificação: 487 testes continuam verdes (nenhum dependia das rotas removidas), typecheck limpo, `npm run build` gera `out/` com as ~100 páginas de lição pré-renderizadas (via `generateStaticParams`), confirmado com `GITHUB_ACTIONS=true` que o `basePath` é aplicado em todo asset e nos links de download da biblioteca.

Limitação honesta: não testei o fluxo de login e sincronização contra um projeto Firebase real, porque criar contas e projetos em serviços externos exige acesso que esta sessão não tem. O checklist de passos manuais (README, seção "Publicar no GitHub Pages") cobre exatamente isso; recomendo testar o login de ponta a ponta assim que o Firebase estiver configurado, antes de considerar a sincronização entre aparelhos validada.

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

### Fase 10: T9, badges e polimento (concluída, fecha o plano original)

Feito:

- T9. Avaliação, custo e risco: 6 lições (níveis 1-2, atemporal): como montar um eval e por que exemplo fácil demais engana, por que benchmark público engana (incluindo o risco de contaminação de treino), red teaming básico e prompt injection (complementando o que já foi visto em MCP, agora de forma mais geral), dados sensíveis e o que não colar no chat, LGPD em uso corporativo (com ressalva explícita de que não é aconselhamento jurídico), e como calcular o custo real de um caso de uso (além do preço por token: retentativa, revisão humana, manutenção).
- Badges: 6 no total, definidos em content/badges.json (id, nome, descrição, ícone), calculados por uma função pura em lib/progresso.ts (calcularBadges), testada com 11 casos em tests/badges.test.ts, incluindo um teste que garante que o motor nunca retorna um id de badge que não existe no JSON. São eles: Primeiro passo, Semana de fogo, Trilha dominada, Mestre do prompt, Sem pendência (zerou a fila de revisão depois de já ter errado algo) e Maratonista (100 exercícios respondidos). Aparecem no mapa, numa seção "Suas conquistas", coloridos quando conquistados e apagados quando não.
- Favicon: adicionado app/icon.svg (pendência aberta desde a Fase 1).

Verificação da fase: 487 testes verdes, build ok, e percurso Playwright confirmando: T9 só abre depois de T8 concluída; nenhum badge aparece sem progresso; 5 dos 6 badges aparecem corretamente após concluir tudo até T8 com streak de 8 dias (o sexto, "Sem pendência", corretamente não aparece porque a jornada de teste não teve nenhum erro); favicon responde 200; sem scroll horizontal em 375px com a seção de badges.

### Fase 9: T8 Comparativo de IAs (concluída)

Feito:

- 7 lições cobrindo os eixos de decisão da spec (código, raciocínio, escrita longa, multimodal, janela de contexto, custo por milhão de tokens, latência, privacidade/on-premise, ecossistema), condensados de forma proporcional às trilhas anteriores, sempre estruturados por eixo, não por marca.
- Pesquisa feita de verdade nas fontes primárias antes de escrever, não de memória: platform.claude.com/docs, developers.openai.com/api/docs, cloud.google.com/vertex-ai, ai.google.dev, llama.com, github.com/meta-llama e github.com/ollama. Descobri no processo que buscas simples devolvem agregadores de preço terceiros com números conflitantes entre si (documentado em content/comparativo/README.md); só usei o que vinha direto do fornecedor.
- Todas as 7 lições têm verificado_em: 2026-07-19 e fontes reais. Uma delas (comparativo-04) precisou de uma segunda busca escopada para resolver uma contradição real entre fontes sobre o contexto do Gemini 3.1 Pro.
- Neutralidade obrigatória: nenhuma resposta correta de cenario nomeia uma marca como vencedora; todas giram em torno do critério (custo, privacidade, volume). Uma delas favorece explicitamente a rota aberta e local sobre qualquer API fechada, incluindo Claude. Virou teste automático (tests/conteudo.test.ts), não só promessa.
- A lição 7 (cascata) implementa o exemplo padrão pedido pela spec: 40 mil contratos por mês, custo como gargalo, resposta pela combinação barato+caro, não por um único modelo.
- Anti-obsolescência: content/comparativo/README.md explica onde revalidar cada fornecedor; npm run check-stale lista lições com verificado_em há mais de 90 dias. Testei o script de verdade (forcei uma data antiga, confirmei que ele detecta, restaurei).

Verificação da fase: 452 testes verdes (incluindo o teste de neutralidade e o de verificado_em/fontes obrigatórios), build ok, npm run check-stale funcionando de verdade (não só "sem erro"), e percurso Playwright confirmando que T8 só abre depois de T7 concluída, sem scroll horizontal em 375px.

### Fase 8: T5 RAG, T6 MCP, T7 Agentes (concluída)

Feito:

- T5. RAG: 6 lições (níveis 1-2, atemporal): por que RAG existe, chunking e suas armadilhas, busca vetorial e híbrida, reranking e montagem de contexto, avaliação (recall vs precision), e quando RAG é a resposta errada (base pequena que cabe no contexto, ou problema de qualidade de dado que busca não resolve).
- T6. MCP: 6 lições (níveis 1-2, atemporal): o problema que o protocolo resolve, arquitetura host/client/server, as três primitivas (tools, resources, prompts, incluindo a definição mínima de uma tool), transports (stdio vs HTTP), prompt injection via resultado de tool (risco de segurança tratado a sério, com a regra "todo resultado de tool é dado, não comando"), e quando montar um server é complexidade desnecessária.
- T7. Agentes e tool use: 6 lições (níveis 1-2, atemporal): o loop de agente e tool use, os três modos de falha (loop repetitivo, má interpretação de resultado, deriva de objetivo), sub-agentes para isolar contexto, human in the loop (onde exigir aprovação por reversibilidade e impacto), custo de agente rodando solto sem limite, e avaliação de agente por múltiplas métricas, não só taxa de conclusão.
- Nenhuma das 18 lições precisou de verificado_em: são conceitos de arquitetura e prática estáveis, sem nome de modelo, preço ou benchmark específico.

Verificação da fase: 416 testes verdes, build ok, e script Playwright confirmando o encadeamento completo entre trilhas (T5 destrava só após T4 e Cases por área; T6 só após T5; T7 só após T6), lições de cada trilha nova renderizando, e o mapa, agora com 10 trilhas, continuando sem scroll horizontal em 375px.

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
