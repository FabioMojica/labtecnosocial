import { describe, expect, test, vi, beforeEach } from "vitest";
import { axiosInstance } from "../config";
import {
  deleteStrategicPlanApi,
  getAllStrategicPlansApi,
  getStrategicPlanByYearApi,
  updateStrategicPlanApi,
} from "../strategicPlan";

describe("Strategic Plan API contract", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("getAllStrategicPlansApi retorna listado cuando success=true", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: [{ year: 2026 }] },
    });
    await expect(getAllStrategicPlansApi()).resolves.toEqual([{ year: 2026 }]);
  });

  test("getAllStrategicPlansApi rechaza contrato invalido", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: false, data: [] },
    });
    await expect(getAllStrategicPlansApi()).rejects.toMatchObject({
      code: "INVALID_API_CONTRACT",
    });
  });

  test("getStrategicPlanByYearApi retorna plan", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: { year: 2026, objectives: [] } },
    });
    await expect(getStrategicPlanByYearApi(2026)).resolves.toMatchObject({ year: 2026 });
  });

  test("updateStrategicPlanApi retorna plan actualizado", async () => {
    vi.spyOn(axiosInstance, "put").mockResolvedValueOnce({
      data: { success: true, data: { year: 2026, plan_version: 2 } },
    });
    await expect(updateStrategicPlanApi(2026, { mission: "M" })).resolves.toMatchObject({
      plan_version: 2,
    });
  });

  test("deleteStrategicPlanApi retorna null cuando elimina", async () => {
    vi.spyOn(axiosInstance, "delete").mockResolvedValueOnce({
      data: { success: true, data: null },
    });
    await expect(deleteStrategicPlanApi(2026)).resolves.toBeNull();
  });
});

