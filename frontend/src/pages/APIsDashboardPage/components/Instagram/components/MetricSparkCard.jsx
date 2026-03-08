import { Box, Divider, Paper, Tooltip, Typography } from "@mui/material";
import { ChartsTooltipContainer, SparkLineChart, useAxesTooltip } from "@mui/x-charts";
import { useEffect, useState } from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { integrationsConfig } from "../../../../../utils";
import { DashboardCard } from "../../Facebook/components/DashboardCard";
import { formatNumber } from "../../Facebook/utils/cards";

function formatDailyValue(value = 0) {
    const sign = value < 0 ? "" : "+";
    return `${sign}${formatNumber(value)}`;
}

function getUnitLabel(value = 0, singular = "unidad", plural = "unidades") {
    return Math.abs(value) === 1 ? singular : plural;
}

const CustomTooltip = ({ sampledCombined, singular, plural, cumulativeLabel = "acumuladas", ...props }) => {
    const tooltipData = useAxesTooltip();
    const dataIndex = tooltipData?.[0]?.dataIndex;
    const hasValidIndex = Number.isInteger(dataIndex) && dataIndex >= 0;
    const realPoint = hasValidIndex ? sampledCombined[dataIndex] : null;

    return (
        <ChartsTooltipContainer {...props}>
            {realPoint && (
                <Paper>
                    <Box sx={{ px: 1.5, pt: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                            {realPoint?.date}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 0.5 }} />

                    <Box sx={{ px: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={400}>
                            {formatDailyValue(realPoint?.daily)} {getUnitLabel(realPoint?.daily, singular, plural)}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 0.5 }} />

                    <Box sx={{ px: 1.5, pb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={400}>
                            {formatNumber(realPoint?.cumulative)} {cumulativeLabel}
                        </Typography>
                    </Box>
                </Paper>
            )}
        </ChartsTooltipContainer>
    );
};

function downsampleObjects(data = [], maxPoints = 240) {
    if (!Array.isArray(data) || data.length <= maxPoints) return data;

    const result = [];
    const step = (data.length - 1) / (maxPoints - 1);

    for (let i = 0; i < maxPoints; i += 1) {
        const index = Math.round(i * step);
        result.push(data[index]);
    }

    return result;
}

function toCumulative(values = []) {
    let acc = 0;
    return values.map((value) => {
        acc += Number(value) || 0;
        return acc;
    });
}

export default function MetricSparkCard({
    mode = "dashboard",
    loading,
    error,
    title,
    interval = "Hoy",
    selected = true,
    selectable = true,
    onSelectChange,
    data = {},
    titleSpinner = "Obteniendo datos...",
    titleError = "Ocurrio un error al obtener los datos",
    singular = "unidad",
    plural = "unidades",
    cumulativeLabel = "acumuladas",
    showPlusInTotal = false,
    color = integrationsConfig.instagram.color,
    gradientId = "instagram-kpi-gradient",
}) {
    const isAnimated = mode === "dashboard";
    const finalData = data?.chartData;
    const [dataCard, setDataCard] = useState([]);
    const [animDates, setAnimDates] = useState([]);

    useEffect(() => {
        if (!Array.isArray(finalData) || finalData.length === 0) {
            setDataCard([]);
            setAnimDates([]);
            return;
        }

        if (!isAnimated || finalData.length > 120) {
            setDataCard(finalData);
            setAnimDates(data?.dates ?? []);
            return;
        }

        if (finalData.length === 1) {
            setDataCard(finalData);
            setAnimDates(data?.dates ?? []);
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
            setAnimDates((data?.dates ?? []).slice(0, currentIndex));

            if (currentIndex >= totalPoints) {
                setDataCard(finalData);
                setAnimDates(data?.dates ?? []);
                clearInterval(intervalId);
            }
        }, 20);

        return () => clearInterval(intervalId);
    }, [data?.dates, finalData, isAnimated]);

    const cumulativeData = toCumulative(dataCard);
    const combined = dataCard.map((daily, index) => ({
        date: animDates[index],
        daily,
        cumulative: cumulativeData[index],
    }));
    const sampledCombined = downsampleObjects(combined, 500);

    const total = Number(data?.total ?? 0);
    const delta = Number(data?.delta ?? 0);

    return (
        <DashboardCard
            title={title}
            titleSpinner={titleSpinner}
            titleError={titleError}
            sxSpinner={{
                fontSize: "0.9rem",
                pt: 3.5,
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
                display="flex"
                gap={0.5}
                justifyContent="center"
                alignItems="flex-end"
                mt={4.5}
                minHeight={70}
                sx={{ whiteSpace: "nowrap" }}
            >
                <Box sx={{ position: "relative" }}>
                    <Tooltip title={total.toLocaleString("es-BO")} arrow>
                        <Typography
                            sx={{ cursor: "pointer", color: total === 0 ? "warning.main" : undefined }}
                            variant="h3"
                            fontWeight={500}
                        >
                            {showPlusInTotal && total > 0 ? `+${formatNumber(total)}` : formatNumber(total)}
                        </Typography>
                    </Tooltip>

                    <Box sx={{ position: "absolute", bottom: -10, right: -15 }}>
                        {delta > 0 && <ArrowUpwardIcon fontSize="medium" sx={{ color: "green" }} />}
                        {delta < 0 && <ArrowDownwardIcon sx={{ color: "red" }} />}
                    </Box>
                </Box>

                <svg width="0" height="0">
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                </svg>

                {total !== 0 && (
                    <SparkLineChart
                        key={interval}
                        data={sampledCombined.map((point) => point.cumulative)}
                        height={70}
                        margin={{ top: 5, bottom: 5, left: 0, right: 18 }}
                        area
                        curve="monotoneX"
                        showHighlight
                        showTooltip
                        color={color}
                        slots={{ tooltip: CustomTooltip }}
                        slotProps={{
                            tooltip: {
                                trigger: "axis",
                                sampledCombined,
                                singular,
                                plural,
                                cumulativeLabel,
                                placement: "right-start",
                            },
                        }}
                        sx={{
                            "& .MuiAreaElement-root": {
                                fill: `url(#${gradientId})`,
                            },
                            "& .MuiLineElement-root": {
                                transition: "none",
                            },
                        }}
                    />
                )}
            </Box>
        </DashboardCard>
    );
}
