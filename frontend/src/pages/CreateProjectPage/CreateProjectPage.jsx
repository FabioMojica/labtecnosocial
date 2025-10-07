// 1. Librerías externas
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModeStandbyRoundedIcon from '@mui/icons-material/ModeStandbyRounded';
import LibraryAddCheckRoundedIcon from '@mui/icons-material/LibraryAddCheckRounded';

// 2. Hooks personalizados
import { useFetchAndLoad } from "../../hooks";
import { useNotification } from "../../contexts";

// 3. Utilidades / helpers
import { isProjectEqual } from "./utils/isProjectEqual";
import { createProjectFormData } from "./utils/createProjectFormData";

// 4. Componentes
import {
    ActionBarButtons,
    FullScreenProgress,
    QuestionModal,
    TabButtons,
} from '../../generalComponents'


import { AssignResponsiblesPanel } from "./components/AssignResponsiblesPanel";
import { CreateProjectInfoPanel } from "./components/CreateProjectInfoPanel";

// 5. Servicios / UseCases
import { createOperationalProjectApi } from "../../api";


// 6. Assets (imágenes, íconos)
// ninguno por ahora

// 7. Estilos
// ninguno por ahora

// 8. Tipos
import { IntegrationsWithAPIsPanel } from "./components/IntegrationWithAPIsPanel";

export const CreateProjectPage = () => {
    const initialProject = {
        name: '',
        description: '',
        image_url: null,
        image_file: null,
        newResponsibles: [],
        integrations: [],
    };
    const [project, setProject] = useState({ ...initialProject });
    const [selectedResponsibles, setSelectedResponsibles] = useState(new Set());
    const [tabsHeight, setTabsHeight] = useState(0);
    const { notify } = useNotification();
    const [isDirty, setIsDirty] = useState(false);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const { loading, callEndpoint } = useFetchAndLoad();
    const navigate = useNavigate();

    const handleCreateProject = async () => {
        if (!project) {
            notify("Completa los datos del proyecto antes de guardar", "info");
            return;
        }
        try {
            
            const projectToSend = {
                name: project.name,
                description: project.description,
                image_file: project.image_file ?? null,
                responsibles: project.newResponsibles ?? [],
                integrations: project.integrations ?? [],
            };

            const formData = createProjectFormData(projectToSend);

            await callEndpoint(createOperationalProjectApi(formData));

            notify("Proyecto creado correctamente", "success");
            navigate("/proyectos");
        } catch (error) {
            notify(error?.message || "Error al crear el proyecto", "error");
        }
    };


    const handleProjectChange = (changes) => {
        setProject(prev => {
            if (!prev) return prev;

            const updated = { ...prev, ...changes };
            setIsDirty(!isProjectEqual(updated, initialProject));
            return updated;
        });
    };

    const handleSave = () => {
        handleCreateProject();
    }

    const handleCancelChanges = () => {
        setQuestionModalOpen(true);
    }

    const handleConfirmCancelModal = () => {
        setProject({ ...initialProject });
        setIsDirty(false);
        setQuestionModalOpen(false);
        notify("Cambios descartados correctamente", "info");
    };

    if (loading) return <FullScreenProgress text="Creando el proyecto" />

    return (
        <>
            <TabButtons
                labels={["Información del proyecto", "Asignar Responsables", "Integraciones con apis"]}
                paramsLabels={["información", "asignarResponsables", "integrarAPIs"]}
                onTabsHeightChange={(height) => setTabsHeight(height)}
            >
                <CreateProjectInfoPanel onChange={handleProjectChange} panelHeight={tabsHeight} project={project} />

                <AssignResponsiblesPanel
                    panelHeight={tabsHeight}
                    selectedUsers={selectedResponsibles}
                    onChange={(selectedIds) => {
                        setSelectedResponsibles(new Set(selectedIds));
                        handleProjectChange({ newResponsibles: selectedIds });
                    }}
                />

                <IntegrationsWithAPIsPanel
                    panelHeight={tabsHeight}
                    selectedIntegrations={project.integrations}
                    onChange={(integrations) => handleProjectChange({ integrations })}
                />
            </TabButtons>

            <QuestionModal
                open={questionModalOpen}
                question="¿Deseas descartar los cambios no guardados?"
                onCancel={() => setQuestionModalOpen(false)}
                onConfirm={handleConfirmCancelModal}
            />

            <ActionBarButtons
                visible={isDirty}
                buttons={[
                    {
                        label: "Cancelar",
                        variant: "outlined",
                        color: "secondary",
                        icon: <ModeStandbyRoundedIcon />,
                        onClick: handleCancelChanges,
                    },
                    {
                        label: "Crear proyecto",
                        variant: "contained",
                        color: "primary",
                        icon: <LibraryAddCheckRoundedIcon />,
                        onClick: handleSave,
                        triggerOnEnter: true,
                        disabled: !project?.name || !project?.description,
                    },
                ]}
            />
        </>
    );
}; 