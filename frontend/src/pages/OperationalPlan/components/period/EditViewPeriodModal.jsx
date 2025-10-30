import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import useKeyboardShortcuts from '../../../../hooks/useKeyboardShortcuts';

const EditViewPeriodModal = ({ open, onClose, value, onSave }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [errorStart, setErrorStart] = useState('');
  const [errorEnd, setErrorEnd] = useState('');
  const theme = useTheme();

  useEffect(() => {
    if (value) {
      setStart(value.start || '');
      setEnd(value.end || '');
      setErrorStart('');
      setErrorEnd('');
    }
  }, [value, open]);

  const validate = () => {
    let valid = true;
    setErrorStart('');
    setErrorEnd('');

    if (!start) {
      setErrorStart('La fecha de inicio es requerida');
      valid = false;
    }

    if (!end) {
      setErrorEnd('La fecha de fin es requerida');
      valid = false;
    }

    if (start && end && end < start) {
      setErrorEnd('La fecha de fin no puede ser anterior a la de inicio');
      valid = false;
    }

    return valid;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({ start, end });
      onClose();
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    enabled: open,
    onEnter: handleSave,
    onEscape: onClose,
  });

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick") return; // No cerrar al hacer click fuera
        onClose();
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: 300, md: 400 },
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          p: 3,
          pt: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Botón de cierre */}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        {/* Título */}
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            mb: 1,
            color: theme.palette.text.primary,
          }}
        >
          Periodo
        </Typography>

        {/* Campo fecha inicio */}
        <TextField
          label="Fecha de inicio"
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          error={!!errorStart}
          helperText={errorStart}
        />

        {/* Campo fecha fin */}
        <TextField
          label="Fecha de fin"
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          error={!!errorEnd}
          helperText={errorEnd}
        />

        {/* Botón guardar */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!start || !end}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
            }}
          >
            Guardar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditViewPeriodModal;
