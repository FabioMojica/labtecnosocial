import React, { memo, useEffect, useState, useCallback } from "react";
import { useHeaderHeight, useNotification } from "../../../contexts";
import { AssignResponsibleCheckBoxItem, ErrorScreen, FullScreenProgress, NoResultsScreen, SearchBar } from "../../../generalComponents";
import { useFetchAndLoad } from "../../../hooks";
import { getAllUsersApi } from "../../../api";
import { Box, Grid, Paper, Typography, useTheme, IconButton, Avatar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

import { useDebouncedCallback } from 'use-debounce';

const MemoizedCheckBoxItem = React.memo(
    ({ responsible, checked, onChange }) => {
        return (
            <AssignResponsibleCheckBoxItem
                responsible={responsible}
                checked={checked}
                onChange={onChange}
            />
        );
    },
    (prev, next) =>
        prev.checked === next.checked && prev.responsible.email === next.responsible.email
);


export const AssignResponsiblesPanel = ({ panelHeight, onChange }) => {
    const { headerHeight } = useHeaderHeight();
    const [users, setUsers] = useState([]);
    const height = `calc(100vh - ${headerHeight}px - ${panelHeight}px)`;
    const tallerHeight = `calc((${height}) * 0.70)`;
    const shorterHeight = `calc((${height}) * 0.30)`;
    const { loading, callEndpoint } = useFetchAndLoad();
    const [error, setError] = useState(false);
    const { notify } = useNotification();
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedResponsibles, setSelectedResponsibles] = useState(new Set());
    const theme = useTheme();
    const debouncedSetFilteredUsers = useDebouncedCallback((filtered) => {
        setFilteredUsers(filtered);
    }, 100);
    
useEffect(() => {
    if (users.length === 0) return; 
    const selectedUsers = users.filter(u => selectedResponsibles.has(u.email));
    onChange?.(selectedUsers);
}, [selectedResponsibles, users, onChange]);


    useEffect(() => {
        setFilteredUsers(users);
    }, [users]);

    const fetchAllUsers = async () => {
        try {
            const response = await callEndpoint(getAllUsersApi());
            setUsers(response);

            setError(false);
        } catch (err) {
            notify("Ocurrió un error inesperado al obtener los usuarios. Inténtalo de nuevo más tarde.", "error");
            setError(true);
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

const handleToggleResponsible = useCallback((email, checked) => {
    setSelectedResponsibles(prev => {
        const newSet = new Set(prev);
        if (checked) newSet.add(email);
        else newSet.delete(email);
        return newSet;
    });
}, []);

const handleRemoveResponsible = useCallback((email) => {
    setSelectedResponsibles(prev => {
        const newSet = new Set(prev);
        newSet.delete(email);
        return newSet;
    });
}, []);



    if (loading) { return <FullScreenProgress text={'Obteniendo usuarios'} /> }

    if (error) { return <ErrorScreen sx={{ height: '70vh' }} message="Ocurrió un error al obtener los usuarios" buttonText="Intentar de nuevo" onButtonClick={() => fetchAllUsers()} /> }

    if (users.length === 0) { return <NoResultsScreen message="No hay usuarios registrados en el sistema" sx={{ height: '70vh' }} /> }

    const assignedUsers = users.filter(u => selectedResponsibles.has(u.email));


    return (
        <Box
            sx={{
                width: "100%",
                minHeight: height,
                height: height,
                maxHeight: height,
                p: 1,
                display: "flex",
                flexDirection: "column",
                gap: 1,
            }}
        >
            <Grid container
                sx={{
                    width: '100%',
                    maxHeight: height,
                }}

            >
                {/* --- RESPONSABLES ASIGNADOS --- */}
                <Grid
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 12,
                        lg: 6
                    }}
                    sx={{
                        width: "100%",
                        height: { xs: shorterHeight, lg: height },
                        maxHeight: { xs: shorterHeight, lg: height },
                        p: 0.5,
                    }}
                >
                    <Paper
                        sx={{
                            width: "100%",
                            height: "100%",
                            p: 1,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Typography
                            variant="h5"
                            textAlign="center"
                            sx={{ fontSize: { xs: "0.9rem", sm: "1.4rem" } }}
                        >
                            Responsables asignados
                            {assignedUsers.length > 0 && ` (${assignedUsers.length})`}
                        </Typography>
                        <Box
                            sx={{
                                backgroundColor: "transparent",
                                flexGrow: 1,
                                overflowY: "auto",
                                "&::-webkit-scrollbar": { width: "2px" },
                                "&::-webkit-scrollbar-thumb": {
                                    backgroundColor: theme.palette.primary.main,
                                },
                                p: 1,
                                display: assignedUsers.length > 0 ? "grid" : "flex",
                                gridTemplateColumns: assignedUsers.length > 0 ? "repeat(auto-fill, minmax(100px, 1fr))" : undefined,
                                gap: 1,
                                justifyItems: "center",
                                alignContent: "flex-start",
                            }}
                        >
                            {assignedUsers.length > 0 ? (
                                assignedUsers.map((user) => (
                                    <Box
                                        key={user.email}
                                        sx={{
                                            position: "relative",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 1,
                                            p: 1,
                                            borderRadius: 2,
                                            backgroundColor: theme.palette.background.paper,
                                            width: 100,
                                            height: 110,
                                            boxShadow:
                                                theme.palette.mode === 'dark'
                                                    ? '0 4px 12px rgba(0,0,0,0.8)'
                                                    : 3,
                                        }}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveResponsible(user.email)}
                                            sx={{
                                                position: "absolute",
                                                top: 2,
                                                right: 2,
                                                zIndex: 2,
                                                backgroundColor: theme.palette.error.main,
                                                color: "#fff",
                                                "&:hover": {
                                                    backgroundColor: theme.palette.error.dark,
                                                },
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>

                                        <Avatar
                                            src={user.image_url
                                                ? `${API_UPLOADS}${user.image_url}`
                                                : undefined}
                                            sx={{
                                                width: '100%',
                                                height: '60%',
                                                borderRadius: 2,
                                                objectFit: 'cover',
                                                fontWeight: 'bold',
                                                zIndex: 1,
                                            }}
                                        >
                                            {user.firstName[0].toUpperCase()}
                                            {user.lastName[0].toUpperCase()}
                                        </Avatar>
                                        <Typography
                                            variant="body2"
                                            textAlign="center"
                                            sx={{
                                                fontSize: "0.75rem",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                width: "100%",
                                            }}
                                        >
                                            {user.firstName} {user.lastName}
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <NoResultsScreen
                                    message="Aún no hay responsables asignados"
                                    sx={{
                                        height: "100%",
                                        width: '100%',
                                        justifyContent: "center",
                                    }}
                                    textSx={{
                                        fontSize: {
                                            xs: '0.7rem',
                                            sm: '1.2rem'
                                        }
                                    }}
                                    iconSX={{
                                        fontSize: {
                                            xs: 50,
                                            sm: 90
                                        }
                                    }}
                                />
                            )}
                        </Box>
                    </Paper>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 12,
                        md: 12,
                        lg: 6
                    }}
                    sx={{
                        height: { xs: tallerHeight, lg: height },
                        maxHeight: { xs: tallerHeight, lg: height },
                        p: 0.5
                    }}
                >
                    <Paper sx={{ width: '100%', height: '100%', p: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant='h5' textAlign={'center'} sx={{ fontSize: { xs: '0.9rem', sm: '1.4rem' } }}>Seleccionar Responsables</Typography>
                        <Box
                            sx={{
                                width: '100%',
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: 0,
                            }}
                        >
                            {/* Barra de búsqueda (alto fijo) */}
                            <Box sx={{ flexShrink: 0, mb: 0.5 }}>
                                <SearchBar
                                    data={users}
                                    fields={['firstName', 'lastName', 'email']}
                                    placeholder="Buscar responsable..."
                                    // onResults={(filtered) => setFilteredUsers(filtered)}
                                    onResults={debouncedSetFilteredUsers}
                                />
                            </Box>

                            {/* Lista ocupa el resto del espacio */}
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    overflowY: 'auto',
                                    "&::-webkit-scrollbar": { width: "2px" },
                                    "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
                                    "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
                                    "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                    p: 1,
                                }}
                            >
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                    
                                        <MemoizedCheckBoxItem
                                            key={user.email}
                                            responsible={user}
                                            checked={selectedResponsibles.has(user.email)}
                                            onChange={checked => handleToggleResponsible(user.email, checked)}
                                        />
                                    ))
                                ) : (
                                    <NoResultsScreen
                                        message="No se encontraron usuarios que coincidan con la búsqueda"
                                        sx={{
                                            height: '100%',
                                            justifyContent: 'center',
                                        }}
                                        iconSX={{
                                            fontSize: 60,
                                            color: theme.palette.text.secondary,
                                        }}
                                    />
                                )}
                            </Box>
                        </Box>

                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}