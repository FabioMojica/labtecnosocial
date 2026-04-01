import {
    Box,
    Button,
    Typography,
} from '@mui/material';
import { SelectProjectModal } from '../../generalComponents/SelectProjectModal';
import { useEffect, useState } from 'react';
import { useFetchAndLoad } from '../../hooks';
import { useAuth, useNotification } from '../../contexts';
import { ErrorScreen, FullScreenProgress, NoResultsScreen } from '../../generalComponents';
import { getOperationalProjectsWithIntegrationsApi } from '../../api';
import { useNavigate } from 'react-router-dom';
import { integrationsConfig } from '../../utils';
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { GitHubDashboard } from './components/GitHub/GitHubDashboard';
import { FacebookDashboard } from './components/Facebook/FacebookDashboard';
import { InstagramDashboard } from './components/Instagram/InstagramDashboard';

export const APIsDashboardPage = ({ showingDialog = false }) => {
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
        } catch (fetchError) {
            setError(true);
            notify(fetchError.message, 'error');
        }
    };

    useEffect(() => {
        fetchProjectsWithIntegrations();
    }, []);

    const handleProjectChange = (project) => {
        setSelectedProject(project);
        const defaultPlatform = project?.integrations?.find((item) => integrationsConfig[item?.platform])?.platform || null;
        setSelectedIntegration(defaultPlatform);
    };

    useEffect(() => {
        if (!selectedProject) return;
        const hasSelectedPlatform = selectedProject?.integrations?.some(
            (integration) => integration.platform === selectedIntegration
        );

        if (!hasSelectedPlatform) {
            const fallbackPlatform = selectedProject?.integrations?.find(
                (integration) => integrationsConfig[integration?.platform]
            )?.platform || null;
            setSelectedIntegration(fallbackPlatform);
        }
    }, [selectedProject, selectedIntegration]);

    if (loading) {
        return <FullScreenProgress text={'Obteniendo los proyectos con integraciones'} />;
    }

    if (error) {
        return (
            <ErrorScreen
                message='Ocurrio un error al obtener los proyectos'
                buttonText='Volver a intentar'
                onButtonClick={() => {
                    fetchProjectsWithIntegrations();
                }}
            />
        );
    }

    if (projects.length === 0) {
        return (
            <NoResultsScreen
                message='No tienes ningun proyecto registrado en el sistema'
                buttonText='Crear uno'
                onButtonClick={() => {
                    navigate('/proyectos/crear');
                }}
            />
        );
    }

    const renderIntegrationDashboard = () => {
        switch (selectedIntegration) {
            case 'github':
                return <GitHubDashboard showingDialog={showingDialog} project={selectedProject} />;
            case 'facebook':
                return <FacebookDashboard showingDialog={showingDialog} project={selectedProject} />;
            case 'instagram':
                return <InstagramDashboard showingDialog={showingDialog} project={selectedProject} />;
            default:
                return null;
        }
    };

    const availableIntegrations = (selectedProject?.integrations || []).filter(
        (integration) => Boolean(integrationsConfig[integration?.platform])
    );

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                overflowX: 'hidden',
            }}
        >
            <Box
                sx={{
                    mt: showingDialog ? 1 : 0,
                    px: showingDialog ? 1 : 0,
                    mb: 1,
                    display: 'flex',
                    flexDirection: { xs: 'column', lg: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', lg: 'center' },
                    gap: 1,
                }}
            >
                <Typography variant='h4' sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    Dashboard
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        gap: 1.2,
                        alignItems: { xs: 'stretch', lg: 'center' },
                        flexDirection: { xs: 'column', md: 'row' },
                        width: { xs: '100%', lg: 'auto' },
                    }}
                >
                    <SelectProjectModal
                        projects={projects}
                        selectedProject={selectedProject}
                        onChange={handleProjectChange}
                        loading={loading}
                        sx={{ width: { xs: '100%', md: 'auto' } }}
                    />

                    {selectedProject && (
                         <Box
                             sx={{
                                 display: 'flex',
                                 flexDirection: 'column',
                                 border: '1px solid',
                                 borderColor: 'divider',
                                 borderRadius: 2,
                                 px: 1.1,
                                 py: 1,
                                 minWidth: { xs: '100%', lg: 520 },
                                 bgcolor: 'background.paper',
                             }}
                         >
                            <Typography
                                variant='caption'
                                sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.3 }}
                            >
                                Plataforma del dashboard
                            </Typography>

                             <Box
                                 sx={{
                                     display: 'grid',
                                     gridTemplateColumns: {
                                         xs: 'repeat(2, minmax(0, 1fr))',
                                         lg: 'repeat(3, minmax(0, 1fr))',
                                     },
                                     gap: 0.8,
                                     mt: 0.8,
                                 }}
                             >
                                {availableIntegrations.map((integration) => {
                                    const config = integrationsConfig[integration.platform];
                                    if (!config) return null;

                                    const IconComponent = config.icon;
                                    const isActive = selectedIntegration === integration.platform;
                                    const integrationKey =
                                        integration.integration_id ??
                                        integration.id ??
                                        `${integration.platform}-${integration.url ?? 'no-url'}`;

                                    return (
                                        <Button
                                            key={integrationKey}
                                            onClick={() => setSelectedIntegration(integration.platform)}
                                            startIcon={<IconComponent sx={{ fontSize: 18 }} />}
                                            endIcon={isActive ? <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> : null}
                                            size='small'
                                            sx={{
                                                width: '100%',
                                                justifyContent: 'center',
                                                border: '1px solid',
                                                borderColor: isActive ? config.color : 'divider',
                                                borderRadius: 999,
                                                textTransform: 'none',
                                                px: { xs: 0.8, sm: 1.1 },
                                                color: isActive ? '#fff' : 'text.primary',
                                                bgcolor: isActive ? config.color : 'transparent',
                                                fontWeight: 700,
                                                fontSize: { xs: '0.8rem', sm: '0.87rem' },
                                                minHeight: 34,
                                                '&:hover': {
                                                    borderColor: config.color,
                                                    bgcolor: isActive ? `${config.color}CC` : 'action.hover',
                                                },
                                            }}
                                        >
                                            {config.label}
                                        </Button>
                                    );
                                })}
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            <Box>
                {!selectedProject ? (
                    <NoResultsScreen
                        message='Selecciona un proyecto para ver los dashboards disponibles.'
                        icon={<TouchAppRoundedIcon sx={{ fontSize: 90, color: 'text.secondary' }} />}
                        sx={{ height: '60vh', justifyContent: 'center' }}
                    />
                ) : selectedIntegration ? (
                    renderIntegrationDashboard()
                ) : (
                    <NoResultsScreen
                        message='Este proyecto no tiene plataformas de dashboard disponibles.'
                        icon={<TouchAppRoundedIcon sx={{ fontSize: 90, color: 'text.secondary' }} />}
                        sx={{ height: '60vh', justifyContent: 'center' }}
                    />
                )}
            </Box>
        </Box>
    );
};
