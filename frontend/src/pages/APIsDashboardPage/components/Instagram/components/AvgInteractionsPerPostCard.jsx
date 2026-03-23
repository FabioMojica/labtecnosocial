import { Box, Typography } from "@mui/material";
import { DashboardCard } from "../../Facebook/components/DashboardCard";
import { formatNumber } from "../../Facebook/utils/cards";

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function AvgInteractionsPerPostCard({
    loading,
    error,
    interval = "Hoy",
    title = "Interacciones por post",
    selected = true,
    selectable = true,
    onSelectChange,
    data = {},
}) {
    const totalPosts = toNumber(data?.totalPosts);
    const interactionsTotal = toNumber(data?.interactionsTotal);
    const avgValue =
        typeof data?.total === "number"
            ? data.total
            : totalPosts > 0
                ? interactionsTotal / totalPosts
                : 0;
    const hasData =
        typeof data?.hasData === "boolean"
            ? data.hasData
            : interactionsTotal > 0 || totalPosts > 0;

    return (
        <DashboardCard
            title={title}
            titleSpinner="Obteniendo interacciones promedio por post..."
            titleError="Ocurrio un error al obtener interacciones promedio por post"
            sxSpinner={{
                fontSize: "0.9rem",
                pt: 3.5,
            }}
            interval={interval}
            loading={loading}
            error={error}
            isEmpty={!hasData}
            smallCard
            selectable={selectable}
            selected={selected}
            onSelectChange={onSelectChange}
        >
            <Box
                sx={{
                    mt: 3.2,
                    minHeight: 92,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 0.45,
                }}
            >
                <Typography variant="h3" fontWeight={500} lineHeight={1}>
                    {avgValue.toLocaleString("es-BO", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                    })}
                </Typography>
                <Typography variant="caption" color="text.secondary" lineHeight={1}>
                    Interacciones promedio por publicacion
                </Typography>
                <Typography variant="caption" color="text.secondary" lineHeight={1} textAlign="center">
                    {formatNumber(interactionsTotal)} interacciones en {formatNumber(totalPosts)} publicaciones
                </Typography>
            </Box>
        </DashboardCard>
    );
}

export default AvgInteractionsPerPostCard;
