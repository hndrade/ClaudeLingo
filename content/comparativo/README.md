# Como revalidar a trilha Comparativo de IAs

Esta trilha (T8) fala sobre preço, janela de contexto e capacidade de modelos de 5 fornecedores.
Isso muda rápido: uma lição verificada hoje pode estar errada em 3 meses.

## Regra do projeto

Toda lição desta trilha tem `verificado_em` (data) e `fontes` (URLs oficiais) no JSON.
Nenhum número de preço, contexto ou capacidade deve vir da memória de quem escreve o conteúdo:
sempre pesquisar na documentação oficial do fornecedor antes de editar.

## Onde checar cada fornecedor

- **Claude (Anthropic)**: `platform.claude.com/docs/en/about-claude/models/overview`
- **GPT (OpenAI)**: `developers.openai.com/api/docs/pricing` e `developers.openai.com/api/docs/models`
- **Gemini (Google)**: `cloud.google.com/vertex-ai/generative-ai/pricing` e `ai.google.dev/gemini-api/docs/gemini-3`
- **Llama (Meta)**: `llama.com/models/llama-4/` e a licença em `github.com/meta-llama/llama-models`
- **Ollama (local)**: `github.com/ollama/ollama`

## Como revalidar uma lição

1. Abra o JSON da lição em `content/trilhas/comparativo/`.
2. Para cada fato citado (preço, contexto, licença, capacidade), acesse a fonte listada em `fontes` e confirme se ainda é verdade.
3. Se mudou: atualize o texto da lição, atualize a URL em `fontes` se necessário, e atualize `verificado_em` para a data de hoje.
4. Se não mudou: só atualize `verificado_em` para a data de hoje.
5. Rode `npm run check-stale` para confirmar que a lição saiu da lista de desatualizadas.
6. Rode `npm test` para garantir que o schema e as regras de conteúdo continuam válidas.

## Sites terceiros não são fonte

Durante a pesquisa desta trilha, buscas simples devolveram vários agregadores de preço com números
divergentes entre si. Não confie neles: vá direto à documentação oficial do fornecedor, mesmo que
seja mais lento.
