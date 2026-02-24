import { Box, Divider, Paper, Tooltip, Typography } from "@mui/material";
import { ChartsTooltipContainer, SparkLineChart, useAxesTooltip } from "@mui/x-charts";
import { useState } from "react";
import { integrationsConfig } from "../../../../../utils";
import { useEffect } from "react";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { DashboardCard } from './DashboardCard';
import { formatNumber } from "../utils/cards";


function formatDailyValue(value = 0) {
    const sign = value < 0 ? "" : "+";
    return `${sign}${formatNumber(value)}`;
}

function getFollowerLabel(value = 0) {
    const absValue = Math.abs(value);
    return absValue === 1 ? "seguidor" : "seguidores";
}

const CustomTooltip = ({ sampledCombined, ...props }) => {
    const tooltipData = useAxesTooltip();
    const dataIndex = tooltipData?.[0]?.dataIndex;
    const hasValidIndex = Number.isInteger(dataIndex) && dataIndex >= 0;
    let resolvedIndex = hasValidIndex ? dataIndex : -1;

    if (props?.isLargeDataset && resolvedIndex >= 0) {
        const snapWindow = 5;
        if (resolvedIndex >= sampledCombined.length - snapWindow) {
            resolvedIndex = sampledCombined.length - 1;
        }
    }

    const realPoint = resolvedIndex >= 0 ? sampledCombined[resolvedIndex] : null;

    return (
        <ChartsTooltipContainer {...props}>
            {realPoint && (
                <Paper>
                    <Box sx={{ px: 1.5, pt: 1 }}>
                        <Typography variant="body2" fontWeight={'bold'}>
                            {realPoint?.date}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 0.5 }} />

                    <Box sx={{ px: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={400}>
                            {formatDailyValue(realPoint?.daily)} {getFollowerLabel(realPoint?.daily)}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 0.5 }} />

                    <Box sx={{ px: 1.5, pb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={400}>
                            {formatNumber(realPoint?.cumulative)} acumulados
                        </Typography>
                    </Box>
                </Paper>
            )}
        </ChartsTooltipContainer>
    );
};

export const FollowersCard = ({
    mode = 'dashboard',
    loading,
    error,
    title = "Nuevos seguidores de la página",
    interval = "Hoy",
    period,
    selected = true,
    selectable = true,
    onSelectChange,
    data = {}
}) => {
    const finalData = data?.chartData;
    const isLargeDataset = Array.isArray(finalData) && finalData.length > 120;
    const isAnimated = mode === 'dashboard' && !isLargeDataset;
    const [dataCard, setDataCard] = useState([]);
    const [animDates, setAnimDates] = useState([]);

    useEffect(() => {
        if (!Array.isArray(finalData) || finalData.length === 0) {
            setDataCard([]);
            setAnimDates([]);
            return;
        }

        if (!isAnimated) {
            setDataCard(finalData);
            setAnimDates(data.dates ?? []);
            return;
        }

        if (finalData.length === 1) {
            setDataCard(finalData);
            setAnimDates(data.dates);
            return;
        }

        const totalPoints = finalData.length;
        const chunkSize = Math.ceil(totalPoints / 30);
        let currentIndex = 0;

        setDataCard([]);
        setAnimDates([]);

        const intervalId = setInterval(() => {
            currentIndex += chunkSize;

            setDataCard(finalData.slice(0, currentIndex));
            setAnimDates(data.dates.slice(0, currentIndex));

            if (currentIndex >= totalPoints) {
                setDataCard(finalData);
                setAnimDates(data.dates);
                clearInterval(intervalId);
            }
        }, 20);

        return () => clearInterval(intervalId);
    }, [finalData, data.dates, isAnimated]);

    function toCumulative(data = []) {
        let acc = 0;
        return data.map(v => {
            acc += v;
            return acc;
        });
    }

    function downsampleObjects(data = [], maxPoints = 24) {
        if (!Array.isArray(data) || data.length <= maxPoints) {
            return data;
        }

        const result = [];
        const step = (data.length - 1) / (maxPoints - 1);

        for (let i = 0; i < maxPoints; i++) {
            const index = Math.round(i * step);
            result.push(data[index]);
        }

        return result;
    }

    const cumulativeData = toCumulative(dataCard);

    const combined = dataCard.map((daily, index) => ({
        date: animDates[index],
        daily,
        cumulative: cumulativeData[index],
    }));

    const maxPointsForChart = 500;
    const sampledCombined = downsampleObjects(combined, maxPointsForChart);

    return (
        <DashboardCard
            title={title}
            titleSpinner={'Obteniendo los nuevos seguidores de la página...'}
            titleError={'Ocurrió un error al obtener los nuevos seguidores de la página'}
            sxSpinner={{
                fontSize: '0.9rem',
                pt: 3.5
            }}
            smallCard
            interval={interval}
            loading={loading}
            error={error}
            isEmpty={data?.chartData?.length === 0}
            selectable={selectable}
            selected={selected}
            onSelectChange={onSelectChange}
        >
            <Box
                display={'flex'}
                gap={0.5}
                justifyContent={'center'}
                alignItems={'flex-end'}
                mt={4.5}
                minHeight={70}
                sx={{ whiteSpace: 'nowrap' }}>
                <Box sx={{
                    position: 'relative',
                }}>
                    <Tooltip title={data?.total} arrow>
                        <Typography sx={{ cursor: 'pointer', color: data?.total === 0 ? "warning.main" : undefined }} variant="h3" fontWeight={500}>
                            {formatNumber(data?.total)}
                        </Typography>
                    </Tooltip>

                    <Box sx={{
                        position: 'absolute',
                        bottom: -10, 
                        right: -15
                    }}>
                        {data.delta > 0 && (
                            <ArrowUpwardIcon
                                fontSize="medium"
                                sx={{ color: 'green' }}
                            />
                        )}
                        {data.delta < 0 && (
                            <ArrowDownwardIcon
                                sx={{ color: 'red' }}
                            />
                        )}
                    </Box>

                </Box>


                <svg width="0" height="0">
                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={integrationsConfig.facebook.color} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={integrationsConfig.facebook.color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                </svg>

                {data?.total !== 0 &&
                    <SparkLineChart
                        
                        key={interval}
                        data={sampledCombined.map(p => p.cumulative)}
                        height={70}
                        margin={{ top: 5, bottom: 5, left: 0, right: 18 }}
                        area
                        curve="monotoneX"
                        showHighlight
                        showTooltip
                        color={integrationsConfig.facebook.color}
                        slots={{ tooltip: CustomTooltip }}
                        slotProps={{
                            tooltip: {
                                trigger: "axis",
                                sampledCombined,
                                isLargeDataset,
                                placement: "right-start",
                            },
                        }}
                        sx={{
                            '& .MuiAreaElement-root': {
                                fill: 'url(#gradient)',
                            },
                            '& .MuiLineElement-root': {
                                transition: 'none',
                            },
                        }}
                    />
                }

            </Box>
        </DashboardCard>
    );
}
