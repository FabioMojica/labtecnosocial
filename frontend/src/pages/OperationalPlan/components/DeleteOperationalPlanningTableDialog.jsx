import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, List, ListItem, ListItemText, Box
} from '@mui/material';
import { useState, useEffect, useRef } from 'react';

const DeleteOperationalPlanningTableDialog = ({ open, onClose, project, onDeletePlan }) => {
  const [inputName, setInputName] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setInputName('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const isConfirmed = inputName === project?.name;

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onDeletePlan();
      onClose();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
        ⚠️ Eliminar Plan Operativo
      </DialogTitle>

      <DialogContent>
        <Typography gutterBottom>
          Esta acción eliminará toda la <strong>planificación operativa</strong> del proyecto{' '}
          <Box
            component="span"
            sx={{ color: 'error.main', fontWeight: 'bold', userSelect: 'none' }}
          >
            {project?.name}
          </Box>{' '}
          de forma <strong>irreversible</strong>.
        </Typography>

        <List sx={{ pl: 2, mb: 2 }}>
          <ListItem sx={{ display: 'list-item', py: 0 }}>
            <ListItemText primary="* Todas las filas del plan operativo serán eliminadas permanentemente." />
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0 }}>
            <ListItemText primary="* La vista documento del plan operativo también se eliminará permanentemente." />
          </ListItem>
          <ListItem sx={{ display: 'list-item', py: 0 }}>
            <ListItemText primary="* Esta operación no se puede deshacer." sx={{ color: 'red' }} />
          </ListItem>
        </List>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Escribe el nombre exacto del proyecto para confirmar:
        </Typography>
        <TextField
          inputRef={inputRef}
          fullWidth
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="Nombre del proyecto"
          autoComplete="off"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={!isConfirmed || loading}
          onClick={handleDelete}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteOperationalPlanningTableDialog;
