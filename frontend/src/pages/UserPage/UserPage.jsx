import { Box, Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth, useNotification } from "../../contexts";

import { useFetchAndLoad } from "../../hooks";
import {
    ErrorScreen,
    FullScreenProgress,
} from "../../generalComponents";

import { getUserByEmailApi } from "../../api";
import { ViewUserInfoPanel } from "./components/ViewUserInfoPanel";
import { AdminTabButtons } from "./components/AdminTabButtons";
import { roleConfig } from "../../utils";

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
    const projectUpdatedRef = useRef(null);
    const [error, setError] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

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
    }, [userEmail]);


    if (!user) return <FullScreenProgress text="Obteniendo el usuario" />;
    if (loading) return <FullScreenProgress text="Obteniendo el usuario" />;
    if (error) return <ErrorScreen message="Ocurrió un error inesperado al obtener el usuario" buttonText="Intentar de nuevo" onButtonClick={() => fetchUserByEmail()} />

    let content = null;

    const handleUserChange = (updatedUser, meta = {}) => {
        setUser(updatedUser);

        if (meta.roleChanged) {
            notify(
                "El rol del usuario cambió. Actualizando vista.",
                "info"
            );
        } 

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
    const isCoordinator = userSession?.role === roleConfig.coordinator.value;


    if (loggingOut) return <FullScreenProgress text="Cerrando la sesión..." />;

    if(isSuperAdmin) {
        // Super admin viendo su propio perfil
        if(isOwnProfile) {
            content = <AdminTabButtons user={user} onUserChange={handleUserChange} isOwnProfile={isOwnProfile} />;
        } else if(user?.role === roleConfig.admin.value) {
            // Super admin viendo a un admin
            content = <AdminTabButtons user={user} onUserChange={handleUserChange} isOwnProfile={isOwnProfile} />;
        } else if (user?.role === roleConfig.coordinator.value) {
            // super admin viendo a un cordinador
            content = <AdminTabButtons user={user} onUserChange={handleUserChange} isOwnProfile={isOwnProfile} />;
        } else {
            return;
        }
    } else if (isAdmin) {
        console.log("is admin")
        // admin viendo su propio perfil
        if(isOwnProfile) {
            content = <AdminTabButtons user={user} onUserChange={handleUserChange} isOwnProfile={isOwnProfile} />;
        } else if(user?.role === roleConfig.superAdmin.value) {
            // admin viendo a un super admin
            content = <ViewUserInfoPanel user={user} isEditable={isOwnProfile} />;
        } else if (user?.role === roleConfig.coordinator.value) {
            // admin viendo a un cordinador
            content = <AdminTabButtons user={user} onUserChange={handleUserChange} isOwnProfile={isOwnProfile} />;
        } else {
            return;
        }
    } else if (isCoordinator) {
        content = <ViewUserInfoPanel user={user} isEditable={isOwnProfile} />;
    } else {
        return;
    }

    // if (isAdmin) {
    //     if (isOwnProfile) { 
    //         console.log("admin viendo a su perfil")
    //         content = <AdminTabButtons user={user} onUserChange={handleUserChange} isOwnProfile={isOwnProfile} />;
    //     } else if (user?.role === 'coordinator') {
    //         console.log("admin viendo a coordindador")
    //         content = <AdminTabButtons user={user} onUserChange={handleUserChange} isOwnProfile={isOwnProfile} />;
    //     } else if (user?.role === 'admin') {
    //         console.log("admin viendo a admin")
    //         content = <ViewUserInfoPanel user={user} isEditable={false} />;
    //     }
    // } else if (isCoordinator) {
    //     console.log("coordinador viendo")
    //     content = <ViewUserInfoPanel user={user} isEditable={isOwnProfile} />;
    // }

    return <>{content}</>;
}

