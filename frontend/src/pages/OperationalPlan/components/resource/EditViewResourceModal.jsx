import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const EditViewResourceModal = ({ open, onClose, resources = [], onSave }) => {
  const [newResource, setNewResource] = useState('');
  const [localResources, setLocalResources] = useState([]);

  useEffect(() => {
    setLocalResources(resources);
  }, [resources]);

  const handleAddResource = () => {
    if (newResource.trim()) {
      setLocalResources([...localResources, newResource]);
      setNewResource('');
    }
  };

  const handleRemoveResource = (index) => {
    setLocalResources(localResources.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(localResources);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          pt: 2,
        }}
      >
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
          Editar Recursos
        </Typography>

        <TextField
          fullWidth
          label="Nuevo Recurso"
          value={newResource}
          onChange={(e) => setNewResource(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleAddResource} sx={{ mb: 2 }}>
          Agregar Recurso
        </Button>

        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          Recursos:
        </Typography>

        {localResources.length > 0 ? (
          <Box
            sx={{
              mb: 2,
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #ccc',
              borderRadius: 1,
              p: 1,
            }}
          >
            {localResources.map((res, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                  padding: '4px',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Typography>{res}</Typography>
                <IconButton size="small" onClick={() => handleRemoveResource(index)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No se han declarado recursos.
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained">
            Guardar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditViewResourceModal;
