import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box
} from '@mui/material';
import { useRef, useState, useEffect } from 'react';
import { deleteStrategicPlanApi } from '../../../api/strategicPlan';
import { useNotification } from '../../../contexts';

const DeleteStrategicPlanDialog = ({ open, onClose, year, onDeleted }) => {
  const yearDigits = String(year).split('');
  const [inputDigits, setInputDigits] = useState(Array(4).fill(''));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const { notify } = useNotification();

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
      setLoading(true);
      await deleteStrategicPlanApi(year);
      onDeleted();
      onClose();
      notify(`Plan estratégico del año ${year} eliminado correctamente.`, 'success');
    } catch (err) {
      notify(`Error eliminando el plan estratégico del año ${year}. Inténtalo de nuevo más tarde.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (

    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      PaperProps={{
        sx: {
          width: { xs: '90%', sm: '500px' }, // 90% en móviles, 500px en desktop
          maxWidth: '90%',                  // nunca exceder pantalla
        },
      }}
    >
      <Box>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
          ⚠️ Eliminar Plan Estratégico
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom sx={{ mb: 2 }}>
            Esta acción eliminará <strong style={{ color: 'error.main' }}>TODO</strong> el plan estratégico del año <strong>{year}</strong>, y desvinculará todos los proyectos operativos asociados a cada programa. Esta operación es <strong>IRREVERSIBLE</strong>.
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
          <Button
            variant="contained"
            color="error"
            disabled={!isConfirmed || loading}
            onClick={handleDelete}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>

  );
};

export default DeleteStrategicPlanDialog;
