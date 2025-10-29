import React, { use } from "react";
import { Avatar, Box, Typography } from "@mui/material";
import { Item } from "../../../generalComponents"; 
import { roleConfig, stateConfig } from "../../../utils";
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const UserItem = ({ user, onClick }) => {
    const roleData = roleConfig[user.role] ?? {
        icon: QuestionMarkRoundedIcon,
        role: user.role,
    };

    const stateData = stateConfig[user.state] ?? {
        icon: QuestionMarkRoundedIcon,
        label: user.state,
        color: "error.main",
    };

      const imageSrc = user.image_url
    ? `${API_UPLOADS}${user.image_url}`
    : undefined;

    return (
        <Item
            leftComponents={[
                    <Avatar
                        src={imageSrc ?? undefined}
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            objectFit: 'cover',
                            fontWeight: 'bold',
                        }}
                    >
                        {user.firstName[0].toUpperCase()}{user.lastName[0].toUpperCase()}
                    </Avatar>,
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography>{user.firstName}</Typography>
                        <Typography>{user.lastName}</Typography>
                        <Typography variant="caption">{user.email}</Typography>
                    </Box>
            ]}
            rightComponents={[
                <Box sx={{ display: 'flex', mt: {xs: 2}, height: '100%', width: 290, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Typography>{user.projectCount}</Typography>
                        <Typography variant="caption">Proyectos</Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", minWidth: 100, justifyContent: 'center', alignItems: "center" }}>
                        {React.createElement(roleData.icon, { fontSize: "small" })}
                        <Typography variant="caption">{roleData.role}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", minWidth: 100, justifyContent: 'center', flexDirection: "column", alignItems: "center" }}>
                        {React.createElement(stateData.icon, { fontSize: "small", sx: { color: stateData.color } })}
                        <Typography variant="caption">{stateData.label}</Typography>
                    </Box>
                </Box>
            ]}
            onClick={onClick}
        />
    );
};
