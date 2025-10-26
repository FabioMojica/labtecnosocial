import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material';

import useKeyboardShortcuts from '../../../../hooks/useKeyBoardShortcuts.js';

import { sanitizeText, isValidSanitizedText } from "../../../../utils/textSanitizer.js";

const MAX_PROGRAM_LENGTH = 1000;

const CreateProgramModal = ({ open, onClose, onSave }) => {
  const [programText, setProgramText] = useState('');
  const [charsLeft, setCharsLeft] = useState(MAX_PROGRAM_LENGTH);

  useEffect(() => {
    if (!open) {
      setProgramText('');
      setCharsLeft(MAX_PROGRAM_LENGTH);
    }
  }, [open]);

  const handleTextChange = (e) => {
    const raw = e.target.value;
    if (raw.length <= MAX_PROGRAM_LENGTH) {
      setProgramText(raw);
      setCharsLeft(MAX_PROGRAM_LENGTH - raw.length);
    }
  };

  const isValid = isValidSanitizedText(programText, MAX_PROGRAM_LENGTH);

  const handleSave = () => {
    if (!isValid) return;
    const cleaned = sanitizeText(programText);
    onSave(cleaned);
    setProgramText('');
    onClose();
  };

  const handleClose = () => {
    setProgramText('');
    setCharsLeft(MAX_PROGRAM_LENGTH);
    onClose();
  };

  useKeyboardShortcuts({
    enabled: open,
    onEnter: handleSave,
    onEscape: handleClose,
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Crear Nuevo Programa</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={4}
          autoFocus
          label="Texto del Programa"
          value={programText}
          onChange={handleTextChange}
          variant="outlined"
          margin="normal"
          inputProps={{ maxLength: MAX_PROGRAM_LENGTH }}
        />
        <Typography
          variant="caption"
          sx={{
            color: charsLeft === 0 ? 'error.main' : 'text.secondary',
            display: 'block',
            textAlign: 'right',
            mt: -1,
            mb: 1,
          }}
        >
          Caracteres: {programText.length} / {MAX_PROGRAM_LENGTH}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">Cancelar</Button>
        <Button onClick={handleSave} disabled={!isValid} variant="contained">
          Guardar Programa
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProgramModal;
