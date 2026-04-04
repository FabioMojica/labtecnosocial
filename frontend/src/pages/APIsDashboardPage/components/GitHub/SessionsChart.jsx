import * as React from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardContent, Typography, useTheme, Divider, Checkbox, Popover } from "@mui/material";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Line } from "recharts";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { NoResultsScreen } from '../../../../generalComponents';

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

const CommitDetailsCard = ({ commit }) => {
  if (!commit) return null;
  const theme = useTheme();
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

const CommitDot = ({ cx, cy, payload, stroke, onSelect, selected }) => {
  if (typeof cx !== "number" || typeof cy !== "number") return null;

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="transparent"
        data-commit-dot="true"
        style={{ cursor: "pointer" }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.(payload, cx, cy, event);
        }}
      />
      <circle
        cx={cx}
        cy={cy}
        r={selected ? 5.5 : 4}
        fill={selected ? "#1D9BF0" : "#fff"}
        stroke={stroke}
        strokeWidth={selected ? 3 : 1.8}
        data-commit-dot="true"
        style={{ cursor: "pointer" }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.(payload, cx, cy, event);
        }}
      />
    </g>
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
  mode = "dashboard",
}) => {
  const theme = useTheme();
  const isReportMode = mode === "report";
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [selectedCommitUi, setSelectedCommitUi] = useState(null);

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

  const pxPerDay = isReportMode ? 34 : 120;

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
  const chartWidth = Math.max(xTicks.length * pxPerDay, isReportMode ? 520 : 860);
  const chartCanvasWidth = chartWidth;
  const reportChartHeight = 240;

  useEffect(() => {
    if (!selectedCommit) return;
    const stillExists = chartData.some((item) => item.sha === selectedCommit.sha);
    if (!stillExists) {
      setSelectedCommit(null);
      setSelectedCommitUi(null);
    }
  }, [chartData, selectedCommit]);

  const handleSelectCommit = (payload, _cx, _cy, event) => {
    if (!payload) return;

    const screenX = event?.clientX ?? 0;
    const screenY = event?.clientY ?? 0;

    setSelectedCommit(payload);
    setSelectedCommitUi({ screenX, screenY });
  };


  if (!filteredCommits || filteredCommits.length === 0) {
    return (
      <Card style={{
        width: "100%",
        height: 400,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <NoResultsScreen
          message='No hay datos para mostrar'
          sx={{
            height: '100%',
            width: '100%'
          }}

        />

      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{
      height: '100%',
      width: '100%',
      maxWidth: 1000,
      position: 'relative',
      minHeight: isReportMode ? 330 : 400,
      p: 2
    }}>
      <Typography component="h2" variant="subtitle2">
        {title}
      </Typography>
      <Typography variant="caption" color='textSecondary'>{interval}</Typography>
      {selectable && (
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Checkbox checked={selected} onChange={(e) => onSelectChange?.(e.target.checked)} />
        </Box>
      )}
      <CardContent sx={{
        height: isReportMode ? 'auto' : '100%',
        width: '100%',
        p: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Typography variant="body2" color="text.secondary"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Fecha del commit
        </Typography>

        <Box display={'flex'} sx={{
          width: '100%',
          height: isReportMode ? reportChartHeight + 14 : '100%',
        }}>
          <Card
            variant="outlined"
            sx={{
              position: "sticky",
              width: isReportMode ? 34 : 20,
              height: '100%',
              top: 0,
              bottom: 0,
              left: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 0,
              border: 'none',
              zIndex: 200,
              pl: isReportMode ? 0 : 2,
            }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                transform: isReportMode ? "rotate(-90deg)" : "rotate(-90deg) translateY(-50%)",
                transformOrigin: "center",
                fontWeight: "bold",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            > 
              Número de commits en el día
            </Typography>
          </Card>
          <Box sx={{
            width: '100%',
            display: isReportMode ? 'block' : 'flex',
            flex: 1,
            minHeight: 0,
            mb: isReportMode ? 0.5 : 2,
            overflowX: 'scroll',
            overflowY: 'hidden',
            scrollbarGutter: 'stable both-edges',
            pb: 0.5,
            "&::-webkit-scrollbar": { height: "4px" },
            "&::-webkit-scrollbar-track": { backgroundColor: "rgba(0,0,0,0.7)", borderRadius: "6px" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: "#D0D3D8", borderRadius: "6px" },
            "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#E5E7EB" },
            scrollbarColor: '#D0D3D8 rgba(0,0,0,0.7)',
            '& svg': {
              outline: 'none',
            },
            '& svg:focus': {
              outline: 'none',
            },
            '& svg:focus-visible': {
              outline: 'none',
            },
          }}>
            <Box sx={{ width: chartCanvasWidth, minWidth: chartCanvasWidth, height: isReportMode ? reportChartHeight : '100%', pr: 1 }}>
            <ResponsiveContainer width={chartCanvasWidth} height={isReportMode ? reportChartHeight : undefined}>
              <LineChart
                data={chartData} margin={{ top: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3"/>
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

                <Line
                  type="monotone"
                  dataKey="y"
                  stroke={theme.palette.primary.dark}
                  dot={(props) => (
                    <CommitDot
                      cx={props?.cx}
                      cy={props?.cy}
                      payload={props?.payload}
                      stroke={theme.palette.primary.dark}
                      selected={selectedCommit?.sha === props?.payload?.sha}
                      onSelect={handleSelectCommit}
                    />
                  )}
                  activeDot={false}
                  isAnimationActive={true}
                />
                <AreaGradient color={theme.palette.primary.dark} />
              </LineChart>
            </ResponsiveContainer>
            </Box>
            {!isReportMode && <Box sx={{ minWidth: 88, width: 88, flex: '0 0 auto' }} />}
          </Box>
        </Box>
      </CardContent>
      {!isReportMode && (
        <Popover
          open={Boolean(selectedCommit && selectedCommitUi)}
          onClose={() => {
            setSelectedCommit(null);
            setSelectedCommitUi(null);
          }}
          anchorReference="anchorPosition"
          anchorPosition={
            selectedCommitUi
              ? {
                  left: Math.max(
                    8,
                    Math.min(
                      selectedCommitUi.screenX + 14,
                      (typeof window !== 'undefined' ? window.innerWidth : 1200) - 320
                    )
                  ),
                  top: Math.max(
                    76,
                    Math.min(
                      selectedCommitUi.screenY - 22,
                      (typeof window !== 'undefined' ? window.innerHeight : 900) - 190
                    )
                  ),
                }
              : undefined
          }
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              overflow: 'visible',
            },
          }}
        >
          <Box data-commit-tooltip="true" sx={{ maxWidth: 300 }}>
            <CommitDetailsCard commit={selectedCommit} />
          </Box>
        </Popover>
      )}
    </Card>
  );
};
