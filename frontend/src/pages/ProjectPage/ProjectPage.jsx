import { Box, Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNotification } from "../../contexts";
import { ActionBarButtons } from "../../generalComponents";

import { useAuthEffects, useFetchAndLoad } from "../../hooks";
import {
    ErrorScreen,
    FullScreenProgress,
    QuestionModal,
    TabButtons
} from "../../generalComponents";

import ModeStandbyRoundedIcon from '@mui/icons-material/ModeStandbyRounded';
import LibraryAddCheckRoundedIcon from '@mui/icons-material/LibraryAddCheckRounded';
import { MorePanel } from "./components/MorePanel";
import { ResponsiblesPanel } from "./components/ResponsiblesPanel";
import { ProjectInfoPanel } from "./components/ProjectInfoPanel";
import { getProjectByIdApi, updateProjectApi } from "../../api";
import { updateProjectFormData } from "./utils/updateProjectFormData";
import { ProjectIntegrationsWithApisPanel } from "./components/ProjectIntegrationsWithApisPanel copy";

const areResponsiblesEqual = (
    a,
    b,
) => {

    if (a?.length !== b?.length) return false;

    const idsA = a?.map(r => r.id).sort();
    const idsB = b?.map(r => r.id).sort();

    return idsA?.every((id, index) => id === idsB?.[index]);
};


export const ProjectPage = () => {
    const [tabsHeight, setTabsHeight] = useState(0);
    const { loading, callEndpoint } = useFetchAndLoad();
    const { notify } = useNotification();
    const { id } = useParams();
    const { handleLogin, handleLogout } = useAuthEffects();

    const navigate = useNavigate();
    if (!id) return <ErrorScreen message="Proyecto no encontrado" buttonText="Volver a proyectos" onButtonClick={() => navigate('/proyectos')} />;
    const projectId = id;
    const [activeTab, setActiveTab] = useState("Información del proyecto");
    const [project, setProject] = useState(null);
    const originalProjectRef = useRef(null);
    const projectUpdatedRef = useRef(null);
    const [resetResponsiblesTrigger, setResetResponsiblesTrigger] = useState(0);
    const [isDirty, setIsDirty] = useState(false);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const [error, setError] = useState(false);

    const fetchProjectById = async () => {
        try {
            const resp = await callEndpoint(getProjectByIdApi(projectId));
            setProject(resp);
            originalProjectRef.current = structuredClone({
                ...resp,
                preEliminados: [],
                preAnadidos: []
            });
            projectUpdatedRef.current = resp;
            setError(false);
        } catch (err) {
            console.log("..............>", err);
            
            const errorMessage =
            err?.message ||
            err?.response?.data?.message ||
            "";
            if (errorMessage.includes("No tienes permisos para acceder a este proyecto")) {
                navigate("/404", { replace: true });
                return;
            }
            
            if (errorMessage.includes("Proyecto no encontrado")) {
                navigate("/404", { replace: true });
                return;
            }
            
            setError(true);
            
            notify(
                "Ocurrió un error inesperado al obtener el proyecto. Inténtalo de nuevo más tarde.",
                "error"
            );
        }

    }

    useEffect(() => {
        fetchProjectById();
    }, []);

    useEffect(() => {
        const urlTab = new URLSearchParams(window.location.search).get("tab");
        if (!urlTab) {
            navigate(`/proyecto/${id}?tab=Información del proyecto`, { replace: true });
        }
    }, [id, navigate]);

    const handleProjectChange = (changes) => {
        if (!project) return;

        const updatedProject = { ...project, ...changes };
        setProject(updatedProject);

        const original = originalProjectRef.current;

        const dirty =
            original &&
            (
                updatedProject.name !== original.name ||
                updatedProject.description !== original.description ||
                updatedProject.image_url !== original.image_url ||
                updatedProject.image_file !== original.image_file ||
                !areResponsiblesEqual(updatedProject.projectResponsibles, original.projectResponsibles) ||
                (updatedProject.preEliminados?.length ?? 0) > 0 ||
                (updatedProject.preAnadidos?.length ?? 0) > 0
            );

        setIsDirty(Boolean(dirty));
    };

    const handleSave = async () => {
        if (!project) return;

        try {
            const formData = updateProjectFormData(project);

            const resp = await callEndpoint(updateProjectApi(project.id, formData));

            setProject(resp);
            originalProjectRef.current = structuredClone({
                ...resp,
                preEliminados: [],
                preAnadidos: [],
            });

            projectUpdatedRef.current = resp;
            setIsDirty(false);
            notify("Proyecto actualizado exitosamente", "success");
        } catch (err) {
            notify("Ocurrió un error inesperado al actualizar el proyecto. Inténtalo de nuevo más tarde.", "error");

        }
    };


    const handleCancelChanges = () => setQuestionModalOpen(true);

    const handleConfirmCancelModal = () => {
        if (originalProjectRef.current) {
            setProject(structuredClone(originalProjectRef.current));
            setResetResponsiblesTrigger(prev => prev + 1);
        }
        setIsDirty(false);
        setQuestionModalOpen(false);
        notify("Cambios descartados correctamente", "success");
    };


    if (loading) return <FullScreenProgress text="Obteniendo el proyecto" />;
    if (error) return <ErrorScreen message="Ocurrió un error inesperado al obtener el proyecto" buttonText="Intentar de nuevo" onButtonClick={() => fetchProjectById()} />

    return (
        <>
        { project && 
        <>
        <TabButtons
                labels={["Información del proyecto", "Responsables", "Integraciones con apis", "Plan operativo", "Más"]}
                paramsLabels={["Información del proyecto", "Responsables", "Integraciones con apis", "Plan operativo", "Más"]}
                onTabsHeightChange={(height) => setTabsHeight(height)}
                onChange={(newTab) => setActiveTab(newTab)}
            >

                <ProjectInfoPanel onChange={handleProjectChange} panelHeight={tabsHeight} project={project} />

                <ResponsiblesPanel
                    panelHeight={tabsHeight}
                    responsibles={project?.projectResponsibles || []}
                    resetTrigger={resetResponsiblesTrigger}
                    onChange={(updatedData) =>
                        handleProjectChange({
                            projectResponsibles: updatedData.projectResponsibles,
                            preEliminados: updatedData.preEliminados,
                            preAnadidos: updatedData.preAnadidos
                        })
                    }
                />

                <ProjectIntegrationsWithApisPanel
                    panelHeight={tabsHeight}
                    selectedIntegrations={project?.integrations || []}
                    onChange={(newIntegrations) => handleProjectChange({ integrations: newIntegrations })}
                />

                <Box>Apis</Box>
                <MorePanel project={project} panelHeight={tabsHeight}></MorePanel>
            </TabButtons>

            <QuestionModal
                open={questionModalOpen}
                question="¿Deseas descartar los cambios no guardados?"
                onCancel={() => setQuestionModalOpen(false)}
                onConfirm={handleConfirmCancelModal}
            />

            {activeTab !== "Más" && (
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
                            label: "Guardar",
                            variant: "contained",
                            color: "primary",
                            icon: <LibraryAddCheckRoundedIcon />,
                            onClick: handleSave,
                            triggerOnEnter: true,
                            disabled: !project?.name || !project?.description,
                        },
                    ]}
                />
            )}</>
        }
        </>
    );
}

