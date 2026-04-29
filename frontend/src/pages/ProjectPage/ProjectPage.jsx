import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, useNotification } from "../../contexts";
import { useFetchAndLoad } from "../../hooks";
import {
  ErrorScreen,
  FullScreenProgress,
  TabButtons,
} from "../../generalComponents";
import { getProjectByIdApi } from "../../api";
import { roleConfig } from "../../utils";
import { ViewProject } from "./components/ViewProject";
import { MorePanel } from "./components/MorePanel";
import { ProjectBudgetRequestsPanel } from "./components/ProjectBudgetRequestsPanel";

export const ProjectPage = () => {
  const { loading, callEndpoint } = useFetchAndLoad();
  const [tabsHeight, setTabsHeight] = useState(0);
  const { notify } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.state?.id;
  const projectId = id;
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [project, setProject] = useState(null);
  const { user: userSession } = useAuth();

  const fetchProjectById = async () => {
    if (!id) return;

    try {
      const resp = await callEndpoint(getProjectByIdApi(projectId));
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
  };

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
      labels = ["Perfil del proyecto", "Solicitudes al presupuesto", "Más"];
      content = (
        <TabButtons
          labels={labels}
          onTabsHeightChange={(height) => setTabsHeight(height)}
          onChange={(index) => setActiveTab(index)}
        >
          <ViewProject projectData={project} onProjectUpdated={handleProjectUpdated} />
          <ProjectBudgetRequestsPanel project={project} panelHeight={tabsHeight} />
          <MorePanel project={project} panelHeight={tabsHeight} isActive={activeTab === 2} />
        </TabButtons>
      );
    } else if (userSession.role === roleConfig.admin.value) {
      labels = ["Perfil del proyecto", "Tus solicitudes al presupuesto"];
      content = (
        <TabButtons
          labels={labels}
          onTabsHeightChange={(height) => setTabsHeight(height)}
          onChange={(index) => setActiveTab(index)}
        >
          <ViewProject projectData={project} onProjectUpdated={handleProjectUpdated} />
          <ProjectBudgetRequestsPanel project={project} panelHeight={tabsHeight} />
        </TabButtons>
      );
    } else {
      content = <ViewProject projectData={project} onProjectUpdated={handleProjectUpdated} />;
    }
  } else {
    return null;
  }

  if (loading) return <FullScreenProgress text="Obteniendo el proyecto" />;
  if (error) {
    return (
      <ErrorScreen
        message="Ocurrió un error inesperado al obtener el proyecto"
        buttonText="Intentar de nuevo"
        onButtonClick={() => fetchProjectById()}
      />
    );
  }
  if (!id) {
    return (
      <ErrorScreen
        message="Proyecto no encontrado"
        buttonText="Volver a proyectos"
        onButtonClick={() => navigate("/proyectos")}
      />
    );
  }

  return <>{content}</>;
};

