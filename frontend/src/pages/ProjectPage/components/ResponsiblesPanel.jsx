import React, { useEffect, useRef, useState } from "react";
import { Box, Divider, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { SearchBar, NoResultsScreen, FullScreenProgress, AssignResponsibleCheckBoxItem, ErrorScreen } from "../../../generalComponents";
import { useHeaderHeight, useNotification } from "../../../contexts";
import CloseIcon from '@mui/icons-material/Close';

import { useFetchAndLoad } from "../../../hooks";
import { getAllUsersApi } from "../../../api";

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
);

export const ResponsiblesPanel = ({ panelHeight, responsibles, resetTrigger, onChange }) => {
    const { headerHeight } = useHeaderHeight();
    const theme = useTheme();
    const [viewResponsiblesPanel, setViewResponsiblesPanel] = useState(
        responsibles?.length > 0
    );
    const originalResponsibles = responsibles ?? [];
    const [allUsers, setAllUsers] = useState([]);
    const [filter, setFilter] = useState("originals");
    const [searchText, setSearchText] = useState("");
    const [filteredUsers, setFilteredUsers] = useState(originalResponsibles);
    const height = `calc(100vh - ${headerHeight}px - ${panelHeight}px)`;
    const { loading, callEndpoint } = useFetchAndLoad();
    const { notify } = useNotification();
    const [selectedUsers, setSelectedUsers] = useState(() => {
        const initial = {};
        responsibles.forEach((user) => {
            initial[user.email] = true;
        });
        return initial;
    });
    const [ errorFetchAllUsers, setErrorFetchAllUsers ] = useState(null);

    useEffect(() => {
        if ((responsibles?.length ?? 0) === 0) {
            setViewResponsiblesPanel(false);
            setFilter("news");
        } else {
            setFilter("originals");
            setViewResponsiblesPanel(true);
        }
    }, [responsibles]);

    const newsUsers = allUsers.filter(
        (user) => !originalResponsibles.some((orig) => orig.email === user.email)
    );

    useEffect(() => {
        const resetSelected = {};

        responsibles.forEach(user => {
            resetSelected[user.email] = true;
        });

        setSelectedUsers(resetSelected);
    }, [responsibles]);

    useEffect(() => {
        let usersToFilter = filter === "originals" ? originalResponsibles : newsUsers;

        if (searchText) {
            const lower = searchText.toLowerCase();
            usersToFilter = usersToFilter.filter(
                (user) =>
                    user.firstName.toLowerCase().includes(lower) ||
                    user.lastName.toLowerCase().includes(lower) ||
                    user.email.toLowerCase().includes(lower)
            );
        }

        setFilteredUsers(usersToFilter);
    }, [filter, searchText, originalResponsibles, allUsers]);

    const handleToggleUser = (user) => {
        setSelectedUsers((prev) => {
            const newChecked = !prev[user.email];
            const updated = { ...prev, [user.email]: newChecked };
            const preEliminados = originalResponsibles.filter(u => !updated[u.email]);
            const preAnadidos = newsUsers.filter(u => updated[u.email]);

            onChange?.({
                preEliminados,
                preAnadidos
            });
            return updated;
        });
    };
    const fetchAllUsers = async () => {
        try {
            const response = await callEndpoint(getAllUsersApi());
            setAllUsers(response);
            setErrorFetchAllUsers(false);
        } catch (err) {
            setErrorFetchAllUsers(true);
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, [])
    const handleToggleViewResponsiblesPanel = (valor) => {
        setViewResponsiblesPanel(valor);
    }
    const handleCloseCase1 = () => {
        handleToggleViewResponsiblesPanel(false);
        onChange?.({
            preEliminados: [],
            preAnadidos: []
        });
        const resetSelected = {};
        originalResponsibles.forEach(user => {
            resetSelected[user.email] = true;
        });
        newsUsers.forEach(user => {
            resetSelected[user.email] = false;
        });

        setSelectedUsers(resetSelected);
    }

    useEffect(() => {
        const resetSelected = {};
        originalResponsibles.forEach(user => {
            resetSelected[user.email] = true;
        });
        newsUsers.forEach(user => {
            resetSelected[user.email] = false;
        });
        setSelectedUsers(resetSelected);

        onChange?.({
            preEliminados: [],
            preAnadidos: []
        });

        if(responsibles.length === 0) {
            setViewResponsiblesPanel(false);
        }

        setFilter("originals");

    }, [resetTrigger]);


    const handleCloseCase2 = () => {
        const resetSelected = {};
        originalResponsibles.forEach(user => {
            resetSelected[user.email] = true;
        });
        newsUsers.forEach(user => {
            resetSelected[user.email] = false;
        });

        setSelectedUsers(resetSelected);
        onChange?.({
            preEliminados: [],
            preAnadidos: []
        });
        setFilter("originals");

    };

    const hasChanges =
        originalResponsibles.some(u => !selectedUsers[u.email]) ||
        newsUsers.some(u => selectedUsers[u.email]);


    if (loading) return <FullScreenProgress text="Obteniendo responsables" />;
    if (errorFetchAllUsers) return <ErrorScreen sx={{height: '70vh'}} message="Ocurrió un error inesperado al obtener los responsables del proyecto" buttonText="Intentar de nuevo" onButtonClick={() => fetchAllUsers()} />

    return (
        <Box
            sx={{
                width: "100%",
                minHeight: height,
                height: height,
                maxHeight: height,
                display: "flex",
                flexDirection: "column",
                gap: 1,
            }}
        >
            {!viewResponsiblesPanel && responsibles?.length === 0 ? (
                <NoResultsScreen
                    message='Este proyecto no tiene responsables asignados'
                    buttonText="Asignar Responsables"
                    onButtonClick={() => {
                        setFilter("news");
                        handleToggleViewResponsiblesPanel(true)
                    }}
                    sx={{ height: '70vh' }}
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
                />
            ) : (
                <Grid container
                    sx={{
                        width: '100%',
                        maxHeight: height,
                    }}
                >
                    <Grid
                        size={12}
                        sx={{
                            height: height,
                            p: 0.5
                        }}
                    >
                        <Paper sx={{ width: '100%', height: '100%', p: 1, display: 'flex', flexDirection: 'column', gap: 1, position: 'relative' }}>
                            <Typography variant='h5' textAlign={'center'} sx={{ fontSize: { xs: '1rem', sm: '1.4rem' } }}>
                                {
                                    responsibles?.length === 0 ? "Seleccionar Responsables" : "Responsables del proyecto"
                                }
                            </Typography>

                            {responsibles?.length === 0 && (
                                <Tooltip
                                    title={
                                        responsibles?.length === 0 ? "Cancelar" : "Descartar cambios"
                                    }
                                >
                                    <CloseIcon
                                        onClick={() => handleCloseCase1()}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 10,
                                            cursor: 'pointer',
                                            color: theme.palette.text.secondary,
                                            fontSize: 28,
                                            "&:hover": { color: theme.palette.error.main }
                                        }}
                                    />
                                </Tooltip>
                            )}

                            {(responsibles?.length > 0 && hasChanges) && (
                                <Tooltip title="Descartar cambios">
                                    <CloseIcon
                                        onClick={handleCloseCase2}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 10,
                                            cursor: 'pointer',
                                            color: theme.palette.text.secondary,
                                            fontSize: 28,
                                            "&:hover": { color: theme.palette.error.main }
                                        }}
                                    />
                                </Tooltip>
                            )}

                            <Box
                                sx={{
                                    width: '100%',
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: 0,
                                    gap: 1
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: {
                                            xs: 'column-reverse',
                                            lg: 'row',
                                        },
                                        gap: 1,
                                    }}
                                >
                                    <SearchBar
                                        data={filter === "originals" ? originalResponsibles : newsUsers}
                                        fields={['firstName', 'lastName', 'email']}
                                        placeholder="Buscar usuarios..."
                                        onResults={(results, query) => setSearchText(query)}
                                    />

                                    <FormControl size="small" sx={{ minWidth: 180 }}>
                                        <Select
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                        >
                                            <MenuItem value="originals">Originales</MenuItem>
                                            <MenuItem value="news">Asignar Nuevos</MenuItem>
                                        </Select>
                                    </FormControl>

                                </Box>

                                <Divider />

                                {/* Lista ocupa el resto del espacio */}
                                <Box
                                    sx={{
                                        flexGrow: 1,
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
                                                checked={!!selectedUsers[user.email]}
                                                onChange={() => handleToggleUser(user)}
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
            )}
        </Box>

    );
};
