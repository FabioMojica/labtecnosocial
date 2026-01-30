import * as React from 'react';
import PropTypes from 'prop-types';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { CheckBox } from '@mui/icons-material';
import { ErrorScreen, NoResultsScreen, SpinnerLoading } from '../../../../../generalComponents';

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

export default function ChartFollowersByCountry({
  loading,
  error,
  insights,
  title = "Seguidores por ciudad",
  selected = true,
  selectable = true,
}) {
  const latest = React.useMemo(() => {
    if (!insights?.length) return {};
    // El último objeto ya contiene los datos
    return insights[insights.length - 1];
    //return insights = []
  }, [insights]);


  const totalFollowers = Object.values(latest).reduce((acc, val) => acc + val, 0);

  const pieData = Object.entries(latest).map(([country, value]) => ({
    label: country,
    value: (value / totalFollowers) * 100
  })); 

  return (
    <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, position: 'relative', minHeight: 150 }}>
      {loading ?
        <>
          <SpinnerLoading text={`Obteniendo los seguidores de la página pos país...`} size={30} sx={{ height: "90%" }} />
        </>
        : error ?
          <>
            <ErrorScreen message="Ocurrió un error al obtener los seguidores por país" sx={{ height: "100%", width: "100%", gap: 0, p: 2 }} iconSx={{ fontSize: 50 }} textSx={{ fontSize: 17 }} />
          </>
          : (insights?.length === 0 && !error && !loading) ?
            <>
              <NoResultsScreen message="No hay datos para mostrar" iconType={'outline'} sx={{ height: "100%", width: "100%", gap: 0, p: 2 }} iconSX={{ fontSize: 50 }} textSx={{ fontSize: 17 }} />
            </>
            :
            <>
              {selectable && (
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <CheckBox checked={selected} onChange={(e) => onSelectChange?.(e.target.checked)} />
                </Box>
              )}

              <CardContent>
                <Typography component="h2" variant="subtitle2">{title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PieChart
                    colors={colors}
                    margin={{ left: 80, right: 80, top: 80, bottom: 80 }}
                    series={[{ data: pieData, innerRadius: 75, outerRadius: 100, paddingAngle: 0 }]}
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
              </CardContent>

            </>}
    </Card>
  );
}

ChartFollowersByCountry.propTypes = {
  insights: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
};
