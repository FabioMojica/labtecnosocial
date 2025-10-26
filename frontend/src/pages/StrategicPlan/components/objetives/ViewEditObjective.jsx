import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import useKeyboardShortcuts from "../../../../hooks/useKeyboardShortcuts.js";

import {
  sanitizeText,
  isValidSanitizedText,
} from "../../../../utils/textSanitizer.js";

import isEqual from "lodash.isequal";
import { useTheme } from "@emotion/react";

const MAX_OBJECTIVE_LENGTH = 1000;
const MAX_CONCEPT_LENGTH = 500;

const ViewEditObjective = ({ open, onClose, objective, onSave }) => {
  const initialObjectiveRef = useRef(null);
  const theme = useTheme();

  const [editedObjective, setEditedObjective] = useState({
    objectiveTitle: "",
    indicators: [],
  });

  const [objectiveCharsLeft, setObjectiveCharsLeft] = useState(MAX_OBJECTIVE_LENGTH);

  const nextIdRef = useRef(1);

  useEffect(() => {
    if (objective && open) {
      const indicatorsWithIds =
        (objective.indicators?.map((ind) => {
          if (!ind || ind.id === undefined || ind.id === null) {
            console.warn("Indicador inválido detectado:", ind);
            return { id: `new-${nextIdRef.current++}`, amount: ind?.amount || "", concept: ind?.concept || "" };
          }
          return {
            id: ind.id.toString(),
            amount: ind.amount || "",
            concept: ind.concept || "",
          };
        })) || [];

      const initState = {
        id: objective.id,
        objectiveTitle: objective.objectiveTitle || "",
        indicators: indicatorsWithIds,
      };

      setEditedObjective(initState);
      setObjectiveCharsLeft(MAX_OBJECTIVE_LENGTH - (objective.objectiveTitle?.length || 0));
      initialObjectiveRef.current = initState;


      const numericIds = indicatorsWithIds
        .map(ind => {
          const num = parseInt(ind.id.replace(/^new-/, ""), 10);
          return isNaN(num) ? null : num;
        })
        .filter(num => num !== null);

      nextIdRef.current = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    } else if (!open) {
      setEditedObjective({ objectiveTitle: "", indicators: [] });
      setObjectiveCharsLeft(MAX_OBJECTIVE_LENGTH);
      nextIdRef.current = 1;
      initialObjectiveRef.current = null;
    }
  }, [objective, open]);

  useKeyboardShortcuts({
    enabled: open,
    onEnter: () => {
      if (!isSaveDisabled()) handleSave();
    },
    onEscape: () => {
      handleCloseAndReset();
    },
  });

  const handleTitleChange = (e) => {
    const raw = e.target.value;
    if (raw.length <= MAX_OBJECTIVE_LENGTH) {
      setEditedObjective((prev) => ({ ...prev, objectiveTitle: raw }));
      setObjectiveCharsLeft(MAX_OBJECTIVE_LENGTH - raw.length);
    }
  };

  const handleIndicatorChange = (id, field, value) => {
    setEditedObjective((prev) => {
      const newIndicators = prev.indicators.map((ind) => {
        if (ind.id !== id) return ind;

        if (field === "amount") {
          if (!/^\d{0,30}$/.test(value)) return ind;
          if (value.length > 1) value = value.replace(/^0+/, "");
          if (value === "0") return ind;
          return { ...ind, amount: value };
        } else if (field === "concept") {
          if (value.length > MAX_CONCEPT_LENGTH) return ind;
          return { ...ind, concept: value };
        }
        return ind;
      });
      return { ...prev, indicators: newIndicators };
    });
  };

  const handleAddIndicator = () => {
    const newId = `new-${nextIdRef.current++}`;
    setEditedObjective((prev) => ({
      ...prev,
      indicators: [...prev.indicators, { id: newId, amount: "", concept: "" }],
    }));
  };

  const handleDeleteIndicator = (id) => {
    setEditedObjective((prev) => ({
      ...prev,
      indicators: prev.indicators.filter((ind) => ind.id !== id),
    }));
  };

  // Validar título sanitizado
  const cleanedTitle = sanitizeText(editedObjective.objectiveTitle);
  const isTitleValid = isValidSanitizedText(cleanedTitle, MAX_OBJECTIVE_LENGTH);

  // Validar indicadores
  const areIndicatorsValid = editedObjective.indicators.every(({ amount, concept }) => {
    if (!amount.trim() || amount === "0") return false;
    const cleanedConcept = sanitizeText(concept);
    if (!isValidSanitizedText(cleanedConcept, MAX_CONCEPT_LENGTH)) return false;
    return true;
  });

  const hasChanges = () => {
    if (!initialObjectiveRef.current) return false;

    if (sanitizeText(initialObjectiveRef.current.objectiveTitle) !== cleanedTitle) return true;

    const sanitizeIndicators = (inds) =>
      inds.map(({ id, amount, concept }) => ({
        id,
        amount: amount.trim(),
        concept: sanitizeText(concept),
      }));

    const initialInds = sanitizeIndicators(initialObjectiveRef.current.indicators || []);
    const currentInds = sanitizeIndicators(editedObjective.indicators || []);

    return !isEqual(initialInds, currentInds);
  };

  const isSaveDisabled = () => {
    if (!isTitleValid) return true;

    const allIndicatorsValid = editedObjective.indicators.length === 0
      ? true // No hay indicadores, está bien
      : editedObjective.indicators.every(({ amount, concept }) => {
        if (!amount.trim() || amount === "0") return false;
        const cleanedConcept = sanitizeText(concept);
        if (!isValidSanitizedText(cleanedConcept, MAX_CONCEPT_LENGTH)) return false;
        return true;
      });

    if (!allIndicatorsValid) return true;
    if (!hasChanges()) return true;

    return false;
  };


  const handleCloseAndReset = () => {
    if (initialObjectiveRef.current) {
      setEditedObjective(initialObjectiveRef.current);
      setObjectiveCharsLeft(MAX_OBJECTIVE_LENGTH - initialObjectiveRef.current.objectiveTitle.length);

      const numericIds = initialObjectiveRef.current.indicators
        .map(ind => {
          const num = parseInt(ind.id.replace(/^new-/, ""), 10);
          return isNaN(num) ? null : num;
        })
        .filter(num => num !== null);

      nextIdRef.current = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    }
    onClose();
  };

  const handleSave = () => {
    if (isSaveDisabled()) return;

    const cleanedIndicators = editedObjective.indicators.map(({ id, amount, concept }) => ({
      id,
      amount: amount.trim(),
      concept: sanitizeText(concept),
    }));

    onSave({ ...editedObjective, objectiveTitle: cleanedTitle, indicators: cleanedIndicators });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={(e, reason) => {
        if (reason === "backdropClick") return;
        handleCloseAndReset();
      }}
      aria-labelledby="view-edit-objective-title"
      aria-describedby="view-edit-objective-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: {
            xs: 310,
            sm: 500
          },
          maxHeight: "80vh",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          outline: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          onClick={handleCloseAndReset}
          sx={{ position: "absolute", top: 8, right: 8, color: "grey.600" }}
          aria-label="Cerrar"
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" mb={2} id="view-edit-objective-title">
          Detalles del Objetivo
        </Typography>

        <TextField
          label="Título del Objetivo"
          variant="outlined"
          fullWidth
          value={editedObjective.objectiveTitle}
          onChange={handleTitleChange}
          inputProps={{ maxLength: MAX_OBJECTIVE_LENGTH }}
          sx={{ mb: 0.5 }}
          required
        />
        <Typography
          variant="caption"
          color={objectiveCharsLeft === 0 ? "error" : "textSecondary"}
          sx={{ mb: 2, alignSelf: "flex-end" }}
        >
          Caracteres: {editedObjective.objectiveTitle.length} / {MAX_OBJECTIVE_LENGTH}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Indicadores
          </Typography>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleAddIndicator();
            }}
            color="primary"
            size="small"
            aria-label="Agregar indicador"
          >
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
          {editedObjective.indicators.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" mb={1}>
              No se han creado indicadores
            </Typography>
          ) : (
            editedObjective.indicators.map((indicator, index) => (
              <Box key={indicator.id} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 1 }}>
                  {index + 1}.
                </Typography>
                <Grid container spacing={{ sm: 2, xs: 1 }} alignItems="center">
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


        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="contained" onClick={handleSave} disabled={isSaveDisabled()}>
            Guardar Cambios
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewEditObjective;
