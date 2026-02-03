import { CheckBox } from "@mui/icons-material";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { SparkLineChart } from "@mui/x-charts";
import { useState } from "react";
import { integrationsConfig } from "../../../../../utils";
import { useEffect } from "react";
import { ErrorScreen, NoResultsScreen, SpinnerLoading } from "../../../../../generalComponents";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DashboardCard from "./DashboardCard";

function PageImpressionsCard({
    loading,
    error,
    title = "Page impressions",
    interval = "Hoy",
    period,
    selected = true,
    selectable = true,
    onSelectChange,
    impressionsPageData = {}
}) {
    const [showHighlight, setShowHighlight] = useState(true);
    const [showTooltip, setShowTooltip] = useState(true);

    const finalData = impressionsPageData?.chartData;
    const [data, setData] = useState([]);
    const [animDates, setAnimDates] = useState([]);
    const [animatedTotal, setAnimatedTotal] = useState(0);

    useEffect(() => {
        if (!impressionsPageData?.total) {
            setAnimatedTotal(0);
            return;
        }

        let start = 0;
        const end = impressionsPageData.total;
        const duration = 1000;
        const steps = 60;
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
    }, [impressionsPageData.total, interval]);

    useEffect(() => {
        if (!Array.isArray(finalData) || finalData.length === 0) {
            setData([]);
            setAnimDates([]);
            return;
        }

        // Si hay un solo punto
        if (finalData.length === 1) {
            setData(finalData);
            setAnimDates(impressionsPageData.dates);
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
            const slicedDates = impressionsPageData.dates.slice(0, currentIndex);

            setData(slicedData);
            setAnimDates(slicedDates);

            if (currentIndex >= totalPoints) {
                setData(finalData);
                setAnimDates(impressionsPageData.dates);
                clearInterval(intervalId);
            }
        }, 20);

        return () => clearInterval(intervalId);
    }, [interval, finalData, impressionsPageData.dates]);

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
            isEmpty={impressionsPageData?.chartData?.length === 0}
            selectable={selectable}
            selected={selected}
            onSelectChange={onSelectChange}
        >
            <Box display={'flex'} gap={0.5} justifyContent={'center'} alignItems={'flex-end'} mt={4.5}>
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
                        {impressionsPageData.delta > 0 && (
                            <ArrowUpwardIcon
                                sx={{ color: 'green', fontSize: 15, transform: 'scale(1.4)' }}
                            />
                        )}
                        {impressionsPageData.delta < 0 && (
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
                            valueFormatter: (value) => `${value} visitas`,
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

export default PageImpressionsCard;