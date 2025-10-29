import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

const EditViewIndicatorModal = ({ open, onClose, value, onSave }) => {
  const [quantity, setQuantity] = useState('');
  const [concept, setConcept] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const originalValues = useRef({ quantity: '', concept: '' });

  useEffect(() => {
    const initial = {
      quantity: value?.quantity ?? '',
      concept: value?.concept ?? '',
    };
    setQuantity(initial.quantity);
    setConcept(initial.concept);
    originalValues.current = initial;
    setIsEditing(false);
  }, [value, open]);


  useEffect(() => {
    setIsValid(quantity.trim().length > 0 && concept.trim().length > 0);
  }, [quantity, concept]);

  const handleSave = () => {
    const cleanedQuantity = quantity.trimStart().replace(/\s+$/, '');
    const cleanedConcept = concept.trimStart().replace(/\s+$/, '');
    if (cleanedQuantity.length > 0 && cleanedConcept.length > 0) {
      onSave({ quantity: cleanedQuantity, concept: cleanedConcept });
      onClose();
    }
  };

  const handleCancel = () => {
    setQuantity(originalValues.current.quantity);
    setConcept(originalValues.current.concept);
    setIsEditing(false);
  };

  const shouldCloseOnBackdropClick = !isEditing;

  const handleQuantityChange = (e) => {
    const newQuantity = e.target.value;
    if (/^\d*$/.test(newQuantity)) {
      setQuantity(newQuantity);
    }
  };

  const handleConceptChange = (e) => {
    const newConcept = e.target.value;
    setConcept(newConcept);
  };

  return (
    <Modal
      open={open}
      onClose={(e, reason) => {
        if (shouldCloseOnBackdropClick || reason !== 'backdropClick') {
          onClose();
        }
      }}
    >
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400, bgcolor: 'background.paper',
        borderRadius: 2, boxShadow: 24, p: 3, pt: 2
      }}>
        {!isEditing && (
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
        )}

        <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
          {isEditing ? 'Editar Indicador' : 'Vista de indicador'}
        </Typography>

        {isEditing ? (
          <>
            <TextField
              fullWidth
              label="Cantidad"
              value={quantity}
              onChange={handleQuantityChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Concepto"
              value={concept}
              onChange={handleConceptChange}
              variant="outlined"
              multiline
              rows={4}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button onClick={handleCancel} color="secondary">Cancelar</Button>
              <Button onClick={handleSave} disabled={!isValid} variant="contained">
                Guardar
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Cantidad:
            </Typography>
            <Box sx={{
              padding: '4px',
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              WebkitLineClamp: 1,
              fontStyle: quantity ? 'normal' : 'italic',
              textAlign: quantity ? 'left' : 'center',
              height: 'auto',
            }}>
              {quantity || '(Sin cantidad definida)'}
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 600, mt: 2 }}>
              Concepto:
            </Typography>
            <Box sx={{
              padding: '4px',
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              whiteSpace: 'normal',
              wordBreak: 'break-all',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              WebkitLineClamp: 1,
              height: 'auto',
              fontStyle: concept ? 'normal' : 'italic',
              textAlign: concept ? 'left' : 'center',
            }}>
              {concept || '(Sin concepto definido)'}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <IconButton onClick={() => setIsEditing(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default EditViewIndicatorModal;
