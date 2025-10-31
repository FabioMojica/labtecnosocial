import { useTheme } from '@mui/material/styles';
import { Box, CssBaseline, IconButton, Stack, Toolbar, Typography, useMediaQuery } from "@mui/material";
import MuiDrawer from '@mui/material/Drawer';
import { useEffect, useState } from "react";
import { useFetchAndLoad } from '../../hooks';
import { useHeaderHeight, useNotification } from '../../contexts';
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
import { UserItem } from './components/UserItem';
import { UsersDrawer } from './components/UsersDrawer';
import { ViewUserDrawer } from './components/ViewUserDrawer';
import { getAllUsersApi } from '../../api';

export function UsersListPage() {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const { loading, callEndpoint } = useFetchAndLoad();
    const { notify } = useNotification();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const isLaptop = useMediaQuery(theme.breakpoints.up('md'));
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const { headerHeight } = useHeaderHeight();

    const handleUserClick = (user) => {
        setSelectedUser(user);
        if (isLaptop) {
            handleDrawerOpen();
        } else {
            navigate('/inicio');
        }
    };

    const fetchAllUsers = async () => {
        try {
            const response = await callEndpoint(getAllUsersApi());
            
            setUsers(response);
            setFilteredUsers(response);
            setError(false);
        } catch (err) {
            notify(err?.message, "error");
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
                message={"Ocurrió un problema al obtener los usuarios"}
                buttonText="Reintentar"
                onButtonClick={() => { fetchAllUsers }}
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

    return ( 
        <Box sx={{display: 'flex'}}>
            <CssBaseline />
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mt: { xs: 1, sm: 0} }}>
                <Box sx={{
                    display: 'flex', gap: 1, flexDirection: {
                        xs: 'column-reverse',
                        sm: 'row'
                    }
                }}>
                    <SearchBar
                        data={users}
                        fields={["firstName", "lastName", "email"]}
                        placeholder="Buscar usuarios..."
                        onResults={setFilteredUsers}
                    />
                    <ButtonWithLoader onClick={handleCreateUser} sx={{
                        gap: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                        width: {
                            xs: '100%',
                            sm: 200
                        },
                        minHeight: 40
                    }}>
                        <Typography>Crear Usuario</Typography>
                        <AddCircleOutlineRoundedIcon fontSize='small' />
                    </ButtonWithLoader>
                </Box>
                <Stack spacing={1}>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <UserItem key={user.id} user={user} onClick={() => handleUserClick(user)} />
                        )) 
                    ) : (
                        <Box sx={{ width: '100%', height: '50vh' }}>
                            <NoResultsScreen message="Búsqueda de usuarios sin resultados" />
                        </Box>
                    )}
                </Stack>
            </Box>

            <UsersDrawer variant="permanent" open={open} anchor='right'>
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
