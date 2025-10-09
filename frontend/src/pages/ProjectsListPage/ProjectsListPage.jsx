import { styled, useTheme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import { Box, IconButton, Stack, Toolbar, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthEffects, useFetchAndLoad } from '../../hooks';
import { useAuth, useNotification } from '../../contexts';

import {
    ButtonWithLoader,
    SearchBar,
    ErrorScreen,
    FullScreenProgress,
    NoResultsScreen
} from '../../generalComponents';

import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { useNavigate } from 'react-router-dom';
import { ProjectItem } from './components/ProjectItem';
import { ViewProjectDrawer } from './components/ViewProjectDrawer';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import { getAllOperationalProjectsApi } from '../../api';


const drawerWidth = 400;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    width: 0,
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({ open }) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                },
            },
        ],
    }),
);

export function ProjectsListPage() {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const { loading, callEndpoint } = useFetchAndLoad();
    const { notify } = useNotification();
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const isLaptop = useMediaQuery(theme.breakpoints.up('md'));
    const navigate = useNavigate();
    const { user } = useAuth();
    const [error, setError] = useState(false);
    const { handleLogout } = useAuthEffects();

    const handleProjectClick = (project) => {
        setSelectedProject(project);

        if (isLaptop) {
            handleDrawerOpen();
        } else {
            navigate(`/proyecto/${project.id}?tab=Información del proyecto`);
        }
    };

    const fetchAllProjects = async () => {
        try {
            const response = await callEndpoint(getAllOperationalProjectsApi());
            console.log(response);
            setProjects(response);
            setFilteredProjects(response);
            setError(false);
        } catch (err) {
            notify(err?.message, "error");
            setError(true);
        }
    }

    useEffect(() => {
        fetchAllProjects();
    }, [])

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleCreateProject = () => {
        navigate('/proyectos/crear');
    }

    if (!loading && projects.length === 0) {
        switch (user?.role) {
            case "admin":
                return <NoResultsScreen
                    message='Aún no tienes proyectos registrados'
                    buttonText="Crear uno"
                    triggerOnEnter
                    onButtonClick={() => navigate("/proyectos/crear")}
                />;
            case "coordinator":
                return <NoResultsScreen
                    message='Aún no tienes proyectos asignados'
                    buttonText="Ir al inicio"
                    onButtonClick={() => navigate("/inicio")}
                />;
            default:
                notify("Rol no encontrado, se cerrará la sesión", "error");
                handleLogout();
        }
    }

    if (loading) return <FullScreenProgress text="Obteniendo los proyectos" />


    if (error) {
        return (
            <ErrorScreen
                message={"Ocurrió un error al obtener los proyectos"}
                buttonText="Volver a intentar"
                onButtonClick={() => fetchAllProjects()}
            />
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                <Box sx={{
                    display: 'flex', gap: 1, flexDirection: {
                        xs: 'column-reverse',
                        sm: 'row'
                    }
                }}>
                    <SearchBar
                        data={projects}
                        fields={["name"]}
                        placeholder="Buscar proyectos..."
                        onResults={setFilteredProjects}
                    />
                    <ButtonWithLoader onClick={handleCreateProject} sx={{
                        gap: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                        width: {
                            xs: '100%',
                            sm: 200
                        },
                        minHeight: 40
                    }}>
                        <Typography>Crear Proyecto</Typography>
                        <AddCircleOutlineRoundedIcon fontSize='small' />
                    </ButtonWithLoader>
                </Box>
                <Stack spacing={1}>
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map(project => (
                            <ProjectItem
                                key={Number(project.id)}
                                project={project}
                                onClick={() => handleProjectClick(project)}
                            />
                        ))
                    ) : (
                        <Box sx={{ width: '100%', height: '50vh' }}>
                            <NoResultsScreen message="Búsqueda de proyectos sin resultados" />
                        </Box>
                    )}
                </Stack>
            </Box>

            <Drawer variant="permanent" open={open} anchor='right'>
                <Box sx={{ position: 'fixed', top: 2 }}>
                    <Toolbar></Toolbar>
                    <IconButton size='small' onClick={handleDrawerClose}>
                        <KeyboardArrowRightRoundedIcon fontSize='large' />
                    </IconButton>
                </Box>
                <ViewProjectDrawer project={selectedProject} />
            </Drawer>
        </Box>
    );
}
