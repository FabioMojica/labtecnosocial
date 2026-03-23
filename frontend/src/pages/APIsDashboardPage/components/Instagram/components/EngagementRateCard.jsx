import { Box, Typography } from "@mui/material";
import { DashboardCard } from "../../Facebook/components/DashboardCard";
import { formatNumber } from "../../Facebook/utils/cards";

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function EngagementRateCard({
    loading,
    error,
    interval = "Hoy",
    title = "Tasa de engagement",
    selected = true,
    selectable = true,
    onSelectChange,
    data = {},
}) {
    const interactionsTotal = toNumber(data?.interactionsTotal);
    const reachTotal = toNumber(data?.reachTotal);
    const hasData =
        typeof data?.hasData === "boolean"
            ? data.hasData
            : interactionsTotal > 0 || reachTotal > 0;

    const engagementRate =
        typeof data?.total === "number"
            ? data.total
            : reachTotal > 0
                ? (interactionsTotal / reachTotal) * 100
                : 0;

    return (
        <DashboardCard
            title={title}
            titleSpinner="Obteniendo tasa de engagement de Instagram..."
            titleError="Ocurrio un error al obtener la tasa de engagement"
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
                    {engagementRate.toLocaleString("es-BO", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                    })}
                    %
                </Typography>
                <Typography variant="caption" color="text.secondary" lineHeight={1}>
                    Interacciones / Alcance
                </Typography>
                <Typography variant="caption" color="text.secondary" lineHeight={1} textAlign="center">
                    {formatNumber(interactionsTotal)} interacciones sobre {formatNumber(reachTotal)} de alcance
                </Typography>
            </Box>
        </DashboardCard>
    );
}

export default EngagementRateCard;
