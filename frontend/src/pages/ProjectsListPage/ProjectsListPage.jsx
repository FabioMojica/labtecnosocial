import { styled, useTheme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import {
    Box, IconButton, Stack, Toolbar, Typography, useMediaQuery,
    Select, MenuItem, FormControl, InputLabel,
    Divider
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
import { useLayout } from '../../contexts/LayoutContext';


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
    { label: "Menos responsables", value: "responsibles_asc" },
    { label: "Más responsables", value: "responsibles_desc" },
    { label: "Menos integraciones", value: "integrations_asc" },
    { label: "Más integraciones", value: "integrations_desc" },
    { label: "Más antiguos", value: "created_asc" },
    { label: "Menos antiguos", value: "created_desc" },
    { label: "Menos actualizados", value: "updated_asc" },
    { label: "Más actualizados", value: "updated_desc" },
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
    const { user, logout } = useAuth();
    const [error, setError] = useState(false);
    const [sortBy, setSortBy] = useState("name_asc");
    const { right } = useLayout();

    const displayedTitle = () => {
        if (user.role === 'admin') {
            return "Lista de proyectos"
        } else if (user.role === 'coordinator') {
            return "Proyectos asignados"
        } else {
            notify("Rol no encontrado, se cerrará la sesión", "error");
            logout();
        }
    }

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


    if (!loading && projects.length === 0 && !error) {
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
                logout();
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
        <Box sx={{ display: 'flex', p: 1, pr: 2 }}>
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                <Box sx={{
                    display: 'flex',
                    gap: 1,
                    flexDirection: 'column',
                    width: '100%',
                    mb: 1.5
                }}>
                    <Box display={'flex'} flexDirection={{ xs: 'column', sm: 'row' }} justifyContent={'space-between'} gap={1}>
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{
                                fontSize: {
                                    xs: '1.5rem',
                                    sm: '2rem'
                                },
                                width: { xs: '100%', sm: 'auto' },
                                textAlign: 'center',
                            }}
                        >
                            {displayedTitle()}{" "}
                            <Typography
                                component="span"
                                color="text.secondary"
                                fontWeight="normal"
                            >
                                ({projects.length})
                            </Typography>
                        </Typography>


                        {user.role === 'admin' && (
                            <ButtonWithLoader
                                onClick={handleCreateProject}
                                sx={{
                                    gap: 1,
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: {
                                        xs: "100%",
                                        sm: 250,
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
                        )}
                    </Box>

                    <Divider
                        sx={{
                            my: 0.5,
                        }}
                    />

                    <Box display={'flex'} flexDirection={{ xs: 'column-reverse', sm: 'row' }} gap={{ xs: 2 }}>
                        <SearchBar
                            data={projects}
                            fields={["name"]}
                            placeholder="Buscar proyectos por nombre..."
                            onResults={setFilteredProjects}
                        />
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Ordenar proyectos por</InputLabel>
                            <Select
                                value={sortBy}
                                label="Ordenar proyectos por"
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
                    </Box>

                    <Divider sx={{ mt: 0.5 }} />
                </Box>

                <Stack spacing={1.5}>
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
                                sx={{ height: '50vh' }}
                                message="Búsqueda de proyectos sin resultados"
                            />
                        </Box>
                    )}
                </Stack>
            </Box>

            <Drawer
                variant="permanent"
                open={open}
                anchor='right'
                sx={{
                    '& .MuiDrawer-paper': {
                        mr: `${right}px`,
                    },
                }}
            >
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
