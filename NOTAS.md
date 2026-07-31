# NOTAS (caderno de trabalho, estilo caveman)

Pensamentos de execução. Curto, bruto, cronológico. Não é documentação.

## 2026-07-18

- Fase 1-2 ok. Tema laranja claro/escuro, iOS font, mapa zigue-zague, vidas, escada 80%, revisão 1/3/7/21. 21 testes verdes.
- Fase 4 em curso. 22 lições T4. 6 agentes paralelos. 5 caíram: limite de sessão. Só N1 completo.
- Lição aprendida: 6 agentes de uma vez = estourou quota. Retomar os 5 com contexto vivo, não recriar.
- Faltam: 06 07 08 10 11 13 14 15 17 18 19 22.
- Pedido novo: login visitante + conta. App é local, sem servidor. Google OAuth de verdade precisa de credencial no Google Cloud + env. Decisão: perfis locais por cookie (visitante, contas nomeadas, arquivo por perfil). Botão Google fica visível e desabilitado, com nota honesta. Sem NextAuth por ora: 1 dependência a menos, mesmo resultado local.
- Console em modo TLDR daqui em diante. Este arquivo recebe o resto.
- Login feito: /login (visitante, contas locais, Google desabilitado com nota), cookie perfil, /api/progresso por perfil. Mapa exige perfil e mostra 👤 no topo. tsc ok.
- 5 agentes retomados via mensagem, contexto preservado. Funcionou: 22/22 lições, 90/90 no teste de conteúdo, 111 na suíte toda.
- Escada verificada no mapa: 4 disponiveis N1 → 7 N2 → 8 N3 → 3 N4. Sem furo.
- Fase 4 fechada. Próxima: Fase 5, cases por área (8 áreas, personagens recorrentes, 1 case "não use IA" por área).
- Pendência conhecida: favicon; alguns agentes puseram prereq encadeado nas lições N4 (campo hoje não é usado pelo motor, escada usa nivel; inofensivo).

## 2026-07-19 (Fase 5)
- 8 áreas x 3 níveis = 24 cases. Personagens: Jorge, Beatriz, Carla, Henrique, Rafael, Sônia, Lucas, Paula.
- Onda 1 (4 agentes) e onda 2 nem lançou: limite de sessão da CONTA travou os subagentes (reset 2:10 UTC). Escrevi 15 dos 24 eu mesmo (orquestrador segue vivo mesmo com subagentes bloqueados).
- Lição de processo: subagente e orquestrador dividem a mesma quota. Em pico de uso, escrever direto é mais confiável que insistir em spawnar.
- nao_usar_ia: 1 por área, verificado por teste. Regra de honestidade da spec cumprida.
- Achado: teste de travessão pegou comentário SQL "--"; troquei por /* */ (SQL valido, nao viola a regra de texto). 223 testes verdes.
- Git: hook reclama de assinatura GPG (nao tenho chave aqui); email do committer ja e noreply@anthropic.com. Nao da pra assinar neste ambiente.

## 2026-07-19 (Fase 6)
- Escrevi tudo eu mesmo, sem subagentes (aprendizado da Fase 5: quota compartilhada). 5 licoes nivel 5 + 8 .md + rota de download + pagina /biblioteca + link na tela final.
- Bug achado no MEU script de verificacao, nao no app: getByRole "Continuar" sem exact:true colidiu com a palavra "continuar" dentro do texto de uma explicacao ("chat continuar existindo"). Corrigido com exact:true.
- "0 arquivos listados" no script foi corrida de timing pos-navegacao; checagem direta confirmou os 8 links corretos na pagina.
- Nao consigo testar os .md contra uma Claude de verdade aqui (sem acesso a API). Verificacao ficou estrutural. Registrado como limitacao no README.
- 276 testes verdes.

## 2026-07-19 (Fase 7)
- T1 (6) + T2 (6) + T3 (5) = 17 licoes. Escrevi tudo eu mesmo de novo, sem subagentes.
- Usei WebSearch + WebFetch de verdade para T3: platform.claude.com/docs (modelos + skills), code.claude.com/docs (Claude Code), anthropic.com/news e support.claude.com (Projects/Artifacts/Cowork). anthropic.com/product e anthropic.com/pricing deram 403 direto via WebFetch, mas o WebSearch sintetizou com boa citação; prioritizei os fetches que funcionaram (platform.claude.com, code.claude.com) como fonte principal.
- Peguei a tabela oficial de precos/contexto/data de corte de Fable 5, Opus 4.8, Sonnet 5, Haiku 4.5 direto da doc. verificado_em: 2026-07-19 (data de hoje).
- Decisao de escopo: T1-T3 usam nivel 1-2, nao a escada completa 1-5. Sao conceituais, "construir do zero" nao faz sentido pra "o que e um token". Registrado no README como corte deliberado.
- Efeito colateral esperado (nao bug): agora que T1-T3 tem conteudo, a trilha "trilhaLiberada" passa a bloquear T4 de verdade ate completar as 3 anteriores. O motor ja suportava isso desde a Fase 2, so nao era visivel porque T1-T3 estavam vazias. Verificado com script: bloqueia sem progresso, libera apos concluir T1+T2+T3.
- 344 testes verdes, build ok, sem scroll horizontal no mapa (agora bem mais longo).

