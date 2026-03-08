import { Box, Stack, Tooltip, Typography, LinearProgress, linearProgressClasses } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { DashboardCard } from "../../Facebook/components/DashboardCard";
import { formatNumber } from "../../Facebook/utils/cards";

function BreakdownRow({ icon, label, value, total, color }) {
    const percentage = total > 0 ? (value / total) * 100 : 0;

    return (
        <Stack spacing={0.25}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.8}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    {icon}
                    <Typography variant="caption">{label}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                    {formatNumber(value)} ({Math.round(percentage)}%)
                </Typography>
            </Stack>
            <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                    height: 4,
                    borderRadius: 999,
                    [`& .${linearProgressClasses.bar}`]: {
                        backgroundColor: color,
                    },
                }}
            />
        </Stack>
    );
}

function TotalReactionsCard({
    mode = "dashboard",
    loading,
    error,
    title = "Interacciones",
    interval = "Hoy",
    selected = true,
    selectable = true,
    onSelectChange,
    data = {},
}) {
    const [animatedTotal, setAnimatedTotal] = useState(0);
    const isAnimated = mode === "dashboard";

    const total = Number(data?.total ?? 0);
    const delta = Number(data?.delta ?? 0);
    const likesTotal = Number(data?.likesTotal ?? 0);
    const commentsTotal = Number(data?.commentsTotal ?? 0);
    const hasData = Array.isArray(data?.chartData) && data.chartData.length > 0;
    const breakdownItems = useMemo(() => {
        const rows = [
            {
                key: "likes",
                icon: <FavoriteBorderRoundedIcon sx={{ fontSize: 14, color: "#E1306C" }} />,
                label: "Likes",
                value: likesTotal,
                color: "#E1306C",
            },
            {
                key: "comments",
                icon: <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 14, color: "#8E44AD" }} />,
                label: "Comentarios",
                value: commentsTotal,
                color: "#8E44AD",
            },
        ];

        const nonZeroRows = rows.filter((row) => row.value > 0);
        return nonZeroRows.length > 0 ? nonZeroRows : rows;
    }, [commentsTotal, likesTotal]);

    const deltaText = useMemo(() => {
        if (delta === 0) return "Sin cambio vs dia anterior";
        return `${delta > 0 ? "+" : ""}${formatNumber(delta)} vs dia anterior`;
    }, [delta]);

    useEffect(() => {
        if (!isAnimated) {
            setAnimatedTotal(total);
            return;
        }

        if (!total) {
            setAnimatedTotal(0);
            return;
        }

        const duration = 650;
        const startTime = performance.now();
        let frameId = 0;

        const tick = (now) => {
            const progress = Math.min(1, (now - startTime) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedTotal(Math.round(total * eased));

            if (progress < 1) {
                frameId = requestAnimationFrame(tick);
            }
        };

        setAnimatedTotal(0);
        frameId = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frameId);
    }, [interval, isAnimated, total]);

    return (
        <DashboardCard
            title={title}
            titleSpinner={"Obteniendo interacciones de Instagram..."}
            titleError={"Ocurrio un error al obtener interacciones de Instagram"}
            sxSpinner={{
                fontSize: "0.9rem",
                pt: 3.5,
            }}
            smallCard
            interval={interval}
            loading={loading}
            error={error}
            isEmpty={!hasData}
            selectable={selectable}
            selected={selected}
            onSelectChange={onSelectChange}
        >
            <Box sx={{ mt: 1.4, minHeight: 0, display: "flex", flexDirection: "column", gap: 0.55 }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.6}>
                    <Tooltip title={total.toLocaleString("es-BO")} arrow>
                        <Typography variant="h4" fontWeight={500} lineHeight={1}>
                            {formatNumber(animatedTotal)}
                        </Typography>
                    </Tooltip>

                    {delta > 0 && <ArrowUpwardIcon fontSize="small" sx={{ color: "success.main", mb: -0.2 }} />}
                    {delta < 0 && <ArrowDownwardIcon fontSize="small" sx={{ color: "error.main", mb: -0.2 }} />}
                </Box>

                <Typography variant="caption" color="text.secondary" textAlign="center" lineHeight={1}>
                    {deltaText}
                </Typography>

                {breakdownItems.map((item) => (
                    <BreakdownRow
                        key={item.key}
                        icon={item.icon}
                        label={item.label}
                        value={item.value}
                        total={total}
                        color={item.color}
                    />
                ))}
            </Box>
        </DashboardCard>
    );
}

export default TotalReactionsCard;
