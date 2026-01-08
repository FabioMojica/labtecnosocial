import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import useKeyboardShortcuts from "../../../../hooks/useKeyboardShortcuts.js";

import { sanitizeText, isValidSanitizedText } from "../../../../utils/textSanitizer.js";
import { useTheme } from "@emotion/react";

const CreateMisionItemModal = ({ open, onClose, onSave, maxLength = 3000 }) => {
  const [misionText, setMisionText] = useState("");
  const [charsLeft, setCharsLeft] = useState(maxLength);
  const [isValid, setIsValid] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (!open) {
      setMisionText("");
      setCharsLeft(maxLength);
      setIsValid(false);
    }
  }, [open, maxLength]);

  const handleSave = () => {
    const cleaned = sanitizeText(misionText);
    if (isValidSanitizedText(cleaned, maxLength)) {
      onSave(cleaned);
      onClose();
    }
  };

  const handleChange = (e) => {
    const rawText = e.target.value;
    if (rawText.length <= maxLength) {
      setMisionText(rawText);
      setCharsLeft(maxLength - rawText.length);
      setIsValid(isValidSanitizedText(rawText, maxLength));
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
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: {
            xs: 300,
            md: 500,
          },
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Crear Misión
        </Typography>
        <TextField 
          fullWidth
          label="Descripción de la misión"
          variant="outlined"
          multiline
          rows={4}
          value={misionText}
          onChange={handleChange}
          inputProps={{ maxLength }}
          error={!isValid && misionText.length > 0}
          helperText={
            !isValid && misionText.length > 0
              ? "El texto debe contener palabras válidas, sin múltiples espacios ni solo símbolos."
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
          sx={{ mt: 0.5, display: "block", textAlign: "right", mb: 2 }}
        >
          Caracteres: {misionText.length} / {maxLength}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button color="error" variant="contained" onClick={onClose} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!isValid}
          >
            Guardar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateMisionItemModal;
