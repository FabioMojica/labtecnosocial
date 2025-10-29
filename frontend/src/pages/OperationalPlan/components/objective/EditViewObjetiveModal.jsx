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

const EditViewObjectiveModal = ({ open, onClose, value, onSave, maxLength = 300 }) => {
  const [text, setText] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [charsLeft, setCharsLeft] = useState(maxLength);
  const originalText = useRef('');
  const theme = useTheme();

  useEffect(() => {
    const initial = value || '';
    setText(initial);
    originalText.current = initial;
  }, [value, open]);

  useEffect(() => {
    const cleanedText = text.trim();
    const cleanedOriginal = originalText.current.trim();
    setIsValid(cleanedText.length > 0 && cleanedText !== cleanedOriginal);
  }, [text]);



  const handleSave = () => {
    const cleaned = text
      .trim()
      .replace(/\s+/g, ' ');

    if (cleaned.length > 0) {
      onSave(cleaned);
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
        {/* Botón cerrar */}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
          Objetivo
        </Typography>

        {/* Campo de edición directamente visible */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Texto del Objetivo"
          value={text}
          onChange={(e) => setText(e.target.value)}
          variant="outlined"
          inputProps={{ maxLength: maxLength }}
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
          color={charsLeft === 0 ? "error" : "textSecondary"}
          sx={{ mt: 0.5, display: "block", textAlign: "right", mb: 2 }}
        >
          Caracteres: {text.length} / {maxLength}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={handleSave} disabled={!isValid} variant="contained">
            Guardar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditViewObjectiveModal;
