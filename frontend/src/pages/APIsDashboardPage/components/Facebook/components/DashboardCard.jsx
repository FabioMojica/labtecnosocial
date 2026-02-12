import { Card, Box, Stack, Typography, CardContent, Checkbox } from "@mui/material";
import { ErrorScreen, NoResultsScreen, SpinnerLoading } from "../../../../../generalComponents";

export const DashboardCard = ({
  title,
  interval,
  titleSpinner,
  titleNoResults,
  titleError,
  smallCard = false,
  sxSpinner,
  loading,
  error,
  isEmpty,
  selectable = false,
  selected = false,
  onSelectChange,
  height = 150,
  children,
  sxCard
}) => {
  return (
    <Card variant="outlined" sx={{ height, flexGrow: 1, position: "relative", ...sxCard }}>
      {/* Header */}
      <Stack sx={{ position: "absolute", top: 8, left: 8 }}>
        <Typography variant="subtitle2" fontWeight={'bold'} fontSize={'0.85rem'}>{title}</Typography>
        {interval && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {interval}
          </Typography>
        )}
      </Stack>

      {/* Checkbox */}
      {selectable && !loading && !error && !isEmpty && (
        <Box sx={{ position: "absolute", top: 0, right: 0 }}>
          <Checkbox checked={selected} onChange={(e) => onSelectChange?.(e.target.checked)} />
        </Box>
      )}

      {/* States */}
      {loading ? (
        <SpinnerLoading size={30} text={titleSpinner} sx={{ height: "100%", ...sxSpinner, fontStyle: 'italic', color: 'text.disabled' }} />
      ) : error ? (
        <ErrorScreen message={titleError || "Ocurrió un error al obtener los datos"}
          sx={{
            height: "100%",
            pt: smallCard ? 4 : 0,
            gap: 0
          }}
          textSx={{
            fontSize: smallCard && '0.9rem',
          }}
          iconSx={{
            fontSize: smallCard ? 40 : 70
          }}

        />
      ) : isEmpty ? (
        <NoResultsScreen message={titleNoResults || "No hay datos para mostrar"} sx={{
          height: "100%",
          pt: smallCard ? 4 : 0,
          gap: 0
        }}
          textSx={{
            fontSize: smallCard ? '0.9rem' : undefined,
          }}
          iconSX={{
            fontSize: smallCard ? 40 : 70
          }} />
      ) : (
        <CardContent>{children}</CardContent>
      )}
    </Card>
  );
}
