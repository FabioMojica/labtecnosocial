import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box,
  useTheme
} from '@mui/material';
import { useRef, useState, useEffect } from 'react';
import { deleteStrategicPlanApi } from '../../../api/strategicPlan';
import { useNotification } from '../../../contexts';
import { ButtonWithLoader } from '../../../generalComponents/ButtonWithLoader';
import { useFetchAndLoad } from '../../../hooks/useFetchAndLoad.js';

const DeleteStrategicPlanDialog = ({ open, onClose, year, onDeleted }) => {
  const yearDigits = String(year).split('');
  const [inputDigits, setInputDigits] = useState(Array(4).fill(''));
  const inputRefs = useRef([]);
  const { notify } = useNotification();
  const { loading, callEndpoint } = useFetchAndLoad();
  const theme = useTheme();

  useEffect(() => {
    if (open) { 
      setInputDigits(Array(4).fill(''));
      inputRefs.current[0]?.focus();
    }
  }, [open]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newDigits = [...inputDigits];
    newDigits[index] = value;
    setInputDigits(newDigits);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Borra el valor actual siempre que se presione Backspace
    if (e.key === 'Backspace') {
      const newDigits = [...inputDigits];
      newDigits[index] = '';           // borra la caja actual
      setInputDigits(newDigits);

      // Mueve el foco al anterior si está vacía y no es la primera caja
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }

      e.preventDefault(); // evita comportamiento por defecto
    }

    // Flecha izquierda → ir al input anterior
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    }

    // Flecha derecha → ir al input siguiente
    if (e.key === 'ArrowRight' && index < inputDigits.length - 1) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const inputYear = inputDigits.join('');
  const isConfirmed = inputYear === String(year);

  const handleDelete = async () => {
    try {
      await callEndpoint(deleteStrategicPlanApi(year));
      onDeleted();
      onClose();
      notify(`Plan estratégico del año ${year} eliminado correctamente.`, 'success');
    } catch (err) {
      notify(err.message, "error");  
    }
  };

  return (
    <Dialog
      open={open}
      fullWidth
      PaperProps={{
        sx: {
          width: { xs: '90%', sm: '500px' },
          maxWidth: '90%',
        },
      }}
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
          ⚠️ Eliminar Plan Estratégico
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom sx={{ mb: 2 }}>
            Esta acción eliminará <strong style={{
              color:
                theme.palette.mode === 'dark'
                  ? theme.palette.error.main
                  : theme.palette.error.main,
            }}>TODO</strong> el plan estratégico del año <strong>{year}</strong>, y desvinculará todos los proyectos operativos asociados a cada programa. Esta operación es <strong>IRREVERSIBLE</strong>.
          </Typography>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Escriba el año <strong>{year}</strong> como confirmación:
          </Typography>

          <Box display="flex" justifyContent="center" gap={1} mb={2}>
            {yearDigits.map((_, index) => (
              <TextField
                disabled={loading}
                key={index}
                inputRef={(el) => inputRefs.current[index] = el}
                value={inputDigits[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                inputProps={{
                  maxLength: 1,
                  style: { textAlign: 'center', fontSize: '1.5rem' },
                }}
                sx={{
                  width: 50,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    borderColor: 'error.main',
                  },
                }}
                variant="outlined"
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{
          p: 1
        }}>
          <Button
            variant="contained"
            color='success'
            onClick={onClose}
            disabled={loading}
          >
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
              color: "white",
              minHeight: '100%',
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

export default DeleteStrategicPlanDialog;
