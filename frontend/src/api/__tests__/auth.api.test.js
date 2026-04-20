import { axiosInstance } from "../config";
import {
  getSummaryDataApi,
  loginUserApi,
  logoutUserApi,
  meApi,
  refreshApi,
} from "../auth";

describe("API auth module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("loginUserApi retorna data cuando contrato es válido", async () => {
    vi.spyOn(axiosInstance, "post").mockResolvedValueOnce({
      data: {
        success: true,
        data: { accessToken: "token", user: { email: "admin@test.com" } },
      },
    });

    const result = await loginUserApi({ email: "admin@test.com", password: "Ab1$xy78" });
    expect(result.accessToken).toBe("token");
  });

  test("loginUserApi falla cuando contrato es inválido", async () => {
    vi.spyOn(axiosInstance, "post").mockResolvedValueOnce({
      data: { success: false },
    });

    await expect(loginUserApi({ email: "a@a.com", password: "Ab1$xy78" })).rejects.toMatchObject({
      code: "INVALID_API_CONTRACT",
    });
  });

  test("logoutUserApi retorna data", async () => {
    vi.spyOn(axiosInstance, "post").mockResolvedValueOnce({
      data: { success: true, data: {} },
    });

    await expect(logoutUserApi()).resolves.toEqual({});
  });

  test("meApi retorna payload de sesión", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: { user: { role: "admin" } } },
    });

    const result = await meApi();
    expect(result.success).toBe(true);
    expect(result.data.user.role).toBe("admin");
  });

  test("refreshApi retorna nuevo token", async () => {
    vi.spyOn(axiosInstance, "post").mockResolvedValueOnce({
      data: { success: true, data: { token: "new-token", user: { id: 1 } } },
    });

    const result = await refreshApi();
    expect(result.token).toBe("new-token");
  });

  test("getSummaryDataApi retorna lista de resumen", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: [{ clave: "Usuarios", valor: 5 }] },
    });

    const result = await getSummaryDataApi({ id: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].clave).toBe("Usuarios");
  });
});
