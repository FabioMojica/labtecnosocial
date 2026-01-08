import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Divider, Grid, Typography } from '@mui/material';
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

 
const StrategicPlanningColumnsView = ({ data, year, onDirtyChange, onPlanSaved }) => {
  const confirm = useConfirm();
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

  const { loading, callEndpoint } = useFetchAndLoad();

  const { notify } = useNotification();

  const containerRef = useRef(null);

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
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (selectedObjectiveId === id) setSelectedObjectiveId(null);
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
          console.log("aaaa",originalDataRef.current.mission);
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
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', width: '100%', height: '100%', p: 2, gap: 2 }}>
        <Typography
          variant="caption"
          fontWeight={'bold'}
          fontSize={{
            xs: '1rem'
          }}
          textAlign={'center'}
        >
          {`Plan Estratégico ${year}`}
        </Typography>

        <Divider sx={{
          width: '100%',
          display: { xs: 'block', sm: 'none' },
        }} />

        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: { xs: 'center', sm: 'flex-end' }, alignItems: 'center', gap: 1 }}>
          {isDirty && (
            <Button
              variant="outlined"
              color="error"
              sx={{ width: { xs: '100%', sm: '170px' }, height: '100%' }}
              // onClick={() => {
              //   setMission(originalDataRef.current.mission || '');
              //   setObjectives(cloneDeep(originalDataRef.current.objectives || []));
              //   setIsDirty(false);
              // }}
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
            sx={{ color: 'white', px: 2, width: { xs: '100%', sm: '170px' } }}
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
          p: 0,
          width: '100%',
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
            mission={mission}
            onEdit={handleEditMission}
            onDelete={handleDeleteMission}
            onCreate={handleCreateMission}
            isSelected={selectedItem === 'mision'}
            onSelect={handleSelectMission}
          />
        </Grid>

        <Grid size={{
          xs: 12,
          sm: 6,
          md: 6,
          lg: 3
        }}
        >
          <ObjectivesColumn
            objectives={objectives}
            selectedObjectiveId={selectedObjectiveId}
            onSelectObjective={handleSelectObjective}
            onEditObjective={handleEditObjective}
            onDeleteObjective={handleDeleteObjective}
            onCreateObjective={handleCreateObjective}
            mission={mission}
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
            onSelectProgram={handleSelectProgram}
            handleSelectObjective={handleSelectObjective}
            onEditProgram={handleEditProgram}
            onDeleteProgram={handleDeleteProgram}
            onViewProgram={() => { }}
            onCreateProgram={() => setIsCreateProgramModalOpen(true)}
            selectedObjective={selectedObjective}
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
          />
        </Grid>
      </Grid>

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




