import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import { Box, Checkbox } from '@mui/material';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';


// export const CommitsByWeekdayHour = ({
//   commitsData,
//   title,
//   interval,
//   selectable = false,
//   selected = false,
//   onSelectChange,
//   selectedPeriod = "all",
// }) => {
//   const theme = useTheme();
//   const colorPalette = [
//     (theme.vars || theme).palette.primary.dark,
//     (theme.vars || theme).palette.primary.main,
//     (theme.vars || theme).palette.primary.light,
//   ];
//   return (
//     <Card variant="outlined" sx={{ width: '100%', height: 400, position: 'relative' }}>
//       <CardContent>
//         <Typography component="h2" variant="subtitle2" gutterBottom>
//           {title}
//         </Typography>
//         {selectable && (
//           <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
//             <Checkbox
//               checked={selected}
//               onChange={e => onSelectChange(e.target.checked)}
//               size="medium"
//             />
//           </Box>
//         )}
//         <Stack sx={{ justifyContent: 'space-between' }}>
//           <Typography variant="caption" sx={{ color: 'text.secondary' }}>
//             {interval}
//           </Typography>
//         </Stack>
//         <BarChart
//           borderRadius={8}
//           colors={colorPalette}
//           xAxis={[
//             {
//               scaleType: 'band',
//               categoryGapRatio: 0.5,
//               data: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
//               height: 24,
//             },
//           ]}
//           yAxis={[{ width: 50 }]}
//           series={[
//             {
//               id: 'page-views',
//               label: 'Page views',
//               data: [2234, 3872, 2998, 4125, 3357, 2789, 2998],
//               stack: 'A',
//             },
//             {
//               id: 'downloads',
//               label: 'Downloads',
//               data: [3098, 4215, 2384, 2101, 4752, 3593, 2384],
//               stack: 'A',
//             },
//             {
//               id: 'conversions',
//               label: 'Conversions',
//               data: [4051, 2275, 3129, 4693, 3904, 2038, 2275],
//               stack: 'A',
//             },
//           ]}
//           height={250}
//           margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
//           grid={{ horizontal: true }}
//           hideLegend
//         />
//       </CardContent>
//     </Card>
//   );
// }
import dayjs from 'dayjs';

const groupCommitsByWeekdayAndHour = (commits = []) => {
  const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const result = weekdays.map(day => ({
    day,
    total: 0,
    hours: {}
  }));

  commits.forEach(commit => {
    const date = dayjs(commit.commit.author.date);
    const dayIndex = date.day() === 0 ? 6 : date.day() - 1; // dayjs: 0=Domingo
    const hour = date.format('HH');

    result[dayIndex].total += 1;
    if (!result[dayIndex].hours[hour]) result[dayIndex].hours[hour] = 0;
    result[dayIndex].hours[hour] += 1;
  });

  return result;
};

export const CommitsByWeekdayHour = ({ commitsData = [], title, interval }) => {
  const theme = useTheme();
  const grouped = groupCommitsByWeekdayAndHour(commitsData);

  const data = grouped.map(d => d.total);

  // Tooltip personalizado
  const tooltipFormatter = ({ xValue, yValue, seriesId }) => {
    const dayData = grouped.find(d => d.day === xValue);
    if (!dayData) return '';
    const hoursText = Object.entries(dayData.hours)
      .map(([h, n]) => `${h}:00 → ${n} commit${n > 1 ? 's' : ''}`)
      .join('\n');
    return `${xValue}: ${yValue} commit${yValue > 1 ? 's' : ''}\n${hoursText}`;
  };

  return (
    <Card variant="outlined" sx={{ width: '100%', height: 400 }}>
      <CardContent>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{interval}</Typography>

        <BarChart
          xAxis={[{
            scaleType: 'band',
            categoryGapRatio: 0.5,
            data: grouped.map(d => d.day)
          }]}
          yAxis={[{ width: 50 }]}
          series={[{ id: 'commits', label: 'Commits', data }]}
          height={250}
          colors={[theme.palette.primary.main]}
          grid={{ horizontal: true }}
          tooltip={tooltipFormatter}
        />
      </CardContent>
    </Card>
  );
};
