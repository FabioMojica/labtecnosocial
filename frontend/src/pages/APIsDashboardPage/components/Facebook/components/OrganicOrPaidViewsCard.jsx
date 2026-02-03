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
import { CheckBox } from "@mui/icons-material";
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { ErrorScreen, NoResultsScreen, SpinnerLoading } from '../../../../../generalComponents';
import DashboardCard from './DashboardCard';

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

export default function OrganicOrPaidViewsCard({
    error = false,
    title = "Page impressions orgánicas vs pagadas",
    loading,
    interval,
    period,
    organicOrPaidViewsData,
    selected = true,
    selectable = true,
    onSelectChange,
}) {

    const pieData = organicOrPaidViewsData?.chartData;
    const totalViews = organicOrPaidViewsData?.total;

    const colorsForPie = [...colors, 'hsl(220, 20%, 15%)'];

    return (
        <DashboardCard
            title={title}
            titleSpinner={'Obteniendo "page impressions" orgánicas vs pagadas de la página...'}
            titleError={'Ocurrió un error al obtener "page impressions" orgánicas vs pagadas de la página'}
            interval={interval}
            loading={loading}
            error={error}
            isEmpty={pieData?.length === 0}
            selectable={selectable}
            selected={selected}
            smallCard
            onSelectChange={onSelectChange}
            sxCard={{
                height: 308
            }}
        >
            <Box sx={{
                width: '100%',
                height: '100%',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 4.5 }}>
                    <PieChart
                        colors={pieData.map((_, index) => colors[index % colors.length])}
                        margin={{ left: 80, right: 80, top: 80, bottom: 80 }}
                        series={[{ data: pieData, innerRadius: 45, outerRadius: 70, paddingAngle: 0, highlightScope: { fade: 'global', highlight: 'item' } }]}
                        height={160}
                        width={160}
                        hideLegend
                    >
                        {totalViews > 0 &&
                            <PieCenterLabel primaryText={totalViews.toString()} secondaryText="Total" />
                        }
                    </PieChart>
                </Box>
                <Stack direction="column" gap={1}>
                    {pieData.map((item, index) => (
                        <Stack key={index} direction="row" sx={{ alignItems: 'center' }}>
                            <Stack sx={{ gap: 1, flexGrow: 1 }}>
                                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: '500' }}>{item.name}</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {Math.round((item.value / totalViews) * 100)}%
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={(item.value / totalViews) * 100}
                                    sx={{ [`& .${linearProgressClasses.bar}`]: { backgroundColor: colors[index % colors.length] } }}
                                />
                            </Stack>
                        </Stack>
                    ))}
                </Stack>
            </Box>
        </DashboardCard>
    );
}
