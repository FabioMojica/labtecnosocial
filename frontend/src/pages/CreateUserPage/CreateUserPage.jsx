// 1. Librerías externas
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModeStandbyRoundedIcon from '@mui/icons-material/ModeStandbyRounded';
import LibraryAddCheckRoundedIcon from '@mui/icons-material/LibraryAddCheckRounded';

// 2. Hooks personalizados
import { useAuthEffects, useFetchAndLoad } from "../../hooks";
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
            notify(error?.message || "Error al crear el usuario. Inténtalo de nuevo más tarde.", "error");
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
        notify("Cambios descartados correctamente", "info");
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
        <>
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
                        disabled:!isFormValid(),
                    },
                ]}
            />
        </>
    );
}; 