import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Tooltip, Typography, useTheme } from '@mui/material';
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

import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';

import { useNotification } from '../../contexts/ToastContext.jsx';
import { updateStrategicPlanApi } from '../../api/strategicPlan.js';
import { generateTempIdObjective } from './utils/generateTempIdObjective.js';
import { normalizePlanData } from './utils/normalizePlanData.js';

import { useFetchAndLoad } from "../../hooks/useFetchAndLoad.js";
import { ButtonWithLoader } from "../../generalComponents/ButtonWithLoader.jsx";

import isEqual from "lodash.isequal";
import cloneDeep from "lodash/cloneDeep";

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import IconButton from '@mui/material/IconButton';
import { useElementSize } from '../../hooks/useElementSize.js';
import { useDirty } from '../../contexts/DirtyContext.jsx';
import { formatDate } from '../../utils/formatDate.js';

const StrategicPlanningColumnsView = ({ data, year, onDirtyChange, onPlanSaved }) => {
  const confirm = useConfirm();
  const theme = useTheme();
  const [planVersion, setPlanVersion] = useState(data?.plan_version || 0);
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

  const [canScroll, setCanScroll] = useState(false);

  const { setIsDirtyContext, registerAutoSave } = useDirty();

  const currentPlanRef = useRef({
    mission: data?.mission || '',
    objectives: data?.objectives || [],
  });

  useEffect(() => {
    currentPlanRef.current = { mission, objectives };
  }, [mission, objectives]);


  const getScrollableParent = (element) => {
    let parent = element?.parentElement;

    while (parent) {
      const style = window.getComputedStyle(parent);
      const overflowY = style.overflowY;
      const isScrollable = /(auto|scroll|overlay)/.test(overflowY);

      if (isScrollable && parent.scrollHeight > parent.clientHeight) {
        return parent;
      }

      parent = parent.parentElement;
    }

    return document.scrollingElement || document.documentElement;
  };

  const getClosestStickyHeader = (element) => {
    let node = element?.parentElement;

    while (node) {
      const previousSibling = node.previousElementSibling;
      if (previousSibling) {
        const siblingStyle = window.getComputedStyle(previousSibling);
        if (siblingStyle.position === 'sticky') {
          return previousSibling;
        }
      }
      node = node.parentElement;
    }

    return null;
  };

  const getTopOverlayOffset = (element, containerRect, isWindowScrollContainer) => {
    let maxBottomOffset = 0;
    const stickyElements = [];

    if (headerRef.current) stickyElements.push(headerRef.current);

    const columnStickyHeader = getClosestStickyHeader(element);
    if (columnStickyHeader) stickyElements.push(columnStickyHeader);

    stickyElements.forEach((stickyEl) => {
      const style = window.getComputedStyle(stickyEl);
      if (style.position !== 'sticky' && style.position !== 'fixed') return;

      const rect = stickyEl.getBoundingClientRect();
      const parsedTop = Number.parseFloat(style.top);
      const hasExplicitTop = Number.isFinite(parsedTop);

      const topInViewport = hasExplicitTop
        ? (isWindowScrollContainer ? parsedTop : containerRect.top + parsedTop)
        : rect.top;

      const bottomOffsetInContainer = topInViewport + rect.height - containerRect.top;
      maxBottomOffset = Math.max(maxBottomOffset, bottomOffsetInContainer);
    });

    return Math.max(0, maxBottomOffset + 12);
  };

  const scrollToRef = (target) => {
    const element = target instanceof HTMLElement ? target : target?.current;
    if (!element) return;

    const fullscreenContainer = containerRef.current;
    const preferredContainer =
      isFullscreen &&
        fullscreenContainer &&
        fullscreenContainer.scrollHeight > fullscreenContainer.clientHeight
        ? fullscreenContainer
        : null;

    const container = preferredContainer || getScrollableParent(element);

    const isWindowScrollContainer =
      container === window ||
      container === document.body ||
      container === document.documentElement ||
      container === document.scrollingElement;

    const containerRect = isWindowScrollContainer
      ? { top: 0, height: window.innerHeight }
      : container.getBoundingClientRect();

    const currentScrollTop = isWindowScrollContainer
      ? window.scrollY
      : container.scrollTop;

    const elementRect = element.getBoundingClientRect();
    const elementTopInContainer =
      elementRect.top - containerRect.top + currentScrollTop;

    const topOverlayOffset = getTopOverlayOffset(
      element,
      containerRect,
      isWindowScrollContainer
    );

    const visibleHeight = Math.max(120, containerRect.height - topOverlayOffset);
    const desiredTopInContainer =
      topOverlayOffset +
      Math.max((visibleHeight - elementRect.height) / 2, 16);

    const targetTop = elementTopInContainer - desiredTopInContainer;

    const maxScroll = isWindowScrollContainer
      ? Math.max(
        0,
        (document.scrollingElement?.scrollHeight ||
          document.documentElement.scrollHeight) - window.innerHeight
      )
      : Math.max(0, container.scrollHeight - container.clientHeight);

    const clampedTop = Math.max(0, Math.min(targetTop, maxScroll));

    if (isWindowScrollContainer) {
      window.scrollTo({ top: clampedTop, behavior: 'smooth' });
      return;
    }

    container.scrollTo({ top: clampedTop, behavior: 'smooth' });
  };

  const flashElement = (ref, id) => {
    const element = ref instanceof HTMLElement ? ref : ref?.current;
    if (!element) return;
    setHighlightedItem(id);
    setTimeout(() => setHighlightedItem(null), 1000);
    scrollToRef(element);
  };

  const goToMission = () => {
    flashElement(missionRef, 'mission');
  };

  const goToSelectedObjective = () => {
    if (!selectedObjectiveId) return;
    flashElement(
      objectiveRefs.current[selectedObjectiveId],
      `objective-${selectedObjectiveId}`
    );
  };

  const goToSelectedProgram = () => {
    if (!selectedProgramId) return;
    flashElement(
      programRefs.current[selectedProgramId],
      `program-${selectedProgramId}`
    );
  };

  const goToProjects = () => {
    if (!selectedProgramId) return;
    flashElement(projectsRef, 'projects');
  };

  useEffect(() => {
    if (headerRef.current) {
      const height = headerRef.current.getBoundingClientRect().height;
    }
  }, [isFullscreen, isDirty]);

  const checkScrollPosition = () => {
    const container = isFullscreen ? containerRef.current : document.documentElement;

    if (!container) return;

    const scrollTop = isFullscreen ? container.scrollTop : window.scrollY;
    const clientHeight = isFullscreen ? container.clientHeight : window.innerHeight;
    const scrollHeight = isFullscreen
      ? container.scrollHeight
      : document.documentElement.scrollHeight;

    // Determinamos si hay scroll
    if (scrollHeight <= clientHeight + 2) {
      setCanScroll(false); // No se puede scrollear
      setScrollDirection('down'); // default
      return;
    } else {
      setCanScroll(true);
    }

    // Si estamos al fondo → flecha arriba
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setScrollDirection('up');
    } else {
      setScrollDirection('down');
    }
  }

  useEffect(() => {
    const container = isFullscreen ? containerRef.current : window;
    if (!container) return;

    container.addEventListener('scroll', checkScrollPosition);

    // 👇 chequeo inicial
    checkScrollPosition();

    return () => container.removeEventListener('scroll', checkScrollPosition);
  }, [isFullscreen]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      checkScrollPosition();
    });

    observer.observe(container);

    return () => observer.disconnect();
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
    setIsDirtyContext(true);
  };

  const handleDeleteMission = () => {
    setMission('');
    setIsDirty(true);
    setIsDirtyContext(true);
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
    setIsDirtyContext(true);
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
    setIsDirtyContext(true);
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
    setIsDirtyContext(true);
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
    setIsDirtyContext(true);
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
    setIsDirtyContext(true);
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
    setIsDirtyContext(true);
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
    setIsDirtyContext(true);
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
    setIsDirtyContext(true);
    setIsCreateProjectModalOpen(false);
  };

  const handleSavePlan = async (autoSave = false) => {
    try {
      const { mission, objectives } = currentPlanRef.current;

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
        plan_version: planVersion,
      };

      const updated = await callEndpoint(updateStrategicPlanApi(year, payload));

      if (updated) {
        setPlanVersion(updated.plan_version);
        originalDataRef.current = cloneDeep(normalizePlanData(updated));
        setIsDirty(false);
        setIsDirtyContext(false);
        if (onPlanSaved) onPlanSaved(normalizePlanData(updated));
        if (!autoSave) notify('Plan estratégico guardado correctamente.', 'success');
      }
    } catch (error) {
      if (!autoSave) notify(error.message, "error")
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
          setMission(originalDataRef.current.mission || '');
          setObjectives(cloneDeep(originalDataRef.current.objectives || []));
          setIsDirty(false);
          setIsDirtyContext(false);
          notify("Cambios descartados correctamente.", "info");
        }
      })
      .catch(() => { });
  };

  useEffect(() => {
    registerAutoSave(async () => {
      await handleSavePlan(true);
    });
  }, []);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'center',
          boxSizing: 'border-box',
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          right: isFullscreen ? 0 : 'auto',
          width: isFullscreen ? '100vw' : '100%',
          maxWidth: isFullscreen ? '100vw' : '100%',
          height: isFullscreen ? '100vh' : 'auto',
          bgcolor: (theme) => theme.palette.background.default,
          zIndex: isFullscreen ? 1500 : 'auto',
          overflow: isFullscreen ? 'auto' : 'visible',
        }}
      >
        <Box
          ref={headerRef}
          sx={{
            boxSizing: 'border-box',
            position: isFullscreen ? 'relative' : 'sticky',
            top: isFullscreen ? 0 : 64,
            zIndex: isFullscreen ? 1600 : 999,
            bgcolor: 'background.paper',
            borderTopLeftRadius: 5,
            borderTopRightRadius: 5,
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
              gap: 1,
              justifyContent: {
                xs: 'space-between',
                sm: 'left'
              },
              width: '100%',
              alignItems: 'center'
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
                    setTooltipOpen(false);
                  }}
                  sx={{
                    transition: 'transform 0.3s ease',
                    transform: isFullscreen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  {isFullscreen ? <CloseFullscreenIcon fontSize="small" /> : <FullscreenIcon fontSize="medium" />}
                </IconButton>
              </Tooltip>

              <Typography
                variant="h6"
                fontWeight={'bold'}
                textAlign={'center'}
                sx={{
                  fontSize: {
                    xs: '1rem',
                    sm: '1.3rem'
                  }
                }}
              >
                {`Plan Estratégico ${year}`}
              </Typography>

              <Tooltip title={scrollDirection === 'up' ? 'Ir arriba' : 'Ir abajo'}>
                <span>
                  <IconButton
                    size="small"
                    onClick={handleScrollAction}
                    disabled={!canScroll}
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
                </span>
              </Tooltip>
            </Box>



            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Ir a misión">
                <span>
                  <IconButton size="small" onClick={goToMission} disabled={!mission}>
                    🧭
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Ir al objetivo seleccionado">
                <span>
                  <IconButton
                    size="small"
                    disabled={!selectedObjectiveId}
                    onClick={goToSelectedObjective}
                  >
                    🎯
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Ir al programa seleccionado">
                <span>
                  <IconButton
                    size="small"
                    disabled={!selectedProgramId}
                    onClick={goToSelectedProgram}
                  >
                    📦
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Ver los proyectos">
                <span>
                  <IconButton
                    size="small"
                    disabled={!selectedProgramId}
                    onClick={goToProjects}
                  >
                    📑
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>


          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            height: '48px',
          }}>
            {isDirty && (
              <Button
                variant="contained"
                color="error"
                sx={{ width: '170px', height: '100%' }}
                onClick={() => handleDiscardChanges()}
                disabled={loading}
              >
                Descartar cambios
              </Button>
            )}
            <ButtonWithLoader
              loading={loading}
              onClick={() => handleSavePlan(false)}
              disabled={!isDirty}
              variant="contained"
              backgroundButton={theme => theme.palette.success.main}
              sx={{ color: 'white', px: 2, width: '170px' }}
            >
              Guardar Plan
            </ButtonWithLoader>
          </Box>
        </Box>


        <Box
          ref={containerRef}
          sx={{
            boxSizing: 'border-box',
            px: 1,
            flex: isFullscreen ? 1 : 'unset',
            overflowY: isFullscreen ? 'auto' : 'visible',
            width: '100%',
            pb: 2,
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            alignItems: 'start',
            "&::-webkit-scrollbar": { height: "2px", width: "2px" },
            "&::-webkit-scrollbar-track": {
              backgroundColor: theme.palette.background.default,
              borderRadius: "2px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.primary.main,
              borderRadius: "2px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
            border: '1px solid',
            borderColor: 'divider',
            borderBottomLeftRadius: (data?.created_at && data?.updated_at) ? 0 : 5,
            borderBottomRightRadius: (data?.created_at && data?.updated_at) ? 0 : 5,
          }}
        >
          <Box sx={{ mt: 1, minWidth: 0 }}>
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
          </Box>

          <Box sx={{ mt: 1, minWidth: 0 }}>
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
          </Box>

          <Box sx={{ mt: 1, minWidth: 0 }}>
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
          </Box>

          <Box sx={{ mt: 1, minWidth: 0 }}>
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
                setIsDirtyContext(true);
              }}
              onViewProject={(id) => window.open(`/proyectos/${id}`, '_blank')}
              onAddProject={() => setIsCreateProjectModalOpen(true)}
              selectedProgram={selectedProgram}
              highlightedItem={highlightedItem}
              isFullscreen={isFullscreen}
              headerHeight={headerHeight}
            />
          </Box>
        </Box>
      </Box>
      {data?.mission !== '' && (
        <Box sx={{
          bgcolor: 'background.paper',
          width: '100%',
          borderBottomRightRadius: 6,
          borderBottomLeftRadius: 6,
          p: 1,
          mb: 2,
          display: 'flex',
          flexDirection: {
            xs: 'column',
            lg: 'row'
          },
          justifyContent: 'space-between',
        }}>
          {data?.created_at && data?.updated_at && (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography fontWeight="bold" variant='caption'>
                Fecha de creación:{" "}
                <Typography
                  component="span"
                  variant="body1"
                  color="textSecondary"
                  sx={{
                    fontStyle: 'italic',
                    fontSize: '0.9rem',
                  }}
                >
                  {formatDate(data?.created_at)}
                </Typography>
              </Typography>
              <Typography fontWeight="bold" variant='caption'>
                Fecha de actualización:{" "}
                <Typography
                  component="span"
                  variant="body1"
                  color="textSecondary"
                  sx={{
                    fontStyle: 'italic',
                    fontSize: '0.9rem',
                  }}
                >
                  {formatDate(data?.updated_at)}
                </Typography>
              </Typography>
            </Box>
          )}

          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'row', lg: 'column' },
            gap: { xs: 1, lg: 0 },
            alignItems: 'center'
          }}>
            <Typography fontWeight="bold" variant='caption'>
              Versión del plan:{" "}
            </Typography>
            <Typography
              component="span"
              variant="body1"
              color="textSecondary"
              sx={{
                fontStyle: 'italic',
                fontSize: '0.9rem',
              }}
            >
              {planVersion}
            </Typography>
          </Box>
        </Box>
      )}

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




