import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { updateStrategicPlanApi } from '../../api/strategicPlan';
import { useNotification } from '../../contexts';

export const CreateStrategicPlan = () => {
  const { year } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotification();
  
  const [formData, setFormData] = useState({
    mission: '',
    objectives: [{ title: '', indicators: [{ amount: '', concept: '' }] }]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validar datos antes de enviar
      if (!formData.mission.trim()) {
        notify('La misión es requerida', 'error');
        return;
      }

      // Filtrar objetivos vacíos y validar
      const validObjectives = formData.objectives
        .filter(obj => obj.title.trim())
        .map(obj => ({
          objectiveTitle: obj.title,
          indicators: obj.indicators
            .filter(ind => ind.concept.trim() && ind.amount)
            .map(ind => ({
              concept: ind.concept,
              amount: Number(ind.amount)
            }))
        }));

      if (validObjectives.length === 0) {
        notify('Se requiere al menos un objetivo con título', 'error');
        return;
      }

      const payload = {
        mission: formData.mission,
        objectives: validObjectives
      };

      console.log('Creating strategic plan for year:', year);
      console.log('Sending payload:', payload);

      const result = await updateStrategicPlanApi(year, payload);
      
      if (result) {
        notify('Plan estratégico para ' + year + ' creado exitosamente', 'success');
        navigate('/planificacion-estrategica');
      }
    } catch (error) {
      console.error('Error creating strategic plan:', error);
      notify(error.message || 'Error al crear el plan estratégico', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Crear Planificación Estratégica {year}
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Misión</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={formData.mission}
            onChange={(e) => setFormData(prev => ({...prev, mission: e.target.value}))}
            placeholder="Describe la misión de la planificación estratégica"
          />
        </Paper>

        <Typography variant="h6" gutterBottom>Objetivos</Typography>
        {formData.objectives.map((objective, objIndex) => (
          <Paper key={objIndex} sx={{ p: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                label="Título del objetivo"
                value={objective.title}
                onChange={(e) => {
                  const newObjectives = [...formData.objectives];
                  newObjectives[objIndex].title = e.target.value;
                  setFormData(prev => ({...prev, objectives: newObjectives}));
                }}
              />
              {objIndex > 0 && (
                <IconButton 
                  size="small" 
                  onClick={() => {
                    const newObjectives = formData.objectives.filter((_, i) => i !== objIndex);
                    setFormData(prev => ({...prev, objectives: newObjectives}));
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Indicadores</Typography>
            {objective.indicators.map((indicator, indIndex) => (
              <Box key={indIndex} sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Cantidad"
                  size="small"
                  type="number"
                  value={indicator.amount}
                  onChange={(e) => {
                    const newObjectives = [...formData.objectives];
                    newObjectives[objIndex].indicators[indIndex].amount = e.target.value;
                    setFormData(prev => ({...prev, objectives: newObjectives}));
                  }}
                  sx={{ width: 100 }}
                />
                <TextField
                  label="Concepto"
                  size="small"
                  fullWidth
                  value={indicator.concept}
                  onChange={(e) => {
                    const newObjectives = [...formData.objectives];
                    newObjectives[objIndex].indicators[indIndex].concept = e.target.value;
                    setFormData(prev => ({...prev, objectives: newObjectives}));
                  }}
                />
                {indIndex > 0 && (
                  <IconButton 
                    size="small"
                    onClick={() => {
                      const newObjectives = [...formData.objectives];
                      newObjectives[objIndex].indicators = objective.indicators.filter((_, i) => i !== indIndex);
                      setFormData(prev => ({...prev, objectives: newObjectives}));
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button 
              size="small" 
              onClick={() => {
                const newObjectives = [...formData.objectives];
                newObjectives[objIndex].indicators.push({ amount: '', concept: '' });
                setFormData(prev => ({...prev, objectives: newObjectives}));
              }}
              sx={{ mt: 1 }}
            >
              + Agregar indicador
            </Button>
          </Paper>
        ))}

        <Button 
          variant="outlined"
          onClick={() => {
            setFormData(prev => ({
              ...prev,
              objectives: [...prev.objectives, { title: '', indicators: [{ amount: '', concept: '' }] }]
            }));
          }}
          sx={{ mb: 3 }}
        >
          + Agregar objetivo
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/planificacion-estrategica')}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            type="submit"
          >
            Crear Plan Estratégico
          </Button>
        </Box>
      </form>
    </Box>
  );
};
