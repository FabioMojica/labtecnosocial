import axios from "axios";
import dotenv from 'dotenv';
import { normalizeGetAPIsData } from "../../utils/normalizeGetAPIsData.js";
import { subMonths, subWeeks, subDays } from 'date-fns';

dotenv.config();

const { GITHUB_ORG, GITHUB_TOKEN } = process.env;

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
    return res.json(normalized);
  } catch (err) {
    console.error("Error al conectar con GitHub:", err.response?.data || err.message);
    return res.status(500).json({ error: "Error al obtener datos de GitHub" });
  }
};

export const getGithubBranches = async (req, res) => {
  try {
    const { projectName } = req.params;

    if (!projectName) {
      return res.status(400).json({ error: "Se requiere el nombre del proyecto" });
    }

    const url = `https://api.github.com/repos/${GITHUB_ORG}/${projectName}/branches`;

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

    return res.json(branches);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: "Repositorio no encontrado en GitHub" });
    }

    console.error("Error al obtener ramas de GitHub:", err.response?.data || err.message);
    return res.status(500).json({ error: "Error al obtener ramas de GitHub" });
  }
};

export const getGithubStats = async (req, res) => {
  try {
    const { projectName } = req.params;
    const { range, branch } = req.query;

    if (!projectName) {
      return res.status(400).json({ error: "Se requiere el nombre del proyecto" });
    }

    // --- COMMIT STATS ---
    const baseCommitUrl = `https://api.github.com/repos/${GITHUB_ORG}/${projectName}/commits`;
    const commitParams = new URLSearchParams();
    if (branch) commitParams.append("sha", branch);

    if (range && range !== "all") {
      let since;
      switch (range) {
        case "today": since = subDays(new Date(), 1); break;
        case "lastWeek": since = subWeeks(new Date(), 1); break;
        case "lastMonth": since = subMonths(new Date(), 1); break;
        case "lastSixMonths": since = subMonths(new Date(), 6); break;
        default: return res.status(400).json({ error: "Rango de tiempo inválido" });
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

    // --- PULL REQUESTS ---
    const prUrl = `https://api.github.com/repos/${GITHUB_ORG}/${projectName}/pulls`;
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

    return res.json({
      commitsCount: allCommits.length,
      commits: allCommits,
      pullRequests, 
    });

  } catch (err) {
    console.error("Error al obtener estadísticas de GitHub:", err.response?.data || err.message);

    if (err.response?.status === 404) {
      return res.status(404).json({ error: "Repositorio no encontrado en GitHub" });
    }

    return res.status(500).json({ error: "Error al obtener estadísticas de GitHub" });
  }
};


// export const getGithubStats = async (req, res) => {
//   try {
//     const { projectName } = req.params;
//     const { range, branch } = req.query;

//     if (!projectName) {
//       return res.status(400).json({ error: "Se requiere el nombre del proyecto" });
//     }

//     const baseUrl = `https://api.github.com/repos/${GITHUB_ORG}/${projectName}/commits`;
//     const params = new URLSearchParams();

//     if (branch) params.append("sha", branch);

//     if (range && range !== "all") {
//       let since;
//       switch (range) {
//         case "today":
//           since = subDays(new Date(), 1);
//           break;
//         case "lastWeek":
//           since = subWeeks(new Date(), 1);
//           break;
//         case "lastMonth":
//           since = subMonths(new Date(), 1);
//           break;
//         case "lastSixMonths":
//           since = subMonths(new Date(), 6);
//           break;
//         default:
//           return res.status(400).json({ error: "Rango de tiempo inválido" });
//       }
//       params.append("since", since.toISOString());
//     }

//     // Si no es "all", usamos una sola petición
//     if (range !== "all") {
//       const url = `${baseUrl}?${params.toString()}`;
//       const commitsResponse = await axios.get(url, {
//         headers: {
//           Authorization: `Bearer ${GITHUB_TOKEN}`,
//           Accept: "application/vnd.github+json",
//         },
//       });
//       return res.json({
//         commitsCount: commitsResponse.data.length,
//         commits: commitsResponse.data,
//       });
//     }

//     // Si es "all", traemos todo con paginación
//     let page = 1;
//     const perPage = 100;
//     let allCommits = [];

//     while (true) {
//       const url = `${baseUrl}?per_page=${perPage}&page=${page}${branch ? `&sha=${branch}` : ""}`;
//       const response = await axios.get(url, {
//         headers: {
//           Authorization: `Bearer ${GITHUB_TOKEN}`,
//           Accept: "application/vnd.github+json",
//         },
//       });

//       if (!response.data.length) break;

//       allCommits = allCommits.concat(response.data);

//       // Si trajo menos de 100, no hay más páginas
//       if (response.data.length < perPage) break;

//       page++;
//     }

//     return res.json({
//       commitsCount: allCommits.length,
//       commits: allCommits,
//     });

//   } catch (err) {
//     console.error("Error al obtener estadísticas de GitHub:", err.response?.data || err.message);

//     if (err.response?.status === 404) {
//       return res.status(404).json({ error: "Repositorio no encontrado en GitHub" });
//     }

//     return res.status(500).json({ error: "Error al obtener estadísticas de GitHub" });
//   }
// };
