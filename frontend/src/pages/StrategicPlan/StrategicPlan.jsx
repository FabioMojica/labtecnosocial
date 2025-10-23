import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Select,
  MenuItem,
  Button,
  IconButton,
  Paper,
  Modal,
  TextField,
  Avatar,
  Tooltip,
} from '@mui/material';
import { updateStrategicPlanApi, getStrategicPlanByYearApi } from '../../api/strategicPlan';
import { getAllOperationalProjectsApi, assignProjectToProgram as assignProjectToProgramApi } from '../../api/operationalProjects';
import { useNotification } from '../../contexts';
import { FullScreenProgress, NoResultsScreen } from '../../generalComponents';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import PageHeader from './components/PageHeader';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  maxHeight: { xs: '90vh', sm: '80vh' },
  overflowY: 'auto',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: { xs: 2, sm: 4 },
  // Estilos de scrollbar
  '&::-webkit-scrollbar': {
    width: '2px',
    height: '2px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(128, 128, 128, 0.7)',
    borderRadius: '2px',
  },
  '&::-webkit-scrollbar-corner': {
    background: 'transparent',
  },
  // Firefox
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(128, 128, 128, 0.7) transparent',
  // IE
  '-ms-overflow-style': 'thin',
}; import DocumentView from './components/DocumentView';

import { useAuth } from "../../contexts";
import DeleteStrategicPlanModal from './components/DeleteStrategicPlanModal';
import { useFetchAndLoad } from '../../hooks';

