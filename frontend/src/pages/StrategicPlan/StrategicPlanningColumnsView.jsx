import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Divider, Grid, Typography, useTheme } from '@mui/material';
import MisionColumn from './components/mision/MisionColumn';
import CreateMisionItemModal from './components/mision/CreateMisionItemModal';
import ObjectivesColumn from './components/objetives/ObjectiveColumn';
import CreateObjectiveModal from './components/objetives/CreateObjectiveModal';
import DeleteObjectiveModal from './components/objetives/DeleteObjectiveModal';
import ProgramsColumn from './components/programs/ProgramsColumn';
import CreateProgramModal from './components/programs/CreateProgramModal';
import DeleteProgramModal from './components/programs/DeleteProgramModal';
import ProjectsColumn from './components/projects/ProjectsColumn';
import CreateProjectModal from './components/projects/CreateProjectModal';
import { useConfirm } from 'material-ui-confirm';

import { useNotification } from '../../contexts/ToastContext.jsx';
import { updateStrategicPlanApi } from '../../api/strategicPlan.js';
import { generateTempIdObjective } from './utils/generateTempIdObjective.js';
import { normalizePlanData } from './utils/normalizePlanData.js';

import { useFetchAndLoad } from "../../hooks/useFetchAndLoad.js";
import { ButtonWithLoader } from "../../generalComponents/ButtonWithLoader.jsx";

import isEqual from "lodash.isequal";
import cloneDeep from "lodash/cloneDeep";

import CropSquareIcon from '@mui/icons-material/CropSquare';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useElementSize } from '../../hooks/useElementSize.js';



