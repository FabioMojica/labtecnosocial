import { Box, Typography } from "@mui/material";
import { DashboardCard } from "../../Facebook/components/DashboardCard";
import { formatNumber } from "../../Facebook/utils/cards";

function ActivityRateCard({
  loading,
  error,
  interval,
  title = "Interacciones por post",
  data = {},
  selected = true,
  selectable = true,
  onSelectChange,
}) {
  const interactionsTotal = Number(data?.interactionsTotal ?? 0);
  const postsTotal = Number(data?.postsTotal ?? 0);
  const hasData = Boolean(data?.hasData);
  const activityRate = postsTotal > 0 ? interactionsTotal / postsTotal : 0;

  return (
    <DashboardCard
      title={title}
      titleSpinner="Obteniendo ratio de actividad de X..."
      titleError="Ocurrio un error al obtener el ratio de actividad"
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
          {activityRate.toLocaleString("es-BO", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </Typography>
        <Typography variant="caption" color="text.secondary" lineHeight={1}>
          Interacciones promedio por publicacion
        </Typography>
        <Typography variant="caption" color="text.secondary" lineHeight={1} textAlign="center">
          {formatNumber(interactionsTotal)} interacciones en {formatNumber(postsTotal)} publicaciones
        </Typography>
      </Box>
    </DashboardCard>
  );
}

export default ActivityRateCard;
