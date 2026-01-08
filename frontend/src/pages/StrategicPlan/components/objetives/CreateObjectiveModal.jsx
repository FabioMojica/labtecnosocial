import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import useKeyboardShortcuts from '../../../../hooks/useKeyboardShortcuts.js';

import { sanitizeText, isValidSanitizedText } from "../../../../utils/textSanitizer.js";
import { useTheme } from '@emotion/react';

const MAX_OBJECTIVE_LENGTH = 1000;
const MAX_CONCEPT_LENGTH = 500;

const CreateObjectiveModal = ({ open, onClose, onSave }) => {
  const [objectiveText, setObjectiveText] = useState('');
  const [objectiveCharsLeft, setObjectiveCharsLeft] = useState(MAX_OBJECTIVE_LENGTH);
  const [indicators, setIndicators] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    if (!open) {
      setObjectiveText('');
      setObjectiveCharsLeft(MAX_OBJECTIVE_LENGTH);
      setIndicators([]);
    }
  }, [open]);

  const handleObjectiveTextChange = (event) => {
    const raw = event.target.value;
    if (raw.length <= MAX_OBJECTIVE_LENGTH) {
      setObjectiveText(raw);
      setObjectiveCharsLeft(MAX_OBJECTIVE_LENGTH - raw.length);
    }
  };

  const handleIndicatorChange = (id, field, value) => {
    setIndicators((prevIndicators) =>
      prevIndicators.map((indicator) => {
        if (indicator.id !== id) return indicator;

        if (field === 'concept') {
          if (value.length > MAX_CONCEPT_LENGTH) return indicator;
          return { ...indicator, concept: value };
        }

        if (field === 'amount') {
          if (value === '') return { ...indicator, amount: '' };
          if (!/^\d*\.?\d*$/.test(value)) return indicator;
          return { ...indicator, amount: value };
        }

        return indicator;
      })
    );
  };

  const handleAddIndicator = () => {
    setIndicators((prev) => [
      ...prev,
      { id: prev.length > 0 ? prev[prev.length - 1].id + 1 : 1, amount: '', concept: '' },
    ]);
  };

  const handleDeleteIndicator = (id) => {
    setIndicators((prev) => prev.filter((ind) => ind.id !== id));
  };

  const isObjectiveValid = isValidSanitizedText(objectiveText, MAX_OBJECTIVE_LENGTH);

  const isSaveDisabled = () => {
    if (!isObjectiveValid) return true;
    return false;
  };

  const handleSave = () => {
    if (isSaveDisabled()) return;

    const cleanedObjective = sanitizeText(objectiveText);
    const cleanedIndicators = indicators.map(({ id, amount, concept }) => ({
      id,
      amount: amount.trim(),
      concept: sanitizeText(concept),
    }));

    onSave({ objectiveText: cleanedObjective, indicators: cleanedIndicators });

    setObjectiveText('');
    setObjectiveCharsLeft(MAX_OBJECTIVE_LENGTH);
    setIndicators([]);
    onClose();
  };

  const handleClose = () => {
    setObjectiveText('');
    setObjectiveCharsLeft(MAX_OBJECTIVE_LENGTH);
    setIndicators([]);
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
      onClose={(event, reason) => {
        if (reason === 'backdropClick') return;
        handleClose();
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: "background.paper",
          padding: 3,
          borderRadius: 2,
          width: {
            xs: 300,
            sm: 500
          },
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Crear Objetivo
        </Typography>

        <TextField
          label="Título del Objetivo"
          variant="outlined"
          fullWidth
          value={objectiveText}
          onChange={handleObjectiveTextChange}
          sx={{ mb: 0.5 }}
          required
          inputProps={{ maxLength: MAX_OBJECTIVE_LENGTH }}

        />
        <Typography
          variant="caption"
          color={objectiveCharsLeft === 0 ? 'error' : 'textSecondary'}
          sx={{ mb: 2, alignSelf: 'flex-end' }}
        >
          Caracteres: {objectiveText.length} / {MAX_OBJECTIVE_LENGTH}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Indicadores
          </Typography>
          <IconButton onClick={handleAddIndicator} color="primary" size="small">
            <AddIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            maxHeight: '200px',
             overflow: 'auto',
            "&::-webkit-scrollbar": { width: "2px", height: '2px' },
            "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
            "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
            
            mb: 2,
            py: 1
          }}
        >
          {indicators.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>
              No se han creado indicadores
            </Typography>
          ) : (
            indicators.map((indicator, index) => (
              <Box key={indicator.id} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 1 }}>
                  {index + 1}.
                </Typography>
                <Grid container spacing={{ sm: 2, xs: 1}} alignItems="center">
                  <Grid size={5}>
                    <TextField
                      label="Cantidad"
                      variant="outlined"
                      fullWidth
                      value={indicator.amount}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (!/^\d{0,30}$/.test(value)) return;
                        if (value.length > 1) value = value.replace(/^0+/, '');
                        if (value === '0') return;
                        handleIndicatorChange(indicator.id, 'amount', value);
                      }}
                      inputProps={{
                        inputMode: 'numeric',
                        maxLength: 30,
                      }}
                    />
                  </Grid>
                  <Grid size={5}>
                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        label="Concepto"
                        variant="outlined"
                        fullWidth
                        value={indicator.concept}
                        onChange={(e) => handleIndicatorChange(indicator.id, 'concept', e.target.value)}
                        inputProps={{ maxLength: MAX_CONCEPT_LENGTH }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          bottom: 1,
                          right: 3,
                          fontSize: '0.65rem',
                          color: indicator.concept.length >= MAX_CONCEPT_LENGTH ? 'error.main' : 'text.secondary',
                        }}
                      >
                        {indicator.concept.length} / {MAX_CONCEPT_LENGTH}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={2}>
                    <IconButton onClick={() => handleDeleteIndicator(indicator.id)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))
          )}
        </Box>


        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" color="error" onClick={handleClose} sx={{ mr: 2 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={isSaveDisabled()}
          >
            Guardar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateObjectiveModal;
