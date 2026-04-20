import { axiosInstance } from "../config";
import {
  createUserApi,
  deleteUserApi,
  getAllUsersApi,
  getUserByEmailApi,
  updateUserApi,
} from "../users";

describe("API users module", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("getAllUsersApi retorna usuarios cuando contrato es vÃ¡lido", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: [{ email: "admin@test.com" }] },
    });

    const result = await getAllUsersApi();
    expect(result).toHaveLength(1);
  });

  test("getAllUsersApi falla cuando contrato es invÃ¡lido", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: false },
    });

    await expect(getAllUsersApi()).rejects.toMatchObject({ code: "INVALID_API_CONTRACT" });
  });

  test("getUserByEmailApi retorna usuario por email", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: { email: "user@test.com" } },
    });

    const result = await getUserByEmailApi("user@test.com");
    expect(result.email).toBe("user@test.com");
  });

  test("createUserApi rechaza contrato invÃ¡lido", async () => {
    vi.spyOn(axiosInstance, "post").mockResolvedValueOnce({
      data: { success: false },
    });

    await expect(createUserApi({})).rejects.toMatchObject({ code: "INVALID_API_CONTRACT" });
  });

  test("updateUserApi rechaza contrato invÃ¡lido", async () => {
    vi.spyOn(axiosInstance, "patch").mockResolvedValueOnce({
      data: { success: false },
    });

    await expect(updateUserApi("user@test.com", {})).rejects.toMatchObject({
      code: "INVALID_API_CONTRACT",
    });
  });

  test("deleteUserApi rechaza contrato invÃ¡lido", async () => {
    vi.spyOn(axiosInstance, "delete").mockResolvedValueOnce({
      data: { success: false },
    });

    await expect(
      deleteUserApi({ email: "user@test.com", password: "Ab1$xy78", requesterEmail: "admin@test.com" })
    ).rejects.toMatchObject({
      code: "INVALID_API_CONTRACT",
    });
  });
});
