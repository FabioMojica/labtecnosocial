import React, { use, useEffect, useState } from "react";
import { Avatar, Box, Divider, Typography, useTheme } from "@mui/material";
import { Item } from "../../../generalComponents";
import { roleConfig, stateConfig } from "../../../utils";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import UpdateIcon from "@mui/icons-material/Update";
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import { formatDate, formatDateParts } from "../../../utils/formatDate";

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
        <Typography
            sx={{
                whiteSpace: 'normal',      
                wordBreak: 'break-word',    
                overflowWrap: 'break-word', 
                width: 100
            }}
            color="text.secondary"
            variant="caption" 
        >
            {value}
        </Typography>
        <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.7rem" }}>
            {label}
        </Typography>
    </Box>
);

export const UserItem = ({ user, onClick }) => {
    const theme = useTheme();
    const [imgError, setImgError] = useState(false);

    const finalSrc =
        (user?.image_url || null);

    useEffect(() => {
        setImgError(false);
    }, [finalSrc]);

    const roleData =
        Object.values(roleConfig).find(r => r.value === user.role) ?? {
            icon: QuestionMarkRoundedIcon,
            label: user.role,
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
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                                }}
                                variant="body2"
                                fontWeight={'bold'}
                            >
                                    {user.firstName} 
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
                                }}
                                variant="body2"
                                fontWeight={'bold'}
                            >
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
                        width: '100%',
                        alignItems: "center",
                        justifyContent: { xs: "space-around", sm: "center" },
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
                        value={roleData.label}
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
                        value={formatDateParts(user.created_at).date}
                        label="Fecha creación"
                    />
                    <RightStat
                        icon={<UpdateIcon fontSize="small" />}
                        value={formatDateParts(user.updated_at).date}
                        label="Fecha actualización"
                    />
                </Box>
            ]}
            onClick={onClick}
        />
    );
};
