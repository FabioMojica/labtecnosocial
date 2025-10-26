import React, { useEffect, useState, useRef } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import useKeyboardShortcuts from '../../../../hooks/useKeyboardShortcuts.js';

import { sanitizeText, isValidSanitizedText } from "../../../../utils/textSanitizer.js";

const MAX_PROGRAM_LENGTH = 1000;

const EditProgramModal = ({ open, onClose, program, onSave }) => {
  const [text, setText] = useState('');
  const [charsLeft, setCharsLeft] = useState(MAX_PROGRAM_LENGTH);
  const originalText = useRef('');

  useEffect(() => {
    if (program && open) {
      const initial = program.programDescription || '';
      setText(initial);
      originalText.current = initial;
      setCharsLeft(MAX_PROGRAM_LENGTH - initial.length);
    }
  }, [program, open]);

  const handleTextChange = (e) => {
    const raw = e.target.value;
    if (raw.length <= MAX_PROGRAM_LENGTH) {
      setText(raw);
      setCharsLeft(MAX_PROGRAM_LENGTH - raw.length);
    }
  };

  const cleanedText = sanitizeText(text);
  const isValid = isValidSanitizedText(text, MAX_PROGRAM_LENGTH);

  const handleSave = () => {
    if (!isValid) return;

    onSave({
      id: program.id,
      programDescription: cleanedText,
      operationalProjects: program.operationalProjects || [],
    });

    onClose();
  };

  const handleCancel = () => {
    setText(originalText.current);
    onClose();
  };

  useKeyboardShortcuts({
    enabled: open,
    onEnter: handleSave,
    onEscape: handleCancel,
  });

  return (
    <Modal 
      open={open} 
      onClose={(e, reason) => {
        if (reason !== 'backdropClick') handleCancel();
      }}
    >
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400, bgcolor: 'background.paper',
        borderRadius: 2, boxShadow: 24, p: 4
      }}>
        <Typography variant="h6" gutterBottom>
          Editar Programa
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Texto del Programa"
          value={text}
          onChange={handleTextChange}
          variant="outlined"
          inputProps={{ maxLength: MAX_PROGRAM_LENGTH }}
        />

        <Typography
          variant="caption"
          sx={{
            color: charsLeft === 0 ? 'error.main' : 'text.secondary',
            display: 'block',
            textAlign: 'right',
            mt: 0.5
          }}
        >
          Caracteres: {text.length} / {MAX_PROGRAM_LENGTH}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button onClick={handleCancel} color="secondary">Cancelar</Button>
          <Button onClick={handleSave} disabled={!isValid} variant="contained">
            Guardar Cambios
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditProgramModal;
