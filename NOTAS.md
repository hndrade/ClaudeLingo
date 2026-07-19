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
