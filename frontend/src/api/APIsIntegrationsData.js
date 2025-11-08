import { axiosInstance } from "./config";

export const getReposApi = async () => {
  try {
    const response = await axiosInstance.get("apis/github/repos")
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGithubBranchesApi = async (repoName) => {
  try {
    const response = await axiosInstance.get(`apis/github/${repoName}/branches`);
    return response.data;
  } catch (error) {
    console.error("Error en getGithubBranches:", error);
    throw error;
  }
};

export const getGithubStatsApi = async (projectName, timeRange, branch) => {
  try {
    const response = await axiosInstance.get(`apis/github/${projectName}/github-stats`, {
      params: { range: timeRange, branch }
    });
    return response.data;
  } catch (error) {
    console.error("Error en getGithubStats:", error);
    throw error;
  }
};
