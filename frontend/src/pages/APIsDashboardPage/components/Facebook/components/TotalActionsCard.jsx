import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import PanToolAltOutlinedIcon from "@mui/icons-material/PanToolAltOutlined";
import { DashboardCard } from "./DashboardCard";
import { formatNumber } from "../utils/cards";

export const TotalActionsCard = ({
    mode = "dashboard",
    loading,
    error,
    title = "Total actions",
    interval = "Hoy",
    period,
    selected = true,
    selectable = true,
    onSelectChange,
    data = {},
}) => {
    const [animatedTotal, setAnimatedTotal] = useState(0);
    const isAnimated = mode === "dashboard";
    const total = Number(data?.total ?? 0);
    const delta = Number(data?.delta ?? 0);
    const hasActions = total > 0;
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
            titleSpinner={'Obteniendo "total actions" de la pagina...'}
            titleError={'Ocurrio un error al obtener "total actions" de la pagina'}
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
            <Box
                sx={{
                    mt: 2.2,
                    minHeight: 95,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 0.8,
                }}
            >
                <Box display="flex" alignItems="center" gap={0.8}>
                    <Tooltip title={total.toLocaleString("es-BO")} arrow>
                        <Typography
                            variant="h3"
                            fontWeight={500}
                            sx={{
                                lineHeight: 1,
                                color: hasActions ? "text.primary" : "warning.main",
                            }}
                        >
                            {hasActions ? `+${formatNumber(animatedTotal)}` : "0"}
                        </Typography>
                    </Tooltip>

                    {delta > 0 && (
                        <ArrowUpwardIcon
                            fontSize="small"
                            sx={{ color: "success.main", mb: -0.2 }}
                        />
                    )}

                    {delta < 0 && (
                        <ArrowDownwardIcon
                            fontSize="small"
                            sx={{ color: "error.main", mb: -0.2 }}
                        />
                    )}
                </Box>

                <Stack
                    direction="row"
                    spacing={0.6}
                    alignItems="center"
                    sx={{
                        px: 1,
                        py: 0.35,
                        borderRadius: 99,
                        bgcolor: hasActions ? "rgba(25,118,210,0.12)" : "rgba(158,158,158,0.16)",
                    }}
                >
                    {hasActions ? (
                        <BoltRoundedIcon sx={{ fontSize: 14, color: "primary.main" }} />
                    ) : (
                        <PanToolAltOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                    )}
                    <Typography
                        variant="caption"
                        sx={{ color: hasActions ? "primary.light" : "text.secondary", lineHeight: 1.2 }}
                    >
                        {hasActions
                            ? `${formatNumber(total)} acciones en el periodo`
                            : "Sin acciones registradas en este periodo"}
                    </Typography>
                </Stack>

                <Typography variant="caption" color="text.secondary" lineHeight={1}>
                    {deltaText}
                </Typography>
            </Box>
        </DashboardCard>
    );
};
