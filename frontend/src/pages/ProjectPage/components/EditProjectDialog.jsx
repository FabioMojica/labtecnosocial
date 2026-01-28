import { Box, Button, Dialog, DialogActions, DialogTitle, Slide, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, useNotification } from "../../../contexts";

import { useFetchAndLoad } from "../../../hooks";
import {
    ButtonWithLoader,
    ErrorScreen,
    FullScreenProgress,
    QuestionModal,
    TabButtons
} from "../../../generalComponents";

import { ResponsiblesPanel } from "./ResponsiblesPanel";
import { ProjectInfoPanel } from "./ProjectInfoPanel";
import { updateProjectApi } from "../../../api";
import { updateProjectFormData } from "../utils/updateProjectFormData";
import { ProjectIntegrationsWithApisPanel } from "./ProjectIntegrationsWithApisPanel";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const EditProjectDialog = ({ open, onClose, projectData, onSaved }) => {
    const [tabsHeight, setTabsHeight] = useState(0);
    const { notify } = useNotification();

    const [isDirty, setIsDirty] = useState(false);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const [loadingupdateProject, setLoadingUpdatedProject] = useState(false);

    const [project, setProject] = useState(projectData);
    const [updatedProject, setUpdatedProject] = useState(projectData);
    const [projectErrors, setProjectErrors] = useState({});
    const { user: userSession } = useAuth();


    const handleProjectChange = (changes) => {
        if (!updatedProject) return;

        const newUpdatedProject = { ...updatedProject, ...changes };

        setUpdatedProject(newUpdatedProject);

        const original = project;

        const dirty =
            original &&
            (
                newUpdatedProject.name !== original.name ||
                newUpdatedProject.description !== original.description ||
                newUpdatedProject.image_url !== original.image_url ||
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
            const resp = await updateProjectApi(updatedProject.id, formData);

            const updated = structuredClone(resp);

            setProject(updated);
            setUpdatedProject(updated);
            setIsDirty(false);
 
            onSaved?.(updated);

            notify("Proyecto actualizado exitosamente.", "success");
            onClose();
        } catch (err) {
            notify(err.message, "error");
        } finally {
            setLoadingUpdatedProject(false)
        }
    }; 

    const handleCancelChanges = () => {
        setUpdatedProject(structuredClone(project));
        setIsDirty(false);
        setQuestionModalOpen(false);
        setProjectErrors({ name: "", description: "" });
        onClose();
    }

    let labels = ["Información del proyecto", "Responsables", "Integraciones con apis"]

    if (loadingupdateProject) return <FullScreenProgress text="Guardando cambios en el proyecto..." />;

    return (
        <>
            {project &&
                <Dialog
                    open={open}
                    fullWidth
                    maxWidth="xl"
                    fullScreen
                    slots={{
                        transition: Transition,
                    }}
                    PaperProps={{
                        style: {
                            height: '100vh',
                            display: 'flex',
                            flexDirection: 'column',
                        },
                    }}
                    aria-describedby="alert-dialog-slide-description"
                    onClose={(event, reason) => {
                        return;
                    }}
                >
                    <DialogTitle variant="h5" textAlign={'center'} fontWeight={'bold'}>
                        Editar Proyecto
                    </DialogTitle>
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            bgcolor: 'background.paper',
                            m: 2,
                            borderRadius: 2,
                            px: {
                                xs: 1,
                                lg: 2
                            }
                        }}
                    >
                        <TabButtons
                            labels={labels}
                            onTabsHeightChange={(height) => setTabsHeight(height)}
                        >
                            <ProjectInfoPanel
                                onChange={handleProjectChange}
                                panelHeight={tabsHeight}
                                project={updatedProject}
                                onErrorsChange={(errs) => setProjectErrors(errs)}
                            />

                            <ResponsiblesPanel
                                panelHeight={tabsHeight}
                                responsibles={updatedProject?.projectResponsibles || []}
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
                            />
                        </TabButtons>

                    </Box>
                    <DialogActions>
                        <Button
                            variant="contained"
                            color="error"
                            sx={{ width: '170px', height: '45px' }}
                            onClick={handleCancelChanges}
                            disabled={loadingupdateProject}
                        >
                            Cancelar edición
                        </Button>

                        <ButtonWithLoader
                            loading={loadingupdateProject}
                            onClick={handleSave}
                            disabled={
                                !project?.name ||
                                !project?.description ||
                                !!projectErrors?.name ||
                                !!projectErrors?.description || !isDirty
                            }
                            variant="contained"
                            backgroundButton={theme => theme.palette.success.main}
                            sx={{ color: 'white', px: 2, width: '170px' }}
                        >
                            Guardar Cambios
                        </ButtonWithLoader>
                    </DialogActions>
                </Dialog>
            }
        </>
    );
}

