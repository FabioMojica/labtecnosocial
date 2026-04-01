import { Box, LinearProgress, Stack, Tooltip, Typography, linearProgressClasses } from "@mui/material";
import { DashboardCard } from "../../Facebook/components/DashboardCard";
import { formatNumber } from "../../Facebook/utils/cards";

const TYPE_COLORS = [
    "#E1306C",
    "#8E44AD",
    "#1D9BF0",
    "#F39C12",
    "#2ECC71",
];

function ContentTypePerformanceCard({
    loading,
    error,
    title = "Rendimiento por formato",
    interval = "Hoy",
    selected = true,
    selectable = true,
    onSelectChange,
    data = {},
}) {
    const rows = Array.isArray(data?.chartData) ? data.chartData : [];
    const total = Number(data?.total ?? 0);
    const hasRows = rows.length > 0;

    return (
        <DashboardCard
            title={title}
            titleSpinner={"Obteniendo rendimiento por formato..."}
            titleError={"Ocurrio un error al obtener rendimiento por formato"}
            sxSpinner={{
                fontSize: "0.9rem",
                pt: 3.5,
            }}
            smallCard
            height={{ xs: 210, sm: 220, md: 235 }}
            interval={interval}
            loading={loading}
            error={error}
            isEmpty={!hasRows}
            selectable={selectable}
            selected={selected}
            onSelectChange={onSelectChange}
        >
            <Box sx={{ mt: 6, minHeight: 145, display: "flex", flexDirection: "column", gap: 0.65 }}>
                <Stack direction="row" justifyContent="center" alignItems="baseline" spacing={0.5}>
                    <Tooltip title={total.toLocaleString("es-BO")} arrow>
                        <Typography variant="h4" fontWeight={500} lineHeight={1}>
                            {formatNumber(total)}
                        </Typography>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary">
                        interacciones
                    </Typography>
                </Stack>

                <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 0.2 }}>
                    {rows.slice(0, 4).map((item, index) => {
                        const value = Number(item?.value ?? 0);
                        const posts = Number(item?.posts ?? 0);
                        const percentage = total > 0 ? (value / total) * 100 : 0;
                        const color = TYPE_COLORS[index % TYPE_COLORS.length];

                        return (
                            <Stack key={`${item?.name}-${index}`} spacing={0.2}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                    <Typography variant="caption">
                                        {item?.name ?? "Formato"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatNumber(value)} ({Math.round(percentage)}%) | {formatNumber(posts)} posts
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
                    })}
                </Box>
            </Box>
        </DashboardCard>
    );
}

export default ContentTypePerformanceCard;
