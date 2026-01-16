import { useTheme } from '@mui/material/styles';
import { Box, CssBaseline, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Toolbar, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import { useFetchAndLoad } from '../../hooks';
import { useNotification } from '../../contexts';
import {
    SearchBar,
    ButtonWithLoader,
    ErrorScreen,
    FullScreenProgress,
    NoResultsScreen
} from '../../generalComponents';

import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { useNavigate } from 'react-router-dom';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import { UsersDrawer } from './components/UsersDrawer';
import { ViewUserDrawer } from './components/ViewUserDrawer';
import { getAllUsersApi } from '../../api';
import { UserItem } from './components/UserItem';
import { useLayout } from '../../contexts/LayoutContext';


const sortOptions = [
    { label: "Nombre A → Z", value: "name_asc" },
    { label: "Nombre Z → A", value: "name_desc" },
    { label: "Más proyectos asignados", value: "projects_desc" },
    { label: "Menos proyectos asignados", value: "projects_asc" },
    { label: "Más antiguos", value: "created_asc" },
    { label: "Menos antiguos", value: "created_desc" },
];


export function UsersListPage() {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const { loading, callEndpoint } = useFetchAndLoad();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const isLaptop = useMediaQuery(theme.breakpoints.up('md'));
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [sortBy, setSortBy] = useState("name_asc");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [searchedUsers, setSearchedUsers] = useState([]);
    const { right } = useLayout();

    useEffect(() => {
        setSearchedUsers(users);
    }, [users]);

    const handleUserClick = (user) => {
        setSelectedUser(user);
        if (isLaptop) {
            handleDrawerOpen();
        } else {
            navigate(`/usuario/${encodeURIComponent(user.email)}`)
        }
    };

    const fetchAllUsers = async () => {
        try {
            const response = await callEndpoint(getAllUsersApi());
            setUsers(response);
            setFilteredUsers(response);
            setError(false);
        } catch (err) {
            setError(true);
        }
    }

    useEffect(() => {
        fetchAllUsers();
    }, [])

    if (loading) return <FullScreenProgress text="Obteniendo los usuarios" />

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    if (error) {
        return (
            <ErrorScreen
                message={"Ocurrió un error al obtener los usuarios"}
                buttonText="Volver a intentar"
                onButtonClick={() => fetchAllUsers()}
            />
        );
    }

    const handleCreateUser = () => {
        navigate('/usuarios/crear')
    }

    if (!loading && users.length === 0) {
        return (
            <NoResultsScreen
                message='Aún no tienes usuarios registrados'
                buttonText="Crear uno"
                triggerOnEnter
                onButtonClick={() => navigate("/usuarios/crear")}
            />
        );
    }

    const filterUsers = (usersArray) => {
        return usersArray.filter((user) => {
            const statusOk =
                statusFilter === "all" || user.state === statusFilter;

            const roleOk =
                roleFilter === "all" || user.role === roleFilter;

            return statusOk && roleOk;
        });
    };

    const sortUsers = (usersArray) => {
        const sorted = [...usersArray];

        switch (sortBy) {
            // 1️⃣ Alfabético
            case "name_asc":
                sorted.sort((a, b) =>
                    `${a.firstName} ${a.lastName}`.localeCompare(
                        `${b.firstName} ${b.lastName}`
                    )
                );
                break;

            case "name_desc":
                sorted.sort((a, b) =>
                    `${b.firstName} ${b.lastName}`.localeCompare(
                        `${a.firstName} ${a.lastName}`
                    )
                );
                break;

            // 2️⃣ Más / menos proyectos
            case "projects_desc":
                sorted.sort(
                    (a, b) => (b.projectCount ?? 0) - (a.projectCount ?? 0)
                );
                break;

            case "projects_asc":
                sorted.sort(
                    (a, b) => (a.projectCount ?? 0) - (b.projectCount ?? 0)
                );
                break;

            // 3️⃣ Más antiguos / menos antiguos
            case "created_asc":
                sorted.sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at)
                );
                break;

            case "created_desc":
                sorted.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                break;

            default:
                break;
        }

        return sorted;
    }; 

    const displayedUsers = sortUsers(
        filterUsers(searchedUsers)
    );



    return (

        <Box sx={{ display: 'flex', px: 1, py: {xs: 1, lg: 0}}}> 
            <CssBaseline /> 

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
                            Lista de usuarios{" "}
                            <Typography
                                component="span"
                                color="text.secondary"
                                fontWeight="normal"
                            >
                                ({users.length})
                            </Typography>
                        </Typography>




                        <ButtonWithLoader onClick={handleCreateUser} sx={{
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
                        }}>
                            <Typography>Crear Usuario</Typography>
                            <AddCircleOutlineRoundedIcon fontSize='small' />
                        </ButtonWithLoader>

                    </Box>

                    <Divider
                        sx={{
                            my: 0.5,
                        }}
                    />

                    <Box display={'flex'} flexDirection={{ xs: 'column-reverse', lg: 'row' }} gap={{ xs: 2 }}>
                        <SearchBar
                            data={users}
                            fields={["firstName", "lastName", "email"]}
                            placeholder="Buscar usuarios..."
                            onResults={setSearchedUsers}
                        />
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Ordenar usuarios por</InputLabel>
                            <Select
                                value={sortBy}
                                label="Ordenar usuarios por"
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

                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Estado"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="all">Todos</MenuItem>
                                <MenuItem value="habilitado">Solo habilitados</MenuItem>
                                <MenuItem value="deshabilitado">Solo deshabilitados</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Rol</InputLabel>
                            <Select
                                value={roleFilter}
                                label="Rol"
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <MenuItem value="all">Todos</MenuItem>
                                <MenuItem value="admin">Administradores</MenuItem>
                                <MenuItem value="coordinator">Coordinadores</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Divider sx={{ mt: 0.5 }} />
                </Box>




                <Stack spacing={1.5}>
                    {displayedUsers.length > 0 ? (
                        displayedUsers.map(user => (
                            <UserItem key={user.id} user={user} onClick={() => handleUserClick(user)} />
                        ))
                    ) : (
                        <Box sx={{ width: '100%' }}>
                            <NoResultsScreen
                                sx={{ height: '50vh' }}
                                message="Búsqueda de usuarios sin resultados"
                            />
                        </Box>
                    )}
                </Stack>
            </Box>

            <UsersDrawer 
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
                <ViewUserDrawer user={selectedUser} />
            </UsersDrawer>
        </Box>
    );
}
