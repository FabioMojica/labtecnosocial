import { Box, Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth, useNotification } from "../../contexts";

import { useFetchAndLoad } from "../../hooks";
import {
    ErrorScreen,
    FullScreenProgress,
    NoResultsScreen,
} from "../../generalComponents";

import { getUserByEmailApi } from "../../api";
import { ViewUserInfoPanel } from "./components/ViewUserInfoPanel";
import { AdminTabButtons } from "./components/AdminTabButtons";
import { roleConfig } from "../../utils";
import { ViewUser } from "./components/ViewUser";

export const UserPage = () => {
    const { loading, callEndpoint } = useFetchAndLoad();
    const { notify } = useNotification();
    const { email } = useParams();
    const navigate = useNavigate();
    if (!email) return <ErrorScreen message="Usuario no encontrado" buttonText="Volver a usuarios" onButtonClick={() => navigate('/usuarios')} />;
    const userEmail = email;
    const { user: userSession, logout } = useAuth();
    const [user, setUser] = useState(null);
    const originalUserRef = useRef(null);
    const [error, setError] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [userNotFound, setUserNotFound] = useState(false);

    const fetchUserByEmail = async () => { 
        try {
            const resp = await callEndpoint(getUserByEmailApi(userEmail));
            setUser(resp);
            console.log(resp) 
            originalUserRef.current = structuredClone(resp);
            setError(false);
        } catch (err) {
            if (err.message.includes("Usuario no encontrado en el sistema")) {
                setUserNotFound(true);
            } else {
                notify(err.message, "error");
                setError(true);
            }
        }
    }

    useEffect(() => {
        fetchUserByEmail();
    }, [userEmail]);

    if (userNotFound) return <NoResultsScreen message="Usuario no encontrado en el sistema" buttonText={"Volver atrás"} onButtonClick={() => navigate(-1)} />
    if (loading) return <FullScreenProgress text="Obteniendo el usuario" />;
    if (error) return <ErrorScreen message="Ocurrió un error inesperado al obtener el usuario" buttonText="Intentar de nuevo" onButtonClick={() => fetchUserByEmail()} />

    let content = null;

    const handleUserChange = (updatedUser, meta = {}) => {
        setUser(updatedUser);

        if (meta.sensitiveChanged) {
            notify(
                "Se cerrará la sesión porque hiciste cambios en información sensible en tu perfil.",
                "warning",
                { persist: true }
            );
            setLoggingOut(true);
            setTimeout(() => logout(), 2000);
        }
    };

    const isOwnProfile = userSession?.email === user?.email;
    const isAdmin = userSession?.role === roleConfig.admin.value;
    const isSuperAdmin = userSession?.role === roleConfig.superAdmin.value;
    const isUser = userSession?.role === roleConfig.user.value;

    const userRoleSession = {
        isAdmin: isAdmin,
        isSuperAdmin: isSuperAdmin,
        isUser: isUser
    }

    if (loggingOut) return <FullScreenProgress text="Cerrando la sesión..." />;

    if (isSuperAdmin) {
        content = <AdminTabButtons user={user} onUserChange={handleUserChange} isOwnProfile={isOwnProfile} userRoleSession={userRoleSession} />;
    } else if (isAdmin) {
        if (isOwnProfile) { 
            content = <AdminTabButtons user={user} onUserChange={handleUserChange} isOwnProfile={isOwnProfile} userRoleSession={userRoleSession} />;
        } else if (user?.role === roleConfig.superAdmin.value) {
            content = <ViewUser user={user} onChange={handleUserChange} isOwnProfile={isOwnProfile} />;
        } else if (user?.role === roleConfig.admin.value) {
            content = <ViewUser user={user} onChange={handleUserChange} isOwnProfile={isOwnProfile} />;
        } else if (user?.role === roleConfig.user.value){
           content = <AdminTabButtons user={user} onUserChange={handleUserChange} isOwnProfile={isOwnProfile} userRoleSession={userRoleSession} />;
        } else {
            return;
        } 
    } else if (isUser) { 
        content = <ViewUser user={user} onChange={handleUserChange} isOwnProfile={isOwnProfile} />;
    } else {
        return;
    }

    return <>{content}</>;
}

