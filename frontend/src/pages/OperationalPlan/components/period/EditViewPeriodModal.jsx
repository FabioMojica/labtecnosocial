import React, { useState, useEffect, useRef } from 'react';
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
  const initialRef = useRef({ start: '', end: '' });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (value) {
      // Convertimos de timestamp a string "YYYY-MM-DDTHH:mm"
      const formatDateTimeLocal = (ts) => {
        if (!ts) return '';
        const date = new Date(ts);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      const formattedStart = formatDateTimeLocal(value.start);
      const formattedEnd = formatDateTimeLocal(value.end);

      setStart(formattedStart);
      setEnd(formattedEnd);
      setErrorStart('');
      setErrorEnd('');

      initialRef.current = { start: formattedStart, end: formattedEnd };

      setHasChanges(false);
    }
  }, [value, open]);

  useEffect(() => {
    if (start !== initialRef.current.start || end !== initialRef.current.end) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [start, end]);


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
      onSave({
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString()
      });
      onClose();
    }
  };


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
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          error={!!errorStart}
          helperText={errorStart}
          onKeyDown={(e) => e.preventDefault()}
        />

        {/* Campo fecha fin */}
        <TextField
          label="Fecha de fin"
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          error={!!errorEnd}
          helperText={errorEnd}
          onKeyDown={(e) => e.preventDefault()}
        />

        {/* Botón guardar */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!start || !end || !hasChanges }
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
