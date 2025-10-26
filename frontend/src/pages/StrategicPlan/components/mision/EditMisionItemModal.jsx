import React, { useState, useEffect, useRef } from "react";
import { Modal, Box, Typography, Button, TextField, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useKeyboardShortcuts from "../../../../hooks/useKeyboardShortcuts.js";

import { sanitizeText, isValidSanitizedText, hasSanitizedChanges } from "../../../../utils/textSanitizer.js";
import { useTheme } from "@emotion/react";

const EditMisionItemModal = ({ open, onClose, onSave, initialText = "", maxLength = 3000 }) => {
  const [text, setText] = useState(initialText);
  const [charsLeft, setCharsLeft] = useState(maxLength);
  const theme = useTheme();

  const initialTextRef = useRef(initialText);

  useEffect(() => {
    setText(initialText);
    setCharsLeft(maxLength - (initialText ? initialText.length : 0));
    initialTextRef.current = initialText;
  }, [initialText, maxLength, open]);

  const handleChange = (event) => {
    const newText = event.target.value;
    if (newText.length <= maxLength) {
      setText(newText);
      setCharsLeft(maxLength - newText.length);
    }
  };

  const isSaveDisabled = () => {
    if (!isValidSanitizedText(text, maxLength)) return true;
    if (!hasSanitizedChanges(text, initialTextRef.current)) return true;
    return false;
  };

  const handleSave = () => {
    if (isSaveDisabled()) return;
    const cleaned = sanitizeText(text);
    onSave(cleaned);
    onClose();
  };

  useKeyboardShortcuts({
    enabled: open && !isSaveDisabled(),
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
      aria-labelledby="edit-mision-modal-title"
      aria-describedby="edit-mision-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: 300, md: 500 },
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          outline: "none",
        }}
      >
        {/* Icono cerrar arriba a la derecha */}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8, color: "grey.600" }}
          aria-label="Cerrar"
        >
          <CloseIcon />
        </IconButton>

        <Typography id="edit-mision-modal-title" variant="h6" component="h2" gutterBottom>
          Editar Misión
        </Typography>

        <TextField
          id="edit-mision-modal-description"
          fullWidth
          multiline
          rows={4}
          value={text}
          onChange={handleChange}
          placeholder="Escribe la misión aquí..."
          inputProps={{ maxLength }}
          error={!isValidSanitizedText(text, maxLength) && text.length > 0}
          helperText={
            !isValidSanitizedText(text, maxLength) && text.length > 0
              ? "Texto inválido: no uses múltiples espacios o caracteres no permitidos."
              : ""
          }
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
          sx={{ display: "block", textAlign: "right", mb: 2 }}
        >
          Caracteres: {text.length} / {maxLength}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button onClick={handleSave} color="primary" disabled={isSaveDisabled()}>
            Guardar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditMisionItemModal;
