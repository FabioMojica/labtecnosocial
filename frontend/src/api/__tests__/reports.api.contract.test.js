import { axiosInstance } from "../config";
import {
  createReportApi,
  deleteReportApi,
  getAllReportsApi,
  getReportByIdApi,
  updateReportApi,
} from "../reports";

describe("Reports API contracts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("getAllReportsApi retorna lista cuando contrato es valido", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: 1, title: "Reporte A", report_version: 1 }],
      },
    });

    const reports = await getAllReportsApi();
    expect(reports).toHaveLength(1);
    expect(reports[0].title).toBe("Reporte A");
  });

  test("getAllReportsApi rechaza contrato invalido", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: false, data: [] },
    });

    await expect(getAllReportsApi()).rejects.toMatchObject({
      code: "INVALID_API_CONTRACT",
    });
  });

  test("getAllReportsApi propaga error controlado de backend", async () => {
    vi.spyOn(axiosInstance, "get").mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          error: {
            code: "USER_UNAUTHORIZED",
            message: "No tienes permisos para realizar esta acción.",
          },
        },
      },
    });

    await expect(getAllReportsApi()).rejects.toMatchObject({
      code: "USER_UNAUTHORIZED",
      message: "No tienes permisos para realizar esta acción.",
    });
  });

  test("getReportByIdApi rechaza contrato invalido", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: false, data: null },
    });

    await expect(getReportByIdApi(10)).rejects.toMatchObject({
      code: "INVALID_API_CONTRACT",
    });
  });

  test("createReportApi retorna data cuando contrato es valido", async () => {
    vi.spyOn(axiosInstance, "post").mockResolvedValueOnce({
      data: {
        success: true,
        data: { id: 77, title: "Reporte nuevo", report_version: 1 },
      },
    });

    await expect(createReportApi(new FormData())).resolves.toMatchObject({
      id: 77,
      report_version: 1,
    });
  });

  test("createReportApi rechaza contrato invalido", async () => {
    vi.spyOn(axiosInstance, "post").mockResolvedValueOnce({
      data: { success: false },
    });

    await expect(createReportApi(new FormData())).rejects.toMatchObject({
      code: "INVALID_API_CONTRACT",
    });
  });

  test("updateReportApi rechaza contrato invalido", async () => {
    vi.spyOn(axiosInstance, "put").mockResolvedValueOnce({
      data: { success: false, data: null },
    });

    await expect(updateReportApi(9, new FormData())).rejects.toMatchObject({
      code: "INVALID_API_CONTRACT",
    });
  });

  test("updateReportApi propaga error de concurrencia", async () => {
    vi.spyOn(axiosInstance, "put").mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          error: {
            code: "VERSION_ERROR",
            message:
              "Error al actualizar el reporte: asegurate de estar trabajando sobre la ultima version del reporte refrescando la pagina.",
          },
        },
      },
    });

    await expect(updateReportApi(9, new FormData())).rejects.toMatchObject({
      code: "VERSION_ERROR",
    });
  });

  test("deleteReportApi rechaza contrato invalido", async () => {
    vi.spyOn(axiosInstance, "delete").mockResolvedValueOnce({
      data: { success: false, data: null },
    });

    await expect(deleteReportApi(55)).rejects.toMatchObject({
      code: "INVALID_API_CONTRACT",
    });
  });

  test("deleteReportApi propaga error NOT_FOUND del backend", async () => {
    vi.spyOn(axiosInstance, "delete").mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          error: { code: "NOT_FOUND", message: "Reporte no encontrado" },
        },
      },
    });

    await expect(deleteReportApi(999)).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Reporte no encontrado",
    });
  });
});

