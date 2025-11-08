import React, { useMemo, useState } from 'react';
import { Card, CardContent, Typography, Stack, Chip, Checkbox, TextField, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { NoResultsScreen } from '../../../../generalComponents';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function PullRequestsCard({
  prs = [],
  title = "Pull Requests",
  interval,
  selectable = false,
  selected = false,
  onSelectChange,
  selectedPeriod = 'lastMonth'
}) {
  const theme = useTheme();
  const safePRs = prs || [];
  const [customGoal, setCustomGoal] = useState(10);

  const filteredPRs = useMemo(() => {
    if (!safePRs.length) return [];

    const today = dayjs().startOf('day');
    let startDate, endDate;
    const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    switch (selectedPeriod) {
      case 'today':
        // startDate = today;
        // endDate = today.endOf('day');
        startDate = normalizeDate(new Date());
        endDate = normalizeDate(new Date());
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
        startDate = null;
        endDate = null;
    }

    if (!startDate) return safePRs;

    return safePRs.filter(pr => {
      const prDate = dayjs(pr.created_at);
      return prDate.isSameOrAfter(startDate, 'day') && prDate.isSameOrBefore(endDate, 'day');
    });
  }, [safePRs, selectedPeriod]);

  const prsByDate = useMemo(() => {
    const grouped = {};
    filteredPRs.forEach(pr => {
      const day = dayjs(pr.created_at).format('YYYY-MM-DD');
      grouped[day] = (grouped[day] || 0) + 1;
    });

    let dateArray = [];
    if (filteredPRs.length) {
      const minDate = dayjs(Math.min(...filteredPRs.map(p => new Date(p.created_at))));
      const maxDate = dayjs(Math.max(...filteredPRs.map(p => new Date(p.created_at))));
      for (let d = minDate; d.isSameOrBefore(maxDate, 'day'); d = d.add(1, 'day')) {
        const dayStr = d.format('YYYY-MM-DD');
        grouped[dayStr] = grouped[dayStr] || 0;
        dateArray.push(dayStr);
      }

      // 🩵 Si solo hay un día (por ejemplo, hoy), agrega el día anterior
      if (selectedPeriod === 'today' && dateArray.length === 1) {
        const yesterday = dayjs(minDate).subtract(1, 'day').format('YYYY-MM-DD');
        grouped[yesterday] = grouped[yesterday] || 0;
        dateArray.unshift(yesterday);
      }
    }

    return { grouped, dateArray };
  }, [filteredPRs, selectedPeriod]);


  const data = prsByDate.dateArray.map(d => prsByDate.grouped[d]);
  const totalPRs = data.reduce((a, b) => a + b, 0);

  if (!totalPRs) {
    return (
      <Card variant="outlined" sx={{ height: '100%', maxHeight: 300, flexGrow: 1 }}>
        <CardContent sx={{ height: '100%', p: 0 }}>
          <NoResultsScreen
            message="Sin PRs para mostrar"
            sx={{ height: '100%' }}
            textSx={{
              fontSize: {
                xs: '0.8rem',
                sm: '1rem'
              }
            }}
            iconSX={{
              fontSize: 70
            }}
          />
        </CardContent>
      </Card>
    );
  }

  const percent = customGoal > 0 ? Math.round((totalPRs / customGoal) * 100) : 0;
  const trendColor = percent >= 100 ? theme.palette.success.main : percent >= 50 ? theme.palette.warning.main : theme.palette.error.main;

  return (
    <Card variant="outlined" sx={{ height: '100%', maxHeight: 300, flexGrow: 1, position: 'relative' }}>
      {selectable && totalPRs !== 0 && (
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Checkbox checked={selected} onChange={(e) => onSelectChange?.(e.target.checked)} />
        </Box>
      )}
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>{title}</Typography>
        <Stack direction="column">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">{totalPRs}</Typography>

            <TextField
              size="small"
              type="number"
              label="Meta"
              value={customGoal}
              disabled={!selectable}
              onChange={e => {
                const val = Number(e.target.value);
                setCustomGoal(isNaN(val) ? 0 : val);
              }}
              onBlur={() => {
                if (customGoal === '' || customGoal < 0) setCustomGoal(0);
              }}
              sx={{ width: 100 }}
              inputProps={{
                min: 0,
                style: {
                  MozAppearance: 'textfield', // Firefox
                },
              }}
              InputProps={{
                sx: {
                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                },
              }}
            />
            <Chip size="small" label={`${percent}%`} sx={{
              bgcolor: trendColor,
              color: theme.palette.getContrastText(trendColor),
              fontWeight: 'bold'
            }} />
          </Stack>

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{interval}</Typography>

          <Box sx={{ width: '100%', height: 40, position: 'relative' }}>
            <svg width="0" height="0">
              <defs>
                <linearGradient id="gradient-prs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={trendColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={trendColor} stopOpacity={0} />
                </linearGradient>
              </defs>
            </svg>

            <SparkLineChart

              sx={{
                '& .MuiAreaElement-root': {
                  fill: 'url(#gradient-prs)',
                },
              }}
              data={data}
              xAxis={{ scaleType: 'band', data: prsByDate.dateArray }}
              area
              showTooltip
              color={trendColor}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
