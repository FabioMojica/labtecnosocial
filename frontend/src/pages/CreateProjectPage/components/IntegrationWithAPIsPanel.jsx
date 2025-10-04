import { Grid } from "@mui/material";
import { useHeaderHeight, useNotification } from "../../../contexts";
import { useEffect, useState } from "react";
import { useFetchAndLoad } from "../../../hooks";

import { 
    ErrorScreen,
    NoResultsScreen,
    FullScreenProgress
} from "../../../generalComponents";

import { useNavigate } from "react-router-dom";
import { GithubApi } from './GitHubAPI';
import { FacebookApi } from './FacebookAPI';
import { InstagramApi } from './InstagramAPI';
import { XApi } from "./XAPI";
import { getAllUsersApi } from "../../../api";


export const IntegrationsWithAPIsPanel = ({ panelHeight, onChange, selectedUsers }) => {
    const { headerHeight } = useHeaderHeight();
    const [filteredResponsibles, setFilteredResponsibles] = useState([]);
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const { loading, callEndpoint } = useFetchAndLoad();
    const { notify } = useNotification();
    const navigate = useNavigate();
    const height = `calc(100vh - ${headerHeight}px - ${panelHeight}px)`;
    const [error, setError] = useState(false);

    const fetchAllUsers = async () => {
        try {
            const response = await callEndpoint(getAllUsersApi());
            setUsers(response);
            setFilteredResponsibles(response);
            setError(false);
        } catch (err) {
            notify(err?.message, "error");
            setError(true);
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

    useEffect(() => {
        let results = [...users];

        if (filter === "assigned") {
            results = users.filter((u) => selectedUsers.has(u.id));
        } else if (filter === "unassigned") {
            results = users.filter((u) => !selectedUsers.has(u.id));
        }

        setFilteredResponsibles(results);
    }, [filter, users, selectedUsers]);

    // const toggleUser = (userId: Number, checked: boolean) => {
    //     setSelectedUsers((prev) => {
    //         const newSet = new Set(prev);
    //         if (checked) {
    //             newSet.add(userId);
    //         } else {
    //             newSet.delete(userId);
    //         }
    //         onChange?.(Array.from(newSet));
    //         return newSet;
    //     });
    // };

    const getFinalResults = () => {
        let results = [...users];

        if (filter === "assigned") {
            results = users.filter((u) => selectedUsers.has(u.id));
        } else if (filter === "unassigned") {
            results = users.filter((u) => !selectedUsers.has(u.id));
        }

        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            results = results.filter(
                (u) =>
                    u.firstName.toLowerCase().includes(query) ||
                    u.lastName.toLowerCase().includes(query)
            );
        }

        return results;
    }; 

    useEffect(() => {
        setFilteredResponsibles(getFinalResults());
    }, [filter, users, selectedUsers, searchQuery]);

    if (loading) return <FullScreenProgress text="Obteniendo los usuarios" />
    if (error) return (
        <ErrorScreen
            message="Hubo un error obteniendo los usuarios"
            buttonText="Volver a intentar"
            onButtonClick={() => fetchAllUsers()}
            sx={{ height: height }}
        />);
    if (!loading && users.length === 0)
        return (
            <NoResultsScreen
                message="No tienes usuarios registrados en el sistema"
                buttonText="Crear uno"
                onButtonClick={() => navigate('/usuarios/crear')}
                sx={{ height: height }}
            />);

    return (
        <Grid
            sx={{
                width: "100%",
                p: 1
            }}
            container
            spacing={1}
            columns={4}
        >
            <Grid size={{sm: 4, md: 1, xs: 4}}>
                <GithubApi panelHeight={panelHeight}/>
            </Grid>
            <Grid size={{sm: 4, md: 1, xs: 4}}>
                <FacebookApi panelHeight={panelHeight}/>
            </Grid>
            <Grid size={{sm: 4, md: 1, xs: 4}}>
                <InstagramApi panelHeight={panelHeight} />
            </Grid>
            <Grid size={{sm: 4, md: 1, xs: 4}} sx={{backgroundColor: 'purple'}}>
                <XApi panelHeight={panelHeight}/>
            </Grid>
            {/* <Box
                sx={{
                    display: "flex",
                    gap: 1,
                    flexDirection: {
                        xs: 'column-reverse',
                        sm: "row",
                    },
                }}
            >
                <SearchBar
                    data={users}
                    fields={["firstName", "lastName"]}
                    placeholder="Buscar usuarios"
                    onResults={(_, query) => setSearchQuery(query)}
                />
                <SelectComponent
                    options={[
                        { value: "all", label: "Todos" },
                        { value: "assigned", label: "Asignados" },
                        { value: "unassigned", label: "No asignados" },
                    ]}
                    value={filter}
                    onChange={(val) => setFilter(val as string)}
                    sx={{
                        maxWidth: {
                            xs: "100%",
                            sm: 200,
                        },
                    }}
                    height={40}
                />
            </Box>

            <Stack spacing={1} sx={{ width: "100%", height: "75%" }}>
                {filteredResponsibles.length > 0 ? (
                    filteredResponsibles.map((user) => ( 
                        <AssignResponsibleCheckBoxItem
                            key={Number(user.id)}
                            responsible={user}
                            checked={selectedUsers.has(user.id)}
                            onChange={(checked) => toggleUser(user.id, checked)}
                        />
                    ))
                ) : (
                    <Box sx={{ width: "100%", height: "50vh" }}>
                        <NoResultsScreen message="No hay resultados" />
                    </Box>
                )}
            </Stack> */}
        </Grid>
    );
};
