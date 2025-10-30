import React, { useEffect, useState, useRef } from 'react';
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

const EditViewBudgetModal = ({
  open,
  onClose,
  value,
  onSave,
  maxLengthAmount = 10,
  maxLengthDescription = 300
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isValid, setIsValid] = useState(false);
  const originalValues = useRef({ amount: '', description: '' });
  const theme = useTheme();

  // Cargar valores iniciales al abrir el modal
  useEffect(() => {
    const initial = {
      amount: value?.amount ?? '',
      description: value?.description ?? '',
    };
    setAmount(initial.amount);
    setDescription(initial.description);
    originalValues.current = initial;
  }, [value, open]);

  // Validar cambios y entradas
  useEffect(() => {
    const cleanedAmount = amount.trim();
    const cleanedDescription = description.trim().replace(/\s+/g, ' ');

    const hasChanges =
      cleanedAmount !== originalValues.current.amount ||
      cleanedDescription !== originalValues.current.description;

    const validInputs = cleanedAmount.length > 0 && cleanedDescription.length > 0;

    setIsValid(validInputs && hasChanges);
  }, [amount, description]);

  // Guardar cambios
  const handleSave = () => {
    const cleanedAmount = amount.trim();
    const cleanedDescription = description
      .split('\n')
      .map(line => line.trim().replace(/\s+/g, ' '))
      .filter(line => line.length > 0)
      .join('\n');

    if (cleanedAmount.length > 0 && cleanedDescription.length > 0) {
      onSave({ amount: cleanedAmount, description: cleanedDescription });
      onClose();
    }
  };

  // Controlar cambio del monto (solo números y punto decimal)
  const handleAmountChange = (e) => {
    const newValue = e.target.value;
    if (/^\d*\.?\d*$/.test(newValue)) {
      setAmount(newValue);
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  // Atajos de teclado (Enter / Escape)
  useKeyboardShortcuts({
    enabled: open,
    onEnter: handleSave,
    onEscape: onClose,
  });

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick") return;
        onClose();
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: 300, md: 500 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          pt: 2,
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
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
          Presupuesto
        </Typography>

        {/* Campo de monto */}
        <TextField
          fullWidth
          label="Monto (Bs)"
          value={amount}
          onChange={handleAmountChange}
          variant="outlined"
          inputProps={{
            maxLength: maxLengthAmount,
            inputMode: "decimal",
          }}
        />
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ mt: 0.5, display: "block", textAlign: "right", mb: 2 }}
        >
          Caracteres: {amount.length} / {maxLengthAmount}
        </Typography>

        {/* Campo de descripción */}
        <TextField
          fullWidth
          label="Descripción"
          value={description}
          onChange={handleDescriptionChange}
          variant="outlined"
          multiline
          rows={4}
          inputProps={{ maxLength: maxLengthDescription }}
          sx={{
            "& .MuiInputBase-input": {
              overflowY: "auto",
              maxHeight: "200px",
              "&::-webkit-scrollbar": { width: "2px" },
              "&::-webkit-scrollbar-track": {
                backgroundColor: theme.palette.background.default,
                borderRadius: "2px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: theme.palette.primary.main,
                borderRadius: "2px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            },
          }}
        />
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ mt: 0.5, display: "block", textAlign: "right", mb: 2 }}
        >
          Caracteres: {description.length} / {maxLengthDescription}
        </Typography>

        {/* Botones */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button onClick={handleSave} disabled={!isValid} variant="contained">
            Guardar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditViewBudgetModal;
