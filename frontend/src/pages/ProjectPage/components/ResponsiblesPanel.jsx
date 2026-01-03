import React, { useEffect, useRef, useState } from "react";
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Stack } from "@mui/material";
import { SearchBar, NoResultsScreen, SelectComponent, FullScreenProgress } from "../../../generalComponents";
import { useHeaderHeight, useNotification } from "../../../contexts";

import { useFetchAndLoad } from "../../../hooks";
import { useResponsiblesPanel } from "../hooks/useResponsiblesPanel";

import { getFilteredResponsibles } from '../utils/responsible.utility';
import { renderResponsiblesList } from '../utils/responsibleReder.utility';
import { getAllUsersApi } from "../../../api";

export const ResponsiblesPanel = ({ panelHeight, responsibles, resetTrigger, onChange }) => {
    const { headerHeight } = useHeaderHeight();
    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const { loading, callEndpoint } = useFetchAndLoad();
    const { notify } = useNotification();
    const [searchResults, setSearchResults] = useState([]) || null;
    const [selectedView, setSelectedView] = useState("project");
    const hasFetchedAllUsers = useRef(false);
    const initialResponsibles = responsibles.map(r => ({
        id: Number(r.id),
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        image_url: r.image_url,
        projectCount: r.projectCount,
        role: (r).role,
        state: r.state,
    }));

    const {
        projectResponsibles,
        preEliminados,
        preAnadidos,
        removeResponsible,
        restoreResponsible,
        addPreResponsible,
        removePreResponsible,
        reset,
        initialRef
    } = useResponsiblesPanel(initialResponsibles, allUsers, onChange);

    const noInitialResponsibles = initialResponsibles.length === 0;

    useEffect(() => {
        if (!responsibles) return;

        initialRef.current = responsibles.map(r => ({
            id: Number(r.id),
            firstName: r.firstName,
            lastName: r.lastName,
            email: r.email,
            image_url: r.image_url,
            projectCount: r.projectCount,
            role: r.role,
            state: r.state,
        }));

        reset();
    }, [responsibles]);


    const dataToSearch = getFilteredResponsibles({
        selectedView,
        projectResponsibles,
        preEliminados,
        preAnadidos,
        allUsers
    });

    const fetchAllUsers = async () => {
        try {
            const response = await callEndpoint(getAllUsersApi());
            setAllUsers(response);
            setUsers(response);

        } catch (err) {
            notify(err?.message, "error");
        }
    };

    useEffect(() => {
        if (selectedView === "assign" && !hasFetchedAllUsers.current) {
            fetchAllUsers();
            hasFetchedAllUsers.current = true;
        }
    }, [selectedView]);

    const [hasSearched, setHasSearched] = useState(false);

    const handleSearchResults = (results) => {
        setSearchResults(results);
        setHasSearched(true);
    };

    const listToRender = hasSearched ? searchResults : dataToSearch;
    const hasResults = listToRender.length > 0;


    if (loading) return <FullScreenProgress text="Obteniendo usuarios" />;



    return (
        <Box
            sx={{
                width: "100%",
                minHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                height: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                maxHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                p: 1,
                display: "flex",
                flexDirection: "column",
                gap: 1,
            }}
        >
            <CssBaseline />
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{
                    display: "flex",
                    gap: 1,
                    flexDirection: {
                        xs: 'column-reverse',
                        sm: "row",
                    },
                }}>

                    <SearchBar
                        data={dataToSearch}
                        fields={["firstName", "lastName"]}
                        placeholder="Buscar..."
                        onResults={handleSearchResults}
                    />

                    <SelectComponent
                        options={[
                            { value: "project", label: "Responsables del proyecto" },
                            { value: "preEliminados", label: "Pre eliminados" },
                            { value: "assign", label: "Asignar nuevos responsables" },
                            { value: "preAnadidos", label: "Pre añadidos" },
                        ]}
                        value={selectedView}

                        onChange={(val) => {
                            setSelectedView(String(val));
                            setSearchResults([]);
                            setHasSearched(false);
                        }}
                        sx={{
                            maxWidth: {
                                xs: "100%",
                                sm: 250,
                            }
                        }}
                        height={40}
                        optionFontSize={{ sm: '0.9rem' }}
                    />
                </Box>

                {noInitialResponsibles && selectedView === "project" ? (
                    <NoResultsScreen
                        message="Este proyecto no tiene responsables asignados"
                        buttonText="Asignar responsables"
                        onButtonClick={() => setSelectedView("assign")}
                        sx={{ height: '50vh' }}
                    />
                ) : !hasResults ? (
                    selectedView === "assign" && allUsers.length > 0 && projectResponsibles.length === allUsers.length ? (
                        <NoResultsScreen
                            message="Todos los usuarios fueron añadidos al proyecto"
                            sx={{ height: '50vh' }}
                        />
                    ) : (
                        <NoResultsScreen
                            message="No se encontraron responsables"
                            sx={{ height: '50vh' }}
                        />
                    )
                ) : (
                    <Stack spacing={1} sx={{ width: "100%", pb: { sm: 15, xs: 150 } }}>
                        {renderResponsiblesList({
                            list: listToRender,
                            selectedView,
                            addPreResponsible,
                            removePreResponsible,
                            removeResponsible,
                            restoreResponsible
                        })}
                    </Stack>
                )}

            </Box>
        </Box>
    );
};
