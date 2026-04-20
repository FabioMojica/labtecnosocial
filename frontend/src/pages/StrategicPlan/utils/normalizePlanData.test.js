import { describe, expect, test } from "vitest";
import { normalizePlanData } from "./normalizePlanData";

describe("normalizePlanData", () => {
  test("retorna null cuando no hay data", () => {
    expect(normalizePlanData(null)).toBeNull();
  });

  test("normaliza plan con valores por defecto", () => {
    const input = {
      id: 1,
      year: 2026,
      mission: null,
      objectives: [
        {
          id: 9,
          title: "Objetivo 1",
          indicators: [{ id: 11, amount: 100, concept: "alcance" }],
          programs: [
            {
              id: 21,
              description: "Programa A",
              operationalProjects: [{ id: 31, name: "Proyecto X" }],
            },
          ],
        },
      ],
    };

    const result = normalizePlanData(input);

    expect(result).toMatchObject({
      id: 1,
      year: 2026,
      mission: "",
      objectives: [
        {
          id: 9,
          objectiveTitle: "Objetivo 1",
          indicators: [{ id: 11, amount: 100, concept: "alcance" }],
          programs: [
            {
              id: 21,
              programDescription: "Programa A",
              operationalProjects: [
                {
                  id: 31,
                  name: "Proyecto X",
                  description: "",
                  image_url: "",
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test("normaliza objetivos, indicadores y programas vacios", () => {
    const result = normalizePlanData({
      id: 2,
      year: 2027,
      mission: "Mision",
    });

    expect(result.objectives).toEqual([]);
    expect(result.mission).toBe("Mision");
  });
});

