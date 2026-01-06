import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, MenuItem, Select, InputLabel, FormControl, Box, Typography
} from '@mui/material';
import { getAllOperationalProjectsApi } from '../../../../api/operationalProjects.js';
import RenderAvatar from '../../../../generalComponents/RenderAvatar.jsx';
import { useNotification } from '../../../../contexts/ToastContext.jsx';

const EditProjectModal = ({ open, onClose, project, onSave }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();

  useEffect(() => {
    if (open) {
      loadProjects();
      setSelectedProjectId(project?.id || '');
    }
  }, [open, project]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getAllOperationalProjectsApi();
      
      setProjects(data);
    } catch (error) {
      notify('Ocurrió un error inesperado al obtener los proyectos. Inténtalo de nuevo más tarde.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const selectedProject = projects.find(p => p.id === Number(selectedProjectId));
    if (selectedProject) {
      onSave(selectedProject);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedProjectId('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Proyecto Operativo</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel id="edit-select-project-label">Proyecto Operativo</InputLabel>
          <Select
            label="Proyecto Operativo"
            labelId="edit-select-project-label"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={loading}
          >
            {projects.map(project => (
              <MenuItem key={project.id} value={project.id}>
                <Box display="flex" alignItems="center" gap={1}>
                  <RenderAvatar
                    image={project.image}
                    fallbackText={project.name}
                    size={30}
                    type="project"
                  />
                  <Typography variant="body1">{project.name}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">Cancelar</Button>
        <Button onClick={handleSave} disabled={!selectedProjectId} variant="contained">
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProjectModal;
