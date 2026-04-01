import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Box, Checkbox, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { NoResultsScreen } from '../../../../generalComponents';
import { formatNumber } from '../Facebook/utils/cards';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const HOUR_COLOR_SET = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#a855f7',
  '#14b8a6',
  '#ef4444',
  '#eab308',
  '#6366f1',
];

const getCommitDate = (commit) =>
  commit?.commit?.committer?.date ?? commit?.commit?.author?.date ?? null;

const resolveRangeStart = (selectedPeriod = 'all') => {
  const todayLocal = dayjs().startOf('day');

  switch (selectedPeriod) {
    case 'today':
      return todayLocal;
    case 'lastWeek':
      return todayLocal.subtract(7, 'day');
    case 'lastMonth':
      return todayLocal.subtract(1, 'month');
    case 'lastSixMonths':
      return todayLocal.subtract(6, 'month');
    default:
      return null;
  }
};

const buildHourLabel = (hour) => {
  const nextHourLabel = hour === 23 ? '24:00' : `${hour + 1}:00`;
  return `${hour}:00-${nextHourLabel}`;
};

const toHourlyTopData = (commits = [], selectedPeriod = 'all') => {
  const startDate = resolveRangeStart(selectedPeriod);
  const endDate = dayjs().endOf('day');

  let droppedInvalidDate = 0;

  const hourBuckets = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: buildHourLabel(hour),
    commits: 0,
  }));

  commits.forEach((commit) => {
    const rawDate = getCommitDate(commit);
    const commitDate = rawDate ? dayjs(rawDate) : null;

    if (!commitDate || !commitDate.isValid()) {
      droppedInvalidDate += 1;
      return;
    }

    if (
      startDate &&
      (!commitDate.isSameOrAfter(startDate, 'day') ||
        !commitDate.isSameOrBefore(endDate, 'day'))
    ) {
      return;
    }

    hourBuckets[commitDate.hour()].commits += 1;
  });

  const topHours = hourBuckets
    .filter((bucket) => bucket.commits > 0)
    .sort((a, b) => {
      if (b.commits !== a.commits) return b.commits - a.commits;
      return a.hour - b.hour;
    })
    .slice(0, 8)
    .map((bucket, index) => ({
      ...bucket,
      color: HOUR_COLOR_SET[index % HOUR_COLOR_SET.length],
    }));

  return {
    droppedInvalidDate,
    topHours,
    totalCommitsInRange: hourBuckets.reduce((sum, bucket) => sum + bucket.commits, 0),
  };
};

const CustomTooltip = ({ active, payload }) => {
  const theme = useTheme();

  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <Card
      variant="outlined"
      sx={{
        p: 1,
        bgcolor: 'background.paper',
        borderColor: 'divider',
        minWidth: 160,
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Franja horaria local
      </Typography>
      <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
        {point.label}
      </Typography>
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
        {formatNumber(point.commits)} commits
      </Typography>
    </Card>
  );
};

export const CommitsByWeekdayHour = ({
  commitsData = [],
  title,
  interval,
  selectable = false,
  selected = false,
  onSelectChange,
  selectedPeriod = 'all',
}) => {
  const theme = useTheme();

  const { topHours, droppedInvalidDate, totalCommitsInRange } = useMemo(
    () => toHourlyTopData(commitsData, selectedPeriod),
    [commitsData, selectedPeriod]
  );

  if (!topHours.length) {
    return (
      <Card
        variant="outlined"
        sx={{
          width: '100%',
          minHeight: 400,
          position: 'relative',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {selectable && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
            <Checkbox checked={selected} onChange={(e) => onSelectChange?.(e.target.checked)} />
          </Box>
        )}
        <CardContent sx={{ height: '100%' }}>
          <Typography variant="subtitle2">{title}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {interval}
          </Typography>
          <NoResultsScreen
            message="No hay commits suficientes para calcular horas de actividad"
            sx={{ mt: 2, height: 280 }}
            iconSX={{ fontSize: 56 }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        minHeight: 400,
        position: 'relative',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {selectable && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <Checkbox checked={selected} onChange={(e) => onSelectChange?.(e.target.checked)} />
        </Box>
      )}

      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          '&:last-child': { pb: 2 },
        }}
      >
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {interval}
        </Typography>

        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.75 }}>
          Top horas con mas commits (hora local)
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1, mb: 1.25 }}>
          {topHours.map((item) => (
            <Box
              key={item.label}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 0.9,
                py: 0.4,
                borderRadius: 1,
                bgcolor: 'action.hover',
              }}
            >
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: 0.4,
                  bgcolor: item.color,
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {item.label}: {formatNumber(item.commits)}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Box sx={{ width: '100%', height: 260, minWidth: 0, mt: 0.25 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topHours}
              margin={{ top: 18, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
              <XAxis
                dataKey="label"
                tick={{ fill: theme.palette.text.primary, fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: theme.palette.divider }}
                tickLine={{ stroke: theme.palette.divider }}
              />
              <YAxis
                allowDecimals={false}
                width={40}
                tick={{ fill: theme.palette.text.primary, fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: theme.palette.divider }}
                tickLine={{ stroke: theme.palette.divider }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="commits" radius={[8, 8, 0, 0]} maxBarSize={58}>
                {topHours.map((item) => (
                  <Cell key={`bar-${item.label}`} fill={item.color} />
                ))}
                <LabelList
                  dataKey="commits"
                  position="top"
                  formatter={(value) => formatNumber(value)}
                  style={{
                    fill: theme.palette.text.primary,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {droppedInvalidDate > 0 && (
          <Typography variant="caption" sx={{ color: 'warning.main', mt: 0.75 }}>
            Se omitieron {formatNumber(droppedInvalidDate)} commits con fecha invalida.
          </Typography>
        )}

        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.25 }}>
          Total analizado: {formatNumber(totalCommitsInRange)} commits.
        </Typography>
      </CardContent>
    </Card>
  );
};