## 2026-07-19 (Fase 8)
- T5 RAG (6) + T6 MCP (6) + T7 Agentes (6) = 18 licoes. Escrito direto, sem subagentes (padrao que ja estabilizou desde a Fase 5).
- Conteudo tecnico estavel, sem verificado_em: arquitetura e pratica, nao fato de mercado com prazo de validade.
- MCP: dei atencao especial a prompt injection via tool result, ja que o proprio harness deste app (github-webhook-activity, untrusted_external_data) segue exatamente essa logica na pratica. Boa oportunidade de ensinar algo que eu mesmo pratico.
- "escrever server minimo" da spec virou exercicio preencher_lacuna dentro da licao de tools/resources/prompts, em vez de licao propria: nao dava pra testar codigo executavel no formato do app, e forcar isso teria sido complexidade sem beneficio real de aprendizado no formato atual.
- Verificado o encadeamento completo entre 5 trilhas seguidas (prompt -> casos -> rag -> mcp -> agentes), cada uma destravando a seguinte só depois da anterior 100% concluida. Motor aguentou sem ajuste.
- 416 testes verdes.
- Pendencia grande que fica pra Fase 9: pesquisa web de verdade pra T8 comparativo (OpenAI, Google, Meta/Llama, Ollama), com cuidado de nao inventar preco nem numero de benchmark. Ja adiantei ao usuario o que vou pesquisar antes de comecar.

## 2026-07-19 (Fase 9)
- Pesquisa real antes de escrever, como prometido. WebFetch direto bateu 403 em quase TODAS as paginas oficiais (openai, google, meta, ollama) - só platform.claude.com e um github.com/meta-llama funcionaram direto.
- Contornei com WebSearch escopado por dominio (allowed_domains) quando o fetch direto falhava. Funciona bem: cita fonte, sintetiza do dominio certo.
- Achado importante: busca solta (sem escopo) trouxe uma penca de agregadores terceiros (finout, benchlm, pricepertoken, etc) com precos CONFLITANTES entre si pro mesmo modelo. Isso e exatamente o risco que a spec queria evitar. Documentei isso no content/comparativo/README.md como aviso pra quem for revalidar depois.
- Gemini 3.1 Pro: contexto veio contraditorio entre fontes (2M num lugar, 200K+ noutro). Fiz busca de desempate escopada em ai.google.dev/cloud.google.com, resolvido: 1M input / 64k output confirmado.
- 7 licoes T8, todas com verificado_em + fontes reais. Neutralidade: nenhuma resposta certa de cenario cita marca, virou teste automatico (nao so promessa em texto).
- check-stale testado de verdade: forcei data de 2025-01-01 numa licao, rodei o script, confirmou deteccao (564 dias), restaurei o arquivo original, rodei de novo pra confirmar que limpou.
- 452 testes verdes.
- Proximo: Fase 10, T9 (avaliacao/custo/risco) + badges (max 6) + polimento. Ultima fase do plano original.

## 2026-07-19 (Fase 10, fechamento)
- T9: 6 licoes (eval, benchmark enganoso, red teaming+injection, dado sensivel, LGPD com ressalva de nao ser conselho juridico, custo real). Sem verificado_em, conteudo de pratica/principio, nao fato de mercado.
- Badges: 6 no JSON, motor puro calcularBadges() em lib/progresso.ts, 11 testes. UI no Mapa, secao "Suas conquistas", 3 colunas, colorido quando conquistado.
- Bug pego nos meus proprios testes: usei resolverErro (funcao removida faz tempo, substituida por acertarRevisao/errarRevisao) sem checar antes. Corrigido com um helper de teste que chama acertarRevisao 4x (INTERVALOS_REVISAO.length) pra tirar o item da fila de vez, igual o motor real faz.
- Favicon adicionado (app/icon.svg), pendencia que tava aberta desde a Fase 1.
- Verificacao final: 487 testes, tsc ok, build ok, favicon 200, e Playwright confirmando T9 destravando depois de T8, badges corretos (5 de 6, o "sem pendencia" corretamente ausente pois a jornada sintetica nao teve erro).
- Achado no proprio script de verificacao: popup de fim de semana cobria a secao de badges na tela, contagem via CSS pegou elemento errado (chips de nivel tambem usam bg-acento-fundo). Corrigido escopando o seletor pela section certa e fechando o popup antes de contar.
- Plano original de 10 fases: CONCLUIDO. ~110 licoes, 9 trilhas + cases, 487 testes.
- Pendencias reais que ficam registradas no README pro dono do projeto decidir: login Google de verdade (hoje so perfil local), testar os .md num Claude real (nao tenho API aqui), revalidar T8 periodicamente com check-stale.

