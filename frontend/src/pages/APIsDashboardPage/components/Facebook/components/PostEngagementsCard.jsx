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

function PostEngagementsCard({
    loading,
    error,
    title = "Post engagements",
    interval = "Hoy",
    period,
    selected = true,
    selectable = true,
    onSelectChange,
    postEngagementsData = {}
}) {
    const [showHighlight, setShowHighlight] = useState(true);
    const [showTooltip, setShowTooltip] = useState(true);

    const finalData = postEngagementsData?.chartData;
    const [data, setData] = useState([]);
    const [animDates, setAnimDates] = useState([]);
    const [animatedTotal, setAnimatedTotal] = useState(0);

    useEffect(() => {
        if (!postEngagementsData?.total) {
            setAnimatedTotal(0);
            return;
        }

        let start = 0;
        const end = postEngagementsData.total;
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
    }, [postEngagementsData.total, interval]);

    useEffect(() => {
        if (!Array.isArray(finalData) || finalData.length === 0) {
            setData([]);
            setAnimDates([]);
            return;
        }

        if (finalData.length === 1) {
            setData(finalData);
            setAnimDates(postEngagementsData.dates);
            return;
        }

        const totalPoints = finalData.length;
        const chunkSize = Math.ceil(totalPoints / 30);
        let currentIndex = 0;

        setData([]);
        setAnimDates([]);

        const intervalId = setInterval(() => {
            currentIndex += chunkSize;
            const slicedData = finalData.slice(0, currentIndex);
            const slicedDates = postEngagementsData.dates.slice(0, currentIndex);

            setData(slicedData);
            setAnimDates(slicedDates);

            if (currentIndex >= totalPoints) {
                setData(finalData);
                setAnimDates(postEngagementsData.dates);
                clearInterval(intervalId);
            }
        }, 20);

        return () => clearInterval(intervalId);
    }, [interval, finalData, postEngagementsData.dates]);

    return (
        <DashboardCard
            title={title}
            titleSpinner={'Obteniendo "post engagements" de la página...'}
            titleError={'Ocurrió un error al obtener "post engagements" de la página'}
            sxSpinner={{
                fontSize: '0.9rem',
                pt: 3.5
            }}
            interval={interval}
            loading={loading}
            error={error}
            isEmpty={postEngagementsData?.chartData?.length === 0}
            selectable={selectable}
            selected={selected}
            smallCard
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
                        {postEngagementsData.delta > 0 && (
                            <ArrowUpwardIcon
                                sx={{ color: 'green', fontSize: 15, transform: 'scale(1.4)' }}
                            />
                        )}
                        {postEngagementsData.delta < 0 && (
                            <ArrowDownwardIcon
                                sx={{ color: 'red', fontSize: 15, transform: 'scale(1.4)' }}
                            />
                        )}
                    </Box>
                </Box>
            </Box>
        </DashboardCard>
    )
}

export default PostEngagementsCard;