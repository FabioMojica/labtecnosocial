import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from '@mui/material';

const EditViewPeriodModal = ({ open, onClose, value, onSave }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [errorStart, setErrorStart] = useState('');
  const [errorEnd, setErrorEnd] = useState('');

  useEffect(() => {
    if (value) {
      setStart(value.start || '');
      setEnd(value.end || '');
      setErrorStart('');
      setErrorEnd('');
    }
  }, [value]);

  const handleSave = () => {
    setErrorStart('');
    setErrorEnd('');

    if (!start) {
      setErrorStart('La fecha de inicio es requerida');
      return;
    }

    if (!end) {
      setErrorEnd('La fecha de fin es requerida');
      return;
    }

    if (end < start) {
      setErrorEnd('La fecha de fin no puede ser anterior a la de inicio');
      return;
    }

    onSave({ start, end });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Periodo</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditViewPeriodModal;
