import { Box, Card, CardContent, Chip, Divider, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ResponsiveContainer, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

const toNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
};

const formatCompact = (value) => {
  const n = toNumber(value);
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

const ChartShell = ({ title, interval, subtitle, children }) => (
  <Card variant="outlined" sx={{ minHeight: 320, borderRadius: 2 }}>
    <CardContent sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.4 }}>
        {interval}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
        {subtitle}
      </Typography>
      <Divider sx={{ mt: 1, mb: 1.2 }} />
      {children}
    </CardContent>
  </Card>
);

const truncateProjectName = (value = "", max = 11) => {
  const text = String(value || "");
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
};

export const OverviewSocialReachRankingChart = ({
  data = [],
  title = "Alcance en redes",
  interval = "Ultimo mes",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const rows = (Array.isArray(data) ? data : [])
    .map((row) => ({
      projectName: row?.projectName || "Proyecto",
      facebookReach: toNumber(row?.facebookReach ?? 0),
      instagramReach: toNumber(row?.instagramReach ?? 0),
      socialReach: toNumber(row?.socialReach ?? 0),
    }))
    .filter((row) => row.socialReach > 0)
    .sort((a, b) => b.socialReach - a.socialReach)
    .slice(0, 8);

  return (
    <ChartShell title={title} interval={interval} subtitle="Facebook + Instagram por proyecto">
      <Stack direction="row" spacing={0.8} sx={{ mb: 1 }}>
        <Chip
          size="small"
          label="Facebook"
          sx={{
            fontWeight: 700,
            bgcolor: "rgba(24,119,242,0.14)",
            color: "text.primary",
            border: "1px solid rgba(24,119,242,0.45)",
            height: 24,
          }}
        />
        <Chip
          size="small"
          label="Instagram"
          sx={{
            fontWeight: 700,
            bgcolor: "rgba(225,48,108,0.14)",
            color: "text.primary",
            border: "1px solid rgba(225,48,108,0.45)",
            height: 24,
          }}
        />
      </Stack>

      {rows.length === 0 ? (
        <Box sx={{ minHeight: 220, display: "grid", placeItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No hay datos para mostrar
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: "100%", height: isMobile ? 220 : 250 }}>
          <ResponsiveContainer>
            <BarChart
              layout="vertical"
              data={rows}
              margin={{ top: 8, right: isMobile ? 6 : 18, left: 0, bottom: 4 }}
              barSize={isMobile ? 16 : 18}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} opacity={0.45} />
              <XAxis type="number" tick={{ fill: theme.palette.text.secondary, fontSize: isMobile ? 10 : 11 }} />
              <YAxis
                type="category"
                dataKey="projectName"
                width={isMobile ? 58 : 120}
                tickFormatter={(value) => (isMobile ? truncateProjectName(value, 9) : value)}
                tick={{ fill: theme.palette.text.primary, fontSize: isMobile ? 10 : 11, fontWeight: 700 }}
              />
              <Tooltip content={<RankingTooltip />} cursor={{ fill: "rgba(24, 119, 242, 0.12)" }} />
              <Bar dataKey="facebookReach" stackId="reach" name="Facebook" fill="#1877F2" radius={[0, 0, 0, 0]} />
              <Bar dataKey="instagramReach" stackId="reach" name="Instagram" fill="#E1306C" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </ChartShell>
  );
};

export const OverviewCommitRankingChart = ({
  data = [],
  title = "Ranking de commits",
  interval = "Todo historico",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const rows = (Array.isArray(data) ? data : [])
    .map((row) => ({
      projectName: row?.projectName || "Proyecto",
      commits: toNumber(row?.commits ?? 0),
    }))
    .filter((row) => row.commits > 0)
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 8);

  return (
    <ChartShell title={title} interval={interval} subtitle="Actividad historica de GitHub por proyecto">
      {rows.length === 0 ? (
        <Box sx={{ minHeight: 220, display: "grid", placeItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No hay datos para mostrar
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: "100%", height: isMobile ? 220 : 250 }}>
          <ResponsiveContainer>
            <BarChart
              layout="vertical"
              data={rows}
              margin={{ top: 8, right: isMobile ? 6 : 18, left: 0, bottom: 4 }}
              barSize={isMobile ? 16 : 18}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} opacity={0.45} />
              <XAxis type="number" tick={{ fill: theme.palette.text.secondary, fontSize: isMobile ? 10 : 11 }} />
              <YAxis
                type="category"
                dataKey="projectName"
                width={isMobile ? 58 : 120}
                tickFormatter={(value) => (isMobile ? truncateProjectName(value, 9) : value)}
                tick={{ fill: theme.palette.text.primary, fontSize: isMobile ? 10 : 11, fontWeight: 700 }}
              />
              <Tooltip content={<RankingTooltip />} cursor={{ fill: "rgba(67, 160, 71, 0.12)" }} />
              <Bar dataKey="commits" name="Commits" fill="#43A047" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </ChartShell>
  );
};
