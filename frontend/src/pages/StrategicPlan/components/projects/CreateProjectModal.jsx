import { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, MenuItem, Select, InputLabel, FormControl, Box, Typography, Tooltip, CircularProgress, Link,
  Avatar
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getAllOperationalProjectsApi } from '../../../../api/operationalProjects.js';
import RenderAvatar from '../../../../generalComponents/RenderAvatar.jsx';
import { useNotification } from '../../../../contexts/ToastContext.jsx';
import { getAllAssignedProjectIds } from '../../utils/strategicPlanningColumnsViewUtils.js';
import { useTheme } from '@emotion/react';

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

const CreateProjectModal = ({ open, onClose, onSave, targets }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  const { notify } = useNotification();
  const [assignedProyectIds, setAssignedProyectIds] = useState([]);
  const theme = useTheme();
  const selectRef = useRef(null);
  const [selectWidth, setSelectWidth] = useState(0);

  useEffect(() => {
    if (open && selectRef.current) {
      setSelectWidth(selectRef.current.offsetWidth);
    }
  }, [open, projects]);

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
              <Link href="/proyectos/crear" underline="hover" color="primary">
                aquí
              </Link>.
            </Typography>
          </Box>
        )}

        {!loading && !errorLoading && projects.length > 0 && (
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-project-label" shrink>Proyecto Operativo</InputLabel>
            <Select
              ref={selectRef}
              label="Proyecto Operativo"
              displayEmpty
              renderValue={(selected) => {
                console.log(selected)
                if (!selected) {
                  return <Typography color="text.disabled">Seleccione un proyecto</Typography>;
                }
                const project = projects.find(p => p.id === Number(selected));
                if (!project) return '';

                return (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      src={project.image_url ? `${API_UPLOADS}${project.image_url}` : undefined}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        objectFit: 'cover',
                        fontWeight: 'bold',
                      }}
                    >
                      {project.name[0]}
                    </Avatar>
                    <Typography variant="body1">{project.name}</Typography>
                  </Box>
                );
              }}
              labelId="select-project-label"
              value={selectedProjectId}
              onChange={(e) => {
                console.log(e.target.value)
                setSelectedProjectId(Number(e.target.value))
              }}
              disabled={loading}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 200,
                    "&::-webkit-scrollbar": { width: "2px" },
                    "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default },
                    "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: 2 },
                    "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                  }
                }
              }}
            >
                {projects.map(project => {
                  const alreadyAssigned = assignedProyectIds.includes(project.id);
                  const hasProgram = !!project.program;

                  const disabled = hasProgram || alreadyAssigned;

                  const infoText = hasProgram
                    ? `Este proyecto ya pertenece a la planificación estratégica: ${project.program.objective?.strategicPlan?.year ?? 'desconocida'}\nPrograma: ${project.program.name}`
                    : alreadyAssigned
                      ? `Este proyecto ya ha sido asignado previamente`
                      : '';

                  const menuItemContent = (
                    <Box display="flex" alignItems="center" width="100%" opacity={disabled ? 0.5 : 1} sx={{
                      width: selectWidth
                    }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          src={project.image_url ? `${API_UPLOADS}${project.image_url}` : undefined}
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            objectFit: "cover",
                            fontWeight: "bold",
                          }}
                        >
                          {project.name[0]}
                        </Avatar>
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
                    <MenuItem value={project.id} disabled>
                      <Box display="flex" alignItems="center" width="100%" opacity={disabled ? 0.5 : 1} sx={{
                        width: selectWidth
                      }}>
                        <Box display="flex" alignItems="center" gap={1}>

                          <Avatar
                            src={project.image_url ? `${API_UPLOADS}${project.image_url}` : undefined}
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: 2,
                              objectFit: "cover",
                              fontWeight: "bold",
                            }}
                          >
                            {project.name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body1">{project.name}</Typography>
                            {disabled && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  padding: '4px',
                                  width: '100%',
                                  borderRadius: 1,
                                  whiteSpace: 'normal',
                                  wordBreak: 'break-word',
                                  display: '-webkit-box',
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  WebkitLineClamp: 2,
                                  backgroundColor:
                                    theme.palette.mode === 'light'
                                      ? 'rgba(200, 200, 200, 0.3)'
                                      : 'rgba(100, 100, 100, 0.3)',
                                  color: theme.palette.text.primary,
                                }}
                              >
                                {infoText}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </MenuItem>
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
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!selectedProjectId || loading} variant="contained">
          Seleccionar Proyecto
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectModal;
