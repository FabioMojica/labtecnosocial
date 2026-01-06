// 1. Librerías externas
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// 2. Hooks personalizados
import { useAuthEffects, useFetchAndLoad } from "../../hooks";
import { useNotification } from "../../contexts";

// 3. Utilidades / helpers
import { isProjectEqual } from "./utils/isProjectEqual";
import { createProjectFormData } from "./utils/createProjectFormData";

// 4. Componentes
import {
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
import { ProjectPreviewPanel } from "./components/ProjectPreviewPanel";

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
    const [tabsHeight, setTabsHeight] = useState(0);
    const { notify } = useNotification();
    const [isDirty, setIsDirty] = useState(false);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const { loading, callEndpoint } = useFetchAndLoad();
    const [isProjectValid, setIsProjectValid] = useState(false);
    

    const navigate = useNavigate();
    useEffect(() => {
        setIsDirty(!isProjectEqual(project, initialProject));
    }, [project]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    const handleCreateProject = async () => {
        if (!project) {
            notify("Completa los datos del proyecto antes de guardar", "info");
            return;
        }
        try {
            const responsiblesIds = project.newResponsibles?.map(u => u.id) ?? [];

            const projectToSend = {
                name: project.name,
                description: project.description,
                image_file: project.image_file ?? null,
                responsibles: responsiblesIds,
                integrations: project.integrations ?? [],
            };
            const formData = createProjectFormData(projectToSend);
            await callEndpoint(createOperationalProjectApi(formData));
            notify("Proyecto creado correctamente", "success");
            navigate('/proyectos', { replace: true });
        } catch (error) {
            notify(error?.message || "Ocurrió un error inesperado al crear el proyecto. Inténtalo de nuevo más tarde.", "error");
        }
    };

    const handleProjectChange = (changes) => {
        setProject(prev => {
            if (!prev) return prev;
            return { ...prev, ...changes };
        });
    };

    const handleResponsiblesChange = useCallback(
        (newSelected) => {
            handleProjectChange({ newResponsibles: newSelected });
        },
        []
    );


    const handleConfirmCancelModal = () => {
        setProject({ ...initialProject });
        setIsDirty(false);
        setQuestionModalOpen(false);
        notify("Cambios descartados correctamente", "info");
        navigate('/proyectos', { replace: true });
    };


    if (loading) return <FullScreenProgress text="Creando el proyecto" />

    return (
        <>
            <TabButtons
                labels={["Información del proyecto", "Asignar Responsables", "Integraciones con apis", "Crear Proyecto"]}
                paramsLabels={["información", "asignarResponsables", "integrarAPIs", "crearProyecto"]}
                onTabsHeightChange={(height) => setTabsHeight(height)}
            >
                <CreateProjectInfoPanel
                    onChange={handleProjectChange}
                    panelHeight={tabsHeight}
                    project={project}
                    onValidationChange={setIsProjectValid}
                />

                <AssignResponsiblesPanel
                    panelHeight={tabsHeight}
                    onChange={handleResponsiblesChange}
                />

                <IntegrationsWithAPIsPanel
                    panelHeight={tabsHeight}
                    selectedIntegrations={project.integrations}
                    onChange={(integrations) => handleProjectChange({ integrations })}
                />

                <ProjectPreviewPanel
                    project={project}
                    panelHeight={tabsHeight}
                    onCancel={() => setQuestionModalOpen(true)}
                    onSave={handleCreateProject}
                    isProjectValid={isProjectValid}
                />
            </TabButtons>

            <QuestionModal
                open={questionModalOpen}
                question="¿Estás seguro de que quieres cancelar la creación del proyecto? Perderás todos los cambios y serás redirigido a la lista de proyectos."
                onConfirm={handleConfirmCancelModal}
                onCancel={() => setQuestionModalOpen(false)}
            />
        </>
    );
}; 