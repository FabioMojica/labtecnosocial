// 1. Librerías externas
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModeStandbyRoundedIcon from '@mui/icons-material/ModeStandbyRounded';
import LibraryAddCheckRoundedIcon from '@mui/icons-material/LibraryAddCheckRounded';

// 2. Hooks personalizados
import { useFetchAndLoad } from "../../hooks";
import { useNotification } from "../../contexts";

// 3. Utilidades / helpers
import { isUserEqual } from "./utils/isUserEqual";
import { createUserFormData } from "./utils/createUserFormData";

// 4. Componentes
import {
    ActionBarButtons,
    FullScreenProgress,
    QuestionModal,
    TabButtons,
} from '../../generalComponents'
import { CreateUserInfoPanel } from "./components/CreateUserInfoPanel";


// 5. Servicios / UseCases
import { createUserApi } from "../../api";
import { Box, Divider, Typography } from "@mui/material";


// 6. Assets (imágenes, íconos)
// ninguno por ahora

// 7. Estilos
// ninguno por ahora

// 8. Tipos

export const CreateUserPage = () => {
    const initialUser = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'coordinator',
        state: 'habilitado',
    };
    const [user, setUser] = useState({ ...initialUser });
    const [tabsHeight, setTabsHeight] = useState(0);
    const { notify } = useNotification();
    const [isDirty, setIsDirty] = useState(false);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const { loading, callEndpoint } = useFetchAndLoad();
    const navigate = useNavigate();
    const boxRef = useRef(null);

    console.log("user antes de pasar", user);

    useEffect(() => {
        if (!boxRef.current) return;

        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                setTabsHeight(entry.contentRect.height);
            }
        });

        observer.observe(boxRef.current);

        return () => observer.disconnect();
    }, []);


    const handleCreateUser = async () => {
        if (!user) {
            notify("Completa los datos del usuario antes de guardar", "info");
            return;
        }
        try {
            const userToSend = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password,
                image_file: user.image_file ?? null,
                role: user.role,
                state: user.state,
            };

            const formData = createUserFormData(userToSend);
            await callEndpoint(createUserApi(formData));
            notify("Usuario creado correctamente", "success");
            navigate("/usuarios");
        } catch (error) {
            if (error?.response?.status === 413) {
                notify(error.response.data.message || "La imagen supera el tamaño máximo permitido (2MB)", "error");
                return;
            }

            if (
                error?.message ===
                "El correo que ingresaste ya pertenece a otro usuario. Prueba con uno diferente."
            ) {
                notify(error.message, "info");
                return;
            }


            notify(
                error?.response?.data?.message ||
                error?.message ||
                "Ocurrió un error inesperado al crear el usuario. Inténtalo de nuevo más tarde.",
                "error"
            );
        }
    };

    const handleUserChange = (changes) => {
        setUser(prev => {
            if (!prev) return prev;

            const updated = { ...prev, ...changes };
            setIsDirty(!isUserEqual(updated, initialUser));
            return updated;
        });
    };

    const handleSave = () => {
        handleCreateUser();
    }

    const handleCancelChanges = () => {
        setQuestionModalOpen(true);
    }

    const handleConfirmCancelModal = () => {
        setUser({ ...initialUser });
        setIsDirty(false);
        setQuestionModalOpen(false);
        notify("Cambios descartados correctamente.", "info");
    };

    const isFormValid = () => {
        return (
            user.firstName?.trim() &&
            user.lastName?.trim() &&
            user.email?.trim() &&
            user.password?.trim() &&
            user.role?.trim() &&
            user.state?.trim() &&
            !user.firstNameError &&
            !user.lastNameError &&
            !user.emailError &&
            !user.passwordError
        ); 
    };


    if (loading) return <FullScreenProgress text="Creando el usuario" />

    return (
        <Box sx={{ p: 1 }}>
            <Box ref={boxRef}>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{
                        fontSize: {
                            xs: '1.5rem',
                            sm: '2rem'
                        },
                        width: { xs: '100%', sm: 'auto' },
                        textAlign: 'left',
                    }}
                >
                    Registrar Nuevo Usuario
                </Typography>
                <Divider sx={{ mb: 1 }} />
            </Box>

            <CreateUserInfoPanel onChange={handleUserChange} panelHeight={tabsHeight} user={user} />


            <QuestionModal
                open={questionModalOpen}
                question="¿Deseas descartar los cambios no guardados?"
                onCancel={() => setQuestionModalOpen(false)}
                onConfirm={handleConfirmCancelModal}
            />

            <ActionBarButtons
                visible={isDirty}
                buttons={[ 
                    {
                        label: "Cancelar",
                        variant: "outlined",
                        icon: <ModeStandbyRoundedIcon />,
                        onClick: handleCancelChanges,
                    }, 
                    {
                        label: "Crear usuario",
                        variant: "contained",
                        color: "primary",
                        icon: <LibraryAddCheckRoundedIcon />,
                        onClick: handleSave,
                        triggerOnEnter: true,
                        disabled: !isFormValid(),
                    },
                ]}
            />
        </Box>
    );
}; 