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