export const StrategicPlan = () => {
  const { user } = useAuth();
  const { loading, callEndpoint } = useFetchAndLoad();
  // En StrategicPlan.jsx
  const { year } = useParams();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(() => {
    return year ? parseInt(year) : currentYear;
  });

  // Cada vez que el estado cambia, actualizar la URL si es diferente
  useEffect(() => {
    if (selectedYear && parseInt(year) !== selectedYear) {
      navigate(`/planificacion-estrategica/${selectedYear}`, { replace: true });
    }
  }, [selectedYear, year, navigate]);

  // Cada vez que la URL cambia, actualizar el estado
  useEffect(() => {
    if (year && parseInt(year) !== selectedYear) {
      setSelectedYear(parseInt(year));
    }
  }, [year]);


  const [view, setView] = useState(user?.role === 'coordinator' ? 'document' : 'editable');
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState({
    mission: '',
    objectives: []
  });

  const [showEmptyColumns, setShowEmptyColumns] = useState(false);

  //funcion de busqueda
  const checkForChanges = (currentMission, currentObjectives) => {
    //mision
    const missionMatches = currentMission === originalData.mission;

    //objetivos
    const objectivesMatch = currentObjectives.length === originalData.objectives.length &&
      currentObjectives.every(currObj => {
        const originalObj = originalData.objectives.find(
          orig => orig.objectiveTitle === currObj.title
        );

        if (!originalObj) return false;

        //indicadores
        const indicatorsMatch = currObj.indicators.length === originalObj.indicators.length &&
          currObj.indicators.every(currInd => {
            return originalObj.indicators.some(
              origInd =>
                origInd.concept === currInd.concept &&
                Number(origInd.amount) === Number(currInd.quantity)
            );
          });

        return indicatorsMatch;
      });

    return missionMatches && objectivesMatch;
  };
  const { notify } = useNotification();

  //coorinador a docu
  useEffect(() => {
    if (user?.role === 'coordinador') {
      setView('document');
    }
  }, [user]);

  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteItemModal, setOpenDeleteItemModal] = useState(false);
  const [openDeletePlanModal, setOpenDeletePlanModal] = useState(false);
  const [openCreatePlanModal, setOpenCreatePlanModal] = useState(false);
  const [currentColumn, setCurrentColumn] = useState(null);
  const [editedItem, setEditedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [newObjective, setNewObjective] = useState({
    title: '',
    indicators: []
  });
  const [newPlanData, setNewPlanData] = useState({
    mission: '',
    objectives: [{ title: '', indicators: [{ amount: '', concept: '' }] }]
  });
  const [inputYear, setInputYear] = useState('');


  const [missionItems, setMissionItems] = useState([]);
  const [pendingMission, setPendingMission] = useState('');
  const [showMissionPreview, setShowMissionPreview] = useState(false);
  const [objectiveItems, setObjectiveItems] = useState([]);
  const [pendingObjectives, setPendingObjectives] = useState([]);
  const [programItems, setProgramItems] = useState([]);
  const [projectItems, setProjectItems] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [openProjectSelectionModal, setOpenProjectSelectionModal] = useState(false);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    const programs = [];
    const projectsFromPlan = [];
    objectiveItems.forEach(obj => {
      (obj.programs || []).forEach(p => {
        programs.push({ id: p.id, text: p.description || p.programDescription || '' });
        (p.operationalProjects || []).forEach(proj => {
          projectsFromPlan.push({ id: proj.id, title: proj.name || proj.title, description: proj.description || '' });
        });
      });
    });

    // Obtener todos los proyectos operativos (de la API)
    // projectItems ya contiene los proyectos de la API por fetchProjects
    // Unir ambos arrays y eliminar duplicados por id
    setProgramItems(programs);
    setProjectItems(prev => {
      const all = [...projectsFromPlan, ...prev];
      const unique = [];
      const seen = new Set();
      for (const p of all) {
        if (!seen.has(p.id)) {
          unique.push(p);
          seen.add(p.id);
        }
      }
      return unique;
    });
  }, [objectiveItems]);

  const scrollbarStyles = {
    '&::-webkit-scrollbar': {
      width: '2px',
      height: '2px', // Para scrollbars horizontales
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(128, 128, 128, 0.7)',
      borderRadius: '2px',
    },
    '&::-webkit-scrollbar-corner': {
      background: 'transparent',
    },
    // Firefox
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(128, 128, 128, 0.7) transparent',
    // IE
    '-ms-overflow-style': 'thin',
  };

  const getColumnStyles = (theme) => ({
    p: 1,
    width: '100%',
    backgroundColor: theme.palette.mode === 'dark' ? '#23272b' : 'grey.200',
    color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : 'inherit',
    transition: 'background-color 0.2s',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flexGrow: 1,
    minHeight: { xs: 'auto', md: '500px' },
  });

  const getPaperItemStyles = (theme) => ({
    p: { xs: 1, sm: 2 },
    mt: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#2c3136' : theme.palette.grey[100],
    color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : 'inherit',
    height: { xs: 'auto', sm: '180px' },
    minHeight: { xs: '180px', sm: '180px' },
    display: 'flex',
    flexDirection: 'column',
    transition: 'background-color 0.2s',
  });

  //cargar proyectos
  const fetchProjects = async () => {
    try {
      const projects = await getAllOperationalProjectsApi();
      if (projects && Array.isArray(projects)) {
        const formattedProjects = projects.map(project => ({
          id: project.id,
          title: project.title || project.name || '',
          description: project.description || '',
          status: project.status || 'pending',
          startDate: project.startDate,
          endDate: project.endDate
        }));
        setProjectItems(formattedProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      notify('Error al cargar los proyectos', 'error');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedYear]);

  useEffect(() => {
    const fetchStrategicPlan = async () => {
      setSelectedObjective(null);
      try {
        const plan = await callEndpoint(getStrategicPlanByYearApi(selectedYear));
        if (!plan) {
          setMissionItems([]);
          setObjectiveItems([]);
          setProgramItems([]);
          setProjectItems([]);
          setOriginalData({
            mission: '',
            objectives: []
          });
          setHasChanges(false);
          return;
        }

        //guardar datos originales
        setOriginalData({
          mission: plan.mission || '',
          objectives: plan.objectives || []
        });

        setMissionItems(plan.mission ? [{ id: 1, text: plan.mission }] : []);

        setObjectiveItems(
          plan.objectives?.map(obj => ({
            id: obj.id,
            title: obj.title,
            indicators: obj.indicators?.map(ind => ({
              id: ind.id,
              quantity: ind.amount,
              concept: ind.concept,
            })) || [],
            programs: obj.programs || [],
          })) || []
        );

        const allPrograms = [];
        const allProjects = [];
        plan.objectives?.forEach(obj => {
          obj.programs?.forEach(prog => {
            allPrograms.push({ id: prog.id, text: prog.description });
            prog.operationalProjects?.forEach(proj => {
              allProjects.push({
                id: proj.id,
                title: proj.name || proj.title,
                description: proj.description || '',
              });
            });
          });
        });
        setProgramItems(allPrograms);
        setProjectItems(allProjects);

      } catch (error) {
        console.error(error);
        setMissionItems([]);
        setObjectiveItems([]);
        setProgramItems([]);
        setProjectItems([]);
      }
    };

    fetchStrategicPlan();
    setShowEmptyColumns(false);
  }, [selectedYear]);

  if (loading) return <FullScreenProgress text="Obteniendo el plan estratégico" />



  if (!loading && missionItems.length === 0 && objectiveItems.length === 0 && !showEmptyColumns) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          view={view}
          setView={setView}
          handleOpenDeletePlanModal={() => setOpenDeletePlanModal(true)}
          hasPlan={false}
        />
        {user?.role === 'coordinator' ? (
          <NoResultsScreen
            message={`No existe planificación estratégica para el año ${selectedYear}`}
            sx={{ height: '60vh' }}
          />
        ) : (
          <NoResultsScreen
            message={`No existe planificación estratégica para el año ${selectedYear}`}
            buttonText="Crear una"
            onButtonClick={() => {
              setShowEmptyColumns(true);
              setMissionItems([]);
              setObjectiveItems([]);
              setProgramItems([]);
              setProjectItems([]);
              setSelectedObjective(null);
              setHasChanges(false);
              setView('editable');
            }}
            sx={{ height: '60vh' }}
          />
        )}
      </Box>
    );
  }

  if (view === 'document') {
    return (
      <Box sx={{ p: 1 }}>
        <PageHeader
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          view={view}
          setView={setView}
          handleOpenDeletePlanModal={() => setOpenDeletePlanModal(true)}
          hasPlan={true}
        />
        <DocumentView
          selectedYear={selectedYear}
          missionItems={missionItems}
          objectiveItems={objectiveItems}
        />
      </Box>
    );
  }

  const handleOpenModal = async (column) => {
    if (column === 'Proyectos') {
      try {
        const projects = await getAllOperationalProjectsApi();
        setAvailableProjects(projects);
        setOpenProjectSelectionModal(true);
      } catch (error) {
        console.error('Error al obtener proyectos:', error);
        notify('Error al cargar los proyectos', 'error');
      }
    } else {
      setCurrentColumn(column);
      if (column === 'Objetivos') {
        setNewObjective({ title: '', indicators: [] });
      }
      setOpenModal(true);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentColumn(null);
    setInputValue('');
  };

  const handleSaveItem = async () => {
    if (currentColumn === 'Misión') {
      const missionText = inputValue.trim();
      if (missionText === '') return;

      setPendingMission(missionText);
      setShowMissionPreview(true);
      setHasChanges(true);
      handleCloseModal();
      return;
    }
    try {
      let newItem;
      if (currentColumn === 'Objetivos') {
        if (!newObjective.title.trim()) {
          notify('El objetivo debe tener un título', 'error');
          return;
        }
        const newObjectiveItem = {
          id: Date.now(),
          title: newObjective.title,
          indicators: newObjective.indicators,
        };
        setPendingObjectives([...pendingObjectives, newObjectiveItem]);
        setObjectiveItems([...objectiveItems, newObjectiveItem]);
        setHasChanges(true);
        handleCloseModal();
        return;
      } else {
        if (inputValue.trim() === '') return;
        newItem = {
          id: Date.now(),
          text: inputValue,
          title: inputValue,
          description: '',
          indicators: [],
        };
      }
      let updatedPlan;
      switch (currentColumn) {
        case 'Objetivos':
          updatedPlan = {
            mission: missionItems[0]?.text || '',
            objectives: [
              ...objectiveItems.map(obj => ({
                objectiveTitle: obj.title,
                indicators: obj.indicators.map(ind => ({
                  concept: ind.concept,
                  amount: Number(ind.quantity)
                }))
              })),
              {
                objectiveTitle: newObjective.title,
                indicators: newObjective.indicators.map(ind => ({
                  concept: ind.concept,
                  amount: Number(ind.quantity)
                }))
              }
            ]
          };
          break;
        case 'Programas':
          if (!selectedObjective) {
            notify('Selecciona primero un objetivo para agregar un programa', 'warning');
            updatedPlan = null;
            break;
          }
          const objectivesPayloadForProgram = objectiveItems.map(obj => ({
            objectiveTitle: obj.title,
            indicators: obj.indicators.map(ind => ({ concept: ind.concept, amount: Number(ind.quantity) })),
            programs: obj.programs ? obj.programs.map(p => ({ id: p.id, programDescription: p.description || p.text })) : []
          }));
          const selIndex = objectiveItems.findIndex(o => o.id === selectedObjective.id);
          if (selIndex >= 0) {
            const newProgramPayload = { programDescription: inputValue, operationalProjects: [] };
            if (!objectivesPayloadForProgram[selIndex].programs) objectivesPayloadForProgram[selIndex].programs = [];
            objectivesPayloadForProgram[selIndex].programs.push(newProgramPayload);
          }
          updatedPlan = {
            mission: missionItems[0]?.text || '',
            objectives: objectivesPayloadForProgram
          };
          break;
        default:
          updatedPlan = null;
      }
      if (updatedPlan) {
        const result = await updateStrategicPlanApi(selectedYear, updatedPlan);
        if (result) {
          notify('Elemento agregado exitosamente', 'success');
          if (result.objectives) {
            const refreshedObjectives = result.objectives.map(obj => ({
              id: obj.id || Date.now(),
              title: obj.title || obj.objectiveTitle,
              indicators: obj.indicators?.map(ind => ({ id: ind.id || Date.now(), quantity: ind.amount, concept: ind.concept })) || [],
              programs: obj.programs?.map(p => ({ id: p.id || Date.now(), description: p.description || p.programDescription })) || []
            }));
            setObjectiveItems(refreshedObjectives);
            if (selectedObjective) {
              const found = refreshedObjectives.find(o => o.id === selectedObjective.id);
              if (found) setSelectedObjective(found);
              else setSelectedObjective(null);
            }
          }
          if (result.mission !== undefined) {
            setMissionItems(result.mission ? [{ id: 1, text: result.mission }] : []);
          }
        }
      } else {
        switch (currentColumn) {
          case 'Proyectos':
            if (!selectedProgram) {
              notify('Debes seleccionar un programa primero', 'error');
              return;
            }
            const newProject = {
              id: Date.now(),
              title: inputValue,
              description: '',
              program: selectedProgram
            };
            setProjectItems([...projectItems, newProject]);
            setPendingProjects([...pendingProjects, newProject]);
            setHasChanges(true);
            handleCloseModal();
            return;
          default:
            break;
        }
      }
    } catch (error) {
      console.error('Error adding item:', error);
      notify(error.message || 'Error al agregar el elemento', 'error');
    }
  };

  const handleOpenEditModal = (item, column) => {
    setCurrentColumn(column);
    setEditedItem({ ...item });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditedItem(null);
    setCurrentColumn(null);
  };

  const handleSaveEditedItem = async () => {
    if (!editedItem) return;

    try {
      let updatedMissionItems = [...missionItems];
      let updatedObjectiveItems = [...objectiveItems];

      switch (currentColumn) {
        case 'Misión':
          updatedMissionItems = missionItems.map(item =>
            item.id === editedItem.id ? editedItem : item
          );
          setMissionItems(updatedMissionItems);
          break;
        case 'Objetivos':
          updatedObjectiveItems = objectiveItems.map(item =>
            item.id === editedItem.id ? editedItem : item
          );
          setObjectiveItems(updatedObjectiveItems);
          if (editedItem.id === selectedObjective?.id) {
            setSelectedObjective(editedItem);
          }
          break;
        case 'Programas':
          let updatedObjs = [...objectiveItems];
          let updated = false;
          updatedObjs = updatedObjs.map(obj => {
            const programs = (obj.programs || []).map(p => {
              if (p.id === editedItem.id) {
                updated = true;
                return { ...p, description: editedItem.text || editedItem.description || p.description };
              }
              return p;
            });
            return { ...obj, programs };
          });

          if (!updated && selectedObjective) {
            updatedObjs = updatedObjs.map(obj => obj.id === selectedObjective.id ? { ...obj, programs: [...(obj.programs || []), { id: editedItem.id, description: editedItem.text || editedItem.description }] } : obj);
          }

          setObjectiveItems(updatedObjs);

          try {
            const payload = {
              mission: missionItems[0]?.text || '',
              objectives: updatedObjs.map(o => ({
                id: o.id,
                objectiveTitle: o.title,
                indicators: o.indicators?.map(ind => ({ id: ind.id, concept: ind.concept, amount: Number(ind.quantity) })) || [],
                programs: o.programs?.map(p => ({ id: p.id, programDescription: p.description || p.programDescription || p.text })) || []
              }))
            };

            const res = await updateStrategicPlanApi(selectedYear, payload);
            if (res && res.objectives) {
              const refreshed = res.objectives.map(obj => ({
                id: obj.id || Date.now(),
                title: obj.title || obj.objectiveTitle,
                indicators: obj.indicators?.map(ind => ({ id: ind.id || Date.now(), quantity: ind.amount, concept: ind.concept })) || [],
                programs: obj.programs?.map(p => ({ id: p.id || Date.now(), description: p.description || p.programDescription })) || []
              }));
              setObjectiveItems(refreshed);
              if (selectedObjective) {
                const found = refreshed.find(o => o.id === selectedObjective.id);
                if (found) setSelectedObjective(found);
              }
            }
          } catch (err) {
            console.error('Error saving edited program:', err);
            notify('Error al guardar programa', 'error');
          }

          break;
        case 'Proyectos':
          setProjectItems(projectItems.map(item => item.id === editedItem.id ? editedItem : item));
          break;
      }

      //verificar si los datos actuales son diferentes a los originales
      const currentPlan = {
        mission: currentColumn === 'Misión' ?
          updatedMissionItems[0]?.text :
          missionItems[0]?.text,
        objectives: currentColumn === 'Objetivos' ?
          updatedObjectiveItems :
          objectiveItems
      };

      const hasActualChanges = !checkForChanges(
        currentPlan.mission || '',
        currentPlan.objectives.map(obj => ({
          title: obj.title,
          indicators: obj.indicators.map(ind => ({
            concept: ind.concept,
            quantity: ind.quantity
          }))
        }))
      );

      setHasChanges(hasActualChanges);

    } catch (error) {
      console.error('Error updating item:', error);
      notify(error.message || 'Error al actualizar el elemento', 'error');
    }

    handleCloseEditModal();
  };

  const handleOpenDeleteItemModal = (item, column) => {
    setItemToDelete(item);
    setCurrentColumn(column);

    if (column === 'Objetivos') {
      const objective = objectiveItems.find(obj => obj.id === item.id);
      if (objective) {
        item.relatedContent = {
          programs: objective.programs?.map(prog => ({
            description: prog.description || prog.programDescription || prog.text,
            projects: projectItems.filter(proj => proj.program?.id === prog.id)
          })) || []
        };
      }
    }
    else if (column === 'Programas') {
      item.relatedContent = {
        projects: projectItems.filter(proj => proj.program?.id === item.id)
      };
    }

    setOpenDeleteItemModal(true);
  };

  const handleCloseDeleteItemModal = () => {
    setOpenDeleteItemModal(false);
    setItemToDelete(null);
    setCurrentColumn(null);
  };

  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      switch (currentColumn) {
        case 'Objetivos':
          if (selectedObjective?.id === itemToDelete.id) {
            setSelectedObjective(null);
          }

          const updatedObjectives = objectiveItems.filter(item => item.id !== itemToDelete.id);
          setObjectiveItems(updatedObjectives);

          const updatedPlan = {
            mission: missionItems[0]?.text || '',
            objectives: updatedObjectives.map(obj => ({
              objectiveTitle: obj.title,
              indicators: obj.indicators.map(ind => ({
                concept: ind.concept,
                amount: Number(ind.quantity)
              }))
            }))
          };

          await updateStrategicPlanApi(selectedYear, updatedPlan);
          notify('Objetivo eliminado exitosamente', 'success');
          break;

        case 'Programas':
          const updatedObjsAfterDelete = objectiveItems.map(obj => ({
            ...obj,
            programs: (obj.programs || []).filter(p => p.id !== itemToDelete.id)
          }));
          setObjectiveItems(updatedObjsAfterDelete);
          try {
            const payloadAfterDelete = {
              mission: missionItems[0]?.text || '',
              objectives: updatedObjsAfterDelete.map(o => ({
                id: o.id,
                objectiveTitle: o.title,
                indicators: o.indicators?.map(ind => ({ id: ind.id, concept: ind.concept, amount: Number(ind.quantity) })) || [],
                programs: o.programs?.map(p => ({ id: p.id, programDescription: p.description || p.programDescription || p.text })) || []
              }))
            };
            await updateStrategicPlanApi(selectedYear, payloadAfterDelete);
            notify('Programa eliminado exitosamente', 'success');
          } catch (err) {
            console.error('Error deleting program:', err);
            notify('Error al eliminar programa', 'error');
          }
          break;
        case 'Proyectos':
          setProjectItems(projectItems.filter(item => item.id !== itemToDelete.id));
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      notify(error.message || 'Error al eliminar el elemento', 'error');
    }

    handleCloseDeleteItemModal();
  };

  const handleOpenDeletePlanModal = () => setOpenDeletePlanModal(true);

  const handleEditedItemChange = (e) => {
    const { name, value } = e.target;
    setEditedItem(prev => ({ ...prev, [name]: value }));
  };

  const handleEditedIndicatorChange = (index, e) => {
    const { name, value } = e.target;
    const newIndicators = [...editedItem.indicators];
    newIndicators[index] = { ...newIndicators[index], [name]: value };
    setEditedItem(prev => ({ ...prev, indicators: newIndicators }));
  };

  const addIndicator = () => {
    const newIndicator = { id: Date.now(), quantity: 0, concept: '' };
    setEditedItem(prev => ({ ...prev, indicators: [...prev.indicators, newIndicator] }));
  };

  const removeIndicator = (id) => {
    setEditedItem(prev => ({ ...prev, indicators: prev.indicators.filter(ind => ind.id !== id) }));
  };

  const handleAssignProjectToProgram = async (projectId, programId) => {
    try {
      const result = await assignProjectToProgramApi(projectId, programId);

      if (result) {
        notify('Proyecto asignado exitosamente', 'success');

        const projects = await getAllOperationalProjectsApi();
        if (projects && Array.isArray(projects)) {
          const formattedProjects = projects.map(project => ({
            id: project.id,
            name: project.name,
            title: project.title || project.name,
            description: project.description || '',
            status: project.status || 'pending',
            startDate: project.startDate,
            endDate: project.endDate,
            program: project.program
          }));
          setProjectItems(formattedProjects);
          setAvailableProjects(formattedProjects);
        }

        const plan = await getStrategicPlanByYearApi(selectedYear);
        if (plan && plan.objectives) {
          setObjectiveItems(
            plan.objectives?.map(obj => ({
              id: obj.id,
              title: obj.title,
              indicators: obj.indicators?.map(ind => ({
                id: ind.id,
                quantity: ind.amount,
                concept: ind.concept,
              })) || [],
              programs: obj.programs || [],
            })) || []
          );
        }

        setOpenProjectSelectionModal(false);
      }
    } catch (error) {
      console.error('Error al asignar proyecto:', error);
      notify(error.message || 'Error al asignar el proyecto al programa', 'error');
    }
  };

  // Control de habilitación de botones +
  const hasMission = (missionItems.length > 0 && missionItems[0]?.text?.trim()) || (typeof pendingMission === 'string' && pendingMission.trim().length > 0);
  const hasObjectives = objectiveItems.length > 0;
  const hasSelectedObjective = !!selectedObjective && selectedObjective.programs && selectedObjective.programs.length > 0;
  const hasSelectedProgram = !!selectedProgram;

  const columnData = {
    'Misión': {
      items: missionItems,
      handler: () => handleOpenModal('Misión'),
      addEnabled: !hasMission
    },
    'Objetivos': {
      items: objectiveItems,
      handler: () => handleOpenModal('Objetivos'),
      addEnabled: hasMission
    },
    'Programas': {
      items: selectedObjective && selectedObjective.programs
        ? (selectedObjective.programs.map(p => ({ id: p.id, text: p.description || p.programDescription || p.text })) || [])
        : [],
      handler: () => handleOpenModal('Programas'),
      addEnabled: hasObjectives && !!selectedObjective
    },
    'Proyectos': {
      items: selectedProgram ?
        projectItems
          .filter(project => {
            return project.program && project.program.id === selectedProgram.id;
          })
          .map(project => ({
            id: project.id,
            title: project.name || project.title || '',
            description: project.description || '',
            status: project.status || 'pending',
            startDate: project.startDate,
            endDate: project.endDate,
            program: project.program
          }))
        : [],
      handler: () => handleOpenModal('Proyectos'),
      addEnabled: hasSelectedProgram
    },
  };
  return (
    <Box sx={{ p: 1 }}>
      <Box>
        <PageHeader
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          view={view}
          setView={setView}
          handleOpenDeletePlanModal={() => setOpenDeletePlanModal(true)}
          hasPlan={true}
        />
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          my: 2
        }}>
          {(hasChanges || pendingMission) && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={async () => {
                  // Restaurar misión
                  if (pendingMission) {
                    setPendingMission(null);
                  }
                  if (originalData.mission) {
                    setMissionItems([{ id: 1, text: originalData.mission }]);
                  } else {
                    setMissionItems([]);
                  }

                  // Restaurar objetivos
                  const objectives = originalData.objectives.map(obj => ({
                    id: obj.id,
                    title: obj.objectiveTitle,
                    indicators: obj.indicators?.map(ind => ({
                      id: ind.id,
                      quantity: ind.amount,
                      concept: ind.concept,
                    })) || [],
                  }));
                  setObjectiveItems(objectives);
                  setPendingObjectives([]);
                  setSelectedObjective(null);

                  // Restaurar proyectos
                  try {
                    const projects = await getAllOperationalProjectsApi();
                    if (projects && Array.isArray(projects)) {
                      const formattedProjects = projects.map(project => ({
                        id: project.id,
                        title: project.title || project.name || '',
                        description: project.description || '',
                        status: project.status || 'pending',
                        startDate: project.startDate,
                        endDate: project.endDate,
                        program: project.program
                      }));
                      setProjectItems(formattedProjects);
                      setPendingProjects([]);
                    }
                  } catch (error) {
                    console.error('Error al restaurar proyectos:', error);
                  }

                  setHasChanges(false);
                  notify('Cambios cancelados', 'info');
                }}
              >
                Cancelar cambios
              </Button>
              <Button
                variant="contained"
                onClick={async () => {
                  try {

                    if (pendingProjects.length > 0) {
                      for (const project of pendingProjects) {
                        if (project.program) {
                          try {
                            await assignProjectToProgramApi(project.id, project.program.id);
                          } catch (error) {
                            console.error('Error al asignar proyecto:', error);
                            notify(`Error al asignar el proyecto "${project.title}"`, 'error');
                            return;
                          }
                        }
                      }
                    }

                    // Crear la planificación estratégica con la misión y/o objetivos pendientes
                    const updatedPlan = {
                      mission: pendingMission || (missionItems[0]?.text || ''),
                      objectives: objectiveItems.map(obj => ({
                        objectiveTitle: obj.title,
                        indicators: obj.indicators.map(ind => ({
                          concept: ind.concept,
                          amount: Number(ind.quantity || 0)
                        }))
                      }))
                    };

                    // Hacer el POST a la API
                    const result = await updateStrategicPlanApi(selectedYear, updatedPlan);

                    if (result) {
                      // Actualizar el estado local con la respuesta del servidor
                      if (result.mission) {
                        setMissionItems([{ id: 1, text: result.mission }]);
                        setPendingMission('');
                        setShowMissionPreview(false);
                      }

                      if (result.objectives) {
                        const refreshedObjectives = result.objectives.map(obj => ({
                          id: obj.id || Date.now(),
                          title: obj.title || obj.objectiveTitle,
                          indicators: obj.indicators?.map(ind => ({
                            id: ind.id || Date.now(),
                            quantity: ind.amount,
                            concept: ind.concept
                          })) || [],
                          programs: obj.programs || []
                        }));
                        setObjectiveItems(refreshedObjectives);
                        setPendingObjectives([]);
                      }

                      // Actualizar la lista de proyectos
                      const projects = await getAllOperationalProjectsApi();
                      if (projects && Array.isArray(projects)) {
                        const formattedProjects = projects.map(project => ({
                          id: project.id,
                          title: project.title || project.name || '',
                          description: project.description || '',
                          status: project.status || 'pending',
                          startDate: project.startDate,
                          endDate: project.endDate,
                          program: project.program
                        }));
                        setProjectItems(formattedProjects);
                        setPendingProjects([]);
                      }

                      setHasChanges(false);
                      notify('Cambios guardados exitosamente', 'success');
                    }
                  } catch (error) {
                    console.error('Error al guardar cambios:', error);
                    notify('Error al guardar los cambios', 'error');
                  }
                }}
              >
                Guardar cambios
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Grid
        container
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          alignItems: 'stretch',
          width: '100%',
          flexWrap: 'nowrap',
          overflowX: { xs: 'visible', md: 'auto' },
          gap: 0,
        }}
      >
        {Object.entries(columnData).map(([title, { items, handler, addEnabled }], index, array) => (
          <Grid
            item
            key={`column-${title}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              width: '100%',
              margin: { xs: '0 0 16px 0', md: 0 },
              ...(index < array.length - 1 && {
                mr: { md: 2 }
              }),
            }}
          >
            <Paper
              sx={(theme) => ({
                ...getColumnStyles(theme),
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              })}
            >
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">{title}</Typography>
                  {/* Mostrar el botón + si está habilitado según la lógica de cada columna */}
                  {addEnabled && (
                    <IconButton size="small" onClick={handler}>
                      <AddCircleOutlineIcon />
                    </IconButton>
                  )}
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    height: '1px',
                    backgroundColor: theme => theme.palette.divider,
                    mb: 1
                  }}
                />
              </Box>

              <Box sx={{
                minHeight: '50px',
                display: 'flex',
                alignItems: 'flex-start',
                mb: 1.5,
                py: 0.5
              }}>
                {title === 'Objetivos' && missionItems[0] && (
                  <Box sx={{ width: '100%' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 'medium',
                        display: 'block',
                        mb: 0.5
                      }}
                    >
                      Misión seleccionada:
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%'
                      }}
                    >
                      {missionItems[0].text}
                    </Typography>
                  </Box>
                )}

                {title === 'Programas' && selectedObjective && (
                  <Box sx={{ width: '100%' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 'medium',
                        display: 'block',
                        mb: 0.5
                      }}
                    >
                      Objetivo seleccionado:
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%'
                      }}
                    >
                      {selectedObjective.title}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Divider antes de los items */}
              <Box
                sx={{
                  width: '100%',
                  height: '1px',
                  backgroundColor: theme => theme.palette.divider,
                  mb: 1
                }}
              />

              <Box
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  p: 0.5,
                  flexGrow: 1,
                  overflowY: 'auto',
                  '& > .MuiPaper-root': {
                    height: '180px',
                    mb: 2,
                  },
                  ...scrollbarStyles,
                }}
              >
                {/* Mostrar misión pendiente */}
                {title === 'Misión' && showMissionPreview && pendingMission && (
                  <Paper sx={(theme) => getPaperItemStyles(theme)}>
                    <Box sx={{ p: 1, flexGrow: 1, overflowY: 'auto' }}>
                      <Box
                        sx={(theme) => ({
                          backgroundColor: theme.palette.mode === 'dark' ? '#23272b' : 'grey.50',
                          borderRadius: 1,
                          p: 2,
                          height: '100%',
                          display: 'flex',
                          alignItems: 'left',
                          justifyContent: 'left'
                        })}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={(theme) => ({
                            textAlign: 'left',
                            lineHeight: 1.6,
                            color: theme.palette.mode === 'dark' ? 'inherit' : theme.palette.grey[700]
                          })}
                        >
                          {pendingMission}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                )}
                {/* Mostrar items existentes */}
                {items.map((item) => (
                  <Paper
                    key={item.id}
                    sx={(theme) => ({
                      ...getPaperItemStyles(theme),
                      border: title === 'Objetivos' && selectedObjective?.id === item.id
                        ? '2px solid #1976d2'
                        : 'none',
                    })}
                  >
                    <Box
                      sx={{
                        p: 1,
                        flexGrow: 1,
                        overflowY: 'auto',
                        cursor: title === 'Objetivos' ? 'pointer' : 'default',
                      }}
                      onClick={() => {
                        if (title === 'Objetivos') {
                          setSelectedObjective(item);
                        }
                      }}
                    >
                      {title === 'Objetivos' ? (
                        <Box>
                          <Box
                            sx={(theme) => ({
                              backgroundColor: theme.palette.mode === 'dark' ? '#23272b' : theme.palette.grey[200],
                              borderRadius: 1,
                              p: 0.5,
                              textAlign: 'center',
                              mb: 1,
                            })}
                            onClick={() => {
                              setSelectedProgram(null);
                            }}
                          >
                            <Typography variant="subtitle2" sx={(theme) => ({
                              color: theme.palette.mode === 'dark' ? 'inherit' : theme.palette.grey[700]
                            })}>{item.title}</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ pl: 1, pt: 1, color: theme => theme.palette.mode === 'dark' ? 'inherit' : theme.palette.grey[700] }}>
                            Indicadores
                          </Typography>
                          {item.indicators.map((ind) => (
                            <Box
                              key={`indicator-${item.id}-${ind.id}`}
                              sx={(theme) => ({
                                backgroundColor: theme.palette.mode === 'dark' ? '#23272b' : theme.palette.grey[200],
                                borderRadius: 1,
                                p: 1,
                                my: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                              })}
                            >
                              <Typography variant="caption">Cantidad: {ind.quantity}</Typography>
                              <Typography variant="caption">Concepto: {ind.concept}</Typography>
                            </Box>
                          ))}
                        </Box>
                      ) : title === 'Programas' ? (
                        <Box>
                          <Box
                            sx={(theme) => ({
                              backgroundColor: theme.palette.mode === 'dark' ? '#23272b' : theme.palette.grey[200],
                              borderRadius: 1,
                              p: 1,
                              textAlign: 'left',
                              mb: 1,
                              border: selectedProgram?.id === item.id ? '2px solid #1976d2' : 'none',
                              cursor: 'pointer',
                            })}
                            onClick={() => setSelectedProgram(item)}
                          >
                            <Typography variant="subtitle2" sx={(theme) => ({
                              color: theme.palette.mode === 'dark' ? 'inherit' : theme.palette.grey[700],
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            })}>{item.text}</Typography>
                          </Box>
                        </Box>
                      ) : title === 'Proyectos' ? (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                            <Avatar
                              sx={(theme) => ({
                                width: 30,
                                height: 30,
                                bgcolor: item.status === 'completed' ? 'success.main' :
                                  item.status === 'in-progress' ? 'primary.main' : 'grey.500',
                                mr: 1,
                                color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : 'inherit',
                              })}
                            >
                              P
                            </Avatar>
                            <Box
                              sx={(theme) => ({
                                backgroundColor: theme.palette.mode === 'dark' ? '#23272b' : theme.palette.grey[200],
                                borderRadius: 1,
                                p: 1,
                                flexGrow: 1,
                                minHeight: '30px',
                                display: 'flex',
                                flexDirection: 'column',
                              })}
                            >
                              <Typography variant="subtitle2" sx={(theme) => ({
                                mb: 0.5,
                                color: theme.palette.mode === 'dark' ? 'inherit' : theme.palette.grey[700],
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              })}>{item.title}</Typography>
                              {item.status && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: item.status === 'completed' ? 'success.main' :
                                      item.status === 'in-progress' ? 'primary.main' : 'text.secondary'
                                  }}
                                >
                                  Estado: {item.status === 'completed' ? 'Completado' :
                                    item.status === 'in-progress' ? 'En progreso' : 'Pendiente'}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Box
                            sx={(theme) => ({
                              backgroundColor: theme.palette.mode === 'dark' ? '#23272b' : theme.palette.grey[200],
                              borderRadius: 1,
                              p: 1,
                            })}
                          >
                            <Typography variant="body2" sx={{
                              mb: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {item.description}
                            </Typography>
                            {(item.startDate || item.endDate) && (
                              <Box sx={{
                                display: 'flex',
                                gap: 2,
                                mt: 1,
                                fontSize: '0.75rem',
                                color: 'text.secondary'
                              }}>
                                {item.startDate && (
                                  <Typography variant="caption">
                                    Inicio: {new Date(item.startDate).toLocaleDateString()}
                                  </Typography>
                                )}
                                {item.endDate && (
                                  <Typography variant="caption">
                                    Fin: {new Date(item.endDate).toLocaleDateString()}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      ) : title === 'Misión' ? (
                        <Box
                          sx={(theme) => ({
                            backgroundColor: theme.palette.mode === 'dark' ? '#23272b' : 'grey.50',
                            borderRadius: 1,
                            p: 2,
                            height: '100%',
                            display: 'flex',
                            alignItems: 'left',
                            justifyContent: 'left'
                          })}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={(theme) => ({
                              textAlign: 'left',
                              lineHeight: 1.6,
                              color: theme.palette.mode === 'dark' ? 'inherit' : theme.palette.grey[700]
                            })}
                          >
                            {item.text}
                          </Typography>
                        </Box>
                      ) : (
                        item.text
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        pt: 1,
                        borderTop: '1px solid grey',
                        mt: 'auto',
                        position: 'sticky',
                        bottom: 0,
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark' ? '#2c3136' : 'grey.100',
                      }}
                    >
                      <IconButton size="small" onClick={() => handleOpenEditModal(item, title)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      {title !== 'Misión' && (
                        <IconButton size="small" onClick={() => handleOpenDeleteItemModal(item, title)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Modal
        open={openCreatePlanModal}
        onClose={() => { }}
      >
        <Box sx={{
          ...modalStyle,
          width: 600,
          maxHeight: '80vh',
          overflowY: 'auto',
          ...scrollbarStyles
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Crear Planificación Estratégica</Typography>
            <Typography variant="h6" color="primary">{selectedYear}</Typography>
            <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => setOpenCreatePlanModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>Misión</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={newPlanData.mission}
            onChange={(e) => setNewPlanData(prev => ({ ...prev, mission: e.target.value }))}
            placeholder="Describe la misión de la planificación estratégica"
          />

          <Typography variant="subtitle1" sx={{ mt: 3 }}>Objetivos</Typography>
          {newPlanData.objectives.map((objective, objIndex) => (
            <Box key={objIndex} sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  label="Título del objetivo"
                  value={objective.title}
                  onChange={(e) => {
                    const newObjectives = [...newPlanData.objectives];
                    newObjectives[objIndex].title = e.target.value;
                    setNewPlanData(prev => ({ ...prev, objectives: newObjectives }));
                  }}
                />
                {objIndex > 0 && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newObjectives = newPlanData.objectives.filter((_, i) => i !== objIndex);
                      setNewPlanData(prev => ({ ...prev, objectives: newObjectives }));
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <Typography variant="subtitle2" sx={{ mt: 2 }}>Indicadores</Typography>
              {objective.indicators.map((indicator, indIndex) => (
                <Box key={indIndex} sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    label="Cantidad"
                    size="small"
                    type="number"
                    value={indicator.amount}
                    onChange={(e) => {
                      const newObjectives = [...newPlanData.objectives];
                      newObjectives[objIndex].indicators[indIndex].amount = e.target.value;
                      setNewPlanData(prev => ({ ...prev, objectives: newObjectives }));
                    }}
                    sx={{ width: 100 }}
                  />
                  <TextField
                    label="Concepto"
                    size="small"
                    fullWidth
                    value={indicator.concept}
                    inputProps={{ maxLength: 100 }}
                    onChange={(e) => {
                      const newObjectives = [...newPlanData.objectives];
                      newObjectives[objIndex].indicators[indIndex].concept = e.target.value;
                      setNewPlanData(prev => ({ ...prev, objectives: newObjectives }));
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newObjectives = [...newPlanData.objectives];
                      newObjectives[objIndex].indicators = objective.indicators.filter((_, i) => i !== indIndex);
                      setNewPlanData(prev => ({ ...prev, objectives: newObjectives }));
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                size="small"
                onClick={() => {
                  const newObjectives = [...newPlanData.objectives];
                  newObjectives[objIndex].indicators.push({ amount: '', concept: '' });
                  setNewPlanData(prev => ({ ...prev, objectives: newObjectives }));
                }}
                sx={{ mt: 1 }}
              >
                + Agregar indicador
              </Button>
            </Box>
          ))}

          <Button
            onClick={() => {
              setNewPlanData(prev => ({
                ...prev,
                objectives: [...prev.objectives, { title: '', indicators: [{ amount: '', concept: '' }] }]
              }));
            }}
            sx={{ mt: 2 }}
          >
            + Agregar objetivo
          </Button>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {/* Botón Cancelar eliminado, solo X arriba */}
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  if (!newPlanData.mission.trim()) {
                    notify('La misión es requerida', 'error');
                    return;
                  }

                  const validObjectives = newPlanData.objectives
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
                    mission: newPlanData.mission,
                    objectives: validObjectives
                  };

                  console.log('Creating strategic plan for year:', selectedYear);
                  console.log('Sending payload:', payload);

                  const result = await updateStrategicPlanApi(selectedYear, payload);

                  if (result) {
                    notify(`Plan estratégico para ${selectedYear} creado exitosamente`, 'success');
                    setOpenCreatePlanModal(false);
                    setNewPlanData({
                      mission: '',
                      objectives: [{ title: '', indicators: [{ amount: '', concept: '' }] }]
                    });
                    const plan = await getStrategicPlanByYearApi(selectedYear);
                    if (plan) {
                      setMissionItems(plan.mission ? [{ id: 1, text: plan.mission }] : []);
                      setObjectiveItems(
                        plan.objectives?.map(obj => ({
                          id: obj.id,
                          title: obj.title,
                          indicators: obj.indicators?.map(ind => ({
                            id: ind.id,
                            quantity: ind.amount,
                            concept: ind.concept,
                          })) || [],
                          programs: obj.programs || [],
                        })) || []
                      );
                    }
                  }
                } catch (error) {
                  console.error('Error creating strategic plan:', error);
                  notify(error.message || 'Error al crear el plan estratégico', 'error');
                }
              }}
            >
              Crear
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openModal}
        onClose={() => { }}
      >
        <Box sx={{ ...modalStyle, height: 500, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Añadir a {currentColumn}</Typography>
            <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          {currentColumn === 'Objetivos' ? (
            <Box sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              p: 1,
              // Estilos de scrollbar
              '&::-webkit-scrollbar': {
                width: '2px',
                height: '2px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(128, 128, 128, 0.7)',
                borderRadius: '2px',
              },
              '&::-webkit-scrollbar-corner': {
                background: 'transparent',
              },
              // Firefox
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(128, 128, 128, 0.7) transparent',
              // IE
              '-ms-overflow-style': 'thin',
            }}>
              <TextField
                fullWidth
                label="Título del objetivo"
                value={newObjective.title}
                onChange={(e) => setNewObjective(prev => ({ ...prev, title: e.target.value }))}
                inputProps={{ maxLength: 100 }}
                helperText={`${newObjective.title.length}/100 caracteres`}
                sx={{ mt: 2 }}
                required
              />
              {newObjective.indicators.length > 0 && (
                <>
                  <Typography sx={{ mt: 2 }}>Indicadores:</Typography>
                  {newObjective.indicators.map((indicator, index) => (
                    <Box key={indicator.id} sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                      <TextField
                        label="Cantidad"
                        type="text"
                        value={indicator.quantity === 0 ? (indicator.quantity === '' ? '' : '0') : indicator.quantity}
                        onChange={(e) => {
                          let value = e.target.value;
                          // Permitir string vacío o solo números positivos
                          if (value === '' || /^\d*$/.test(value)) {
                            const newIndicators = [...newObjective.indicators];
                            newIndicators[index] = { ...newIndicators[index], quantity: value };
                            setNewObjective(prev => ({ ...prev, indicators: newIndicators }));
                          }
                        }}
                        sx={{
                          flex: 1
                        }}
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          min: 0
                        }}
                      />
                      <TextField
                        label="Concepto"
                        value={indicator.concept}
                        inputProps={{ maxLength: 100 }}
                        onChange={(e) => {
                          const newIndicators = [...newObjective.indicators];
                          newIndicators[index] = { ...newIndicators[index], concept: e.target.value };
                          setNewObjective(prev => ({ ...prev, indicators: newIndicators }));
                        }}
                        sx={{ flex: 2 }}
                      />
                      <IconButton
                        onClick={() => {
                          const newIndicators = newObjective.indicators.filter((_, i) => i !== index);
                          setNewObjective(prev => ({ ...prev, indicators: newIndicators }));
                        }}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </>
              )}
              <Button
                onClick={() => {
                  setNewObjective(prev => ({
                    ...prev,
                    indicators: [...prev.indicators, { id: Date.now(), quantity: 0, concept: '' }]
                  }));
                }}
                size="small"
                sx={{ mt: 2 }}
              >
                Añadir indicador
              </Button>
            </Box>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {/* Botón Cancelar eliminado, solo X arriba */}
            <Button
              variant="contained"
              onClick={handleSaveItem}
              disabled={
                (currentColumn === 'Objetivos' && !newObjective.title.trim()) ||
                (currentColumn === 'Misión' && !inputValue.trim())
              }
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openEditModal}
        onClose={() => { }}
      >
        <Box sx={{ ...modalStyle, height: 500, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Editar {currentColumn}</Typography>
            <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={handleCloseEditModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          {editedItem && (
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', ...scrollbarStyles, p: 1 }}>
              {currentColumn === 'Misión' && (
                <TextField
                  fullWidth
                  label="Misión"
                  name="text"
                  multiline
                  rows={4}
                  value={editedItem.text}
                  onChange={handleEditedItemChange}
                  sx={{ mt: 2 }}
                />
              )}
              {currentColumn === 'Objetivos' && (
                <>
                  <TextField
                    fullWidth
                    label="Título del objetivo"
                    name="title"
                    value={editedItem.title}
                    onChange={handleEditedItemChange}
                    inputProps={{ maxLength: 100 }}
                    helperText={`${editedItem.title.length}/100 caracteres`}
                    sx={{ mt: 2 }}
                    required
                  />
                  <Typography sx={{ mt: 2 }}>Indicadores:</Typography>
                  {editedItem.indicators.map((indicator, index) => (
                    <Box key={indicator.id} sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                      <TextField
                        label="Cantidad"
                        name="quantity"
                        type="text"
                        value={indicator.quantity === 0 ? (indicator.quantity === '' ? '' : '0') : indicator.quantity}
                        onChange={(e) => {
                          let value = e.target.value;
                          // Permitir string vacío o solo números positivos
                          if (value === '' || /^\d*$/.test(value)) {
                            const event = {
                              target: {
                                name: 'quantity',
                                value: value
                              }
                            };
                            handleEditedIndicatorChange(index, event);
                          }
                        }}
                        sx={{
                          flex: 1
                        }}
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          min: 0
                        }}
                      />
                      <TextField
                        label="Concepto"
                        name="concept"
                        value={indicator.concept}
                        inputProps={{ maxLength: 100 }}
                        onChange={(e) => handleEditedIndicatorChange(index, e)}
                        sx={{ flex: 2 }}
                      />
                      <IconButton onClick={() => removeIndicator(indicator.id)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button onClick={addIndicator} size="small" sx={{ mt: 1 }}>Añadir indicador</Button>
                </>
              )}
              {currentColumn === 'Programas' && (
                <TextField
                  fullWidth
                  label="Programa"
                  name="text"
                  value={editedItem.text}
                  onChange={handleEditedItemChange}
                  sx={{ mt: 2 }}
                />
              )}
              {currentColumn === 'Proyectos' && (
                <>
                  <TextField
                    fullWidth
                    label="Título del proyecto"
                    name="title"
                    value={editedItem.title}
                    onChange={handleEditedItemChange}
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Descripción del proyecto"
                    name="description"
                    multiline
                    rows={4}
                    value={editedItem.description}
                    onChange={handleEditedItemChange}
                    sx={{ mt: 2 }}
                  />
                </>
              )}
            </Box>
          )}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {/* Botón Cancelar eliminado, solo X arriba */}
            <Button
              variant="contained"
              onClick={handleSaveEditedItem}
              disabled={currentColumn === 'Objetivos' && (!editedItem?.title || editedItem.title.trim() === '')}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openDeleteItemModal}
        onClose={() => { }}
      >
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" color="error.main" gutterBottom>
              ¿Estás seguro que deseas borrar este elemento?
            </Typography>
            <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={handleCloseDeleteItemModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              mb: 2
            }}
          >
            {currentColumn === 'Objetivos' && itemToDelete && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  <b>Objetivo a eliminar:</b>
                </Typography>
                <Typography paragraph>{itemToDelete.title}</Typography>

                <Typography variant="subtitle2" gutterBottom>Indicadores:</Typography>
                {itemToDelete.indicators?.map((ind, index) => (
                  <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                    • {ind.quantity} {ind.concept}
                  </Typography>
                ))}

                {itemToDelete.relatedContent?.programs?.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2, color: 'warning.main' }}>
                      Este objetivo contiene los siguientes programas que también serán eliminados:
                    </Typography>
                    {itemToDelete.relatedContent.programs.map((prog, index) => (
                      <Box key={index} sx={{ ml: 2, mt: 1 }}>
                        <Typography variant="body2">
                          • Programa: {prog.description}
                        </Typography>
                        {prog.projects?.length > 0 && (
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="body2" color="warning.main">
                              Proyectos que serán desvinculados:
                            </Typography>
                            {prog.projects.map((proj, idx) => (
                              <Typography key={idx} variant="body2" sx={{ ml: 2 }}>
                                ◦ {proj.title || proj.name}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </>
                )}
              </>
            )}

            {currentColumn === 'Programas' && itemToDelete && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  <b>Programa a eliminar:</b>
                </Typography>
                <Typography paragraph>{itemToDelete.text || itemToDelete.description}</Typography>

                {itemToDelete.relatedContent?.projects?.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ color: 'warning.main' }}>
                      Los siguientes proyectos serán desvinculados:
                    </Typography>
                    {itemToDelete.relatedContent.projects.map((proj, index) => (
                      <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                        • {proj.title || proj.name}
                      </Typography>
                    ))}
                  </>
                )}
              </>
            )}

            {currentColumn === 'Proyectos' && itemToDelete && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  <b>Proyecto a desvincular:</b>
                </Typography>
                <Typography variant="body1">{itemToDelete.title}</Typography>
                {itemToDelete.description && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    {itemToDelete.description}
                  </Typography>
                )}
              </>
            )}
          </Paper>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {/* Botón Cancelar eliminado, solo X arriba */}
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDeleteItem}
            >
              Eliminar
            </Button>
          </Box>
        </Box>
      </Modal>

      <DeleteStrategicPlanModal
        open={openDeletePlanModal}
        onClose={() => setOpenDeletePlanModal(false)}
        inputYear={inputYear}
        setInputYear={setInputYear}
        selectedYear={selectedYear}
      />

      <Modal
        open={openProjectSelectionModal}
        onClose={() => setOpenProjectSelectionModal(false)}
      >
        <Box
          sx={{
            ...modalStyle,
            width: 500,
            height: 500,
            maxWidth: '95vw',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            p: 0,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider', position: 'relative' }}>
            <Typography variant="h6">Asignar Proyecto</Typography>
            <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => setOpenProjectSelectionModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ p: 2, pt: 1, flex: '0 0 auto' }}>
            {selectedProgram ? (
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Asignar proyecto al programa: <strong>{selectedProgram.text || selectedProgram.description}</strong>
              </Typography>
            ) : (
              <Typography variant="subtitle2" sx={{ color: 'warning.main' }}>
                Selecciona primero un programa para poder asignarle un proyecto
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              flex: '1 1 0',
              overflowY: 'auto',
              px: 2,
              pb: 2,
              ...scrollbarStyles,
            }}
          >
            {availableProjects.map((project) => (
              <Paper
                key={project.id}
                sx={(theme) => ({
                  p: 2,
                  mb: 2,
                  backgroundColor: theme.palette.mode === 'dark' ? '#2c3136' : theme.palette.grey[100],
                  cursor: selectedProgram ? 'pointer' : 'not-allowed',
                  opacity: selectedProgram ? 1 : 0.7,
                  '&:hover': {
                    backgroundColor: selectedProgram ?
                      (theme.palette.mode === 'dark' ? '#353a40' : theme.palette.grey[200]) :
                      (theme.palette.mode === 'dark' ? '#2c3136' : theme.palette.grey[100]),
                  },
                })}
                onClick={() => {
                  if (selectedProgram) {
                    handleAssignProjectToProgram(project.id, selectedProgram.id)
                  } else {
                    notify('Selecciona primero un programa', 'warning');
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Avatar
                    sx={(theme) => ({
                      width: 30,
                      height: 30,
                      bgcolor: 'primary.main',
                      color: theme.palette.grey[100]
                    })}
                  >
                    P
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>{project.name || project.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {project.description}
                    </Typography>
                    {project.program && (
                      <Typography variant="caption" color="warning.main">
                        Actualmente asignado a: {project.program.name || project.program.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            ))}

            {availableProjects.length === 0 && (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                No hay proyectos disponibles
              </Typography>
            )}
          </Box>
        </Box>
      </Modal>

    </Box>
  );
};
