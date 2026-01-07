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
    onUserChange
}) => {
    const [tabsHeight, setTabsHeight] = useState(0);
    const { email } = useParams();

    const navigate = useNavigate();
    if (!email) return <ErrorScreen message="Usuario no encontrado" buttonText="Volver a usuarios" onButtonClick={() => navigate('/usuarios')} />;
    const userEmail = email;
    const [activeTab, setActiveTab] = useState("Información del usuario");

    return (
        <>
            <TabButtons
                labels={["Información del usuario", "Más"]}
                paramsLabels={["Información del usuario", "Más"]}
                onTabsHeightChange={(height) => setTabsHeight(height)}
                onChange={(newTab) => setActiveTab(newTab)}
            >
                <AdminInfoPanel
                    panelHeight={tabsHeight}
                    userEmail={userEmail}
                    onUserChange={onUserChange}
                />

                <MorePanel 
                user={user} 
                panelHeight={tabsHeight} 
                />
            </TabButtons>
        </>
    );
}

