import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Divider
} from '@mui/material';
import useKeyboardShortcuts from '../../../../hooks/useKeyboardShortcuts.js';
import { sanitizeText, isValidSanitizedText } from "../../../../utils/textSanitizer.js";
import { useTheme } from '@emotion/react';

const MAX_PROGRAM_LENGTH = 1000;

const CreateProgramModal = ({ open, onClose, onSave }) => {
  const [programText, setProgramText] = useState('');
  const [charsLeft, setCharsLeft] = useState(MAX_PROGRAM_LENGTH);
  const theme = useTheme();

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
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="create-program-title"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography id="create-program-title" variant="h6" fontWeight="bold">
          Crear Nuevo Programa
        </Typography>

        <Divider />

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
          sx={{
            color: charsLeft === 0 ? 'error.main' : 'text.secondary',
            textAlign: 'right',
          }}
        >
          Caracteres: {programText.length} / {MAX_PROGRAM_LENGTH}
        </Typography>

        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
          <Button onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!isValid} variant="contained">
            Guardar Programa
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default CreateProgramModal;
