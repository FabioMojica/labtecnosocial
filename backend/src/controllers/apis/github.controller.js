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


// export const getGithubStats = async (req, res) => {
//   try {
//     const { projectName } = req.params;
//     const { range } = req.query;

//     if (!projectName) {
//       return res.status(400).json({ error: "Se requiere el nombre del proyecto" });
//     }

//     let url = `https://api.github.com/repos/${GITHUB_ORG}/${projectName}/commits`;

//     if (range) {
//       const since = new Date();

//       switch (range) {
//         case "monthly":
//           since.setMonth(since.getMonth() - 1);
//           break;
//         case "weekly":
//           since.setDate(since.getDate() - 7);
//           break;
//         case "six_months":
//           since.setMonth(since.getMonth() - 6);
//           break;
//         case "all":
//           break;
//         default:
//           return res.status(400).json({ error: "Rango de tiempo inválido" });
//       }

//       if (range !== "all") {
//         url += `?since=${since.toISOString()}`;
//       }
//     }

//     const commitsResponse = await axios.get(url, {
//       headers: {
//         Authorization: `Bearer ${GITHUB_TOKEN}`,
//         Accept: "application/vnd.github+json",
//       },
//     });

//     return res.json({
//       commitsCount: commitsResponse.data.length,
//       commits: commitsResponse.data,
//     });

//   } catch (err) {
//     if (err.response?.status === 404) {
//       return res.status(404).json({ error: "Repositorio no encontrado en GitHub" });
//     }

//     console.error("Error al obtener estadísticas de GitHub:", err.response?.data || err.message);
//     return res.status(500).json({ error: "Error al obtener estadísticas de GitHub" });
//   }
// };

export const getGithubStats = async (req, res) => {
  try {
    const { projectName } = req.params;
    const { range, branch } = req.query;

    if (!projectName) {
      return res.status(400).json({ error: "Se requiere el nombre del proyecto" });
    }

    let url = `https://api.github.com/repos/${GITHUB_ORG}/${projectName}/commits`;
    const params = new URLSearchParams();

    if (branch) {
      params.append("sha", branch);
    }

    if (range && range !== "all") {
      let since;

      switch (range) {
        case "today":
          since = subDays(new Date(), 1);
          break;
        case "week":
          since = subWeeks(new Date(), 1);
          break;
        case "month":
          since = subMonths(new Date(), 1);
          break;
        case "6months":
          since = subMonths(new Date(), 6);
          break;
        default:
          return res.status(400).json({ error: "Rango de tiempo inválido" });
      }

      params.append("since", since.toISOString());
    }

    if ([...params].length > 0) {
      url += `?${params.toString()}`;
    }

    const commitsResponse = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });

    return res.json({
      commitsCount: commitsResponse.data.length,
      commits: commitsResponse.data,
    });

  } catch (err) {
    console.error("Error al obtener estadísticas de GitHub:", err.response?.data || err.message);

    if (err.response?.status === 404) {
      return res.status(404).json({ error: "Repositorio no encontrado en GitHub" });
    }

    return res.status(500).json({ error: "Error al obtener estadísticas de GitHub" });
  }
};