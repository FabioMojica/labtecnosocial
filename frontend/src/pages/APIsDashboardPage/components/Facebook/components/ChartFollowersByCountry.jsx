import * as React from 'react';
import PropTypes from 'prop-types';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { DashboardCard } from './DashboardCard';

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
  loading,
  error,
  countryFollowersData,
  interval,
  title = "Seguidores por país",
  selected = true,
  selectable = true,
  onSelectChange,
}) => {
  const latest = React.useMemo(() => {
    if (!countryFollowersData?.length) return {};
    return countryFollowersData[countryFollowersData.length - 1];
  }, [countryFollowersData]);


  const totalFollowers = Object.values(latest).reduce((acc, val) => acc + val, 0);

  const pieData = Object.entries(latest).map(([country, value]) => ({
    label: country,
    value: (value / totalFollowers) * 100
  })).sort((a, b) => b.value - a.value);

  return (
    <DashboardCard
      title={title}
      titleSpinner={'Obteniendo los seguidores por país de la página...'}
      titleError={'Ocurrió un error al obtener los seguidores por país de la página'}
      interval={interval}
      loading={loading}
      error={error}
      isEmpty={countryFollowersData?.length === 0}
      selectable={selectable}
      selected={selected}
      onSelectChange={onSelectChange}
      sxCard={{
        height: 540,
        maxHeight: 540
      }}
    >
      <Box mt={2.5}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PieChart
            colors={colors}
            margin={{ left: 80, right: 80, top: 80, bottom: 80 }}
            series={[{ data: pieData, innerRadius: 75, outerRadius: 100, paddingAngle: 0, highlightScope: { fade: 'global', highlight: 'item' } }]}
            height={260}
            width={260}
            hideLegend
          >
            <PieCenterLabel primaryText={totalFollowers.toString()} secondaryText="Total" />
          </PieChart>
        </Box>

        {pieData.map((c, index) => (
          <Stack key={c.label} direction="row" sx={{ alignItems: 'center', gap: 2, pb: 2 }}>
            <Box sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: colors[index % colors.length] }} />
            <Stack sx={{ gap: 1, flexGrow: 1 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: '500' }}>{c.label}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{Math.round(c.value)}%</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={c.value}
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
  countryFollowersData: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
};
