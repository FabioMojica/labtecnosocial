import { Avatar, Box, Divider, Paper, Toolbar, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import { UserProfileImage, NoResultsScreen } from "../../../generalComponents";
import { useNavigate } from "react-router-dom";
import { roleConfig, stateConfig } from "../../../utils";


const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const ViewUserDrawer = ({ user }) => {
    if (!user) return;
    const navigate = useNavigate();

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
            }}>
                <Box
                    sx={{
                        width: "100%",
                        height: "40%",
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderTopLeftRadius: 2,
                        borderTopRightRadius: 2,
                        pb: 0.5,
                    }}
                    onClick={() => navigate(`/usuario/${encodeURIComponent(user.email)}`)}
                >
                    <Box
                        sx={{
                            position: "relative",
                            width: "75%",
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


                    <Paper
                        elevation={3}
                        sx={{
                            width: '75%',
                            display: 'flex',
                            flexDirection: 'row',
                            borderBottomLeftRadius: 8,
                            borderBottomRightRadius: 8,
                            borderTopRightRadius: 0,
                            borderTopLeftRadius: 0,
                            p: 1.5,
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                textAlign: 'center',
                                flex: 1,
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                },
                            }}
                        >
                            <Typography variant="subtitle2" color="textSecondary">Creado</Typography>
                            <Typography variant="body2">{new Date(user.created_at).toLocaleDateString()}</Typography>
                        </Box>

                        <Divider orientation="vertical" flexItem color="primary" />

                        <Box
                            sx={{
                                textAlign: 'center',
                                flex: 1,
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                },
                            }}
                        >
                            <Typography variant="subtitle2" color="textSecondary">Actualizado</Typography>
                            <Typography variant="body2">{new Date(user.updated_at).toLocaleDateString()}</Typography>
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
                        variant="h6"
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
                                    <StateIcon sx={{ color: stateConfig[user.state].color }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {stateConfig[user.state].label}
                                    </Typography>
                                </Box>
                            );
                        })()}

                        {/* Rol */}
                        {roleConfig[user.role] && (() => {
                            const RoleIcon = roleConfig[user.role].icon;
                            return (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <RoleIcon sx={{ color: "primary.main" }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {roleConfig[user.role].role}
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
                                        onClick={() => navigate(`/proyecto/${project.id}`)}
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
                                                boxShadow: 1,
                                            }}
                                        >
                                            <Avatar
                                                src={project.image_url ? `${API_UPLOADS}${project.image_url}` : undefined}
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

            </Box>
        </>
    );
}
