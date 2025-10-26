import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, MenuItem, Select, InputLabel, FormControl, Box, Typography, Tooltip, CircularProgress, Link
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getAllOperationalProjectsApi } from '../../../../api/operationalProjects.js';
import RenderAvatar from '../../../../generalComponents/RenderAvatar.jsx';
import { useNotification } from '../../../../contexts/ToastContext.jsx';
import { getAllAssignedProjectIds } from '../../utils/strategicPlanningColumnsViewUtils.js';

const CreateProjectModal = ({ open, onClose, onSave, targets }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(false);  
  const [errorLoading, setErrorLoading] = useState(false);
  const { notify } = useNotification();
  const [assignedProyectIds, setAssignedProyectIds] = useState([]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setErrorLoading(false);
      const data = await getAllOperationalProjectsApi();

      setProjects(data);
    } catch (error) {
      notify('Error al obtener los proyectos operativos. Inténtalo de nuevo más tarde.', 'error');
      setErrorLoading(true);
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
    setSelectedProjectId(null);
    onClose();
  };

  useEffect(() => {
    if (open && targets) {
      const ids = getAllAssignedProjectIds(targets);
      
      setAssignedProyectIds(ids);
      loadProjects();
    } else {
      setProjects([]);
      setSelectedProjectId(null);
      setErrorLoading(false);
      setLoading(false);
      setAssignedProyectIds([]);
    }
  }, [open, targets]);


  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Vincular Proyecto Operativo</DialogTitle>
      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        )}

        {errorLoading && (
          <Typography color="error" align="center" mt={2} mb={3}>
            Ocurrió un problema al listar los proyectos, inténtelo de nuevo más tarde.
          </Typography>
        )}

        {!loading && !errorLoading && projects.length === 0 && (
          <Box textAlign="center" my={3}>
            <Typography>No se encontraron proyectos registrados.</Typography>
            <Typography>
              Por favor, registre uno{' '}
              <Link href="/proyectos/nuevoProyecto" underline="hover" color="primary">
                aquí
              </Link>.
            </Typography>
          </Box>
        )}

        {!loading && !errorLoading && projects.length > 0 && (
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-project-label">Proyecto Operativo</InputLabel>
            <Select
              label="Proyecto Operativo"
              labelId="select-project-label"
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              disabled={loading}
            >
              {projects.map(project => {
                const alreadyAssigned = assignedProyectIds.includes(project.id);
                const hasProgram = !!project.program;

                const disabled = hasProgram || alreadyAssigned;

                const tooltipText = hasProgram
                  ? `Este proyecto ya pertenece al programa: "${project.program.name}", planificación estratégica ${project.program.objective?.strategicPlan?.year ?? 'desconocida'}`
                  : alreadyAssigned
                    ? `Este proyecto ya ha sido asignado previamente`
                    : '';

                const menuItemContent = (
                  <Box display="flex" alignItems="center" width="100%" opacity={disabled ? 0.5 : 1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <RenderAvatar
                        image={project.image}
                        fallbackText={project.name}
                        size={30}
                        type="project"
                      />
                      <Typography variant="body1">{project.name}</Typography>
                    </Box>
                    {disabled && (
                      <Box ml="auto">
                        <InfoOutlinedIcon color="warning" fontSize="small" />
                      </Box>
                    )}
                  </Box>
                );

                return disabled ? (
                  <Tooltip
                    key={project.id}
                    title={tooltipText}
                    placement="right"
                    arrow
                  >
                    <span>
                      <MenuItem value={project.id} disabled>
                        {menuItemContent}
                      </MenuItem>
                    </span>
                  </Tooltip>
                ) : (
                  <MenuItem key={project.id} value={project.id}>
                    {menuItemContent}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={loading}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!selectedProjectId || loading} variant="contained">
          Seleccionar Proyecto
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectModal;
