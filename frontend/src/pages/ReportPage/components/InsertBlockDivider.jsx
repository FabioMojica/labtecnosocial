import { Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TableChartIcon from "@mui/icons-material/TableChart";
import DescriptionIcon from "@mui/icons-material/Description";

export const InsertBlockDivider = ({ onAddText, onAddChart, onAddImage, disabled = false }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        justifyContent: "center",
        py: 1,
        mb: 1,
        width: "100%",
      }}
    >
      <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={onAddText} disabled={disabled}>
        Texto
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<DescriptionIcon />}
        onClick={onAddImage}
        disabled={disabled}
      >
        Imagen
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<TableChartIcon />}
        onClick={onAddChart}
        disabled={disabled}
      >
        Graficos
      </Button>
    </Box>
  );
};

