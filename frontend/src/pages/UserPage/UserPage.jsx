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
import { ViewUserInfoPanel } from "./components/ViewUserInfoPanel";
import { AdminTabButtons } from "./components/AdminTabButtons";

export const UserPage = () => {
    const { loading, callEndpoint } = useFetchAndLoad();
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
            console.log("userrrrrrrr", resp)
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
    }, [userEmail]);


    useEffect(() => {
        const urlTab = new URLSearchParams(window.location.search).get("tab");
        if (!urlTab) {
            navigate(`/usuario/${email}?tab=Información del usuario`, { replace: true });
        }
    }, [userEmail, navigate]);

    if (!user) return <FullScreenProgress text="Obteniendo el usuario" />;
    if (loading) return <FullScreenProgress text="Obteniendo el usuario" />;
    if (error) return <ErrorScreen message="Ocurrió un error inesperado al obtener el usuario" buttonText="Intentar de nuevo" onButtonClick={() => fetchUserByEmail()} />

    const isOwnProfile = userSession?.email === user?.email;
    const isAdmin = userSession?.role === 'admin';
    const isCoordinator = userSession?.role === 'coordinator';


    // Lógica de qué mostrar
    let content = null;

    if (isAdmin) {
        if (isOwnProfile) {
            content = <AdminTabButtons user={user} />;
        } else if (user?.role === 'coordinator') {
            content = <AdminTabButtons />;
        } else if (user?.role === 'admin') {
            // Admin viendo otro admin
            content = <ViewUserInfoPanel user={user} isEditable={false} />;
        }
    } else if (isCoordinator) {
        content = <ViewUserInfoPanel user={user} isEditable={isOwnProfile} />;
    }

    return <>{content}</>;

}

