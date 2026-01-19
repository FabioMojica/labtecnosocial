import React from "react";
import { Avatar, Box, Typography } from "@mui/material";
import { Item } from "../../../generalComponents";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

export const ResponsibleItem = ({ responsible, onClick  }) => {
    const roleIcon = (responsible.role === "admin" || responsible.role === "super-admin") ? AdminPanelSettingsIcon : PersonIcon;
    const stateIcon = responsible.state === "habilitado" ? CheckCircleIcon : CancelIcon;

    return (
        <Item
            leftComponents={[
                <Avatar
                    src={responsible.image_url ?? undefined}
                    sx={{
                        width: 56,        
                        height: 56,      
                        borderRadius: 2,  
                        objectFit: 'cover',
                        fontWeight: 'bold'
                    }}
                >
                    {responsible.firstName[0]}{responsible.lastName[0]}
                </Avatar>,
                
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography>{responsible.firstName}</Typography>
                    <Typography>{responsible.lastName}</Typography>
                    <Typography variant="caption">{responsible.email}</Typography>
                </Box>,
            ]}
            rightComponents={[
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Typography>{responsible.projectResponsibles?.length}</Typography>
                    <Typography variant="caption">Proyectos</Typography>
                </Box>,
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {React.createElement(roleIcon, { fontSize: "small" })}
                    <Typography variant="caption">{responsible.role}</Typography>
                </Box>,
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {React.createElement(stateIcon, { fontSize: "small" })}
                    <Typography variant="caption">{responsible.state}</Typography>
                </Box>,
            ]}
            onClick={onClick}
        />
    );
};
