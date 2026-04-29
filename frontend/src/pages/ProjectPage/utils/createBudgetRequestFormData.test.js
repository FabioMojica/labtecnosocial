import { describe, expect, test } from "vitest";
import { createBudgetRequestFormData } from "./createBudgetRequestFormData";

describe("createBudgetRequestFormData", () => {
  test("construye el payload con objective, items y archivos indexados", () => {
    const receiptFile = new File(["img"], "respaldo.png", { type: "image/png" });

    const formData = createBudgetRequestFormData({
      objective: "Comprar materiales",
      items: [
        {
          item_name: "Lápices",
          quantity: "10",
          unit_cost: "2.50",
          support_file: receiptFile,
        },
        {
          item_name: "Cuadernos",
          quantity: "5",
          unit_cost: "12.00",
          support_file: null,
        },
      ],
    });

    const entries = Array.from(formData.entries());
    const map = Object.fromEntries(entries);

    expect(map.objective).toBe("Comprar materiales");
    expect(JSON.parse(map.items)).toEqual([
      { item_name: "Lápices", quantity: "10", unit_cost: "2.50" },
      { item_name: "Cuadernos", quantity: "5", unit_cost: "12.00" },
    ]);
    expect(map.file_0).toBeInstanceOf(File);
    expect(map.file_1).toBeUndefined();
  });
});
