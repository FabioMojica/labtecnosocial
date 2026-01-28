import { Box, Button, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, useNotification } from "../../contexts";

import { useFetchAndLoad } from "../../hooks";
import {
    ErrorScreen,
    FullScreenProgress,
    QuestionModal,
    TabButtons
} from "../../generalComponents";

import { getProjectByIdApi, updateProjectApi } from "../../api";
import { roleConfig } from "../../utils";
import { ViewProject } from "./components/ViewProject";
import { MorePanel } from "./components/MorePanel";

export const ProjectPage = () => {
    const { loading, callEndpoint } = useFetchAndLoad();
    const [tabsHeight, setTabsHeight] = useState(0);
    const { notify } = useNotification();
    const location = useLocation();
    const id = location.state?.id;
    const navigate = useNavigate();
    const projectId = id;
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const [project, setProject] = useState(null);

    const { user: userSession } = useAuth();

    const fetchProjectById = async () => {
        if (!id) return;
        try {
            const resp = await callEndpoint(getProjectByIdApi(projectId));

            console.log(resp)

            setProject(resp);

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

            notify(err.message, "error");

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

    const handleProjectUpdated = (updatedProject) => {
        setProject(updatedProject);
    };


    let labels = [];
    let content;

    if (roleConfig.rolesArray.includes(userSession.role)) {
        if (userSession.role === roleConfig.superAdmin.value) {
            labels = ["Datos del proyecto", "Más"];
            content =
                <TabButtons
                    labels={labels}
                    onTabsHeightChange={(height) => setTabsHeight(height)}
                    onChange={(index) => setActiveTab(index)}
                >
                    <ViewProject projectData={project} onProjectUpdated={handleProjectUpdated} />
                    <MorePanel project={project} panelHeight={tabsHeight} isActive={activeTab === 1}/>
                </TabButtons>
        } else {
            content= <ViewProject projectData={project} onProjectUpdated={handleProjectUpdated} />
        }
    } else { 
        return; 
    } 
    if (loading) return <FullScreenProgress text="Obteniendo el proyecto" />;
    if (error) return <ErrorScreen message="Ocurrió un error inesperado al obtener el proyecto" buttonText="Intentar de nuevo" onButtonClick={() => fetchProjectById()} />
    if (!id) return <ErrorScreen message="Proyecto no encontrado" buttonText="Volver a proyectos" onButtonClick={() => navigate('/proyectos')} />;

    return ( 
        <> 
        {content}
        </>
    );
}

