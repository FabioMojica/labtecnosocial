import { Box, Stack, Tooltip, Typography, LinearProgress, linearProgressClasses } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import { DashboardCard } from "../../Facebook/components/DashboardCard";
import { formatNumber } from "../../Facebook/utils/cards";

function BreakdownRow({ icon, label, value, total, color }) {
    const percentage = total > 0 ? (value / total) * 100 : 0;

    return (
        <Stack spacing={0.45}>
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
                    height: 5,
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
    const repostsTotal = Number(data?.repostsTotal ?? 0);
    const repliesTotal = Number(data?.repliesTotal ?? 0);
    const quotesTotal = Number(data?.quotesTotal ?? 0);
    const hasData = Array.isArray(data?.chartData) && data.chartData.length > 0;

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
            titleSpinner={"Obteniendo interacciones de X..."}
            titleError={"Ocurrio un error al obtener interacciones de X"}
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
            <Box sx={{ mt: 2.2, minHeight: 95, display: "flex", flexDirection: "column", gap: 0.8 }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.6}>
                    <Tooltip title={total.toLocaleString("es-BO")} arrow>
                        <Typography variant="h3" fontWeight={500} lineHeight={1}>
                            {formatNumber(animatedTotal)}
                        </Typography>
                    </Tooltip>

                    {delta > 0 && <ArrowUpwardIcon fontSize="small" sx={{ color: "success.main", mb: -0.2 }} />}
                    {delta < 0 && <ArrowDownwardIcon fontSize="small" sx={{ color: "error.main", mb: -0.2 }} />}
                </Box>

                <Typography variant="caption" color="text.secondary" textAlign="center" lineHeight={1}>
                    {deltaText}
                </Typography>

                <BreakdownRow
                    icon={<FavoriteBorderRoundedIcon sx={{ fontSize: 14, color: "#1D9BF0" }} />}
                    label="Likes"
                    value={likesTotal}
                    total={total}
                    color="#1D9BF0"
                />

                <BreakdownRow
                    icon={<RepeatRoundedIcon sx={{ fontSize: 14, color: "#00BA7C" }} />}
                    label="Reposts"
                    value={repostsTotal}
                    total={total}
                    color="#00BA7C"
                />

                <BreakdownRow
                    icon={<ChatBubbleOutlineRoundedIcon sx={{ fontSize: 14, color: "#9D5CF7" }} />}
                    label="Respuestas"
                    value={repliesTotal}
                    total={total}
                    color="#9D5CF7"
                />

                <BreakdownRow
                    icon={<FormatQuoteRoundedIcon sx={{ fontSize: 14, color: "#F59E0B" }} />}
                    label="Citas"
                    value={quotesTotal}
                    total={total}
                    color="#F59E0B"
                />
            </Box>
        </DashboardCard>
    );
}

export default TotalReactionsCard;
