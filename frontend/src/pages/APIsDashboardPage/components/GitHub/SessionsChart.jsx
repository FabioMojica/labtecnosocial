import * as React from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardContent, Typography, useTheme, Divider, Checkbox } from "@mui/material";
import { Tooltip, ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Line } from "recharts";
import dayjs from "dayjs";
import { useMemo } from "react";

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

AreaGradient.propTypes = {
  color: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const theme = useTheme();
  const commit = payload[0].payload;
  const commitDate = dayjs(commit.date).format("DD/MM/YYYY HH:mm:ss");

  return (
    <Card style={{
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "10px",
      maxWidth: "300px",
      fontSize: "14px",
      backgroundColor: theme.palette.background.paper,
    }}>
      <Box style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
        <img
          src={commit.author?.avatar_url}
          alt={commit.author?.login}
          style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 8 }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{commit.author?.login}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{commit?.commit.commit?.author?.email}</Typography>
        </Box>
      </Box>
      <Divider></Divider>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}><strong>Fecha y Hora:</strong> {commitDate}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}><strong>Número de commit en el día:</strong> {commit.y}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }} style={{ marginTop: 6 }}>
          <strong>Mensaje:</strong> {commit.message}
        </Typography>
      </Box>
    </Card>
  );
};

export const SessionsChart = ({
  commitsData,
  title,
  interval,
  selectable = false,
  selected = false,
  onSelectChange,
  selectedPeriod = "all",
}) => {
  const theme = useTheme();

  // --- FILTRADO DE COMMITS SEGÚN EL PERIODO ---
  const filteredCommits = useMemo(() => {
    if (!selectedPeriod || selectedPeriod === "all") return commitsData;

    const today = dayjs().startOf('day');
    let startDate, endDate;

    switch (selectedPeriod) {
      case 'today':
        startDate = today;
        endDate = today.endOf('day');
        break;
      case 'lastWeek':
        startDate = today.subtract(7, 'day');
        endDate = today.endOf('day');
        break;
      case 'lastMonth':
        startDate = today.subtract(1, 'month');
        endDate = today.endOf('day');
        break;
      case 'lastSixMonths':
        startDate = today.subtract(6, 'month');
        endDate = today.endOf('day');
        break;
      default:
        return commitsData;
    }

    return commitsData.filter(c => {
      const commitDate = dayjs(c.commit.author.date);
      return commitDate.isSameOrAfter(startDate, 'day') && commitDate.isSameOrBefore(endDate, 'day');
    });
  }, [commitsData, selectedPeriod]);

  const pxPerDay = 120;

  const { chartData, xTicks } = useMemo(() => {
    const uniqueDays = Array.from(
      new Set(filteredCommits.map(c => dayjs(c.commit.author.date).format("YYYY-MM-DD")))
    ).sort();

    const dayIndexMap = {};
    uniqueDays.forEach((day, idx) => (dayIndexMap[day] = idx));

    const commitsByDay = {};
    filteredCommits.forEach(c => {
      const day = dayjs(c.commit.author.date).format("YYYY-MM-DD");
      if (!commitsByDay[day]) commitsByDay[day] = [];
      commitsByDay[day].push(c);
    });

    const data = [];
    uniqueDays.forEach(day => {
      const commitsInDay = (commitsByDay[day] || []).sort(
        (a, b) => new Date(a.commit.author.date) - new Date(b.commit.author.date)
      );

      commitsInDay.forEach((commit, idx) => {
        const commitDate = dayjs(commit.commit.author.date);
        const secondsSinceMidnight = commitDate.hour() * 3600 + commitDate.minute() * 60 + commitDate.second();
        const x = dayIndexMap[day] + secondsSinceMidnight / 86400;

        data.push({
          x,
          y: idx + 1,
          sha: commit.sha,
          message: commit.commit.message,
          date: commit.commit.author.date,
          day,
          author: commit.author,
          commit
        });
      });
    });

    return { chartData: data, xTicks: uniqueDays };
  }, [filteredCommits]);

  const maxY = Math.max(...chartData.map(d => d.y), 6);


  if (!filteredCommits || filteredCommits.length === 0) {
    return (
      <Card style={{
        width: "100%",
        height: 400,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Typography variant="h6" style={{ color: "orange", fontWeight: "bold" }}>
          No hay datos para mostrar
        </Typography>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{
      height: '100%',
      width: '100%',
      position: 'relative',
      minHeight: 400
    }}>
      <Typography
        component="h2"
        variant="subtitle2"
        sx={{
          position: 'relative',
          mt: 2,
          ml: 2,
          zIndex: 10
        }}
      >
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', zIndex: 10, position: 'relative', ml: 2 }}>{interval}</Typography>
      {selectable && (
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Checkbox checked={selected} onChange={(e) => onSelectChange?.(e.target.checked)} />
        </Box>
      )}
      <CardContent sx={{
        height: '100%',
        width: '100%',
        position: 'relative',
        overflowX: 'auto',
        "&::-webkit-scrollbar": { height: "2px" },
        "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
        "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
        "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
      }}>
        <ResponsiveContainer
          width={Math.max(xTicks.length * pxPerDay, 800)}
          sx={{ height: 200 }}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              ticks={xTicks.map((_, idx) => idx)}
              tickFormatter={(val) => xTicks[Math.floor(val)] ? dayjs(xTicks[Math.floor(val)]).format("DD/MM/YY") : ""}
              angle={-45}
              textAnchor="end"
              tick={{ fontSize: 12, fontWeight: 500 }}
              domain={[0, xTicks.length]}
            />

            <YAxis
              domain={[1, maxY]}
              allowDecimals={false}
              tickCount={Math.min(maxY, 10)}
              tick={{ fontSize: 12, fontWeight: 500 }}
            />

            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="y"
              stroke={theme.palette.primary.dark}
              dot={{ r: 4, cursor: "pointer" }}
              activeDot={{ r: 6, cursor: "pointer" }}
              isAnimationActive={false}
            />
            <AreaGradient color={theme.palette.primary.dark} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
      <Card
        variant="outlined"
        sx={{
          position: "sticky",
          width: 30,
          height: '100%',
          top: 0,
          bottom: 0,
          left: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          zIndex: 0
        }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            transform: "rotate(-90deg) translateY(-50%)",
            transformOrigin: "center",
            fontWeight: "bold",
            textAlign: "center",
            whiteSpace: "nowrap",
            ml: 3,
          }}
        >
          Número de commits en el día
        </Typography>
      </Card>
      <Typography variant="body2" color="text.secondary"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          position: "sticky",
          bottom: 5,
          left: 0
        }}
      >
        Fecha del commit
      </Typography>
    </Card>
  );
};
