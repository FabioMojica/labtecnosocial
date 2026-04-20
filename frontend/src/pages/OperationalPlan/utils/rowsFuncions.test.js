import { describe, expect, test } from "vitest";
import { formatRow, isRowEmpty, removeRowIfEmpty } from "./rowsFuncions";

const buildRow = (overrides = {}) => ({
  objective: "",
  indicator: { quantity: "", concept: "" },
  team: [],
  resource: [],
  budget: { amount: "", description: "" },
  period: { start: "", end: "" },
  ...overrides,
});

describe("rowsFuncions", () => {
  test("isRowEmpty devuelve true para fila vacia", () => {
    expect(isRowEmpty(buildRow())).toBe(true);
  });

  test("isRowEmpty devuelve false cuando hay contenido", () => {
    expect(isRowEmpty(buildRow({ objective: "Objetivo 1" }))).toBe(false);
  });

  test("formatRow normaliza valores y convierte numeros", () => {
    const formatted = formatRow(
      buildRow({
        id: 10,
        objective: "Objetivo",
        indicator: { quantity: "5", concept: "KPI" },
        team: ["A"],
        resource: ["Laptop"],
        budget: { amount: "200", description: "Presupuesto" },
        period: { start: "2026-01-01", end: "2026-02-01" },
      })
    );

    expect(formatted).toMatchObject({
      id: 10,
      objective: "Objetivo",
      indicator_amount: 5,
      indicator_concept: "KPI",
      team: ["A"],
      resources: ["Laptop"],
      budget_amount: 200,
      budget_description: "Presupuesto",
      period_start: "2026-01-01",
      period_end: "2026-02-01",
    });
  });

  test("removeRowIfEmpty elimina fila vacia cuando hay mas de una", () => {
    const rows = [buildRow(), buildRow({ objective: "Activo" })];
    const result = removeRowIfEmpty(rows, 0);
    expect(result).toHaveLength(1);
    expect(result[0].objective).toBe("Activo");
  });

  test("removeRowIfEmpty conserva fila unica aunque este vacia", () => {
    const rows = [buildRow()];
    const result = removeRowIfEmpty(rows, 0);
    expect(result).toHaveLength(1);
  });
});
