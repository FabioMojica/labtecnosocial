import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import { usePdfExport } from "../contexts/PdfExportContext";

const clampProgress = (value) => Math.max(1, Math.min(100, Math.round(Number(value) || 0)));

export const GlobalPdfExportProgress = () => {
  const { pdfState } = usePdfExport();
  const showProgress = pdfState.active || pdfState.percentage >= 100;

  if (!showProgress) return null;

  const percentage = clampProgress(pdfState.percentage);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        width: { xs: "calc(100vw - 24px)", sm: 390 },
        maxWidth: 460,
        zIndex: 4000,
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: 8,
        p: 1.25,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.6}>
        <Stack direction="row" spacing={0.7} alignItems="center" minWidth={0}>
          <PictureAsPdfRoundedIcon color="error" fontSize="small" />
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {pdfState.active ? "Generando PDF..." : "PDF generado"}
          </Typography>
        </Stack>
        <Typography variant="caption" fontWeight={700}>
          {percentage}%
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{ height: 8, borderRadius: 999 }}
        color={pdfState.active ? "primary" : "success"}
      />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.6, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {pdfState.stage || "Preparando elementos del reporte..."}
      </Typography>
    </Box>
  );
};
