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
import { formatDateTime } from '../../../../utils/formatDate';

const PeriodItem = ({ setGlobalModalOpen, value, onUpdate, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();

  const openModal = () => {
    setModalOpen(true);
    setGlobalModalOpen(true);
  };
   const closeModal = () => {
    setModalOpen(false);
    setGlobalModalOpen(false);
  };

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
          p: 1,
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'light'
                ? 'rgba(0, 0, 0, 0.05)'
                : 'rgba(255, 255, 255, 0.08)',
            transition: 'background-color 0.2s ease',
          },
          cursor: 'pointer',
          border: theme.palette.mode === "light"
            ? `1px solid #b9c0b3ff`
            : "1px solid #e0e0e0",
          transition: 'box-shadow 0.3s ease',
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
                {formatDateTime(value.start)}
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
                {formatDateTime(value.end)}
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
                textAlign: 'center'
              }}>
              No se ha declarado un periodo
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          {!hasPeriod ? (
            <Tooltip title="Agregar periodo">
              <IconButton size="small" onClick={() => openModal()}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Ver periodo">
                <IconButton size="small" onClick={() => openModal()}>
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
        onClose={() => closeModal()}
        value={value}
        onSave={handleSave}
      />
    </>
  );
};

export default PeriodItem;
