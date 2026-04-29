import { describe, expect, test } from "vitest";
import { updateProjectFormData } from "./updateProjectFormData";

describe("updateProjectFormData", () => {
  test("incluye presupuesto cuando fue definido", () => {
    const formData = updateProjectFormData({
      name: "Proyecto editado",
      budget_amount: "1800.00",
    });

    const entries = Array.from(formData.entries());
    const map = Object.fromEntries(entries);

    expect(map.name).toBe("Proyecto editado");
    expect(map.budget_amount).toBe("1800.00");
  });

  test("envia presupuesto vacio para permitir limpiar el valor", () => {
    const formData = updateProjectFormData({
      budget_amount: "",
    });

    const entries = Array.from(formData.entries());
    const map = Object.fromEntries(entries);

    expect(map.budget_amount).toBe("");
  });
});
