import { styled, useTheme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import {
    Box, IconButton, Stack, Toolbar, Typography, useMediaQuery,
    Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
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

const sortOptions = [
    { label: "Nombre A → Z", value: "name_asc" },
    { label: "Nombre Z → A", value: "name_desc" },
    { label: "Responsables ↑", value: "responsibles_asc" },
    { label: "Responsables ↓", value: "responsibles_desc" },
    { label: "Integraciones ↑", value: "integrations_asc" },
    { label: "Integraciones ↓", value: "integrations_desc" },
    { label: "Fecha creación ↑", value: "created_asc" },
    { label: "Fecha creación ↓", value: "created_desc" },
    { label: "Fecha actualización ↑", value: "updated_asc" },
    { label: "Fecha actualización ↓", value: "updated_desc" },
];

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
    const [sortBy, setSortBy] = useState("name_asc");

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

    const sortProjects = (projectsArray, sortKey) => {
        const sorted = [...projectsArray];

        switch (sortKey) {
            case "name_asc":
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "name_desc":
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case "responsibles_asc":
                sorted.sort((a, b) => (a.projectResponsibles?.length ?? 0) - (b.projectResponsibles?.length ?? 0));
                break;
            case "responsibles_desc":
                sorted.sort((a, b) => (b.projectResponsibles?.length ?? 0) - (a.projectResponsibles?.length ?? 0));
                break;
            case "integrations_asc":
                sorted.sort((a, b) => (a.integrations?.length ?? 0) - (b.integrations?.length ?? 0));
                break;
            case "integrations_desc":
                sorted.sort((a, b) => (b.integrations?.length ?? 0) - (a.integrations?.length ?? 0));
                break;
            case "created_asc":
                sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case "created_desc":
                sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case "updated_asc":
                sorted.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
                break;
            case "updated_desc":
                sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
                break;
            default:
                break;
        }

        return sorted;
    };


    if (!loading && projects.length === 0) {
        switch (user?.role) {
            case "admin":
                return <NoResultsScreen
                    message='Aún no tienes proyectos registrados'
                    buttonText="Crear uno"
                    triggerOnEnter
                    onButtonClick={() => navigate("/proyectos/crear")}
                    buttonSx={{
                        backgroundColor: "primary.main",
                            color: "primary.contrastText",
                            "&:hover": {
                                backgroundColor: "primary.dark",
                            },
                            "&.Mui-disabled": {
                                backgroundColor: "action.disabledBackground",
                                color: "action.disabled",
                            },
                    }}
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

    const displayedProjects = sortProjects(filteredProjects, sortBy);

    return (
        <Box sx={{ display: 'flex' }}>
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mt: { xs: 1, sm: 0.5 } }}>
                <Box sx={{
                    display: 'flex', gap: 1.5, flexDirection: {
                        xs: 'column-reverse',
                        sm: 'row'
                    }
                }}>
                    <SearchBar
                        data={projects}
                        fields={["name"]}
                        placeholder="Buscar proyectos por nombre..."
                        onResults={setFilteredProjects}
                    />
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Ordenar por</InputLabel>
                        <Select
                            value={sortBy}
                            label="Ordenar por"
                            onChange={(e) => setSortBy(e.target.value)}
                            size="small"
                        >
                            {sortOptions.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <ButtonWithLoader
                        onClick={handleCreateProject}
                        sx={{
                            gap: 1,
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            width: {
                                xs: "100%",
                                sm: 300,
                            },
                            minHeight: 40,
                            backgroundColor: "primary.main",
                            color: "primary.contrastText",
                            "&:hover": {
                                backgroundColor: "primary.dark",
                            },
                            "&.Mui-disabled": {
                                backgroundColor: "action.disabledBackground",
                                color: "action.disabled",
                            },
                        }}
                    >

                        <Typography>Crear Proyecto</Typography>
                        <AddCircleOutlineRoundedIcon fontSize='small' />
                    </ButtonWithLoader>
                </Box>
                <Stack spacing={1}>
                    {displayedProjects.length > 0 ? (
                        displayedProjects.map(project => (
                            <ProjectItem
                                key={Number(project.id)}
                                project={project}
                                onClick={() => handleProjectClick(project)}
                            />
                        ))
                    ) : (
                        <Box sx={{ width: '100%' }}>
                            <NoResultsScreen
                                sx={{height: '50vh'}}
                                message="Búsqueda de proyectos sin resultados"
                            />
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
