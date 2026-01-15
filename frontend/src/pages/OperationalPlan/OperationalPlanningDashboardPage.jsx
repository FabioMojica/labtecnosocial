import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Tooltip, IconButton, Divider, TextField } from "@mui/material";
import OperationalPlanningTable from "./OperationalPlannigTable";
import OperationalPlanningReadOnlyTable from "./OperationalPlanningReadOnlyTable";
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import { ErrorScreen, FullScreenProgress, NoResultsScreen } from "../../generalComponents";
import { SelectProjectModal } from "../../generalComponents/SelectProjectModal";
import { deleteOperationalPlanningApi, getAllOperationalProjectsApi } from "../../api";
import { useNotification } from "../../contexts";
import DeleteOperationalPlanningTableDialog from "./components/DeleteOperationalPlanningTableDialog";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { slugify } from "../../utils/slugify";
import { useFetchAndLoad } from "../../hooks";

const OperationalPlanningDashboardPage = () => {
  const location = useLocation();
  const id = location.state?.id;
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const { loading, callEndpoint } = useFetchAndLoad();
  const { notify } = useNotification();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState(false);
  const [planLoadError, setPlanLoadError] = useState(false);
  const navigate = useNavigate();
  const [projectWithoutPlan, setProjectWithoutPlan] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [ loadingProject, setLoadingProject ] = useState(false);

  const [viewMode, setViewMode] = useState('editable')

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
    if (selectedProject) {

      navigate(
        `/planificacion-operativa/${slugify(selectedProject?.name)}`,
        { replace: true },
        {
          state: { id: id }
        }
      );
      setViewMode('editable');

    }
  }, [selectedProject]);

  useEffect(() => {
    if (!id || projects.length === 0) return;

    const projectFromState = projects.find(p => p.id === id);

    if (projectFromState) {
      setSelectedProject(projectFromState);
      setViewMode('editable');
    }
  }, [id, projects]);


  const handleProjectWithoutPlan = (valor) => {
    setProjectWithoutPlan(valor);
  };
  const handleErrorFetchedPlan = (valor) => {
    setPlanLoadError(valor);
  };
  const handleProjectChange = (project) => {
    setSelectedProject(project);
  };
  const handleLoadingProject = (valor) => {
    setLoadingProject(valor);
  };

  const handleDeleteOperationalPlanningTable = async () => {
    if (!selectedProject) return;
    try {
      await deleteOperationalPlanningApi(selectedProject?.id);
      notify('Planificación operativa del proyecto eliminada correctamente.', 'success');
      handleProjectWithoutPlan(true);
    } catch (err) {
      console.log("hola", err)
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

  return (
    <Box>
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
          px: 1,
          pr: 2,
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
            selectedProject={selectedProject}
            onChange={handleProjectChange}
            loading={loading}
            disabled={hasUnsavedChanges}
          />

          {!projectWithoutPlan && !planLoadError && !loading && !loadingProject && (
            <>
              {(selectedProject) && (
                <FormControl
                  sx={{
                    minWidth: { xs: 50, sm: 150 }
                  }}
                  size="small"
                  disabled={!selectedProject || hasUnsavedChanges}
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

              {(viewMode === 'editable' && selectedProject) && (
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
                      disabled={hasUnsavedChanges}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      <DeleteOperationalPlanningTableDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        project={selectedProject}
        onDeletePlan={handleDeleteOperationalPlanningTable}
      />

      {selectedProject && (
        viewMode === 'editable' ? (
          <OperationalPlanningTable
            projectId={selectedProject?.id}
            project={selectedProject}
            onProjectWithoutPlan={handleProjectWithoutPlan}
            projectWithoutPlan={projectWithoutPlan}
            onUnsavedChanges={(hasChanges) => setHasUnsavedChanges(hasChanges)}
            onErrorFetchedPlan={handleErrorFetchedPlan}
            onProjectLoading={handleLoadingProject}
          />
        ) : (
          <OperationalPlanningReadOnlyTable
            projectId={selectedProject?.id}
            project={selectedProject}
            onProjectWithoutPlan={handleProjectWithoutPlan}
            projectWithoutPlan={projectWithoutPlan}
            onUnsavedChanges={(hasChanges) => setHasUnsavedChanges(hasChanges)}
            onErrorFetchedPlan={handleErrorFetchedPlan}
            onProjectLoading={handleLoadingProject}
          />
        ))
      }

      {!selectedProject && (
        <>
          <Divider sx={{ mr: 1, ml: { xs: 1 } }} />
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
