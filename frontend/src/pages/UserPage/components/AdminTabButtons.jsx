import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    ErrorScreen,
    TabButtons,
} from "../../../generalComponents";

import { MorePanel } from "../components/MorePanel";
import { AdminInfoPanel } from "./AdminInfoPanel";

export const AdminTabButtons = ({
    user,
    onUserChange,
    isOwnProfile
}) => { 
    const [tabsHeight, setTabsHeight] = useState(0);
    const { email } = useParams();
    console.log("iswoma", isOwnProfile)

    const navigate = useNavigate();
    if (!email) return <ErrorScreen message="Usuario no encontrado" buttonText="Volver a usuarios" onButtonClick={() => navigate('/usuarios')} />;
    const userEmail = email;

    const lables = isOwnProfile ? 
    ["Tu perfil", "Más"]
    :
    ["Información del usuario", "Más"];

    return (
        <>
            <TabButtons 
                labels={lables}
                onTabsHeightChange={(height) => setTabsHeight(height)}
                onChange={(newTab) => setActiveTab(newTab)}
            >
                <AdminInfoPanel 
                    panelHeight={tabsHeight} 
                    userEmail={userEmail}
                    onUserChange={onUserChange} 
                    isOwnProfile
                />

                <MorePanel  
                user={user} 
                panelHeight={tabsHeight} 
                isOwnProfile={isOwnProfile}
                /> 
            </TabButtons>
        </>
    );
}

