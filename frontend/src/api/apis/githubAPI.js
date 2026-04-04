import { Routes } from "../config";
import { handleApiError } from "../config/handleApiError";
import { axiosInstance } from "../config";

export const getReposApi = async () => {
    try {
        const { data } = await axiosInstance.get(
            Routes.github.REPOS
        );

        if (data?.success !== true) {
            throw {
                code: 'INVALID_API_CONTRACT',
                message: 'Respuesta inesperada del servidor.',
            };
        }

        return data?.data;

    } catch (error) {
        throw handleApiError(error, "Ocurrió un error inesperado al obtener los repositorios de Github. Inténtalo de nuevo más tarde");
    }
};

export const getGithubBranchesApi = async (repoName, owner) => {
    try {
        const { data } = await axiosInstance.get(
            Routes.github.BRANCHES(repoName),
            {
                params: owner ? { owner } : undefined,
            }
        );

        if (data?.success !== true) {
            throw {
                code: 'INVALID_API_CONTRACT',
                message: 'Respuesta inesperada del servidor.',
            };
        }

        return data?.data;

    } catch (error) {
        throw handleApiError(error, "Ocurrió un error inesperado al obtener las ramas del repositorio de Github. Inténtalo de nuevo más tarde");
    }
};

export const getGithubStatsApi = async (projectName, timeRange, branch, owner) => {
    try {

        const { data } = await axiosInstance.get(
            Routes.github.STATS(projectName),
            {
                params: {
                    range: timeRange,
                    branch,
                    ...(owner ? { owner } : {}),
                },
            } 
        );

        if (data?.success !== true) {
            throw {
                code: 'INVALID_API_CONTRACT',
                message: 'Respuesta inesperada del servidor.',
            };
        }

        return data?.data;
    } catch (error) {
        throw handleApiError(error, "Ocurrió un error inesperado al obtener las estadísticas de la rama del repositorio de Github. Inténtalo de nuevo más tarde");
    }
};
