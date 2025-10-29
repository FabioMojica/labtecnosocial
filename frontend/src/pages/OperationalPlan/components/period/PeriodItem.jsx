import { useState } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditViewPeriodModal from './EditViewPeriodModal';
import { formatDate } from '../../../../utils/formatDate';

const PeriodItem = ({ value, onUpdate, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);

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
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Inicio:</Typography>
              <Box sx={{
                padding: '4px',
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                overflowWrap: 'break-word',
              }}>
                {formatDate(value.start)}
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Fin:</Typography>
              <Box sx={{
                padding: '4px',
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                overflowWrap: 'break-word',
              }}>
                {formatDate(value.end)}
              </Box>
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
