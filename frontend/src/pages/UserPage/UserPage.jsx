import { Box, Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth, useNotification } from "../../contexts";
import { ActionBarButtons } from "../../generalComponents";

import { useAuthEffects, useFetchAndLoad } from "../../hooks";
import {
    ErrorScreen,
    FullScreenProgress,
} from "../../generalComponents";

import { getUserByEmailApi } from "../../api";
import { CoordinatorInfoPanel } from "./components/CoordinatorInfoPanel";
import { AdminTabButtons } from "./components/AdminTabButtons";

export const UserPage = () => {
    const { loading, callEndpoint } = useFetchAndLoad();
    const { handleLogin, handleLogout } = useAuthEffects();
    const { notify } = useNotification();
    const { email } = useParams();
    const navigate = useNavigate(); 
    if (!email) return <ErrorScreen message="Usuario no encontrado" buttonText="Volver a usuarios" onButtonClick={() => navigate('/usuarios')} />;
    const userEmail = email;
    const { user: userSession } = useAuth();
    const [user, setUser] = useState(null);
    const originalUserRef = useRef(null);
    const projectUpdatedRef = useRef(null);
    const [error, setError] = useState(false);

    const fetchUserByEmail = async () => {
        try {
            const resp = await callEndpoint(getUserByEmailApi(userEmail));
            setUser(resp);
            originalUserRef.current = structuredClone({
                ...resp,
                preEliminados: [],
                preAnadidos: []
            });
            projectUpdatedRef.current = resp;
            setError(false);
        } catch (err) {
            notify("Ocurrió un error inesperado al obtener el usuario. Inténtalo de nuevo más tarde.", "error");
            setError(true);
        }
    }

    useEffect(() => {
        fetchUserByEmail();
    }, []);

    useEffect(() => {
        const urlTab = new URLSearchParams(window.location.search).get("tab");
        if (!urlTab) {
            navigate(`/usuario/${email}?tab=Información del usuario`, { replace: true });
        }
    }, [userEmail, navigate]);

    if (loading) return <FullScreenProgress text="Obteniendo el usuario" />;
    if (error) return <ErrorScreen message="Ocurrió un error inesperado al obtener el usuario" buttonText="Intentar de nuevo" onButtonClick={() => fetchUserByEmail()} />

    return (
        <>
            {
                userSession.role === 'admin' ? (
                    <AdminTabButtons />
                ) : userSession.role === 'coordinator' ? (
                    <CoordinatorInfoPanel />
                ) : null
            }
        </>
    );
}

