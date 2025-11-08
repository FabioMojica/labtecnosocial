import { NoResultsScreen } from '../../../../generalComponents';
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Chip,
    TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { Checkbox } from '@mui/material';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function CommitsInThePeriod({
    commits,
    title,
    interval,
    selectable = false,
    selected = false,
    onSelectChange,
    selectedPeriod
}) {
    const theme = useTheme();
    const safeCommits = commits || [];
    const [customGoal, setCustomGoal] = useState(50);
    if (!safeCommits.length || !safeCommits) {
        return (
            <Card variant="outlined" sx={{ height: '100%', maxHeight: 300, flexGrow: 1 }}>
                <CardContent sx={{ height: '100%', p: 0 }}>
                    <NoResultsScreen
                        message="Sin commits para mostrar"
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

    const filteredCommits = useMemo(() => {
        if (!safeCommits.length) return [];

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

        if (!startDate) return safeCommits;

        return safeCommits.filter((c) => {
            const commitDate = dayjs(c.commit.author.date);
            return (
                commitDate.isSameOrAfter(startDate, 'day') &&
                commitDate.isSameOrBefore(endDate, 'day')
            );
        });
    }, [safeCommits, selectedPeriod]);

    let endDate = new Date();
    const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());


    const commitsByDate = useMemo(() => {
        const grouped = {};
        filteredCommits.forEach(c => {
            const day = new Date(c.commit.author.date).toISOString().split('T')[0];
            grouped[day] = (grouped[day] || 0) + 1;
        });

        let startDate;
        switch (selectedPeriod) {
            case 'lastSixMonths':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 6);
                break;
            case 'lastMonth':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'lastWeek':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'today':
                startDate = normalizeDate(new Date());
                endDate = normalizeDate(new Date());
                break;
            case 'all':
            default:
                startDate = filteredCommits.length
                    ? new Date(Math.min(...filteredCommits.map(c => new Date(c.commit.author.date))))
                    : new Date();
                break;
        }

        const dateArray = [];
        for (let d = new Date(startDate); d <= endDate; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
            const dayStr = d.toISOString().split('T')[0];
            grouped[dayStr] = grouped[dayStr] || 0;
            dateArray.push(dayStr);
        }

        // <<< Aquí es donde debes ponerlo
        if (selectedPeriod === 'today' && dateArray.length === 1) {
            const yesterday = new Date(startDate);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            dateArray.unshift(yesterdayStr);
            grouped[yesterdayStr] = grouped[yesterdayStr] || 0;
        }

        return { grouped, dateArray };
    }, [filteredCommits, selectedPeriod]);



    const data = commitsByDate.dateArray.map(d => commitsByDate.grouped[d]);
    const days = commitsByDate.dateArray;

    const totalCommits = data.reduce((a, b) => a + b, 0);

    const percent = customGoal > 0 ? Math.round((totalCommits / customGoal) * 100) : 0;
    const getTrendColor = () => {
        if (percent >= 100) return theme.palette.success.main;
        if (percent >= 50) return theme.palette.warning.main;
        return theme.palette.error.main;
    };
    const trendColor = getTrendColor();

    return (
        <Card variant="outlined" sx={{ height: '100%', maxHeight: 300, flexGrow: 1, position: 'relative' }}>
            {selectable && totalCommits !== 0 && (
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Checkbox
                        checked={selected}
                        onChange={(e) => onSelectChange && onSelectChange(e.target.checked)}
                    />
                </Box>
            )}
            <CardContent>
                <Typography component="h2" variant="subtitle2" gutterBottom>
                    {title}
                </Typography>

                <Stack direction="column">
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography variant="h4">{totalCommits}</Typography>

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


                        <Chip
                            size="small"
                            label={`${percent}%`}
                            sx={{
                                bgcolor: trendColor,
                                color: theme.palette.getContrastText(trendColor),
                                fontWeight: 'bold',
                            }}
                        />

                    </Stack>

                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {interval}
                    </Typography>

                    <Box sx={{ width: '100%', height: 40, position: 'relative' }}>
                        {totalCommits === 0 ? (
                            <Typography variant="body1" color="textSecondary" sx={{
                                color: 'gray',
                                fontStyle: 'italic',
                                textAlign: 'center',
                                fontSize: '0.9rem',
                                mt: 2
                            }}>

                                Sin datos para mostrar
                            </Typography>
                        ) : (
                            <>
                                <svg width="0" height="0">
                                    <defs>
                                        <linearGradient id="gradient-safeCommits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={trendColor} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={trendColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                <SparkLineChart
                                    data={data}
                                    xAxis={{ scaleType: 'band', data: days }}
                                    area
                                    showLine
                                    showTooltip
                                    color={trendColor}
                                    sx={{
                                        '& .MuiAreaElement-root': {
                                            fill: 'url(#gradient-safeCommits)',
                                        },
                                    }}
                                />
                            </>
                        )}
                    </Box>

                </Stack>
            </CardContent>
        </Card>
    );
}

CommitsInThePeriod.propTypes = {
    safeCommits: PropTypes.array.isRequired,
    title: PropTypes.string.isRequired,
    interval: PropTypes.string.isRequired,
};
