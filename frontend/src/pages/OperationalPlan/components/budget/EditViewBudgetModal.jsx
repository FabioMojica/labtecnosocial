import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack
} from '@mui/material';
import { useState, useEffect } from 'react';

const EditViewBudgetModal = ({ open, onClose, value, onSave }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (value) {
      setAmount(value.amount || '');
      setDescription(value.description || '');
    }
  }, [value]);

  const handleSave = () => {
    const trimmedDescription = description.trim();
    onSave({ amount, description: trimmedDescription });
    onClose();
  };

  const handleCancel = () => {
    setAmount(value?.amount || '');
    setDescription(value?.description || '');
    onClose();
  };

  const isSaveDisabled = amount === '' || description.trim() === '';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Presupuesto</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Monto"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{ inputProps: { min: 0, step: "0.01" } }}
          />
          <TextField
            label="Descripción"
            multiline
            rows={3}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaveDisabled}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditViewBudgetModal;
