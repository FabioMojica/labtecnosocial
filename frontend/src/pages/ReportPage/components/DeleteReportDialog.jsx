import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, List, ListItem, ListItemText, Box,
  useTheme
} from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { ButtonWithLoader } from '../../../generalComponents';
import { useFetchAndLoad } from '../../../hooks';

const DeleteReportDialog = ({ open, onClose, report, onDeleteReport }) => {
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

  const isConfirmed = inputName === report?.title;

  const handleDelete = async () => {
    try {
      await callEndpoint(onDeleteReport());
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
          ⚠️ Eliminar Reporte
        </DialogTitle>

        <DialogContent>
          <Typography gutterBottom>
            Esta acción eliminará el reporte {' '}
            <Box
              component="span"
              sx={{
                fontWeight: 'bold', color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.error.main
                    : theme.palette.error.main,
              }}
            >
              {report?.title}{' '}
            </Box>
            permanentemente del sistema
          </Typography>

          <Typography variant="subtitle2" fontWeight={'bold'} sx={{ mb: 1 }}>
            Escribe el título exacto del reporte para confirmar:
          </Typography>
          <TextField
            disabled={loading}
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

export default DeleteReportDialog;