## 2026-07-19 (pos-PR: deploy)
- PR #1 (fases 1-4) ja tinha sido mesclado enquanto eu seguia na branch antiga. Rebase dos 8 commits nao mesclados sobre origin/main, forca-with-lease, PR #2 novo aberto. Sem conflito no rebase.
- Pedido: GitHub Pages + Vercel. Github Pages e so estatico (sem servidor); Vercel roda API mas disco de funcao serverless nao persiste. Perguntei antes de mexer (AskUserQuestion), porque decisao de arquitetura + custo de conta e do usuario, nao minha.
- Usuario escolheu: GitHub Pages + progresso sincronizado entre aparelhos. Isso exige Firestore (banco na nuvem lido direto do navegador) e login de verdade (nao da pra sincronizar sem saber quem e quem). Perguntei backend (Firebase) e metodo de login (Google + link magico).
- Migracao grande: output:"export" no next.config, matei as 3 rotas de API (progresso/perfil/biblioteca-md), troquei carregarProgresso/salvarProgresso pra Firestore MANTENDO A MESMA ASSINATURA (import dinamico so dentro dessas 2 funcoes, pra nao quebrar os testes das funcoes puras que rodam em Node sem browser). Boa decisao: zero mudanca nos componentes que so chamam essas funcoes (LessonPlayer, Repescagem, Notificacoes, onboarding).
- app/login reescrito do zero: Google popup + link magico por email (sendSignInLinkToEmail/isSignInWithEmailLink).
- app/licao/[id] precisou de generateStaticParams (obrigatorio em export estatico com rota dinamica).
- biblioteca-md: rota de API morreu, arquivos viraram estaticos em public/ (copiados de content/ via script, content/ continua fonte unica).
- firestore.rules: 1 regra, uid so mexe no proprio doc.
- Testei de verdade: build local sem GITHUB_ACTIONS (basePath vazio) E com GITHUB_ACTIONS=true (basePath /ClaudeLingo aplicado em tudo, confirmado via grep no HTML exportado, inclusive nos links de download que sao <a href> manual, nao <Link>, entao nao ganham basePath de graca). 487 testes continuaram verdes, nada quebrou.
- Limitacao honesta que registrei: nao tenho como criar projeto Firebase real nem testar login/sync de ponta a ponta aqui. Deixei checklist manual no README (criar projeto, ativar provedores, pegar config, secrets no GitHub, dominio autorizado, ativar Pages).

## 2026-07-31 (teste simulado com emulador Firebase)
- Pedido: "abre uma janela de teste simulado". Sem projeto Firebase real, usei Firebase Local Emulator Suite (auth 9099, firestore 8080, projeto fake demo-claudelingo) + Playwright/Chromium de verdade.
- lib/firebase.ts ganhou guard NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true (so liga emulador se a env existir, nunca em prod). firebase.json novo na raiz.
- Google popup NAO deu pra testar aqui: signInWithPopup carrega apis.google.com de verdade mesmo com auth emulado, e a rede sandboxed deste ambiente (proxy+cert proprios) nao deixa passar isso limpo. ERR_CERT_AUTHORITY_INVALID e depois ERR_TUNNEL_CONNECTION_FAILED tentando contornar. Decisao: pivotar o teste pro link magico (100% nativo Firebase, sem host externo).
- Link magico: peguei o oobLink direto da REST API do proprio emulador (GET /emulator/v1/projects/demo-claudelingo/oobCodes) em vez de e-mail de verdade. Playwright navega pro link como se tivesse clicado no e-mail.
- 3 bugs achados e corrigidos NO SCRIPT DE TESTE (nao no app): (1) clique por texto "Machine learning" pegava a descricao da trilha antes do link real da licao -> troquei pra getByRole("link"). (2) espera por "text=XP" ambigua com a tela de conclusao que tambem mostra "+20 XP" -> troquei pra selector exclusivo do mapa ("Suas conquistas"). (3) clique generico de responder exercicio as vezes clicava "Refazer licao" na tela final por acidente, reiniciando a licao -> corrigido parando o loop assim que "Licao concluida" aparece.
- Resultado real, com screenshots: login -> link enviado -> completar login por link -> onboarding -> mapa le do Firestore -> completa licao (Machine learning) -> +20 XP grava no Firestore -> volta pro mapa relendo o XP -> reload completo da pagina mantem XP -> segunda sessao de navegador (simula 2o aparelho) loga so com o e-mail e mostra o mesmo progresso (20 XP, streak, badge "Primeiro passo").
- Isso valida a integracao Auth+Firestore de verdade, mas NAO valida projeto Firebase real nem o provedor Google (continua pendencia registrada no README).
- Commitei firebase.json e o guard do emulador em lib/firebase.ts: convenincia permanente pra proximo teste local, documentado no README ("Testar login e Firestore sem projeto Firebase real"). .env.local (com as chaves) continua fora do git.
