import { CheckBox } from "@mui/icons-material";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { SparkLineChart } from "@mui/x-charts";
import { useState } from "react";
import { integrationsConfig } from "../../../../../utils";
import { useEffect } from "react";
import { ErrorScreen, NoResultsScreen, SpinnerLoading } from "../../../../../generalComponents";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { DashboardCard } from './DashboardCard';

export const FollowersCard = ({
    loading,
    error,
    title = "Seguidores de la página",
    interval = "Hoy",
    period,
    selected = true,
    selectable = true,
    onSelectChange,
    data = {}
}) => {

    const [showHighlight, setShowHighlight] = useState(true);
    const [showTooltip, setShowTooltip] = useState(true);

    const finalData = data?.chartData;
    const [dataCard, setDataCard] = useState([]);
    const [animDates, setAnimDates] = useState([]);
    const [animatedTotal, setAnimatedTotal] = useState(0);

    useEffect(() => {
        if (!data?.total) {
            setAnimatedTotal(0);
            return;
        }

        let start = 0;
        const end = data.total;
        const duration = 1000; // duración de animación en ms
        const steps = 60; // cantidad de pasos (aprox 60 fps)
        const increment = end / steps;
        const intervalTime = duration / steps;

        const intervalId = setInterval(() => {
            start += increment;
            if (start >= end) {
                start = end;
                clearInterval(intervalId);
            }
            setAnimatedTotal(Math.round(start));
        }, intervalTime);

        return () => clearInterval(intervalId);
    }, [data.total, interval]);

    useEffect(() => {
        if (!Array.isArray(finalData) || finalData.length === 0) {
            setDataCard([]);
            setAnimDates([]);
            return;
        }

        // Si hay un solo punto
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

            // Slicing dataCard y fechas juntos
            const slicedData = finalData.slice(0, currentIndex);
            const slicedDates = data.dates.slice(0, currentIndex);

            setDataCard(slicedData);
            setAnimDates(slicedDates);

            if (currentIndex >= totalPoints) {
                setDataCard(finalData);
                setAnimDates(data.dates);
                clearInterval(intervalId);
            }
        }, 20);

        return () => clearInterval(intervalId);
    }, [interval, finalData, data.dates]);

    return (
        <DashboardCard
            title={title}
            titleSpinner={'Obteniendo los seguidores de la página...'}
            titleError={'Ocurrió un error al obtener los seguidores de la página'}
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
            <Box display={'flex'} gap={0.5} justifyContent={'center'} alignItems={'flex-end'} sx={{
                mt: 4.5
            }}>
                <Box sx={{
                    position: 'relative',
                }}>
                    <Typography variant='h3'>
                        +{animatedTotal}
                    </Typography>
                    <Box sx={{
                        position: 'absolute',
                        bottom: -10,
                        right: -10
                    }}>
                        {data.delta > 0 && (
                            <ArrowUpwardIcon
                                sx={{ color: 'green', fontSize: 15, transform: 'scale(1.4)' }}
                            />
                        )}
                        {data.delta < 0 && (
                            <ArrowDownwardIcon
                                sx={{ color: 'red', fontSize: 15, transform: 'scale(1.4)' }}
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

                {period !== 'all' && period !== 'today' &&
                    <SparkLineChart
                        data={dataCard}
                        height={70}
                        area
                        curve="natural"
                        showHighlight={showHighlight}
                        showTooltip={showTooltip}
                        color={integrationsConfig.facebook.color}
                        xAxis={{
                            scaleType: 'point',
                            data: animDates,
                            valueFormatter: (value) =>
                                new Date(value).toLocaleDateString('es-BO', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                }),
                        }}
                        tooltip={{
                            valueFormatter: (value) => `${value} seguidores`,
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
    )
}
