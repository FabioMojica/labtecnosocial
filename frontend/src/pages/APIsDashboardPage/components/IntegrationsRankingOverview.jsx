import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import { getFacebookPageInsights, getGithubStatsApi, getInstagramInsights } from "../../../api";
import { useReport } from "../../../contexts/ReportContext";

const SOCIAL_RANGE = "lastMonth";
const GITHUB_RANGE = "all";
const MAX_ITEMS = 8;
const FACEBOOK_COLOR = "#1877F2";
const INSTAGRAM_COLOR = "#E1306C";
const COMMITS_COLOR = "#43A047";
const CHART_IDS_OVERVIEW = {
  socialReachRanking: "chart-overviewSocialReachRanking-platform:github-period:lastMonth",
  commitRanking: "chart-overviewCommitRanking-platform:github-period:all",
};

const getGithubOwnerFromUrl = (repoUrl) => {
  if (!repoUrl || typeof repoUrl !== "string") return null;
  try {
    const parsed = new URL(repoUrl);
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments[0] || null;
  } catch {
    return null;
  }
};

const toSafeNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") return Number(value) || 0;
  if (Array.isArray(value)) return value.reduce((acc, item) => acc + toSafeNumber(item), 0);
  if (value && typeof value === "object") {
    return Object.values(value).reduce((acc, item) => acc + toSafeNumber(item), 0);
  }
  return 0;
};

const sumMetricValues = (insights = [], metricName = "") => {
  const metric = Array.isArray(insights)
    ? insights.find((item) => item?.name === metricName)
    : null;
  const values = Array.isArray(metric?.values) ? metric.values : [];
  return values.reduce((acc, row) => acc + toSafeNumber(row?.value), 0);
};

const formatCompact = (value) => {
  const n = toSafeNumber(value);
  try {
    return new Intl.NumberFormat("es-BO", {
      notation: "compact",
      maximumFractionDigits: 1,
    })
      .format(n)
      .replace(/\s+/g, "");
  } catch {
    return String(Math.round(n));
  }
};

const EmptyState = ({ message }) => (
  <Box
    sx={{
      minHeight: 320,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "text.secondary",
      textAlign: "center",
      px: 2,
    }}
  >
    <Typography variant="body2">{message}</Typography>
  </Box>
);

const RankingTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
        px: 1.2,
        py: 0.8,
      }}
    >
      <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, mb: 0.6 }}>{label}</Typography>
      {payload.map((entry) => (
        <Typography key={`${entry.name}-${entry.dataKey}`} sx={{ fontSize: "0.76rem" }}>
          {entry.name}: {formatCompact(entry.value)}
        </Typography>
      ))}
    </Box>
  );
};

const ChartCard = ({
  title,
  subtitle,
  icon,
  children,
  selectable = false,
  selected = false,
  canSelect = true,
  onSelectChange,
}) => (
  <Card
    variant="outlined"
    sx={{
      minHeight: 420,
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 55%, rgba(255,255,255,0.02) 100%)",
      borderColor: selectable && selected ? "primary.main" : "divider",
      borderRadius: 2.5,
    }}
  >
    <CardContent sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
            {subtitle}
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.2}>
          {icon}
          {selectable && canSelect && (
            <Checkbox
              size="small"
              checked={selected}
              onChange={(event) => onSelectChange?.(event.target.checked)}
            />
          )}
        </Stack>
      </Stack>
      <Divider sx={{ mb: 1.5 }} />
      {children}
    </CardContent>
  </Card>
);

