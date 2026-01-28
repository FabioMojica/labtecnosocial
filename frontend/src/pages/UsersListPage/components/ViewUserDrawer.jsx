import { Avatar, Box, Divider, Paper, Toolbar, Typography, useTheme } from "@mui/material";
import { Grid } from "@mui/material";
import { UserProfileImage, NoResultsScreen } from "../../../generalComponents";
import { useNavigate } from "react-router-dom";
import { roleConfig, stateConfig } from "../../../utils";
import { formatDateParts } from "../../../utils/formatDate";
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';


const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const ViewUserDrawer = ({ user }) => {
    if (!user) return;
    const navigate = useNavigate();
    const theme = useTheme(); 

    return (
        <>
            <Toolbar></Toolbar>
            <Box sx={{
                width: '100%',
                height: '100%',
                p: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: 1000
            }}>
                <Box
                    sx={{
                        width: "100%",
                        height: "40%",
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        width: '75%',
                        boxShadow:
                            theme.palette.mode === 'light'
                                ? '0 0 0 1px rgba(0,0,0,0.3)'
                                : '0 0 0 1px rgba(255,255,255,0.3)',
                    }}
                >
                    <Box
                        onClick={() => navigate(`/usuario/${encodeURIComponent(user.email)}`)}
                        sx={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            borderTopLeftRadius: 2,
                            borderTopRightRadius: 2,
                            overflow: "hidden",
                            cursor: "pointer",
                            "&:hover .overlay": {
                                opacity: 1,
                            },
                        }}
                    >
                        <UserProfileImage
                            user={user}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8,
                                overflow: 'hidden'
                            }}
                        />

                        <Box
                            className="overlay"
                            sx={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "rgba(0,0,0,0.5)",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "1.1rem",
                                opacity: 0,
                                transition: "opacity 0.3s ease",
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8,
                            }}
                        >
                            Ir al perfil
                        </Box>
                    </Box>

                    <Divider sx={{ width: '100%' }} />

                    <Paper
                        elevation={3}
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            borderBottomLeftRadius: 8,
                            borderBottomRightRadius: 8,
                            borderTopRightRadius: 0,
                            borderTopLeftRadius: 0,
                            gap: 2,
                            py: 0.5
                        }}
                    >
                        <Box
                            sx={{
                                textAlign: 'center',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                
                            }} 
                        >
                            <Typography variant="subtitle2" color="textSecondary">Creado</Typography>
                            <Typography variant="caption">{formatDateParts(user?.created_at).date}</Typography>
                            <Typography variant="caption">{formatDateParts(user?.created_at).time}</Typography>
                        </Box>

                        <Divider orientation="vertical" flexItem color="primary" />

                        <Box
                            sx={{
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                            }}
                        >
                            <Typography variant="subtitle2" color="textSecondary">Actualizado</Typography>
                            <Typography variant="caption">{formatDateParts(user?.updated_at).date}</Typography>
                            <Typography variant="caption">{formatDateParts(user?.updated_at).time}</Typography>
                        </Box>

                    </Paper>
                </Box>

                <Divider orientation="vertical" flexItem color="primary" />

                <Box
                    sx={{
                        width: "100%",
                        height: 'auto',
                        textAlign: "center",
                        mt: 0.5,
                        mb: 0.5,
                        px: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0.5,
                    }}
                >
                    <Typography
                        variant="h7"
                        fontWeight="bold"
                        noWrap
                        sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "100%",
                        }}
                    >
                        {user.firstName} {user.lastName}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "100%",
                        }}
                    >
                        {user.email}
                    </Typography>

                    {/* Estado y Rol */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mt: 0.5,
                        }}
                    >
                        {/* Estado */}
                        {stateConfig[user.state] && (() => {
                            const StateIcon = stateConfig[user.state].icon;
                            return (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <StateIcon sx={{ color: stateConfig[user.state].color, fontSize: 20 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {stateConfig[user.state].label}
                                    </Typography>
                                </Box>
                            ); 
                        })()}

                        {/* Rol */}
                        {(() => {
                            const roleData = Object.values(roleConfig).find(r => r.value === user.role);
                            const RoleIcon = roleData?.icon ?? QuestionMarkRoundedIcon;

                            return (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <RoleIcon sx={{ color: "primary.main", fontSize: 20 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {roleData?.label}
                                    </Typography>
                                </Box>
                            );
                        })()}
                    </Box>
                </Box>


                <Paper
                    sx={{
                        width: '100%',
                        height: '40%',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 1,
                        overflowY: 'auto',
                    }}
                >
                    {user.projects?.length === 0 ? (
                        <NoResultsScreen
                            message="Sin proyectos asignados"
                            iconSX={{ fontSize: 50 }}
                        />
                    ) : (
                        <>
                            <Typography variant="h6" fontWeight="bold">
                                Proyectos Asignados ({user.projects?.length})
                            </Typography>

                            <Box
                                sx={{
                                    width: '100%',
                                    flexGrow: 1,
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'flex-start',
                                    gap: 2,
                                    p: 1,
                                    "&::-webkit-scrollbar": { width: "4px" },
                                    "&::-webkit-scrollbar-track": { backgroundColor: 'background.default', borderRadius: 2 },
                                    "&::-webkit-scrollbar-thumb": { backgroundColor: 'primary.main', borderRadius: 2 },
                                    "&::-webkit-scrollbar-thumb:hover": { backgroundColor: 'primary.dark' },
                                }}
                            >
                                {user.projects?.map((project) => (
                                    <Box
                                        key={project.id}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            width: 90,
                                            cursor: 'pointer',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                            '&:hover': { transform: 'scale(1.1)' },
                                        }}
                                        onClick={
                                            () => {
                                                navigate(`/proyecto/${project?.name}`, {
                                                    replace: true,
                                                    state: { id: project?.id },
                                                });
                                            }}
                                    >
                                        <Box
                                            sx={{
                                                width: '100%',
                                                aspectRatio: '1 / 1',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                                boxShadow: theme.palette.mode === 'light'
                                                    ? '0 0 0 1px rgba(0,0,0,0.3)'
                                                    : '0 0 0 1px rgba(255,255,255,0.3)',
                                            }}
                                        >
                                            <Avatar
                                                src={project?.image_url || null}
                                                alt={project.name} 
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: 0,
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {project.name[0]}
                                            </Avatar>
                                        </Box>

                                        <Typography
                                            variant="body2"
                                            align="center"
                                            sx={{
                                                mt: 0.5,
                                                fontSize: '0.7rem',
                                                color: 'text.secondary',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                width: '100%',
                                            }}
                                        >
                                            {project.name}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </>
                    )}
                </Paper>

            </Box >
        </>
    );
}
