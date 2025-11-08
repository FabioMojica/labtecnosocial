import { useReport } from '../contexts/ReportContext';
import { Badge, Fab } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export const ReportBubble = ({ onClick }) => {
  const { selectedCharts } = useReport();

  if (selectedCharts.length === 0) return null;

  return (
    <Fab
      color="primary"
      onClick={onClick}
      sx={{ position: 'fixed', bottom: 24, right: 24 }}
    >
      <Badge badgeContent={selectedCharts.length} color="secondary">
        <InsertDriveFileIcon />
      </Badge>
    </Fab>
  );
};
