import { NoResultsScreen } from '../../../../generalComponents';
import React, { useEffect, useState, useMemo } from 'react';
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

const getCommitDate = (commit) =>
    commit?.commit?.committer?.date ?? commit?.commit?.author?.date ?? null;

export default function CommitsInThePeriod({
    commits,
    title,
    interval,
    selectable = false,
    selected = false,
    onSelectChange,
    selectedPeriod,
    goal,
    onGoalChange,
    allowGoalEdit = false,
}) {
    const theme = useTheme();
    const safeCommits = commits || [];
    const [customGoal, setCustomGoal] = useState(
        Number.isFinite(goal) ? Math.max(0, Number(goal)) : 50
    );

    useEffect(() => {
        if (Number.isFinite(goal)) {
            setCustomGoal(Math.max(0, Number(goal)));
        }
    }, [goal]);
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
            const rawDate = getCommitDate(c);
            const commitDate = rawDate ? dayjs(rawDate) : null;
            if (!commitDate || !commitDate.isValid()) return false;
            return (
                commitDate.isSameOrAfter(startDate, 'day') &&
                commitDate.isSameOrBefore(endDate, 'day')
            );
        });
    }, [safeCommits, selectedPeriod]);

    const commitsByDate = useMemo(() => {
        const grouped = {};
        filteredCommits.forEach(c => {
            const rawDate = getCommitDate(c);
            const day = rawDate ? dayjs(rawDate).format('YYYY-MM-DD') : null;
            if (!day) return;
            grouped[day] = (grouped[day] || 0) + 1;
        });

        const today = dayjs().startOf('day');
        let startDate;
        let endDate = today;
        switch (selectedPeriod) {
            case 'lastSixMonths':
                startDate = today.subtract(6, 'month');
                break;
            case 'lastMonth':
                startDate = today.subtract(1, 'month');
                break;
            case 'lastWeek':
                startDate = today.subtract(7, 'day');
                break;
            case 'today':
                startDate = today;
                endDate = today;
                break;
            case 'all':
            default:
                {
                    const minDate = filteredCommits
                        .map(c => {
                            const rawDate = getCommitDate(c);
                            const parsed = rawDate ? dayjs(rawDate) : null;
                            return parsed && parsed.isValid() ? parsed.startOf('day') : null;
                        })
                        .filter(Boolean)
                        .reduce((min, current) => (min && min.isBefore(current) ? min : current), null);

                    startDate = minDate || today;
                }
                break;
        }

        const dateArray = [];
        for (let d = startDate; d.isSameOrBefore(endDate, 'day'); d = d.add(1, 'day')) {
            const dayStr = d.format('YYYY-MM-DD');
            grouped[dayStr] = grouped[dayStr] || 0;
            dateArray.push(dayStr);
        }

        if (selectedPeriod === 'today' && dateArray.length === 1) {
            const yesterdayStr = startDate.subtract(1, 'day').format('YYYY-MM-DD');
            dateArray.unshift(yesterdayStr);
            grouped[yesterdayStr] = grouped[yesterdayStr] || 0;
        }

        return { grouped, dateArray };
    }, [filteredCommits, selectedPeriod]);



    const data = commitsByDate.dateArray.map(d => commitsByDate.grouped[d]);
    const days = commitsByDate.dateArray;

    const totalCommits = filteredCommits.length;

    if (totalCommits === 0) {
        return (
            <Card variant="outlined" sx={{ height: '100%', maxHeight: 300, flexGrow: 1, position: 'relative' }}>
                <CardContent sx={{ height: '100%' }}>
                    <Typography component="h2" variant="subtitle2">
                        {title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {interval}
                    </Typography>
                    <NoResultsScreen
                        message="Sin datos para mostrar"
                        sx={{ height: '80%' }}
                        textSx={{
                            fontSize: {
                                xs: '0.8rem',
                                sm: '1rem',
                            },
                        }}
                        iconSX={{ fontSize: 56 }}
                    />
                </CardContent>
            </Card>
        );
    }

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
                <Typography component="h2" variant="subtitle2">
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
                            disabled={!allowGoalEdit}
                            onChange={e => {
                                const val = Number(e.target.value);
                                const normalized = Number.isFinite(val) && val >= 0 ? val : 0;
                                setCustomGoal(normalized);
                                onGoalChange?.(normalized);
                            }}
                            onBlur={() => {
                                if (customGoal === '' || customGoal < 0) {
                                    setCustomGoal(0);
                                    onGoalChange?.(0);
                                }
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

                    <Box
                        sx={{
                            width: '100%',
                            height: { xs: 54, sm: 40 },
                            position: 'relative',
                            mt: 0.5,
                            pb: { xs: 1, sm: 0.25 },
                        }}
                    >
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
                                    showHighlight
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
