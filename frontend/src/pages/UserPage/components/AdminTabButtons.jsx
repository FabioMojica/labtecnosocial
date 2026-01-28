import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    ErrorScreen,
    TabButtons,
} from "../../../generalComponents";

import { MorePanel } from "../components/MorePanel";
import { useAuth } from "../../../contexts";
import { ViewUser } from "./ViewUser";

export const AdminTabButtons = ({
    user,
    onUserChange,
    isOwnProfile,
    userRoleSession,
}) => { 
    const [tabsHeight, setTabsHeight] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    

    const { email } = useParams();
    const { user: userSession, isAdmin, isSuperAdmin, isUser } = useAuth();
    const navigate = useNavigate();
    if (!email) return <ErrorScreen message="Usuario no encontrado" buttonText="Volver a usuarios" onButtonClick={() => navigate('/usuarios')} />;
    
    let labels; 


    if(isOwnProfile){
        labels = ["Tu perfil"];
    } else if (isSuperAdmin) {
        labels = ["Información del usuario", "Más"]
    } else if (isAdmin) {
        labels = ["Información del usuario"]
    } else if (isUser) {
        labels = ["Información del usuario"]
    } else {
        return;
    }

    return (
        <>
            <TabButtons
                labels={labels}
                onTabsHeightChange={(height) => setTabsHeight(height)}
                onChange={(newTab) => setActiveTab(newTab)}
            >
                
                <ViewUser panelHeight={tabsHeight} user={user} onChange={onUserChange} isOwnProfile={isOwnProfile} />

                <MorePanel  
                    user={user}
                    panelHeight={tabsHeight}
                    isOwnProfile={isOwnProfile}
                    userRoleSession={userRoleSession}
                    isActive={activeTab === 1}
                />
            </TabButtons>
        </> 
    );
}

