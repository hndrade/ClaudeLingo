import { describe, expect, it } from "vitest";
import {
  acertarRevisao,
  concluirLicao,
  errarRevisao,
  errosVencidos,
  minutosSemana,
  progressoVazio,
  registrarErros,
  type Progresso,
} from "../lib/progresso";

const licao = { id: "l1", acertos: 6, total: 7, xp: 20 };

describe("XP", () => {
  it("soma XP na primeira conclusão da lição", () => {
    const p = concluirLicao(progressoVazio, licao, 5, "2026-07-18");
    expect(p.xp).toBe(20);
  });

  it("não repete XP ao refazer a mesma lição", () => {
    let p = concluirLicao(progressoVazio, licao, 5, "2026-07-18");
    p = concluirLicao(p, { ...licao, acertos: 7 }, 5, "2026-07-19");
    expect(p.xp).toBe(20);
    expect(p.licoes).toHaveLength(2);
  });

  it("lições diferentes somam XP separadamente", () => {
    let p = concluirLicao(progressoVazio, licao, 5, "2026-07-18");
    p = concluirLicao(p, { ...licao, id: "l2", xp: 30 }, 5, "2026-07-18");
    expect(p.xp).toBe(50);
  });
});

describe("streak", () => {
  it("primeira sessão inicia streak em 1", () => {
    const p = concluirLicao(progressoVazio, licao, 5, "2026-07-18");
    expect(p.streak).toEqual({ atual: 1, ultimaSessao: "2026-07-18" });
  });

  it("sessão no dia seguinte incrementa", () => {
    let p = concluirLicao(progressoVazio, licao, 5, "2026-07-18");
    p = concluirLicao(p, { ...licao, id: "l2" }, 5, "2026-07-19");
    expect(p.streak.atual).toBe(2);
  });

  it("mais de uma sessão no mesmo dia não incrementa", () => {
    let p = concluirLicao(progressoVazio, licao, 5, "2026-07-18");
    p = concluirLicao(p, { ...licao, id: "l2" }, 5, "2026-07-18");
    expect(p.streak.atual).toBe(1);
  });

  it("pular um dia reinicia em 1", () => {
    let p = concluirLicao(progressoVazio, licao, 5, "2026-07-18");
    p = concluirLicao(p, { ...licao, id: "l2" }, 5, "2026-07-19");
    p = concluirLicao(p, { ...licao, id: "l3" }, 5, "2026-07-22");
    expect(p.streak.atual).toBe(1);
  });
});

describe("revisão espaçada (1, 3, 7, 21 dias)", () => {
  const comErro = (): Progresso => registrarErros(progressoVazio, "l1", [2], "2026-07-18");

  it("erro novo entra no estágio 0 e vence em 1 dia", () => {
    const p = comErro();
    expect(p.erros).toEqual([{ licao: "l1", exercicio: 2, data: "2026-07-18", estagio: 0 }]);
    expect(errosVencidos(p, "2026-07-18")).toHaveLength(0);
    expect(errosVencidos(p, "2026-07-19")).toHaveLength(1);
  });

  it("registrar o mesmo erro de novo não duplica, só reinicia a contagem", () => {
    let p = comErro();
    p = registrarErros(p, "l1", [2], "2026-07-20");
    expect(p.erros).toHaveLength(1);
    expect(p.erros[0].data).toBe("2026-07-20");
  });

  it("acertar avança o estágio: 1, depois 3, depois 7, depois 21 dias", () => {
    let p = comErro();
    p = acertarRevisao(p, "l1", 2, "2026-07-19");
    expect(p.erros[0].estagio).toBe(1);
    expect(errosVencidos(p, "2026-07-21")).toHaveLength(0);
    expect(errosVencidos(p, "2026-07-22")).toHaveLength(1); // +3 dias
    p = acertarRevisao(p, "l1", 2, "2026-07-22");
    expect(errosVencidos(p, "2026-07-29")).toHaveLength(1); // +7 dias
    p = acertarRevisao(p, "l1", 2, "2026-07-29");
    expect(errosVencidos(p, "2026-08-19")).toHaveLength(1); // +21 dias
  });

  it("acertar no último estágio remove da fila", () => {
    let p = comErro();
    for (const d of ["2026-07-19", "2026-07-22", "2026-07-29", "2026-08-19"]) {
      p = acertarRevisao(p, "l1", 2, d);
    }
    expect(p.erros).toHaveLength(0);
  });

  it("errar na revisão volta ao estágio 0", () => {
    let p = comErro();
    p = acertarRevisao(p, "l1", 2, "2026-07-19");
    p = errarRevisao(p, "l1", 2, "2026-07-22");
    expect(p.erros[0]).toEqual({ licao: "l1", exercicio: 2, data: "2026-07-22", estagio: 0 });
  });
});

describe("minutos por semana (você contra você)", () => {
  it("separa últimos 7 dias dos 7 anteriores", () => {
    const p: Progresso = {
      ...progressoVazio,
      minutosPorDia: { "2026-07-18": 10, "2026-07-12": 5, "2026-07-11": 8, "2026-07-04": 99 },
    };
    expect(minutosSemana(p, "2026-07-18")).toEqual({ estaSemana: 15, semanaPassada: 8 });
  });
});
