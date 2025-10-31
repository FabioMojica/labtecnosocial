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
    if (e.key === 'Backspace' && inputDigits[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
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
      notify(`Error eliminando el plan estratégico del año ${year}. Inténtalo de nuevo más tarde.`, 'error');
    }
  };

  return (

    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      PaperProps={{
        sx: {
          width: { xs: '90%', sm: '500px' },
          maxWidth: '90%',
        },
      }}
    >
      <Box>
        <DialogTitle sx={{ color:
        theme.palette.mode === 'dark'
          ? theme.palette.error.light
          : theme.palette.error.main, fontWeight: 'bold' }}>
          ⚠️ Eliminar Plan Estratégico
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom sx={{ mb: 2 }}>
            Esta acción eliminará <strong style={{ color:
        theme.palette.mode === 'dark'
          ? theme.palette.error.light
          : theme.palette.error.main, }}>TODO</strong> el plan estratégico del año <strong>{year}</strong>, y desvinculará todos los proyectos operativos asociados a cada programa. Esta operación es <strong>IRREVERSIBLE</strong>.
          </Typography>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Escriba el año <strong>{year}</strong> como confirmación:
          </Typography>

          <Box display="flex" justifyContent="center" gap={1} mb={2}>
            {yearDigits.map((_, index) => (
              <TextField
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
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
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
