import { getInterBlockSpacing } from "../generatePdf";

describe("generatePdf inter-block spacing", () => {
  test("agrega separacion extra entre dos bloques de texto", () => {
    expect(
      getInterBlockSpacing(
        { type: "text" },
        { type: "text" }
      )
    ).toBe(10);
  });

  test("agrega separacion extra entre grafica y texto", () => {
    expect(
      getInterBlockSpacing(
        { type: "chart" },
        { type: "text" }
      )
    ).toBe(12);
  });

  test("no agrega espacio extra entre texto y grafica", () => {
    expect(
      getInterBlockSpacing(
        { type: "text" },
        { type: "chart" }
      )
    ).toBe(0);
  });
});
