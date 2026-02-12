import { Box, Tooltip, Typography } from "@mui/material";
import { SparkLineChart } from "@mui/x-charts";
import { useState } from "react";
import { integrationsConfig } from "../../../../../utils";
import { useEffect } from "react";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { DashboardCard } from './DashboardCard';
import { formatNumber } from "../utils/cards";

export const PageImpressionsCard = ({
    mode = 'dashboard',
    loading,
    error,
    title = "Page impressions",
    interval = "Hoy",
    period,
    selected = true,
    selectable = true,
    onSelectChange,
    data = {}
}) => {
    console.log("---------->", data)

    const isAnimated = mode === 'dashboard';

    const finalData = data?.chartData;
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

    function toCumulative(data) {
        let acc = 0;
        return data.map(v => {
            acc += v;
            return acc;
        });
    }

    function downsample(data, maxPoints = 24) {
        if (!Array.isArray(data) || data.length <= maxPoints) return data;

        const step = Math.ceil(data.length / maxPoints);
        const result = [];

        for (let i = 0; i < data.length; i += step) {
            result.push(data[i]);
        }

        const last = data[data.length - 1];
        if (result[result.length - 1] !== last) {
            result.push(last);
        }

        return result;
    }


    const sampledData = downsample(dataCard, 24); // ya son los valores reales
    const sampledDates = downsample(animDates, 24);

    const safeLength = Math.min(sampledData.length, sampledDates.length);
    const safeData = sampledData.slice(0, safeLength);
    const safeDates = sampledDates.slice(0, safeLength);

    return (
        <DashboardCard
            title={title}
            titleSpinner={'Obteniendo "page impressions" de la página...'}
            titleError={'Ocurrió un error al obtener "page impressions" de la página'}
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
                        <Typography sx={{ cursor: 'pointer' }} variant="h3" fontWeight={500}>
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

                {data?.total > 0 &&
                    <SparkLineChart
                        key={interval}
                        data={safeData}
                        height={70}
                        area
                        curve="linear"
                        showHighlight 
                        showTooltip
                        color={integrationsConfig.facebook.color}
                        xAxis={{
                            data: safeDates,
                            valueFormatter: (value, context) => {
                                return (
                                    <Typography variant="body2" lineHeight={1}>
                                        {value}
                                    </Typography>
                                )
                            }
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