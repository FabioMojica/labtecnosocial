import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Tooltip, IconButton } from "@mui/material";
import OperationalPlanningTable from "./OperationalPlannigTable";
import OperationalPlanningReadOnlyTable from "./OperationalPlanningReadOnlyTable";
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import { ErrorScreen, FullScreenProgress, NoResultsScreen } from "../../generalComponents";
import { SelectProjectModal } from "./components/SelectProjectModal";
import { deleteOperationalPlanningApi, getAllOperationalProjectsApi } from "../../api";
import { useFetchAndLoad } from "../../hooks";
import { useNotification } from "../../contexts";
import DeleteOperationalPlanningTableDialog from "./components/DeleteOperationalPlanningTableDialog";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const VIEW_MODE_KEY = "operationalPlanningViewMode";

const OperationalPlanningDashboardPage = () => {
  const { id } = useParams();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    const parsed = Number(id);
    return !isNaN(parsed) ? parsed : "";
  });
  const { loading, callEndpoint } = useFetchAndLoad();
  const { notify } = useNotification();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  const [hasPlan, setHasPlan] = useState(true);

  useEffect(() => {
    if (selectedProjectId) {
      setHasPlan(true);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const res = await callEndpoint(getAllOperationalProjectsApi());

      setProjects(res);
      setError(false);
    } catch (error) {
      setError(true);
      notify('Error al cargar lista de proyectos. Inténtalo de nuevo más tarde.', 'error');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      navigate(`/planificacion/operativa/${selectedProjectId}`, { replace: true });
    } else {
      navigate(`/planificacion/operativa`, { replace: true });
    }
  }, [selectedProjectId, navigate]);



  useEffect(() => {
    if (id) {
      const parsedId = Number(id);
      if (!isNaN(parsedId) && parsedId !== selectedProjectId) {
        setSelectedProjectId(parsedId);
      }
    }
  }, [id]);

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem(VIEW_MODE_KEY) || "editable";
  });


  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  const handleProjectWithoutPlan = () => {
    setHasPlan(false);
  };

  const handleProjectChange = (newId) => {
    setSelectedProjectId(Number(newId));
  };

  const handleDeleteOperationalPlanningTable = async () => {
    if (!selectedProjectId) return;
    try {
      await deleteOperationalPlanningApi(selectedProjectId);
      notify('Planificación operativa del proyecto eliminada correctamente.', 'success');
      setHasPlan(false);
    } catch (err) {
      notify('Error al eliminar la planificación operativa del proyecto. Inténtalo de nuevo más tarde.', 'error');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return <FullScreenProgress text={"Obteniendo los proyectos"} />
  }

  if (error) {
    return <ErrorScreen message="Ocurrió un error al obtener los proyectos" buttonText="Intentar de nuevo" onButtonClick={() => fetchProjects()} />
  }

  const selectedProject = projects.find(p => p.id === Number(selectedProjectId));

  return (
    <Box maxWidth sx={{ padding: 1 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            sm: 'row',
            xs: 'column'
          },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          width: '100%',
          mb: 1,
        }}
      >
        <Typography variant="h4" sx={{
          fontSize: {
            xs: '1.5rem',
            sm: '2rem'
          }
        }}>Planificación Operativa</Typography>

        <Box sx={{
          display: 'flex',
          flexDirection: {
            xs: 'row',
            sm: 'row'
          },
          alignItems: 'center',
          gap: {xs: 0.5, sm: 2}
        }}>
          <SelectProjectModal
            projects={projects}
            selectedProjectId={selectedProjectId}
            onChange={handleProjectChange}
            loading={loading}
          />

          {selectedProjectId && hasPlan && (
            <FormControl
              sx={{
                minWidth: { xs: 100, sm: 150 },
              }}
              size="small"
              disabled={!selectedProjectId || isEditing}
            >
              <InputLabel id="view-mode-label">Modo de vista</InputLabel>
              <Select
                labelId="view-mode-label"
                value={viewMode}
                label="Modo de vista"
                onChange={(e) => setViewMode(e.target.value)}
                sx={{
                  '& .MuiSelect-select': {
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  },
                }}
              >
                <MenuItem value="editable">Editable</MenuItem>
                <MenuItem value="readonly">Solo lectura</MenuItem>
              </Select>
            </FormControl>

          )}

          {selectedProjectId && hasPlan && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Tooltip title="Eliminar plan operativo">
                <IconButton
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{ ml: 1 }}
                  disabled={isEditing}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>

      <DeleteOperationalPlanningTableDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        project={projects.find(p => p.id === Number(selectedProjectId))}
        onDeletePlan={handleDeleteOperationalPlanningTable}
      />

      {
        viewMode === 'editable' ? (
          <OperationalPlanningTable
            projectId={selectedProjectId}
            onProjectIdChange={setSelectedProjectId}
            onProjectWithoutPlan={handleProjectWithoutPlan}
            onEditingChange={setIsEditing}
          />
        ) : (
          <OperationalPlanningReadOnlyTable
            projectId={selectedProjectId}
            onProjectIdChange={setSelectedProjectId}
            project={selectedProject}
          />
        )
      }

      {!selectedProjectId && (
        <NoResultsScreen
          message="Seleccione un proyecto para visualizar la planificación operativa"
          icon={<TouchAppRoundedIcon sx={{ fontSize: 90, color: 'text.secondary' }} />}
          sx={{
            height: '60vh',
            justifyContent: 'center',
          }}
        />
      )}
    </Box>
  );
};

export default OperationalPlanningDashboardPage;
