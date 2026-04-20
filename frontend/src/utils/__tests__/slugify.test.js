import { slugify } from "../slugify";

describe("slugify", () => {
  test("normaliza texto y mantiene prefijo proyecto-", () => {
    expect(slugify("Mi Proyecto Ñandú 2026")).toBe("proyecto-mi-proyecto-nandu-2026");
    expect(slugify("proyecto-demo app")).toBe("proyecto-demo-app");
    expect(slugify("")).toBe("proyecto-");
  });
});
