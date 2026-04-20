import { isRowEmpty } from "../../src/utils/isRowEmpty.js";

describe("isRowEmpty (plan operativo)", () => {
  test("retorna true cuando la fila no tiene datos", () => {
    const row = {
      objective: "",
      indicator_amount: null,
      indicator_concept: "",
      team: [],
      resources: [],
      budget_amount: null,
      budget_description: "",
      period_start: null,
      period_end: null,
    };
    expect(isRowEmpty(row)).toBe(true);
  });

  test("retorna false cuando existe algun dato", () => {
    const row = {
      objective: "Objetivo",
      indicator_amount: null,
      indicator_concept: "",
      team: [],
      resources: [],
      budget_amount: null,
      budget_description: "",
      period_start: null,
      period_end: null,
    };
    expect(isRowEmpty(row)).toBe(false);
  });
});
