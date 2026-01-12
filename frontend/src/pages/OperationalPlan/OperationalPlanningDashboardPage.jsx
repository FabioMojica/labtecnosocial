import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Tooltip, IconButton, Divider, TextField } from "@mui/material";
import OperationalPlanningTable from "./OperationalPlannigTable";
import OperationalPlanningReadOnlyTable from "./OperationalPlanningReadOnlyTable";
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import { ErrorScreen, FullScreenProgress, NoResultsScreen } from "../../generalComponents";
import { SelectProjectModal } from "../../generalComponents/SelectProjectModal";
import { deleteOperationalPlanningApi, getAllOperationalProjectsApi } from "../../api";
import { useAuthEffects, useFetchAndLoad } from "../../hooks";
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
  const [planLoadError, setPlanLoadError] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);


  const handlePlanLoadError = (hasError) => {
    setPlanLoadError(hasError);
  };


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
      notify("Ocurrió un error inesperado al eliminar la planificación operativa del proyecto. Inténtalo de nuevo más tarde.", 'error');
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
    <Box sx={{ pt: { xs: 2 } }}>
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
          px: 1
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ 
            fontSize: {
              xs: '1.5rem', 
              sm: '2rem'
            },
            width: { xs: '100%', sm: 'auto' },
            textAlign: 'center',
          }}
        >Planificación Operativa</Typography>

        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
          justifyContent: 'flex-end',
        }}>
          <SelectProjectModal 
            projects={projects} 
            selectedProjectId={selectedProjectId}
            onChange={handleProjectChange}
            loading={loading}
            disabled={isEditing}
          />

          {(selectedProjectId && !planLoadError) && (
            <FormControl
              sx={{
                minWidth: { xs: 50, sm: 150 }
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

          {(selectedProjectId && hasPlan && !planLoadError && !loadingRows) && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Tooltip title="Eliminar el plan operativo">

                <IconButton
                  onClick={() => setDeleteDialogOpen(true)}
                  color="error"
                  sx={{
                    boxShadow: 3,
                    width: 40,
                    height: 40,
                    ml: 1,
                  }}
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

      {selectedProjectId && (
        viewMode === 'editable' ? (
          <OperationalPlanningTable
            projectId={selectedProjectId}
            project={selectedProject}
            onProjectIdChange={setSelectedProjectId}
            onProjectWithoutPlan={handleProjectWithoutPlan}
            onProjectHasPlan={() => setHasPlan(true)}
            onEditingChange={setIsEditing}
            hasPlan={hasPlan}
            onLoadError={handlePlanLoadError}
          />
        ) : (
          <OperationalPlanningReadOnlyTable
            projectId={selectedProjectId}
            onProjectIdChange={setSelectedProjectId}
            project={selectedProject}
            onProjectWithoutPlan={handleProjectWithoutPlan}
            hasPlan={hasPlan}
            onLoadError={handlePlanLoadError}
            onLoadingRowsChange={setLoadingRows}
          />
        ))
      } 

      {!selectedProjectId && (
        <>
      <Divider />
        <NoResultsScreen
          message="Seleccione un proyecto para visualizar la planificación operativa"
          icon={<TouchAppRoundedIcon sx={{ fontSize: 90, color: 'text.secondary' }} />}
          sx={{
            height: '60vh',
            justifyContent: 'center',
            p: 1
          }}
        />
      </>
      )}
    </Box>
  );
};

export default OperationalPlanningDashboardPage;
