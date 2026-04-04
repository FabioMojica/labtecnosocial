import axios from "axios";
import dotenv from 'dotenv';
import { normalizeGetAPIsData } from "../../utils/normalizeGetAPIsData.js";
import { subMonths, subWeeks, subDays } from 'date-fns';
import { ERROR_CODES, errorResponse, successResponse } from "../../utils/apiResponse.js";

dotenv.config();

const { GITHUB_ORG, GITHUB_TOKEN } = process.env;

const resolveGithubOwner = (req) => {
  const ownerFromQuery = req.query?.owner;
  if (typeof ownerFromQuery === "string" && ownerFromQuery.trim()) {
    return ownerFromQuery.trim();
  }
  return GITHUB_ORG;
};

export const getGitHubRepos = async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.github.com/users/${GITHUB_ORG}/repos`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const normalized = normalizeGetAPIsData('github', response.data);
    return successResponse(res, normalized);
  } catch (err) {
    console.error("Error al conectar con GitHub:", err.response?.data || err.message);
    return errorResponse(
      res,
      ERROR_CODES.RESOURCE_ERROR,
      "Error al obtener datos de GitHub",
      500
    );
  }
};

export const getGithubBranches = async (req, res) => {
  try {
    const { projectName } = req.params;
    const owner = resolveGithubOwner(req);

    if (!projectName) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        "Se requiere el nombre del proyecto",
        400
      );
    }

    if (!owner) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        "No se pudo resolver el owner de GitHub",
        400
      );
    }

    const url = `https://api.github.com/repos/${owner}/${projectName}/branches`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });

    const branches = response.data.map((b) => ({
      name: b.name,
      protected: b.protected,
    }));

    return successResponse(res, branches);
  } catch (err) {
    if (err.response?.status === 404) {
      return errorResponse(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        "Repositorio no encontrado en GitHub",
        404
      );
    }

    console.error("Error al obtener ramas de GitHub:", err.response?.data || err.message);
    return errorResponse(
      res,
      ERROR_CODES.RESOURCE_ERROR,
      "Error al obtener ramas de GitHub",
      500
    );
  }
};

export const getGithubStats = async (req, res) => {
  try {
    const { projectName } = req.params;
    const { range, branch } = req.query;
    const owner = resolveGithubOwner(req);

    if (!projectName) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        "Se requiere el nombre del proyecto",
        400
      );
    }

    if (!owner) {
      return errorResponse(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        "No se pudo resolver el owner de GitHub",
        400
      );
    }

    const baseCommitUrl = `https://api.github.com/repos/${owner}/${projectName}/commits`;
    const commitParams = new URLSearchParams();
    if (branch) commitParams.append("sha", branch);

    if (range && range !== "all") {
      let since;
      switch (range) {
        case "today":
          since = subDays(new Date(), 1);
          break;
        case "lastWeek":
          since = subWeeks(new Date(), 1);
          break;
        case "lastMonth":
          since = subMonths(new Date(), 1);
          break;
        case "lastSixMonths":
          since = subMonths(new Date(), 6);
          break;
        default:
          return errorResponse(
            res,
            ERROR_CODES.VALIDATION_ERROR,
            "Rango de tiempo inválido",
            400
          );
      }
      commitParams.append("since", since.toISOString());
    }

    let allCommits = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const url = `${baseCommitUrl}?per_page=${perPage}&page=${page}${branch ? `&sha=${branch}` : ""}${range && range !== "all" ? `&since=${commitParams.get('since')}` : ""}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      });

      if (!response.data.length) break;
      allCommits = allCommits.concat(response.data);
      if (response.data.length < perPage) break;
      page++;
    }

    const prUrl = `https://api.github.com/repos/${owner}/${projectName}/pulls`;
    const prParams = new URLSearchParams();
    prParams.append("state", "all");
    if (branch) prParams.append("base", branch);

    const prResponse = await axios.get(`${prUrl}?${prParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });

    const pullRequests = prResponse.data;

    return successResponse(res, {
      commitsCount: allCommits.length,
      commits: allCommits,
      pullRequests,
    });
  } catch (err) {
    console.error("Error al obtener estadísticas de GitHub:", err.response?.data || err.message);

    if (err.response?.status === 404) {
      return errorResponse(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        "Repositorio no encontrado en GitHub",
        404
      );
    }

    return errorResponse(
      res,
      ERROR_CODES.RESOURCE_ERROR,
      "Error al obtener estadísticas de GitHub",
      500
    );
  }
};
