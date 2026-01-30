import {
    Box,
    Divider,
    IconButton,
    Tooltip,
    Typography

} from '@mui/material'
import { SelectProjectModal } from '../../generalComponents/SelectProjectModal';
import { useEffect, useState } from 'react';
import { useFetchAndLoad } from '../../hooks';
import { useAuth, useNotification } from '../../contexts';
import { ErrorScreen, FullScreenProgress, NoResultsScreen } from '../../generalComponents';
import { getOperationalProjectsWithIntegrationsApi } from '../../api';
import { useNavigate, useParams } from 'react-router-dom';
import { integrationsConfig } from '../../utils';
import { DashboardOutlined } from '@mui/icons-material';
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import { GitHubDashboard } from './components/GitHub/GitHubDashboard';
import { FacebookDashboard } from './components/Facebook/FacebookDashboard';
import { InstagramDashboard } from './components/Instagram/InstagramDashboard';
import { XDashboard } from './components/X/XDashboard';

export const APIsDashboardPage = () => {
    const { id } = useParams();
    const [projects, setProjects] = useState([]);
    const { loading, callEndpoint } = useFetchAndLoad();
    const [selectedProject, setSelectedProject] = useState(null);
    const { user } = useAuth();
    const [error, setError] = useState(false);
    const { notify } = useNotification();
    const navigate = useNavigate();
    const [selectedIntegration, setSelectedIntegration] = useState(null);
    

    const fetchProjectsWithIntegrations = async () => {
        try {
            setError(false);
            const res = await callEndpoint(getOperationalProjectsWithIntegrationsApi(user.email));
            setProjects(res);
        } catch (error) { 
            setError(true);
            notify(error.message, "error");
        }
    };


    useEffect(() => {
        fetchProjectsWithIntegrations();
    }, []);


    const handleProjectChange = (project) => {
        setSelectedProject(project);
        setSelectedIntegration(null);
    };

    if (loading) { return <FullScreenProgress text={'Obteniendo los proyectos con integraciones'} /> }

    if (error) { return <ErrorScreen message="Ocurrió un error al obtener los proyectos" buttonText='Volver a intentar' onButtonClick={() => { fetchProjectsWithIntegrations() }} /> }


    if (projects.length === 0) {
        return <NoResultsScreen message='No tienes ningún proyecto registrado en el sistema' buttonText={'Crear uno'} onButtonClick={() => { navigate('/proyectos/crear') }} />
    }
 
    const renderIntegrationDashboard = () => {
        switch (selectedIntegration) {
            case 'github':
                return <GitHubDashboard project={selectedProject} />;
            case 'facebook':
                return <FacebookDashboard project={selectedProject}/>;
            case 'instagram':
                return <InstagramDashboard project={selectedProject}/>;
            case 'x':
                return <XDashboard project={selectedProject} />;
            default:
                return null;
        }
    };

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
        }}>
            <Box sx={{ mb: 1, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>Dashboard</Typography>

                <Box sx={{ display: 'flex', gap: { xs: 0.5, lg: 2 }, alignItems: 'center' }}>
                    {
                        selectedProject && (
                            <Box variant='outlined' sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid #686666ff', borderRadius: 1, p: 1 }}>
                                <Typography variant="h4" fontWeight={'bold'} sx={{ fontSize: { xs: '0.8rem', sm: '0.7rem' }, mb: 1 }}>Dashboards disponibles</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {/* 🔹 Icono adicional de resumen general */}
                                    <Tooltip title="Resumen de todos los dashboards">
                                        <IconButton
                                            sx={(theme) => ({
                                                backgroundColor: theme.palette.primary.dark,
                                                color: "#ffffffff",
                                                "&:hover": {
                                                    backgroundColor:
                                                        theme.palette.mode === "light"
                                                            ? `${theme.palette.primary.main}CC`
                                                            : `${theme.palette.primary.main}88`,
                                                },
                                            })}
                                            onClick={() => setSelectedIntegration("resumen")}
                                            size='small'
                                        >
                                            <DashboardOutlined sx={{ fontSize: 20 }} />
                                        </IconButton>
                                    </Tooltip>

                                    {/* 🔹 Íconos de integraciones dinámicas */}
                                    {selectedProject?.integrations?.map((integration) => {
                                        const config = integrationsConfig[integration.platform];
                                        if (!config) return null;
                                        const IconComponent = config.icon;

                                        return (
                                            <Tooltip
                                                key={integration.id}
                                                title={
                                                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                                                        <Typography sx={{ fontSize: "0.75rem" }}>
                                                            Mantén presionado por 3 segundos para redirigirte al link de integración:
                                                        </Typography>
                                                        <Typography
                                                            sx={{
                                                                fontSize: "0.7rem",
                                                                color: "#ccc",
                                                                mt: 0.3,
                                                                textDecoration: "underline",
                                                                wordBreak: "break-all",
                                                            }}
                                                        >
                                                            {integration.url}
                                                        </Typography>
                                                    </Box>
                                                }
                                            >
                                                <IconButton
                                                    sx={(theme) => ({
                                                        backgroundColor: config.color,
                                                        color: "#fff",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                theme.palette.mode === "light"
                                                                    ? `${config.color}CC`
                                                                    : `${config.color}88`,
                                                        },
                                                    })}
                                                    onClick={() => setSelectedIntegration(integration.platform)}
                                                    onMouseDown={(e) => {
                                                        const timer = setTimeout(() => {
                                                            window.open(integration.url, "_blank");
                                                        }, 3000);
                                                        e.currentTarget.dataset.holdTimer = timer;
                                                    }}
                                                    onMouseUp={(e) => {
                                                        clearTimeout(e.currentTarget.dataset.holdTimer);
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        clearTimeout(e.currentTarget.dataset.holdTimer);
                                                    }}
                                                    size='small'
                                                >
                                                    <IconComponent sx={{ fontSize: 20 }} />
                                                </IconButton>
                                            </Tooltip>
                                        );
                                    })}
                                </Box>


                            </Box>
                        )
                    }
                    <SelectProjectModal
                        projects={projects}
                        selectedProject={selectedProject}
                        onChange={handleProjectChange}
                        loading={loading}
                    />
                </Box>
            </Box>

            <Box>
                {!selectedProject ? (
                    <NoResultsScreen
                        message="Seleccione un proyecto para ver los dashboards disponibles."
                        icon={<TouchAppRoundedIcon sx={{ fontSize: 90, color: 'text.secondary' }} />}
                        sx={{ height: '60vh', justifyContent: 'center' }}
                    />
                ) : selectedIntegration ? (
                    renderIntegrationDashboard()
                ) : (
                    <NoResultsScreen
                        message="Seleccione una opción de los dashboards disponibles para ver su contenido."
                        icon={<TouchAppRoundedIcon sx={{ fontSize: 90, color: 'text.secondary' }} />}
                        sx={{ height: '60vh', justifyContent: 'center' }}
                    />
                )}
            </Box>
        </Box>
    );
}