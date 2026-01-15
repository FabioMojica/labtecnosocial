import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, List, ListItem, ListItemText, Box,
  useTheme
} from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { ButtonWithLoader } from '../../../generalComponents';
import { useFetchAndLoad } from '../../../hooks';

const DeleteOperationalPlanningTableDialog = ({ open, onClose, project, onDeletePlan }) => {
  const [inputName, setInputName] = useState('');
  const inputRef = useRef(null);
  const { loading, callEndpoint } = useFetchAndLoad();
  const theme = useTheme();

  useEffect(() => {
    if (open) {
      setInputName('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const isConfirmed = inputName === project?.name;

  const handleDelete = async () => {
    try {
      await callEndpoint(onDeletePlan());
      onClose();
    } catch (error) {
      throw error;
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      onClose={(event, reason) => {
        if (loading) {
          if (reason === 'backdropClick') {
            return;
          }
          return;
        }
        onClose();
      }}
      disableEscapeKeyDown={loading}
    >
      <Box sx={{
        width: '100%',
        height: '100%',
        bgcolor: theme.palette.background.paper,
      }}>
        <DialogTitle sx={{
          color:
            theme.palette.mode === 'dark'
              ? theme.palette.error.main
              : theme.palette.error.main, fontWeight: 'bold'
        }}>
          ⚠️ Eliminar Plan Operativo
        </DialogTitle>

        <DialogContent>
          <Typography gutterBottom>
            Esta acción eliminará toda la <strong>planificación operativa</strong> del proyecto{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 'bold', color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.error.main
                    : theme.palette.error.main,
              }}
            >
              {project?.name}
            </Box>{' '}
            de forma <strong>irreversible</strong>.
          </Typography>

          <List sx={{ pl: 2, mb: 2 }}>
            <ListItem sx={{ display: 'list-item', py: 0 }}>
              <ListItemText primary="* Todo el plan operativo del proyecto seleccionado será eliminado permanentemente." />
            </ListItem>
            <ListItem sx={{ display: 'list-item', py: 0 }}>
              <ListItemText primary="* Esta operación no se puede deshacer." sx={{
                color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.error.main
                    : theme.palette.error.main
              }} />
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
          <Button onClick={onClose} disabled={loading} variant='contained' color='success'>
            Cancelar
          </Button>
          <ButtonWithLoader
            loading={loading}
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
            variant="contained"
            backgroundButton={theme => theme.palette.error.main}
            sx={{
              width: '100px',
              minHeight: 0,
              color: "white",
              "&:hover": {
                backgroundColor: theme => theme.palette.error.dark,
              },
            }}
          >
            Eliminar
          </ButtonWithLoader>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default DeleteOperationalPlanningTableDialog;
