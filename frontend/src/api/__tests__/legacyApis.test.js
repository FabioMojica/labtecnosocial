import { axiosInstance } from "../config";
import {
  getFacebookPagesApi,
  getGitHubRepositoriesApi,
  getInstagramPagesApi,
} from "../apis";

describe("Legacy APIs wrapper", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("getGitHubRepositoriesApi soporta contrato legacy y nuevo", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      status: 200,
      data: [{ name: "repo-legacy" }],
    });
    await expect(getGitHubRepositoriesApi()).resolves.toHaveLength(1);

    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      status: 200,
      data: { success: true, data: [{ name: "repo-new" }] },
    });
    await expect(getGitHubRepositoriesApi()).resolves.toHaveLength(1);
  });

  test("getFacebookPagesApi y getInstagramPagesApi retornan payload en status 200", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      status: 200,
      data: { data: [{ id: "fb-1" }] },
    });
    await expect(getFacebookPagesApi()).resolves.toMatchObject({ data: [{ id: "fb-1" }] });

    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      status: 200,
      data: { data: [{ id: "ig-1" }] },
    });
    await expect(getInstagramPagesApi()).resolves.toMatchObject({ data: [{ id: "ig-1" }] });
  });
});
