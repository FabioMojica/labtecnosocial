import { jest } from "@jest/globals";
import { AppDataSource } from "../../data-source.js";
import {
  getAllStrategicPlans,
  getStrategicPlanByYear,
  updateStrategicPlan,
  deleteStrategicPlanByYear,
} from "../../src/controllers/strategicPlan.controller.js";

const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("strategicPlan.controller (unit)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("getAllStrategicPlans responde 200 con lista", async () => {
    const res = buildRes();
    const find = jest.fn().mockResolvedValue([{ id: 1, year: 2026 }]);
    jest.spyOn(AppDataSource, "getRepository").mockReturnValue({ find });

    await getAllStrategicPlans({}, res);

    expect(find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: [{ id: 1, year: 2026 }],
      })
    );
  });

  test("getStrategicPlanByYear valida anio invalido", async () => {
    const req = { params: { year: "abc" } };
    const res = buildRes();

    await getStrategicPlanByYear(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: "VALIDATION_ERROR" }),
      })
    );
  });

  test("updateStrategicPlan valida anio invalido", async () => {
    const req = { params: { year: "xyz" }, body: {} };
    const res = buildRes();

    await updateStrategicPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: "VALIDATION_ERROR" }),
      })
    );
  });

  test("deleteStrategicPlanByYear responde 404 si plan no existe", async () => {
    const req = { params: { year: "2035" } };
    const res = buildRes();

    jest.spyOn(AppDataSource, "getRepository").mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null),
    });

    await deleteStrategicPlanByYear(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: "RESOURCE_NOT_FOUND" }),
      })
    );
  });

  test("deleteStrategicPlanByYear responde 500 ante excepcion", async () => {
    const req = { params: { year: "2035" } };
    const res = buildRes();

    jest.spyOn(AppDataSource, "getRepository").mockImplementation(() => {
      throw new Error("boom");
    });

    await deleteStrategicPlanByYear(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: "SERVER_ERROR" }),
      })
    );
  });
});

