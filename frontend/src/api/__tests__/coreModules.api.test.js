import { axiosInstance } from "../config";
import {
  createOperationalProjectApi,
  deleteProjectByIdApi,
  getAllOperationalProjectsApi,
  getProjectByIdApi,
  updateProjectApi,
} from "../operationalProjects";
import {
  deleteStrategicPlanApi,
  getAllStrategicPlansApi,
  getStrategicPlanByYearApi,
  updateStrategicPlanApi,
} from "../strategicPlan";
import { getOperationalProjectsWithIntegrationsApi } from "../dashboard";
import {
  createReportApi,
  deleteReportApi,
  getAllReportsApi,
  getReportByIdApi,
  updateReportApi,
} from "../reports";
import {
  createUserApi,
  deleteUserApi,
  getAllAdminsApi,
  getAllUsersApi,
  getUserByEmailApi,
  updateUserApi,
} from "../users";
import {
  deleteOperationalPlanningApi,
  getOperationalPlanOfProjectApi,
  saveOperationalRowsApi,
} from "../operationalPlan";

describe("API core modules", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("operationalProjects APIs cubren CRUD principal", async () => {
    vi.spyOn(axiosInstance, "post").mockResolvedValueOnce({
      data: { success: true, data: { id: 1, name: "Proyecto A" } },
    });
    await expect(createOperationalProjectApi({ name: "Proyecto A" })).resolves.toMatchObject({ id: 1 });

    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: [{ id: 1 }] },
    });
    await expect(getAllOperationalProjectsApi()).resolves.toHaveLength(1);

    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: { id: 1 } },
    });
    await expect(getProjectByIdApi(1)).resolves.toMatchObject({ id: 1 });

    vi.spyOn(axiosInstance, "patch").mockResolvedValueOnce({
      data: { success: true, data: { id: 1, name: "Proyecto B" } },
    });
    await expect(updateProjectApi(1, {})).resolves.toMatchObject({ name: "Proyecto B" });

    vi.spyOn(axiosInstance, "delete").mockResolvedValueOnce({
      data: { success: true, data: {} },
    });
    await expect(deleteProjectByIdApi(1)).resolves.toEqual({});
  });

  test("strategicPlan APIs cubren listar, obtener, actualizar y eliminar", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: [{ year: 2026 }] },
    });
    await expect(getAllStrategicPlansApi()).resolves.toHaveLength(1);

    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: { year: 2026, objectives: [] } },
    });
    await expect(getStrategicPlanByYearApi(2026)).resolves.toMatchObject({ year: 2026 });

    vi.spyOn(axiosInstance, "put").mockResolvedValueOnce({
      data: { success: true, data: { year: 2026, plan_version: 2 } },
    });
    await expect(updateStrategicPlanApi(2026, {})).resolves.toMatchObject({ plan_version: 2 });

    vi.spyOn(axiosInstance, "delete").mockResolvedValueOnce({
      data: { success: true, data: null },
    });
    await expect(deleteStrategicPlanApi(2026)).resolves.toBeNull();
  });

  test("dashboard API retorna proyectos con integraciones", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: [{ id: 9, name: "Simi" }] },
    });

    const result = await getOperationalProjectsWithIntegrationsApi("admin@test.com");
    expect(result[0].name).toBe("Simi");
  });

  test("reports APIs cubren ciclo completo", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: [{ id: 5, title: "Reporte" }] },
    });
    await expect(getAllReportsApi()).resolves.toHaveLength(1);

    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: { id: 5, title: "Reporte" } },
    });
    await expect(getReportByIdApi(5)).resolves.toMatchObject({ id: 5 });

    vi.spyOn(axiosInstance, "post").mockResolvedValueOnce({
      data: { success: true, data: { id: 5 } },
    });
    await expect(createReportApi({})).resolves.toMatchObject({ id: 5 });

    vi.spyOn(axiosInstance, "put").mockResolvedValueOnce({
      data: { success: true, data: { id: 5, report_version: 2 } },
    });
    await expect(updateReportApi(5, {})).resolves.toMatchObject({ report_version: 2 });

    vi.spyOn(axiosInstance, "delete").mockResolvedValueOnce({
      data: { success: true, data: { id: 5 } },
    });
    await expect(deleteReportApi(5)).resolves.toMatchObject({ id: 5 });
  });

  test("users APIs cubren administración principal", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: [{ id: 1, role: "admin" }] },
    });
    await expect(getAllUsersApi()).resolves.toHaveLength(1);

    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: [{ id: 2, role: "admin" }] },
    });
    await expect(getAllAdminsApi()).resolves.toHaveLength(1);

    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: { email: "usuario@test.com" } },
    });
    await expect(getUserByEmailApi("usuario@test.com")).resolves.toMatchObject({
      email: "usuario@test.com",
    });

    vi.spyOn(axiosInstance, "post").mockResolvedValueOnce({
      data: { success: true, data: { id: 3 } },
    });
    await expect(createUserApi({})).resolves.toMatchObject({ id: 3 });

    vi.spyOn(axiosInstance, "patch").mockResolvedValueOnce({
      data: { success: true, data: { id: 3, firstName: "Nuevo" } },
    });
    await expect(updateUserApi("usuario@test.com", {})).resolves.toMatchObject({ firstName: "Nuevo" });

    vi.spyOn(axiosInstance, "delete").mockResolvedValueOnce({
      data: { success: true, data: { id: 3 } },
    });
    await expect(
      deleteUserApi({
        email: "usuario@test.com",
        password: "Ab1$xy78",
        requesterEmail: "admin@test.com",
      })
    ).resolves.toMatchObject({ id: 3 });
  });

  test("operationalPlan APIs cubren leer/guardar/eliminar", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: { rows: [], operationalPlan_version: 0 } },
    });
    await expect(getOperationalPlanOfProjectApi(1)).resolves.toMatchObject({
      operationalPlan_version: 0,
    });

    vi.spyOn(axiosInstance, "post").mockResolvedValueOnce({
      data: { success: true, data: { savedRows: [{ id: 1 }], operationalPlan_version: 1 } },
    });
    await expect(saveOperationalRowsApi(1, { create: [] })).resolves.toMatchObject({
      operationalPlan_version: 1,
    });

    vi.spyOn(axiosInstance, "delete").mockResolvedValueOnce({
      data: { success: true, data: {} },
    });
    await expect(deleteOperationalPlanningApi(1)).resolves.toEqual({});
  });
});
