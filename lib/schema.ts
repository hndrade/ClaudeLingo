import { z } from "zod";

const alternativa = z.object({
  texto: z.string(),
  correta: z.boolean().default(false),
  explicacao: z.string(),
});

const multiplaEscolha = z.object({
  tipo: z.literal("multipla_escolha"),
  enunciado: z.string(),
  alternativas: z.array(alternativa).length(3),
});

const associacao = z.object({
  tipo: z.literal("associacao"),
  enunciado: z.string(),
  pares: z.array(z.object({ conceito: z.string(), definicao: z.string() })).min(3),
});

const ordenacao = z.object({
  tipo: z.literal("ordenacao"),
  enunciado: z.string(),
  etapas: z.array(z.string()).min(3),
  explicacao: z.string(),
});

const preencherLacuna = z.object({
  tipo: z.literal("preencher_lacuna"),
  enunciado: z.string(),
  texto: z.string().refine((t) => t.includes("___"), "texto precisa conter a lacuna ___"),
  opcoes: z.array(alternativa).min(3),
});

const cenario = z.object({
  tipo: z.literal("cenario"),
  enunciado: z.string(),
  alternativas: z
    .array(z.object({ texto: z.string(), melhor: z.boolean().default(false), feedback: z.string() }))
    .min(3),
});

const compararPrompts = z.object({
  tipo: z.literal("comparar_prompts"),
  enunciado: z.string(),
  prompts: z
    .array(
      z.object({
        rotulo: z.string(),
        texto: z.string(),
        saida_esperada: z.string(),
        melhor: z.boolean().default(false),
        explicacao: z.string(),
      })
    )
    .min(3)
    .max(4),
});

const consertarPrompt = z.object({
  tipo: z.literal("consertar_prompt"),
  enunciado: z.string(),
  prompt_fraco: z.string(),
  saida_fraca: z.string(),
  prompt_referencia: z.string(),
  saida_referencia: z.string(),
  checklist: z.array(z.string()).min(3),
});

export const exercicioSchema = z.discriminatedUnion("tipo", [
  multiplaEscolha,
  associacao,
  ordenacao,
  preencherLacuna,
  cenario,
  compararPrompts,
  consertarPrompt,
]);

export const licaoSchema = z
  .object({
    id: z.string(),
    trilha: z.string(),
    titulo: z.string(),
    nivel: z.number().int().min(1).max(5),
    area: z.string().optional(),
    prereq: z.array(z.string()).default([]),
    xp: z.number().int().positive(),
    verificado_em: z.string().date().optional(),
    fontes: z.array(z.string().url()).optional(),
    conceito: z.string(),
    // Marca uma lição cujo case conclui que o certo é não usar IA, ou usar de forma limitada.
    nao_usar_ia: z.boolean().optional(),
    exercicios: z.array(exercicioSchema).min(1),
  })
  .refine((l) => !l.verificado_em || (l.fontes && l.fontes.length > 0), {
    message: "licao com verificado_em precisa declarar fontes",
  });

export const indiceSchema = z.object({
  trilhas: z.array(
    z.object({
      id: z.string(),
      nome: z.string(),
      descricao: z.string(),
      licoes: z.array(z.string()),
    })
  ),
});

export type Exercicio = z.infer<typeof exercicioSchema>;
export type Licao = z.infer<typeof licaoSchema>;
export type Indice = z.infer<typeof indiceSchema>;
export type MultiplaEscolha = z.infer<typeof multiplaEscolha>;
export type Associacao = z.infer<typeof associacao>;
export type Ordenacao = z.infer<typeof ordenacao>;
export type PreencherLacuna = z.infer<typeof preencherLacuna>;
export type Cenario = z.infer<typeof cenario>;
export type CompararPrompts = z.infer<typeof compararPrompts>;
export type ConsertarPrompt = z.infer<typeof consertarPrompt>;
