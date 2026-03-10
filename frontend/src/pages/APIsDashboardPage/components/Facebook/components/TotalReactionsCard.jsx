import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { DashboardCard } from "./DashboardCard";
import { formatNumber } from "../utils/cards";

const REACTIONS = [
    { key: "LIKE", label: "Like", iconSrc: "/reactions/facebook/like.png", bg: "#1877F2" },
    { key: "LOVE", label: "Love", iconSrc: "/reactions/facebook/love.png", bg: "#F33E58" },
    { key: "WOW", label: "Wow", iconSrc: "/reactions/facebook/wow.png", bg: "#F7B125" },
    { key: "HAHA", label: "Haha", iconSrc: "/reactions/facebook/haha.png", bg: "#F7B125" },
    { key: "SAD", label: "Sad", iconSrc: "/reactions/facebook/sad.png", bg: "#F7B125" },
    { key: "ANGRY", label: "Angry", iconSrc: "/reactions/facebook/angry.png", bg: "#E9710F" },
];

const ReactionBadge = ({ reaction, size = 14 }) => {
    return (
        <Box
            component="img"
            src={reaction.iconSrc}
            alt={reaction.label}
            sx={{
                width: size,
                height: size,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
            }}
        />
    );
};

export const TotalReactionsCard = ({
    error,
    loading,
    title = "Reacciones totales",
    interval = "Hoy",
    selected = true,
    selectable = true,
    onSelectChange,
    data = [],
}) => {
    const reactionValues = useMemo(
        () => REACTIONS.map((_, index) => Number(data?.[index] ?? 0)),
        [data]
    );
    const maxReactionValue = Math.max(...reactionValues, 0);
    const [animatedValues, setAnimatedValues] = useState(() =>
        REACTIONS.map(() => 0)
    );

    useEffect(() => {
        const targets = REACTIONS.map((_, index) => Number(data?.[index] ?? 0));
        const duration = 520;
        const start = performance.now();
        let frameId = 0;

        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const easeOut = 1 - Math.pow(1 - t, 3);
            setAnimatedValues(targets.map((value) => Math.round(value * easeOut)));

            if (t < 1) {
                frameId = requestAnimationFrame(tick);
            }
        };

        setAnimatedValues(REACTIONS.map(() => 0));
        frameId = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frameId);
    }, [data, interval]);

    const animatedTotal = animatedValues.reduce((acc, value) => acc + value, 0);

    return (
        <DashboardCard
            title={title}
            titleSpinner={"Obteniendo las reacciones totales de la pagina..."}
            titleError={"Ocurrio un error al obtener las reacciones totales de la pagina"}
            sxSpinner={{
                fontSize: "0.9rem",
                pt: 3.5,
            }}
            smallCard
            interval={interval}
            loading={loading}
            error={error}
            isEmpty={data.length === 0}
            selectable={selectable}
            selected={selected}
            onSelectChange={onSelectChange}
        >
            <Box
                sx={{
                    mt: 1.2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 0.8,
                    overflow: "hidden",
                }}
            >
                <Box mt={3} display="flex" justifyContent="center" alignItems="baseline" gap={0.5}>
                    <Typography variant="h4" fontWeight={500} lineHeight={1}>
                        {formatNumber(animatedTotal)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" lineHeight={1}>
                        totales
                    </Typography>
                </Box>

                <Stack
                    direction="row"
                    spacing={0.45}
                    justifyContent="center"
                    alignItems="flex-end"
                    useFlexGap
                    flexWrap="nowrap"
                    sx={{ px: 0.5 }}
                >
                    {REACTIONS.map((reaction, index) => {
                        const value = reactionValues[index];
                        const animatedValue = animatedValues[index];
                        const barHeight =
                            maxReactionValue > 0 ? Math.max(6, (animatedValue / maxReactionValue) * 30) : 6;

                        return (
                            <Tooltip key={reaction.key} title={`${reaction.label}: ${formatNumber(value)}`} arrow>
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    gap={0.25}
                                    sx={{
                                        width: 34,
                                        cursor: "default",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 14,
                                            height: 24,
                                            display: "flex",
                                            alignItems: "flex-end",
                                            justifyContent: "center",
                                            borderRadius: 2,
                                            bgcolor: alpha("#FFFFFF", 0.08),
                                            p: "1px",
                                            boxSizing: "border-box",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: "100%",
                                                height: `${barHeight}px`,
                                                borderRadius: "6px 6px 3px 3px",
                                                background: `linear-gradient(180deg, ${reaction.bg} 0%, ${alpha(reaction.bg, 0.42)} 100%)`,
                                                boxShadow: `0 0 0 1px ${alpha(reaction.bg, 0.35)}`,
                                            }}
                                        />
                                    </Box>

                                    <Box display="flex" alignItems="center" gap={0.25}>
                                        <ReactionBadge reaction={reaction} size={11} />
                                        <Typography variant="caption" fontWeight={600} lineHeight={1}>
                                            {formatNumber(animatedValue)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Tooltip>
                        );
                    })}
                </Stack>
            </Box>
        </DashboardCard>
    );
};
