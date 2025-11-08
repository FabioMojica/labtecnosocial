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
import { Checkbox } from '@mui/material';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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
];

export default function ChartCommitsByAuthor({
  commits,
  title,
  interval,
  selectable = false,
  selected = false,
  onSelectChange,
  selectedPeriod
}) {

  // Filtrar commits según el período
  const filteredCommits = React.useMemo(() => {
    if (!commits?.length) return [];
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
        startDate = null;
        endDate = null;
    }
    if (!startDate) return commits;

    return commits.filter(c => {
      const date = dayjs(c.commit.author.date);
      return date.isSameOrAfter(startDate, 'day') && date.isSameOrBefore(endDate, 'day');
    });
  }, [commits, selectedPeriod]);

  // Contar commits por autor
  const authorsMap = React.useMemo(() => {
    const map = {};
    filteredCommits.forEach(c => {
      const key = c.author?.login || c.commit.author.name;
      if (!map[key]) {
        map[key] = { ...c.author, name: key, count: 0 };
      }
      map[key].count += 1;
    });
    return map;
  }, [filteredCommits]);

  // Top 10 autores
  const authorsArray = Object.values(authorsMap);
  const sortedAuthors = authorsArray.sort((a, b) => b.count - a.count);
  const topAuthors = sortedAuthors.slice(0, 10);
  const otherCount = sortedAuthors.slice(10).reduce((acc, a) => acc + a.count, 0);

  const totalCommits = filteredCommits.length;

  const pieData = [
    ...topAuthors.map(a => ({ label: a.name, value: (a.count / totalCommits) * 100 })),
  ];
  if (otherCount > 0) pieData.push({ label: 'Otros', value: (otherCount / totalCommits) * 100 });

  const colorsForPie = [...colors, 'hsl(220, 20%, 15%)']; 

  return (
    <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, position: 'relative' }}>
      {selectable && totalCommits > 0 && (
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Checkbox
            checked={selected}
            onChange={(e) => onSelectChange && onSelectChange(e.target.checked)}
          />
        </Box>
      )}
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PieChart
            colors={colorsForPie}
            margin={{ left: 80, right: 80, top: 80, bottom: 80 }}
            series={[{ data: pieData, innerRadius: 75, outerRadius: 100, paddingAngle: 0, highlightScope: { fade: 'global', highlight: 'item' } }]}
            height={260}
            width={260}
            hideLegend
          >
            { totalCommits.length > 0 &&
            <PieCenterLabel primaryText={totalCommits.toString()} secondaryText="Total" />
            }
            
          </PieChart>
        </Box>

        {topAuthors.map((author, index) => (
          <Stack key={index} direction="row" sx={{ alignItems: 'center', gap: 2, pb: 2 }}>
            <img src={author.avatar_url} alt={author.login} width={24} height={24} style={{ borderRadius: '50%' }} />
            <Stack sx={{ gap: 1, flexGrow: 1 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: '500' }}>
                  {author.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {Math.round((author.count / totalCommits) * 100)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(author.count / totalCommits) * 100}
                sx={{ [`& .${linearProgressClasses.bar}`]: { backgroundColor: colors[index % colors.length] } }}
              />
            </Stack>
          </Stack>
        ))}

        {otherCount > 0 && (
          <Stack direction="row" sx={{ alignItems: 'center', gap: 2, pb: 2 }}>
            <Box sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'gray' }} />
            <Stack sx={{ gap: 1, flexGrow: 1 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: '500' }}>Otros</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {Math.round((otherCount / totalCommits) * 100)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(otherCount / totalCommits) * 100}
                sx={{ [`& .${linearProgressClasses.bar}`]: { backgroundColor: 'hsl(220, 20%, 15%)' } }}
              />
            </Stack>
          </Stack>
        )}

      </CardContent>
    </Card>
  );
}

ChartCommitsByAuthor.propTypes = {
  commits: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  interval: PropTypes.string,
  selectable: PropTypes.bool,
  selected: PropTypes.bool,
  onSelectChange: PropTypes.func,
  selectedPeriod: PropTypes.string,
};
