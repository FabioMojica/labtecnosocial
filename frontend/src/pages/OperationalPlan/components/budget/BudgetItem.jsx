import { useState } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import EditViewBudgetModal from './EditViewBudgetModal';

const BudgetItem = ({ value, onUpdate, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSave = (newValue) => {
    onUpdate(newValue);
  };

  const hasBudget = Boolean(value?.amount?.toString().trim() || value?.description?.trim());

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
          gap: 1,
          height: '100%',
          boxShadow: 3,
          justifyContent: 'space-between'
        }}
      >
        {hasBudget ? (
          <Box sx={{ width: '100%',display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Monto:</Typography>
              <Box sx={{
                padding: '4px',
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                overflowWrap: 'break-word',
              }}>
                {value.amount}
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Descripción:</Typography>
              <Box sx={{
                padding: '4px',
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                overflowWrap: 'break-word'
              }}>
                {value.description}
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
                textAlign: 'center'
              }}>
              No se ha declarado un presupuesto
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          {!hasBudget ? (
            <Tooltip title="Crear presupuesto">
              <IconButton size="small" onClick={() => setModalOpen(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Ver presupuesto">
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

      <EditViewBudgetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        value={value}
        onSave={handleSave}
      />
    </>
  );
};

export default BudgetItem;