export const IntegrationsRankingOverview = ({ projects = [], showingDialog = false }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [rankingRows, setRankingRows] = useState([]);
  const { addChart, removeChart, selectedCharts } = useReport();

  useEffect(() => {
    let active = true;

    const loadRankings = async () => {
      try {
        setLoading(true);
        setError(false);

        const rows = await Promise.all(
          projects.map(async (project) => {
            const facebookIntegration = project?.integrations?.find((it) => it?.platform === "facebook");
            const instagramIntegration = project?.integrations?.find((it) => it?.platform === "instagram");
            const githubIntegration = project?.integrations?.find((it) => it?.platform === "github");
            const githubOwner = getGithubOwnerFromUrl(githubIntegration?.url);

            const [facebookReach, instagramReach, commits] = await Promise.all([
              facebookIntegration?.integration_id
                ? getFacebookPageInsights(facebookIntegration.integration_id, SOCIAL_RANGE)
                    .then((insights) => sumMetricValues(insights, "page_media_view"))
                    .catch(() => 0)
                : Promise.resolve(0),
              instagramIntegration?.integration_id
                ? getInstagramInsights(instagramIntegration.integration_id, SOCIAL_RANGE)
                    .then((insights) => sumMetricValues(insights, "reach"))
                    .catch(() => 0)
                : Promise.resolve(0),
              githubIntegration?.name
                ? getGithubStatsApi(githubIntegration.name, GITHUB_RANGE, undefined, githubOwner)
                    .then((stats) => toSafeNumber(stats?.commitsCount))
                    .catch(() => 0)
                : Promise.resolve(0),
            ]);

            return {
              id: project?.id,
              projectName: project?.name || "Proyecto",
              facebookReach,
              instagramReach,
              socialReach: facebookReach + instagramReach,
              commits,
            };
          })
        );

        if (!active) return;
        setRankingRows(rows);
      } catch {
        if (!active) return;
        setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (projects.length > 0) {
      loadRankings();
    } else {
      setRankingRows([]);
    }

    return () => {
      active = false;
    };
  }, [projects]);

  const socialData = useMemo(
    () =>
      [...rankingRows]
        .filter((row) => row.socialReach > 0)
        .sort((a, b) => b.socialReach - a.socialReach)
        .slice(0, MAX_ITEMS),
    [rankingRows]
  );

  const commitsData = useMemo(
    () =>
      [...rankingRows]
        .filter((row) => row.commits > 0)
        .sort((a, b) => b.commits - a.commits)
        .slice(0, MAX_ITEMS),
    [rankingRows]
  );

  const isSelected = (idName) => selectedCharts.some((chart) => chart.id_name === idName);

  const buildOverviewPayload = (idName, title, data, period, periodLabel) => ({
    id_name: idName,
    integration_data: {
      project: { id: "overview", name: "Resumen de integraciones" },
      integration: { platform: "github", name: "ranking-proyectos" },
    },
    period,
    periodLabel,
    title,
    interval: periodLabel,
    data,
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 1.5 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Ranking de proyectos con integraciones
          </Typography>
        </Box>
        <Chip label="Alcance: ultimo mes | Commits: historico" size="small" sx={{ fontWeight: 700 }} />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" },
          gap: 1.5,
        }}
      >
        <ChartCard
          title="Alcance en redes"
          subtitle="Facebook + Instagram por proyecto"
          icon={<GroupsRoundedIcon sx={{ color: "primary.main" }} />}
          selectable={showingDialog}
          selected={isSelected(CHART_IDS_OVERVIEW.socialReachRanking)}
          canSelect={!loading && !error && socialData.length > 0}
          onSelectChange={(checked) => {
            if (checked) {
              addChart(
                buildOverviewPayload(
                  CHART_IDS_OVERVIEW.socialReachRanking,
                  "Alcance en redes",
                  socialData,
                  "lastMonth",
                  "Ultimo mes"
                )
              );
            } else {
              removeChart({ id_name: CHART_IDS_OVERVIEW.socialReachRanking });
            }
          }}
        >
          <Stack direction="row" spacing={1.6} sx={{ mb: 1.2, ml: 0.4 }}>
            <Stack direction="row" alignItems="center" spacing={0.7}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: FACEBOOK_COLOR }} />
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                Facebook
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.7}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: INSTAGRAM_COLOR }} />
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                Instagram
              </Typography>
            </Stack>
          </Stack>

          {loading ? (
            <Stack spacing={1}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <Skeleton key={idx} variant="rounded" height={26} />
              ))}
            </Stack>
          ) : error ? (
            <EmptyState message="No se pudo generar el ranking de alcance en este momento." />
          ) : socialData.length === 0 ? (
            <EmptyState message="No hay datos de alcance en Facebook/Instagram para el periodo seleccionado." />
          ) : (
            <Box sx={{ width: "100%", height: 335 }}>
              <ResponsiveContainer>
                <BarChart
                  layout="vertical"
                  data={socialData}
                  margin={{ top: 10, right: 18, left: 10, bottom: 6 }}
                  barCategoryGap={12}
                  barSize={22}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} opacity={0.45} />
                  <XAxis type="number" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <YAxis
                    dataKey="projectName"
                    type="category"
                    width={120}
                    tick={{ fill: theme.palette.text.primary, fontSize: 12, fontWeight: 700 }}
                  />
                  <Tooltip
                    content={<RankingTooltip />}
                    cursor={{ fill: "rgba(24, 119, 242, 0.12)" }}
                  />
                  <Bar
                    dataKey="facebookReach"
                    stackId="reach"
                    name="Facebook"
                    fill={FACEBOOK_COLOR}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="instagramReach"
                    stackId="reach"
                    name="Instagram"
                    fill={INSTAGRAM_COLOR}
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </ChartCard>

        <ChartCard
          title="Ranking de commits"
          subtitle="Actividad historica de GitHub por proyecto"
          icon={<AnalyticsRoundedIcon sx={{ color: "success.main" }} />}
          selectable={showingDialog}
          selected={isSelected(CHART_IDS_OVERVIEW.commitRanking)}
          canSelect={!loading && !error && commitsData.length > 0}
          onSelectChange={(checked) => {
            if (checked) {
              addChart(
                buildOverviewPayload(
                  CHART_IDS_OVERVIEW.commitRanking,
                  "Ranking de commits",
                  commitsData,
                  "all",
                  "Todo historico"
                )
              );
            } else {
              removeChart({ id_name: CHART_IDS_OVERVIEW.commitRanking });
            }
          }}
        >
          {loading ? (
            <Stack spacing={1}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <Skeleton key={idx} variant="rounded" height={26} />
              ))}
            </Stack>
          ) : error ? (
            <EmptyState message="No se pudo generar el ranking de commits en este momento." />
          ) : commitsData.length === 0 ? (
            <EmptyState message="No hay datos historicos de commits para proyectos con integracion GitHub." />
          ) : (
            <Box sx={{ width: "100%", height: 335 }}>
              <ResponsiveContainer>
                <BarChart
                  layout="vertical"
                  data={commitsData}
                  margin={{ top: 10, right: 18, left: 10, bottom: 6 }}
                  barCategoryGap={12}
                  barSize={22}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} opacity={0.45} />
                  <XAxis type="number" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <YAxis
                    dataKey="projectName"
                    type="category"
                    width={120}
                    tick={{ fill: theme.palette.text.primary, fontSize: 12, fontWeight: 700 }}
                  />
                  <Tooltip
                    content={<RankingTooltip />}
                    cursor={{ fill: "rgba(67, 160, 71, 0.12)" }}
                  />
                  <Bar dataKey="commits" name="Commits" fill={COMMITS_COLOR} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </ChartCard>
      </Box>
    </Box>
  );
};

export default IntegrationsRankingOverview;
