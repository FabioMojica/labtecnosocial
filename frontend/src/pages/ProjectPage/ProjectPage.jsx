import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotification } from "../../contexts";

import { useFetchAndLoad } from "../../hooks";
import {
    ErrorScreen,
    FullScreenProgress,
    QuestionModal,
    TabButtons
} from "../../generalComponents";

import { MorePanel } from "./components/MorePanel";
import { ResponsiblesPanel } from "./components/ResponsiblesPanel";
import { ProjectInfoPanel } from "./components/ProjectInfoPanel";
import { getProjectByIdApi, updateProjectApi } from "../../api";
import { updateProjectFormData } from "./utils/updateProjectFormData";
import { ProjectIntegrationsWithApisPanel } from "./components/ProjectIntegrationsWithApisPanel";
import { FloatingActionButtons } from "./components/FloatingActionButtons";

export const ProjectPage = () => {
    const [tabsHeight, setTabsHeight] = useState(0);
    const { loading, callEndpoint } = useFetchAndLoad();
    const { notify } = useNotification();
    const location = useLocation();
    const id = location.state?.id;

    const navigate = useNavigate();

    const projectId = id;

    const [resetTrigger, setResetTrigger] = useState(0);
    const [isDirty, setIsDirty] = useState(false);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const [error, setError] = useState(false);
    const [loadingupdateProject, setLoadingUpdatedProject] = useState(false);

    const [project, setProject] = useState(null);
    const [updatedProject, setUpdatedProject] = useState(null);
    const [projectErrors, setProjectErrors] = useState({});


    const fetchProjectById = async () => {
        if (!id) return;
        try {
            const resp = await callEndpoint(getProjectByIdApi(projectId));

            console.log(resp)

            setProject(resp);
            setUpdatedProject(resp);

            setError(false);
        } catch (err) {
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
        }

    }

    useEffect(() => {
        fetchProjectById();
    }, []);

    const handleProjectChange = (changes) => {
        console.log(changes);
        if (!updatedProject) return;

        const newUpdatedProject = { ...updatedProject, ...changes };

        setUpdatedProject(newUpdatedProject);

        console.log(newUpdatedProject);

        const original = project;

        const dirty =
            original &&
            (
                newUpdatedProject.name !== original.name ||
                newUpdatedProject.description !== original.description ||
                newUpdatedProject.image_url !== original.image_url ||
                newUpdatedProject.image_file !== original.image_file || 
                (newUpdatedProject.preEliminados?.length ?? 0) > 0 ||
                (newUpdatedProject.preAnadidos?.length ?? 0) > 0 ||
                (newUpdatedProject.intEliminados?.length ?? 0) > 0 ||
                (newUpdatedProject.intAnadidos?.length ?? 0) > 0 
            );

        setIsDirty(Boolean(dirty));
    };

    const handleSave = async () => {
        if (!project) return;
        setLoadingUpdatedProject(true);

        try {
            const formData = updateProjectFormData(updatedProject);

            console.log("formmmmmmm", formData)

            const resp = await updateProjectApi(updatedProject.id, formData);

            const cloneProject = (data) => structuredClone(data);

            setProject(cloneProject(resp)); 
            setUpdatedProject(cloneProject(resp));

            setIsDirty(false);

            notify("Proyecto actualizado exitosamente.", "success");
            setProjectErrors({ name: "", description: "" });
            setResetTrigger(prev => prev + 1);
        } catch (err) {
            notify("Ocurrió un error inesperado al actualizar el proyecto. Inténtalo de nuevo más tarde.", "error");
        } finally { 
            setLoadingUpdatedProject(false)
        }
    };

    const handleCancelChanges = () => setQuestionModalOpen(true);

    const handleConfirmCancelModal = () => {
        setUpdatedProject(structuredClone(project)); 
        setIsDirty(false);
        setQuestionModalOpen(false);
        setProjectErrors({ name: "", description: "" });
        setResetTrigger(prev => prev + 1);
        notify("Cambios descartados correctamente.", "info");
    };

    if (loading) return <FullScreenProgress text="Obteniendo el proyecto" />;
    if (error) return <ErrorScreen message="Ocurrió un error inesperado al obtener el proyecto" buttonText="Intentar de nuevo" onButtonClick={() => fetchProjectById()} />
    if (!id) return <ErrorScreen message="Proyecto no encontrado" buttonText="Volver a proyectos" onButtonClick={() => navigate('/proyectos')} />;

    return (
        <>
            {project &&
                <>
                    <TabButtons
                        labels={["Información del proyecto", "Responsables", "Integraciones con apis", "Más"]}
                        onTabsHeightChange={(height) => setTabsHeight(height)}
                    >
                        <ProjectInfoPanel
                            onChange={handleProjectChange}
                            panelHeight={tabsHeight}
                            project={updatedProject}
                            onErrorsChange={(errs) => setProjectErrors(errs)}
                            resetTrigger={resetTrigger}
                        />
 
                        <ResponsiblesPanel
                            panelHeight={tabsHeight}
                            responsibles={updatedProject?.projectResponsibles || []}
                            resetTrigger={resetTrigger}
                            onChange={(updatedData) =>
                                handleProjectChange({
                                    preEliminados: updatedData.preEliminados,
                                    preAnadidos: updatedData.preAnadidos
                                })
                            } 
                        />
 
                        <ProjectIntegrationsWithApisPanel 
                            panelHeight={tabsHeight}
                            integrations={updatedProject?.integrations || []}
                            onChange={(updatedData) => handleProjectChange({
                                intEliminados: updatedData.intEliminados,
                                intAnadidos: updatedData.intAnadidos 
                            })}
                            resetTrigger={resetTrigger}
                        /> 

                        <MorePanel project={project} panelHeight={tabsHeight}></MorePanel>
                    </TabButtons>

                    <QuestionModal
                        open={questionModalOpen}
                        question="¿Deseas descartar los cambios no guardados?"
                        onCancel={() => setQuestionModalOpen(false)}
                        onConfirm={handleConfirmCancelModal}
                    />

                    <FloatingActionButtons
                        loading={loadingupdateProject}
                        visible={isDirty}
                        onSave={handleSave}
                        onCancel={handleCancelChanges}
                        saveDisabled={
                            !project?.name ||
                            !project?.description ||
                            !!projectErrors?.name ||
                            !!projectErrors?.description
                        }
                    />
                </>
            }
        </>
    );
}

