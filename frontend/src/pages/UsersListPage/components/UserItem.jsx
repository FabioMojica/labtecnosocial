import React, { use, useEffect, useState } from "react";
import { Avatar, Box, Divider, Typography, useTheme } from "@mui/material";
import { Item } from "../../../generalComponents";
import { roleConfig, stateConfig } from "../../../utils";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import UpdateIcon from "@mui/icons-material/Update";
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import { formatDate } from "../../../utils/formatDate";

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

const RightStat = ({ icon, value, label }) => (
    <Box
        sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 80,
            textAlign: "center",
        }}
    >
        {icon}
        <Typography variant="caption" fontWeight={600}>
            {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
            {label}
        </Typography>
    </Box>
);

export const UserItem = ({ user, onClick }) => {
    const theme = useTheme();
    const [imgError, setImgError] = useState(false);

     const finalSrc =
        (user.image_url ? `${API_UPLOADS}${user.image_url}` : null);
    
      useEffect(() => {
        setImgError(false);
      }, [finalSrc]);

    const roleData = roleConfig[user.role] ?? {
        icon: QuestionMarkRoundedIcon,
        role: user.role,
    };

    const stateData = stateConfig[user.state] ?? {
        icon: QuestionMarkRoundedIcon,
        label: user.state,
        color: "error.main",
    };

    return (
        <Item
            leftComponents={[
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Avatar
                            src={finalSrc ?? undefined} 
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 2,
                                objectFit: 'cover',
                                fontWeight: 'bold',
                                boxShadow:
                                    theme.palette.mode === 'light'
                                        ? '0 0 0 1px rgba(0,0,0,0.3)'
                                        : '0 0 0 1px rgba(255,255,255,0.3)',
                            }}
                        >
                            {user.firstName[0].toUpperCase()}{user.lastName[0].toUpperCase()}
                        </Avatar>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <Typography
                                sx={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    wordBreak: "break-word",
                                    overflowWrap: "break-word",
                                }}>{user.firstName}
                            </Typography>

                            <Typography
                                sx={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    wordBreak: "break-word",
                                    overflowWrap: "break-word",
                                }}>
                                {user.lastName}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    wordBreak: "break-word",
                                    overflowWrap: "break-word",
                                }}
                            >
                                {user.email} 
                            </Typography>
                        </Box>
                    </Box>

                    <Divider
                        sx={{
                            display: {
                                xs: "block",
                                lg: 'none'
                            },
                            my: 1,
                        }}
                    />
                </Box>
            ]}
            rightComponents={[
                <Box
                    sx={{
                        display: "flex",
                        mt: { xs: 2, sm: 0 },
                        height: "100%",
                        width: { xs: "100%" },
                        alignItems: "center",
                        justifyContent: { xs: "space-around", sm: "flex-end" },
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <RightStat
                        icon={<FolderCopyRoundedIcon fontSize="small" />}
                        value={user.projectCount ?? 0}
                        label="Proyectos asignados"
                    />

                    <RightStat
                        icon={React.createElement(roleData.icon, { fontSize: "small" })}
                        value={roleData.role}
                        label="Rol"
                    />

                    <RightStat
                        icon={React.createElement(stateData.icon, {
                            fontSize: "small",
                            sx: { color: stateData.color },
                        })}
                        value={stateData.label}
                        label="Estado"
                    />

                    <RightStat
                        icon={<CalendarMonthIcon fontSize="small" />}
                        value={formatDate(user.created_at)}
                        label="Fecha creación"
                    />
                    <RightStat
                        icon={<UpdateIcon fontSize="small" />}
                        value={formatDate(user.updated_at)}
                        label="Fecha actualización"
                    />
                </Box>
            ]}
            onClick={onClick}
        />
    );
};
