import { describe, expect, test, vi } from "vitest";
import {
  buildPayload,
  buildPayloadFromData,
  generateTempId,
  getAllAssignedProjectIds,
  isEqual,
  normalizeTargets,
  sortById,
  updateTargetsWithEditedProject,
  updateTargetsWithEditedTarget,
  updateTargetsWithNewProgram,
} from "./strategicPlanningColumnsViewUtils";

describe("strategicPlanningColumnsViewUtils", () => {
  test("buildPayloadFromData mapea mision y objetivos", () => {
    const payload = buildPayloadFromData({
      mission: "Mision QA",
      objectives: [
        {
          id: 1,
          objectiveTitle: "Obj",
          indicators: [],
          programs: [{ id: 2, programDescription: "Prog", operationalProjects: [] }],
        },
      ],
    });

    expect(payload).toMatchObject({
      mission: "Mision QA",
      objectives: [{ id: 1, objectiveTitle: "Obj" }],
    });
  });

  test("isEqual compara estructuras serializadas", () => {
    expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  test("sortById ordena por id y maneja null", () => {
    expect(sortById(null)).toEqual([]);
    expect(sortById([{ id: 4 }, { id: 1 }, { id: 2 }]).map((x) => x.id)).toEqual([1, 2, 4]);
  });

  test("normalizeTargets ordena objetivos internos", () => {
    const result = normalizeTargets([
      {
        id: 1,
        objectiveTitle: "Obj",
        indicators: [{ id: 9, amount: 1, concept: "A" }, { id: 2, amount: 3, concept: "B" }],
        programs: [
          {
            id: 7,
            programDescription: "P",
            operationalProjects: [{ id: 3, name: "B" }, { id: 1, name: "A" }],
          },
        ],
      },
    ]);

    expect(result[0].indicators.map((x) => x.id)).toEqual([2, 9]);
    expect(result[0].programs[0].operationalProjects.map((x) => x.id)).toEqual([1, 3]);
  });

  test("buildPayload omite ids de indicadores y conserva estructura requerida", () => {
    const result = buildPayload("M", [
      {
        id: 1,
        objectiveTitle: "Obj",
        indicators: [{ id: 9, amount: 10, concept: "C" }],
        programs: [{ id: 2, programDescription: "Prog", operationalProjects: [{ id: 3 }] }],
      },
    ]);

    expect(result.objectives[0].indicators[0]).toEqual({ amount: 10, concept: "C" });
  });

  test("updateTargetsWithEditedTarget reemplaza target por id", () => {
    const targets = [{ id: 1, objectiveTitle: "A" }, { id: 2, objectiveTitle: "B" }];
    const updated = updateTargetsWithEditedTarget(targets, { id: 2, objectiveTitle: "B2" });
    expect(updated[1].objectiveTitle).toBe("B2");
  });

  test("updateTargetsWithNewProgram agrega programa al objetivo seleccionado", () => {
    const targets = [{ id: 10, programs: [] }, { id: 11, programs: [] }];
    const updated = updateTargetsWithNewProgram(targets, 10, "Programa QA");
    expect(updated[0].programs).toHaveLength(1);
    expect(updated[0].programs[0].programDescription).toBe("Programa QA");
    expect(updated[1].programs).toHaveLength(0);
  });

  test("updateTargetsWithEditedProject modifica un proyecto especifico", () => {
    const targets = [
      {
        id: 1,
        programs: [
          {
            id: 8,
            operationalProjects: [{ id: 99, name: "Proyecto Viejo", description: "old" }],
          },
        ],
      },
    ];
    const updated = updateTargetsWithEditedProject(targets, 1, 8, { id: 99, name: "Proyecto Nuevo" });
    expect(updated[0].programs[0].operationalProjects[0].name).toBe("Proyecto Nuevo");
  });

  test("getAllAssignedProjectIds devuelve ids unicos", () => {
    const ids = getAllAssignedProjectIds([
      { programs: [{ operationalProjects: [{ id: 1 }, { id: 2 }] }] },
      { programs: [{ operationalProjects: [{ id: 2 }, { id: 3 }] }] },
    ]);
    expect(ids.sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });

  test("generateTempId produce prefijo temp-", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const id = generateTempId();
    expect(id.startsWith("temp-")).toBe(true);
  });
});

