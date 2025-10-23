import { Box, Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNotification } from "../../contexts";
import { ActionBarButtons } from "../../generalComponents";

import { useFetchAndLoad } from "../../hooks";
import {
    ErrorScreen,
    FullScreenProgress,
    QuestionModal,
    TabButtons
} from "../../generalComponents";

import ModeStandbyRoundedIcon from '@mui/icons-material/ModeStandbyRounded';
import LibraryAddCheckRoundedIcon from '@mui/icons-material/LibraryAddCheckRounded';
import { MorePanel } from "./components/MorePanel";
import { UserInfoPanel } from "./components/UserInfoPanel";
import { getUserByEmailApi } from "../../api";

export const UserPage = () => {
    const [tabsHeight, setTabsHeight] = useState(0);
    const { loading, callEndpoint } = useFetchAndLoad();
    const { notify } = useNotification();
    const { email } = useParams();

    const navigate = useNavigate();
    if (!email) return <ErrorScreen message="Usuario no encontrado" buttonText="Volver a usuarios" onButtonClick={() => navigate('/usuarios')} />;
    const userEmail = email;
    const [activeTab, setActiveTab] = useState("Información del usuario");
    const [user, setUser] = useState(null);
    const originalUserRef = useRef(null);
    const projectUpdatedRef = useRef(null);
    const [resetResponsiblesTrigger, setResetResponsiblesTrigger] = useState(0);
    const [isDirty, setIsDirty] = useState(false);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const [error, setError] = useState(false);

    const fetchUserByEmail = async () => {
        try {
            const resp = await callEndpoint(getUserByEmailApi(userEmail));
            console.log("usuario llegando>>>>>>>>>>>>>>>>>>>>>>>", resp);
            setUser(resp);
            originalUserRef.current = structuredClone({
                ...resp,
                preEliminados: [],
                preAnadidos: []
            }); 
            projectUpdatedRef.current = resp;
            setError(false);
        } catch (err) {
            notify(err?.message, "error");
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

    const handleUserChange = (changes) => {
        if (!user) return;

        const updatedUser = { ...user, ...changes };
        setUser(updatedUser);

        const original = originalUserRef.current;

        const dirty =
            original &&
            (
                updatedUser.name !== original.name ||
                updatedUser.description !== original.description ||
                updatedUser.image_url !== original.image_url ||
                updatedUser.image_file !== original.image_file ||
                !areResponsiblesEqual(updatedUser.projectResponsibles, original.projectResponsibles) ||
                (updatedUser.preEliminados?.length ?? 0) > 0 ||
                (updatedUser.preAnadidos?.length ?? 0) > 0
            );

        setIsDirty(Boolean(dirty));
    };

    const handleSave = async () => {
        if (!user) return;

        try {
            console.log("user antes del form data", user);
            const formData = updateProjectFormData(user);

            const resp = await callEndpoint(updateProjectApi(user.email, formData));

            setUser(resp);
            originalUserRef.current = structuredClone({
                ...resp,
                preEliminados: [],
                preAnadidos: [],
            });

            projectUpdatedRef.current = resp;
            setIsDirty(false);
            notify("Usuario actualizado exitosamente", "success");
        } catch (err) {
            notify(err?.message, "error");
        }
    };

    const handleCancelChanges = () => setQuestionModalOpen(true);

    const handleConfirmCancelModal = () => {
        if (originalUserRef.current) {
            setUser(structuredClone(originalUserRef.current));
        }
        setIsDirty(false);
        setQuestionModalOpen(false);
        notify("Cambios descartados correctamente", "success");
    };


    if (loading) return <FullScreenProgress text="Obteniendo el usuario" />;
    if (error) return <ErrorScreen message="Ocurrió un error inesperado al obtener el usuario" buttonText="Intentar de nuevo" onButtonClick={() => fetchUserByEmail()} />

    return (
        <>
            <TabButtons
                labels={["Información del usuario", "Proyectos asignados", "Más"]}
                paramsLabels={["Información del usuario", "Proyectos asignados", "Más"]}
                onTabsHeightChange={(height) => setTabsHeight(height)}
                onChange={(newTab) => setActiveTab(newTab)}
            >

                <UserInfoPanel onChange={handleUserChange} panelHeight={tabsHeight} user={user} />
                
                <Box>Hola</Box>
                <MorePanel user={user} panelHeight={tabsHeight}/> 
            </TabButtons>

            <QuestionModal
                open={questionModalOpen}
                question="¿Deseas descartar los cambios no guardados?"
                onCancel={() => setQuestionModalOpen(false)}
                onConfirm={handleConfirmCancelModal}
            />

            {activeTab !== "Más" && (
                <ActionBarButtons
                    visible={isDirty}
                    buttons={[
                        {
                            label: "Cancelar",
                            variant: "outlined",
                            color: "secondary",
                            icon: <ModeStandbyRoundedIcon />,
                            onClick: handleCancelChanges,
                        },
                        {
                            label: "Guardar",
                            variant: "contained",
                            color: "primary",
                            icon: <LibraryAddCheckRoundedIcon />,
                            onClick: handleSave,
                            triggerOnEnter: true,
                            disabled: !user?.name || !user?.description,
                        }, 
                    ]}
                />
            )}
        </>
    );
}

