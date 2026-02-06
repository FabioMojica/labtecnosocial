import { 
    Box,
    Button
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';

export const InsertBlockDivider = ({ onAddText, onAddChart, onAddImage }) => {
    return (
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
          py: 1,
          mb: 1,
          width: '100%',
        }}
      >
        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={onAddText}>
          Texto
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DescriptionIcon />}
          onClick={onAddImage}
        >
          Imagen
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<TableChartIcon />}
          onClick={onAddChart}
        >
          Gráficos
        </Button>
      </Box>
    );
  };