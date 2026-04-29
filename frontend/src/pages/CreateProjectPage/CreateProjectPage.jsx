import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";

import { useFetchAndLoad } from "../../hooks";
import { useAuth, useNotification } from "../../contexts";

import { isProjectEqual } from "./utils/isProjectEqual";
import { createProjectFormData } from "./utils/createProjectFormData";

import {
    FullScreenProgress,
    QuestionModal,
    TabButtons,
} from '../../generalComponents';

import { AssignResponsiblesPanel } from "./components/AssignResponsiblesPanel";
import { CreateProjectInfoPanel } from "./components/CreateProjectInfoPanel";
import { IntegrationsWithAPIsPanel } from "./components/IntegrationWithAPIsPanel";
import { ProjectPreviewPanel } from "./components/ProjectPreviewPanel";
import { ProjectBudgetPanel } from "./components/ProjectBudgetPanel";

import { createOperationalProjectApi } from "../../api";

export const CreateProjectPage = () => {
    const initialProject = {
        name: '',
        description: '',
        image_url: null,
        image_file: null,
        budget_amount: '',
        newResponsibles: [],
        integrations: [],
    };

    const [project, setProject] = useState({ ...initialProject });
    const [, setActiveTab] = useState(0);
    const [tabsHeight, setTabsHeight] = useState(0);
    const { notify } = useNotification();
    const { isSuperAdmin } = useAuth();
    const [isDirty, setIsDirty] = useState(false);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const { loading, callEndpoint } = useFetchAndLoad();
    const [isProjectValid, setIsProjectValid] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setIsDirty(!isProjectEqual(project, initialProject));
    }, [project]);

    const handleCreateProject = async () => {
        if (!project) {
            notify("Completa los datos del proyecto antes de guardar", "info");
            return;
        }

        try {
            const responsiblesIds = project.newResponsibles?.map((u) => u.id) ?? [];
            const projectToSend = {
                name: project.name,
                description: project.description,
                image_file: project.image_file ?? null,
                budget_amount: isSuperAdmin ? project.budget_amount : undefined,
                responsibles: responsiblesIds,
                integrations: project.integrations ?? [],
            };

            const formData = createProjectFormData(projectToSend);
            const newProject = await callEndpoint(createOperationalProjectApi(formData));

            notify("Proyecto creado correctamente", "success");
            navigate(`/proyecto/${newProject?.name}`, {
                replace: true,
                state: { id: newProject?.id },
            });
        } catch (error) {
            console.log(error);
            notify("Ocurrió un error inesperado al crear el proyecto. Inténtalo de nuevo más tarde.", "error");
        }
    };

    const handleProjectChange = (changes) => {
        setProject((prev) => {
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

    if (loading) return <FullScreenProgress text="Creando el proyecto" />;

    const labels = isSuperAdmin
        ? ["Información del proyecto", "Presupuesto", "Asignar Responsables", "Integraciones con apis", "Crear Proyecto"]
        : ["Información del proyecto", "Asignar Responsables", "Integraciones con apis", "Crear Proyecto"];

    return (
        <Box>
            <TabButtons
                labels={labels}
                onTabsHeightChange={(height) => setTabsHeight(height)}
                onChange={(newTab) => setActiveTab(newTab)}
                canChangeTab={(idx) => {
                    if (idx === 0) return true;

                    if (isSuperAdmin) {
                        if (idx === 1) return isProjectValid;
                        if (idx === 2) return isProjectValid;
                        if (idx === 3) return isProjectValid;
                        if (idx === 4) return isProjectValid;
                    } else {
                        if (idx === 1) return isProjectValid;
                        if (idx === 2) return isProjectValid;
                        if (idx === 3) return isProjectValid;
                    }

                    return false;
                }}
            >
                <CreateProjectInfoPanel
                    onChange={handleProjectChange}
                    panelHeight={tabsHeight}
                    project={project}
                    onValidationChange={setIsProjectValid}
                />

                {isSuperAdmin && (
                    <ProjectBudgetPanel
                        budgetAmount={project.budget_amount}
                        panelHeight={tabsHeight}
                        onChange={handleProjectChange}
                    />
                )}

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
        </Box>
    );
};
