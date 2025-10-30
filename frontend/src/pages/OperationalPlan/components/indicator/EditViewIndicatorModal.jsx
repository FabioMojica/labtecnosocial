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

const EditViewIndicatorModal = ({ open, onClose, value, onSave, maxLengthAmount = 10, maxLengthConcept = 300 }) => {
  const [quantity, setQuantity] = useState('');
  const [concept, setConcept] = useState('');
  const [isValid, setIsValid] = useState(false);
  const originalValues = useRef({ quantity: '', concept: '' });
  const theme = useTheme();

  useEffect(() => {
    const initial = {
      quantity: value?.quantity ?? '',
      concept: value?.concept ?? '',
    };
    setQuantity(initial.quantity);
    setConcept(initial.concept);
    originalValues.current = initial;
  }, [value, open]);

  useEffect(() => {
    const cleanedQuantity = quantity.trim().replace(/\s+/g, ' ');
    const cleanedConcept = concept.trim().replace(/\s+/g, ' ');

    const hasChanges =
      cleanedQuantity !== originalValues.current.quantity ||
      cleanedConcept !== originalValues.current.concept;

    const validInputs = cleanedQuantity.length > 0 && cleanedConcept.length > 0;

    setIsValid(validInputs && hasChanges);
  }, [quantity, concept]);

  const handleSave = () => {
    const cleanedQuantity = quantity.trim().replace(/\s+/g, ' ');
    const cleanedConcept = concept
      .split('\n')
      .map(line => line.trim().replace(/\s+/g, ' '))
      .filter(line => line.length > 0)
      .join('\n');

    if (cleanedQuantity.length > 0 && cleanedConcept.length > 0) {
      onSave({ quantity: cleanedQuantity, concept: cleanedConcept });
      onClose();
    }
  };

  const handleQuantityChange = (e) => {
    const newQuantity = e.target.value;
    if (/^\d*$/.test(newQuantity)) {
      setQuantity(newQuantity);
    }
  };

  const handleConceptChange = (e) => {
    setConcept(e.target.value);
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
        if (reason === "backdropClick") return;
        onClose();
      }}
    >
      <Box sx={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: {
          xs: 300,
          md: 500,
        },
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 3,
        pt: 2
      }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
          Indicador
        </Typography>

        <TextField
          fullWidth
          label="Cantidad"
          value={quantity}
          onChange={handleQuantityChange}
          variant="outlined"
          inputProps={{ maxLength: maxLengthAmount }}
        />
        <Typography 
          variant="caption"
          color="textSecondary"
          sx={{ mt: 0.5, display: "block", textAlign: "right", mb: 2 }}
        >
          Caracteres: {quantity.length} / {maxLengthAmount}
        </Typography>

        <TextField
          fullWidth
          label="Concepto"
          value={concept}
          onChange={handleConceptChange}
          variant="outlined"
          multiline
          inputProps={{ maxLength: maxLengthConcept }}
          rows={4}
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
          Caracteres: {concept.length} / {maxLengthConcept}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button onClick={handleSave} disabled={!isValid} variant="contained">
            Guardar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditViewIndicatorModal;
