import * as React from 'react';
import PropTypes from 'prop-types';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { DashboardCard } from './DashboardCard';
import { formatNumber } from '../utils/cards';

const StyledText = styled('text', {
  shouldForwardProp: (prop) => prop !== 'variant',
})(({ theme }) => ({
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fill: (theme.vars || theme).palette.text.secondary,
  variants: [
    { props: { variant: 'primary' }, style: { fontSize: theme.typography.h5.fontSize, fontWeight: theme.typography.h5.fontWeight } },
    { props: ({ variant }) => variant !== 'primary', style: { fontSize: theme.typography.body2.fontSize, fontWeight: theme.typography.body2.fontWeight } },
  ],
}));

function PieCenterLabel({ primaryText, secondaryText }) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;
  return (
    <>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </>
  );
}

PieCenterLabel.propTypes = {
  primaryText: PropTypes.string.isRequired,
  secondaryText: PropTypes.string.isRequired,
};

const colors = [
  'hsl(220, 20%, 65%)',
  'hsl(220, 20%, 42%)',
  'hsl(220, 20%, 35%)',
  'hsl(220, 20%, 25%)',
  'hsl(120, 50%, 60%)',
  'hsl(50, 70%, 60%)',
];

export const ChartFollowersByCountry = ({
  mode = 'dashboard',
  loading,
  error,
  data,
  interval,
  title = "Seguidores por país",
  selected = true,
  selectable = true,
  onSelectChange,
}) => {
  const formatPercentage = (percentage) => {
    if (percentage <= 0) return '0%';
    if (percentage < 10) {
      return `${percentage.toLocaleString('es-BO', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}%`;
    }
    return `${Math.round(percentage)}%`;
  };

  const theme = useTheme();
  const latest = React.useMemo(() => {
    if (!data?.length) return {};
    return data[data.length - 1];
  }, [data]);


  const totalFollowers = Object.values(latest).reduce((acc, val) => acc + Number(val ?? 0), 0);

  const pieData = Object.entries(latest)
    .map(([country, value]) => {
      const absoluteValue = Number(value ?? 0);
      const percentage = totalFollowers > 0 ? (absoluteValue / totalFollowers) * 100 : 0;

      return {
        label: country,
        value: absoluteValue,
        percentage,
      };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <DashboardCard
      title={title}
      titleSpinner={'Obteniendo los seguidores por país de la página...'}
      titleError={'Ocurrió un error al obtener los seguidores por país de la página'}
      interval={interval}
      loading={loading}
      error={error}
      isEmpty={data?.length === 0}
      selectable={selectable}
      selected={selected}
      onSelectChange={onSelectChange}
      sxCard={{
        height: {
          xs: 540,
          sm: 540,
          lg: 540,
        },
        maxHeight: {
          xs: 'auto',
          sm: 540,
          lg: 540
        },
      }}
    >
      <Box mt={2.5} pr={1} pb={5} sx={{
        maxHeight: {
          xs: 540,
          sm: mode === 'report' ? 'auto' : 540,
          lg: mode === 'report' ? 'auto' : 540
        },
        overflowY: 'auto',
        "&::-webkit-scrollbar": { height: "2px", width: "2px" },
        "&::-webkit-scrollbar-track": {
          backgroundColor: theme.palette.background.default,
          borderRadius: "2px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: theme.palette.primary.main,
          borderRadius: "2px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: theme.palette.primary.dark,
        },
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PieChart
            colors={colors}
            margin={{ left: 80, right: 80, top: 80, bottom: 80 }}
            series={[{
              data: pieData,
              innerRadius: 75,
              outerRadius: 100,
              paddingAngle: 0,
              highlightScope: { fade: 'global', highlight: 'item' },
              valueFormatter: (item) => `${item.label}: ${formatNumber(item.value)} seguidores`,
            }]}
            height={260}
            width={260}
            hideLegend
          >
            <PieCenterLabel primaryText={formatNumber(totalFollowers)} secondaryText="Total" />
          </PieChart>
        </Box>

        {pieData.map((c, index) => (
          <Stack key={c.label} direction="row" sx={{ alignItems: 'center', gap: 2, pb: 2 }}>
            <Box sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: colors[index % colors.length] }} />
            <Stack sx={{ gap: 1, flexGrow: 1 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: '500' }}>{c.label}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{formatPercentage(c.percentage)}</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={c.percentage}
                sx={{ [`& .${linearProgressClasses.bar}`]: { backgroundColor: colors[index % colors.length] } }}
              />
            </Stack>
          </Stack>
        ))}
      </Box>
    </DashboardCard>
  );
}

ChartFollowersByCountry.propTypes = {
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
};
