import { useState } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditViewPeriodModal from './EditViewPeriodModal';
import { formatDate } from '../../../../utils/formatDate';

const PeriodItem = ({ value, onUpdate, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();

  const handleSave = (newValue) => {
    onUpdate(newValue);
  };

  const hasPeriod = value?.start && value?.end;

  return (
    <>
      <Box
        sx={{
          padding: 1,
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'left',
          height: '100%',
          justifyContent: 'space-between',
          boxShadow: 3,
          gap: 1,
        }}
      >
        {hasPeriod ? (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
            <Box>

              <Typography variant="body2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Inicio:
              </Typography>

              <Typography
                sx={{
                  display: "block",
                  padding: 0.5,
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  wordBreak: 'break-word',
                  borderRadius: 1,
                  backgroundColor:
                    theme.palette.mode === 'light'
                      ? 'rgba(200, 200, 200, 0.3)'
                      : 'rgba(100, 100, 100, 0.3)',
                  color: theme.palette.text.primary,
                  WebkitLineClamp: 1,
                }}
                variant="caption"
              >
                {formatDate(value.start)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Fin:
              </Typography>
              <Typography
                sx={{
                  display: "block",
                  padding: 0.5,
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  wordBreak: 'break-word',
                  borderRadius: 1,
                  backgroundColor:
                    theme.palette.mode === 'light'
                      ? 'rgba(200, 200, 200, 0.3)'
                      : 'rgba(100, 100, 100, 0.3)',
                  color: theme.palette.text.primary,
                  WebkitLineClamp: 1,
                }}
                variant="caption"
              >
                {formatDate(value.end)}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'orange', fontWeight: 'bold', width: '100%', height: '100%' }}>
            <InfoOutlinedIcon fontSize="small" />
            <Typography
              variant="body2"
              sx={{
                fontStyle: 'italic',
                fontSize: '0.75rem',
              }}>
              No se ha declarado un periodo
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          {!hasPeriod ? (
            <Tooltip title="Agregar periodo">
              <IconButton size="small" onClick={() => setModalOpen(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Ver periodo">
                <IconButton size="small" onClick={() => setModalOpen(true)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Borrar">
                <IconButton size="small" onClick={onDelete}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      <EditViewPeriodModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        value={value}
        onSave={handleSave}
      />
    </>
  );
};

export default PeriodItem;
