import { CheckBox } from "@mui/icons-material";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { SparkLineChart } from "@mui/x-charts";
import { useState } from "react";
import { integrationsConfig } from "../../../../../utils";
import { useEffect } from "react";
import { ErrorScreen, NoResultsScreen, SpinnerLoading } from "../../../../../generalComponents";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

function FollowersCard({
    loading,
    error,
    title = "Seguidores de la página",
    interval = "Hoy",
    period,
    selected = true,
    selectable = true,
    onSelectChange,
    followersData = {}
}) {
    const [showHighlight, setShowHighlight] = useState(true);
    const [showTooltip, setShowTooltip] = useState(true);

    const finalData = followersData?.chartData;
    const [data, setData] = useState([]);
    const [animDates, setAnimDates] = useState([]);
    const [animatedTotal, setAnimatedTotal] = useState(0);

    useEffect(() => {
        if (!followersData?.total) {
            setAnimatedTotal(0);
            return;
        }

        let start = 0;
        const end = followersData.total;
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
    }, [followersData.total, interval]);

    useEffect(() => {
        if (!Array.isArray(finalData) || finalData.length === 0) {
            setData([]);
            setAnimDates([]);
            return;
        }

        // Si hay un solo punto
        if (finalData.length === 1) {
            setData(finalData);
            setAnimDates(followersData.dates);
            return;
        }

        const totalPoints = finalData.length;
        const chunkSize = Math.ceil(totalPoints / 30);
        let currentIndex = 0;

        setData([]);
        setAnimDates([]);

        const intervalId = setInterval(() => {
            currentIndex += chunkSize;

            // Slicing data y fechas juntos
            const slicedData = finalData.slice(0, currentIndex);
            const slicedDates = followersData.dates.slice(0, currentIndex);

            setData(slicedData);
            setAnimDates(slicedDates);

            if (currentIndex >= totalPoints) {
                setData(finalData);
                setAnimDates(followersData.dates);
                clearInterval(intervalId);
            }
        }, 20);

        return () => clearInterval(intervalId);
    }, [interval, finalData, followersData.dates]);

    return (
        <Card variant="outlined" sx={{ height: 150, flexGrow: 1, position: 'relative' }}>
            {loading ?
                <>
                    <SpinnerLoading text={`Obteniendo los seguidores de la página...`} size={30} sx={{ height: "90%" }} />
                </>
                : error ?
                    <>
                        <ErrorScreen message="Ocurrió un error al obtener los seguidores de la página" sx={{ height: "100%", width: "100%", gap: 0, p: 2 }} iconSx={{ fontSize: 50 }} textSx={{ fontSize: 17 }} />
                    </>
                    : (followersData?.chartData?.length === 0 && !error && !loading) ?
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
                                <Stack direction="column" justifyContent="flex-start" alignItems="flex-start">
                                    <Typography component="h2" variant="subtitle2">{title}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{interval}</Typography>
                                </Stack>

                                <Box display={'flex'} gap={0.5} justifyContent={'center'} alignItems={'flex-end'}>

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
                                            {followersData.delta > 0 && (
                                                <ArrowUpwardIcon
                                                    sx={{ color: 'green', fontSize: 15, transform: 'scale(1.4)' }}
                                                />
                                            )}
                                            {followersData.delta < 0 && (
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
                                            key={interval}
                                            data={data}
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
                            </CardContent>
                        </>
            }
        </Card>
    )
}

export default FollowersCard;