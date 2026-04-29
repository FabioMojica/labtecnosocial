import { axiosInstance } from "../../config";
import { getGithubBranchesApi, getGithubStatsApi, getReposApi } from "../githubAPI";
import {
  getFacebookPageInsights,
  getFacebookPageOverview,
  getFacebookPagePosts,
} from "../facebookAPI";
import { getInstagramInsights, getInstagramMedia, getInstagramOverview } from "../instagramAPI";

describe("Social APIs (GitHub/Facebook/Instagram)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("GitHub APIs retornan data con contrato valido", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: [{ name: "repo-a" }] },
    });
    await expect(getReposApi()).resolves.toHaveLength(1);

    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: [{ name: "main" }] },
    });
    await expect(getGithubBranchesApi("repo-a", "lab-tecnosocial")).resolves.toHaveLength(1);

    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: { commits: 20 } },
    });
    await expect(getGithubStatsApi("repo-a", "lastMonth", "main", "lab-tecnosocial")).resolves.toMatchObject({
      commits: 20,
    });
  });

  test("Facebook APIs retornan data con contrato valido", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: { followers: 100 } },
    });
    await expect(getFacebookPageOverview("page-1")).resolves.toMatchObject({ followers: 100 });

    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: { insights: [] } },
    });
    await expect(getFacebookPageInsights("page-1", "lastMonth")).resolves.toMatchObject({ insights: [] });

    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: { posts: [] } },
    });
    await expect(getFacebookPagePosts("page-1", "lastMonth")).resolves.toMatchObject({ posts: [] });
  });

  test("Instagram APIs retornan data con contrato valido", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: { reach: 450 } },
    });
    await expect(getInstagramOverview("ig-1")).resolves.toMatchObject({ reach: 450 });

    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: { insights: [] } },
    });
    await expect(getInstagramInsights("ig-1", "lastMonth")).resolves.toMatchObject({ insights: [] });

    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: true, data: { media: [] } },
    });
    await expect(getInstagramMedia("ig-1", "lastMonth")).resolves.toMatchObject({ media: [] });
  });

  test("GitHub APIs rechazan contrato invalido", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: false, data: [] },
    });

    await expect(getReposApi()).rejects.toMatchObject({
      code: "INVALID_API_CONTRACT",
    });
  });

  test("GitHub APIs propagan error de backend", async () => {
    vi.spyOn(axiosInstance, "get").mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          error: {
            code: "RESOURCE_NOT_FOUND",
            message: "Repositorio no encontrado",
          },
        },
      },
    });

    await expect(getGithubBranchesApi("repo-x", "lab-tecnosocial")).rejects.toMatchObject({
      code: "RESOURCE_NOT_FOUND",
      message: "Repositorio no encontrado",
    });
  });

  test("Facebook APIs rechazan contrato invalido", async () => {
    vi.spyOn(axiosInstance, "get").mockResolvedValueOnce({
      data: { success: false, data: {} },
    });

    await expect(getFacebookPageOverview("page-1")).rejects.toMatchObject({
      code: "INVALID_API_CONTRACT",
    });
  });

  test("Instagram APIs manejan error de red", async () => {
    vi.spyOn(axiosInstance, "get").mockRejectedValueOnce({
      code: "ERR_NETWORK",
    });

    await expect(getInstagramOverview("ig-1")).rejects.toMatchObject({
      code: "ERR_NETWORK",
    });
  });
});