const StrategicPlanningColumnsView = ({ data, year, onDirtyChange, onPlanSaved }) => {
  const confirm = useConfirm();
  const theme = useTheme();
  const originalDataRef = useRef(cloneDeep(data));
  const [mission, setMission] = useState(data?.mission || '');
  const [selectedItem, setSelectedItem] = useState('mision');
  const [isDirty, setIsDirty] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [objectives, setObjectives] = useState(data?.objectives || []);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState(null);
  const selectedObjective = objectives.find(o => o.id === selectedObjectiveId) || null;

  const [isCreateObjectiveModalOpen, setIsCreateObjectiveModalOpen] = useState(false);
  const [objectiveToDelete, setObjectiveToDelete] = useState(null);

  const [isCreateProgramModalOpen, setIsCreateProgramModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const selectedProgram = selectedObjective?.programs?.find(p => p.id === selectedProgramId) || null;

  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const { loading, callEndpoint } = useFetchAndLoad();

  const { notify } = useNotification();

  const containerRef = useRef(null);

  const [scrollDirection, setScrollDirection] = useState('down');

  const missionRef = useRef(null);
  const objectiveRefs = useRef({});
  const programRefs = useRef({});
  const projectsRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [highlightedItem, setHighlightedItem] = useState(null);

  const headerRef = useRef(null);
  const { height: headerHeight } = useElementSize(headerRef);

  const scrollToRef = (ref) => {
    ref?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  const flashElement = (ref, id) => {
    console.log("holaaaaaaaa", ref)
    if (!ref?.current) return;
    setHighlightedItem(id);
    setTimeout(() => setHighlightedItem(null), 1000);
    scrollToRef(ref.current);
  };

  const goToMission = () => {
    flashElement(missionRef, 'mission');
  };

  const goToSelectedObjective = () => {
    if (!selectedObjectiveId) return;
    flashElement(objectiveRefs.current[selectedObjectiveId], selectedObjectiveId);
  };

  const goToSelectedProgram = () => {
    if (!selectedProgramId) return;
    flashElement(programRefs.current[selectedProgramId], selectedProgramId);
  };

  const goToProjects = () => {
    if (!selectedProgramId) return;
    flashElement(projectsRef, 'projects');
  };

  useEffect(() => {
    if (headerRef.current) {
      const height = headerRef.current.getBoundingClientRect().height;
      console.log('Altura del header:', height);
    }
  }, [isFullscreen, isDirty]);


  useEffect(() => {
    const container = isFullscreen ? containerRef.current : window;

    const handleScroll = () => {
      let scrollTop, scrollHeight, clientHeight;

      if (isFullscreen && container) {
        scrollTop = container.scrollTop;
        clientHeight = container.clientHeight;
        scrollHeight = container.scrollHeight;
      } else {
        scrollTop = window.scrollY;
        clientHeight = window.innerHeight;
        scrollHeight = document.documentElement.scrollHeight;
      }

      // Si estamos al final
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        setScrollDirection('up');
      } else {
        setScrollDirection('down');
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [isFullscreen]);


  const handleScrollAction = () => {
    const container = isFullscreen ? containerRef.current : window;

    if (scrollDirection === 'up') {
      // Scroll al inicio
      if (isFullscreen) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Scroll al final
      if (isFullscreen) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      } else {
        const scrollHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        );
        window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);


  useEffect(() => {
    const currentData = {
      mission,
      objectives
    };

    const hasChanges = !isEqual(currentData, {
      mission: originalDataRef.current?.mission || '',
      objectives: originalDataRef.current?.objectives || []
    });

    setIsDirty(hasChanges);
  }, [mission, objectives]);

  useEffect(() => {
    setMission(data?.mission || '');
    setIsDirty(false);
  }, [data]);

  const handleEditMission = (newText) => {
    setMission(newText);
    setIsDirty(true);
  };

  const handleDeleteMission = () => {
    setMission('');
    setIsDirty(true);
  };

  const handleCreateMission = () => {
    setIsCreateModalOpen(true);
  };

  const handleSelectMission = () => {
    setSelectedItem('mision');
  };

  const handleSaveNewMission = (newText) => {
    setMission(newText);
    setIsDirty(true);
    setSelectedItem('mision');
  };

  const handleSelectObjective = (id) => {
    setSelectedProgramId(null);
    setSelectedObjectiveId(id);
    setSelectedItem('objetivo');
  };

  const handleEditObjective = (id, editedObj) => {
    setObjectives((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, ...editedObj } : obj))
    );
    setIsDirty(true);
  };

  const handleCreateObjective = () => {
    setIsCreateObjectiveModalOpen(true);
  };

  const handleSaveNewObjective = (newObjectiveData) => {
    const newObjective = {
      id: generateTempIdObjective(),
      objectiveTitle: newObjectiveData.objectiveText,
      indicators: newObjectiveData.indicators || [],
      programs: [],
    };
    setObjectives((prev) => [...prev, newObjective]);
    setIsDirty(true);
    setSelectedObjectiveId(newObjective.id);
  };

  const handleDeleteObjective = (id) => {
    const obj = objectives.find((o) => o.id === id);
    if (obj) {
      setObjectiveToDelete(obj);
    }
  };

  const confirmDeleteObjective = (id) => {
    setObjectives((prev) => prev.filter((o) => o.id !== id));
    setIsDirty(true);
    setObjectiveToDelete(null);
    if (selectedObjectiveId === id) {
      setSelectedObjectiveId(null);
      setSelectedProgramId(null);
    }
  };

  const handleSelectProgram = (id) => {
    setSelectedProgramId(id);
    setSelectedItem('programa');
  };

  const handleEditProgram = (editedProgram) => {

    setObjectives((prev) =>
      prev.map((obj) => {
        if (!obj.programs) return obj;
        return {
          ...obj,
          programs: obj.programs.map((prog) =>
            prog.id === editedProgram.id ? { ...prog, ...editedProgram } : prog
          ),
        };
      })
    );
    setIsDirty(true);
  };

  const handleDeleteProgram = (programId) => {
    const program = objectives
      .flatMap((obj) => obj.programs || [])
      .find((p) => p.id === programId);

    if (program) {
      setProgramToDelete(program);
    }
  };

  const confirmDeleteProgram = (programId) => {
    setObjectives((prev) =>
      prev.map((obj) => ({
        ...obj,
        programs: obj.programs.filter((prog) => prog.id !== programId),
      }))
    );
    setIsDirty(true);
    if (selectedProgramId === programId) setSelectedProgramId(null);
    setProgramToDelete(null);
  };

  const handleSaveNewProgram = (programText) => {
    if (!selectedObjectiveId) return;

    const newProgram = {
      id: generateTempIdObjective(),
      programDescription: programText,
    };

    setObjectives((prev) =>
      prev.map((obj) =>
        obj.id === selectedObjectiveId
          ? { ...obj, programs: [...(obj.programs || []), newProgram] }
          : obj
      )
    );
    setIsDirty(true);
    setSelectedProgramId(newProgram.id);
  };

  const handleSaveNewProject = (selectedProject) => {
    if (!selectedProgramId) return;

    setObjectives((prev) =>
      prev.map((obj) => ({
        ...obj,
        programs: obj.programs.map((prog) =>
          prog.id === selectedProgramId
            ? {
              ...prog,
              operationalProjects: [...(prog.operationalProjects || []), selectedProject],
            }
            : prog
        ),
      }))
    );

    setIsDirty(true);
    setIsCreateProjectModalOpen(false);
  };

  const handleSavePlan = async () => {
    try {

      const payload = {
        mission,
        objectives: objectives.map(obj => ({
          id: typeof obj.id === 'number' ? obj.id : undefined,
          objectiveTitle: obj.objectiveTitle || obj.title,
          indicators: (obj.indicators || []).map(ind => ({
            id: typeof ind.id === 'number' ? ind.id : undefined,
            concept: ind.concept,
            amount: ind.amount,
          })),
          programs: (obj.programs || []).map(prog => ({
            id: typeof prog.id === 'number' ? prog.id : undefined,
            programDescription: prog.programDescription || prog.description,
            operationalProjects: (prog.operationalProjects || []).map(proj => ({
              id: typeof proj.id === 'number' ? proj.id : undefined,
              name: proj.name,
              description: proj.description,
              image_url: proj.image_url,
            })),
          })),
        })),
      };

      const updated = await callEndpoint(updateStrategicPlanApi(year, payload));
      if (onPlanSaved) onPlanSaved(normalizePlanData(updated));
      originalDataRef.current = cloneDeep(normalizePlanData(updated));
      setIsDirty(false);

      notify('Plan estratégico guardado correctamente.', 'success');

    } catch (error) {
      console.error('Error guardando plan:', error);
      notify("Ocurrió un error inesperado al guardar el plan estratégico. Inténtalo de nuevo más tarde.", 'error');
    }
  };

  const handleDiscardChanges = () => {
    confirm({
      title: "Descartar cambios",
      description: "¿Deseas descartar todos los cambios no guardados?",
      confirmationText: "Sí, descartar",
      cancellationText: "Cancelar",
    })
      .then((result) => {
        if (result.confirmed === true) {
          console.log("aaaa", originalDataRef.current.mission);
          console.log("eee", originalDataRef.current.objectives);

          setMission(originalDataRef.current.mission || '');
          setObjectives(cloneDeep(originalDataRef.current.objectives || []));
          setIsDirty(false);
          notify("Cambios descartados correctamente.", "info");
        }
      })
      .catch(() => { });
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          width: isFullscreen ? '100vw' : '100%',
          height: isFullscreen ? '100vh' : 'auto',
          bgcolor: (theme) => theme.palette.background.default,
          zIndex: isFullscreen ? 1500 : 'auto',
          overflow: isFullscreen ? 'auto' : 'visible',
          gap: 1
        }}
      >
        <Box
          ref={headerRef}
          sx={{
            position: isFullscreen ? 'relative' : 'sticky',
            top: isFullscreen ? 0 : 64,
            zIndex: isFullscreen ? 1600 : 999,
            bgcolor: 'background.paper',
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            p: 1,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: {
              xs: 'column',
              md: 'row',
            },
            gap: 1
          }}
        >
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: {
              xs: 'column',
              sm: 'row',
              md: 'row',
              lg: 'row'
            },
            gap: 1
          }}>
            <Box sx={{
              display: 'flex',
              gap: 1
            }}>
              <Tooltip
                title={isFullscreen ? "Minimizar" : "Maximizar"}
                open={tooltipOpen}
                onOpen={() => setTooltipOpen(true)}
                onClose={() => setTooltipOpen(false)}
              >
                <IconButton
                  size="small"
                  onClick={() => {
                    setIsFullscreen(!isFullscreen);
                    setTooltipOpen(false); // cerramos el tooltip al hacer click
                  }}
                  sx={{
                    transition: 'transform 0.3s ease',
                    transform: isFullscreen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  {isFullscreen ? <FilterNoneIcon fontSize="small" /> : <CropSquareIcon fontSize="small" />}
                </IconButton>
              </Tooltip>

              <Typography
                variant="h6"
                fontWeight={'bold'}
                textAlign={'center'}
              >
                {`Plan Estratégico ${year}`}
              </Typography>


              <IconButton
                size="small"
                onClick={handleScrollAction}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  opacity: 1,
                  transform: scrollDirection === 'up'
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)',

                  transition: `
        transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
        background-color 0.2s ease
      `,

                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <KeyboardArrowDownIcon />
              </IconButton>
            </Box>



            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Ir a misión">
                <IconButton size="small" onClick={goToMission} disabled={!mission}>
                  🧭
                </IconButton>
              </Tooltip>

              <Tooltip title="Ir al objetivo seleccionado">
                <IconButton
                  size="small"
                  disabled={!selectedObjectiveId}
                  onClick={goToSelectedObjective}
                >
                  🎯
                </IconButton>
              </Tooltip>

              <Tooltip title="Ir al programa seleccionado">
                <IconButton
                  size="small"
                  disabled={!selectedProgramId}
                  onClick={goToSelectedProgram}
                >
                  📦
                </IconButton>
              </Tooltip>

              <Tooltip title="Ver los proyectos">
                <IconButton
                  size="small"
                  disabled={!selectedProgramId}
                  onClick={goToProjects}
                >
                  📑
                </IconButton>
              </Tooltip>
            </Box>
          </Box>


          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            flexDirection: {
              xs: 'row',
            }
          }}>
            {isDirty && (
              <Button
                variant="contained"
                color="error"
                sx={{ width: { xs: '170px', sm: '170px' } }}
                onClick={() => handleDiscardChanges()}
              >
                Descartar cambios
              </Button>
            )}
            <ButtonWithLoader
              loading={loading}
              onClick={handleSavePlan}
              disabled={!isDirty}
              variant="contained"
              sx={{ color: 'white', px: 2, width: { xs: '170px' } }}
            >
              Guardar Plan
            </ButtonWithLoader>
          </Box>
        </Box>


        <Grid
          container
          ref={containerRef}
          spacing={2}
          sx={{
            width: '100%',
            px: 1,
            pb: 1,
            flex: isFullscreen ? 1 : 'unset',
            overflowY: isFullscreen ? 'auto' : 'visible',
          }}
          justifyContent="center"
        >
          <Grid size={{
            xs: 12,
            sm: 6,
            md: 6,
            lg: 3
          }}
          >
            <MisionColumn
              missionRef={missionRef}
              mission={mission}
              onEdit={handleEditMission}
              onDelete={handleDeleteMission}
              onCreate={handleCreateMission}
              isSelected={selectedItem === 'mision'}
              onSelect={handleSelectMission}
              highlightedItem={highlightedItem}
              isFullscreen={isFullscreen}
              headerHeight={headerHeight}
            />
          </Grid>

          <Grid size={{
            xs: 12,
            sm: 6,
            md: 6,
            lg: 3,
          }}

          >
            <ObjectivesColumn
              objectives={objectives}
              selectedObjectiveId={selectedObjectiveId}
              objectiveRefs={objectiveRefs}
              onSelectObjective={handleSelectObjective}
              onEditObjective={handleEditObjective}
              onDeleteObjective={handleDeleteObjective}
              onCreateObjective={handleCreateObjective}
              mission={mission}
              highlightedItem={highlightedItem}
              isFullscreen={isFullscreen}
              headerHeight={headerHeight}
            />
          </Grid>

          <Grid size={{
            xs: 12,
            sm: 6,
            md: 6,
            lg: 3
          }}
          >
            <ProgramsColumn
              objectives={objectives}
              selectedProgramId={selectedProgramId}
              selectedObjectiveId={selectedObjectiveId}
              programRefs={programRefs}
              onSelectProgram={handleSelectProgram}
              handleSelectObjective={handleSelectObjective}
              onEditProgram={handleEditProgram}
              onDeleteProgram={handleDeleteProgram}
              onViewProgram={() => { }}
              onCreateProgram={() => setIsCreateProgramModalOpen(true)}
              selectedObjective={selectedObjective}
              highlightedItem={highlightedItem}
              isFullscreen={isFullscreen}
              headerHeight={headerHeight}
            />
          </Grid>

          <Grid size={{
            xs: 12,
            sm: 6,
            md: 6,
            lg: 3
          }}
          >
            <ProjectsColumn
              projectsRef={projectsRef}
              objectives={objectives}
              selectedProgramId={selectedProgramId}
              onEditProgram={handleEditProgram}
              onUnlinkProject={(programId, projectId) => {
                setObjectives((prev) =>
                  prev.map((obj) => ({
                    ...obj,
                    programs: obj.programs.map((prog) =>
                      prog.id === programId
                        ? {
                          ...prog,
                          operationalProjects: (prog.operationalProjects || []).filter(
                            (proj) => proj.id !== projectId
                          ),
                        }
                        : prog
                    ),
                  }))
                );
                setIsDirty(true);
              }}
              onViewProject={(id) => window.open(`/proyectos/${id}`, '_blank')}
              onAddProject={() => setIsCreateProjectModalOpen(true)}
              selectedProgram={selectedProgram}
              highlightedItem={highlightedItem}
              isFullscreen={isFullscreen}
              headerHeight={headerHeight}
            />
          </Grid>
        </Grid>
      </Box>

      <CreateMisionItemModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNewMission}
      />
      <CreateObjectiveModal
        open={isCreateObjectiveModalOpen}
        onClose={() => setIsCreateObjectiveModalOpen(false)}
        onSave={handleSaveNewObjective}
      />
      <DeleteObjectiveModal
        open={!!objectiveToDelete}
        onClose={() => setObjectiveToDelete(null)}
        objective={objectiveToDelete}
        onDelete={confirmDeleteObjective}
      />
      <CreateProgramModal
        open={isCreateProgramModalOpen}
        onClose={() => setIsCreateProgramModalOpen(false)}
        onSave={handleSaveNewProgram}
      />
      <DeleteProgramModal
        open={!!programToDelete}
        onClose={() => setProgramToDelete(null)}
        program={programToDelete}
        onDelete={() => confirmDeleteProgram(programToDelete?.id)}
      />
      <CreateProjectModal
        open={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onSave={handleSaveNewProject}
        targets={objectives}
      />
    </>
  );
};

export default StrategicPlanningColumnsView;




