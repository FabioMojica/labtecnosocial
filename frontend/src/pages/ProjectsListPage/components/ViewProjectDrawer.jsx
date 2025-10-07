import { Box, Paper, Toolbar, Typography, Grid, Avatar, Tooltip, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { integrationsConfig, roleConfig, stateConfig } from "../../../utils";
import { NoResultsScreen, ProjectImageDates } from "../../../generalComponents";
import { useTheme } from "@emotion/react";

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const ViewProjectDrawer = ({ project }) => {
    if (!project) return null;
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <>
            <Toolbar />
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
                        height: "35%",
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onClick={() => navigate(`/proyecto/${project.id}`)}
                >
                    <Box
                        sx={{
                            position: "relative",
                            width: "75%",
                            height: "100%",
                            borderRadius: 2,
                            overflow: "hidden",
                            cursor: "pointer",
                            "&:hover .overlay": {
                                opacity: 1,
                            },
                        }}
                    >
                        <ProjectImageDates overlay={true} overlayText="Ir al proyecto" project={project} />
                    </Box>

                </Box>

                <Box sx={{ width: "100%", height: '10%', textAlign: "center", mt: 1, mb: 0.5, px: 2 }}>
                    <Typography
                        variant="h7"
                        fontWeight="bold"
                        sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {project.name}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: "0.7rem",
                            color: "text.secondary",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {project.description}
                    </Typography>
                </Box>

                <Box sx={{ width: "100%", height: '10%', mb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Integraciones del proyecto
                    </Typography>

                    {(!project.integrations || project.integrations.length === 0) ? (
                        <Typography sx={{ fontSize: '0.7rem' }} color="error" align="center">
                            No integrado a ninguna plataforma
                        </Typography>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 2,
                                flexWrap: "wrap",
                            }}
                        >
                            {project.integrations.map((integration) => {
                                const config = integrationsConfig[integration.platform?.toLowerCase()];
                                if (!config) return null;
                                const Icon = config.icon;
                                return (
                                    <Tooltip
                                        key={integration.id}
                                        title={`${config.label}: ${integration.name}`}
                                        PopperProps={{
                                            disablePortal: true, 
                                            modifiers: [
                                                {
                                                    name: 'preventOverflow',
                                                    options: {
                                                        boundary: 'clippingParents', 
                                                    },
                                                },
                                            ],
                                        }}
                                    >
                                        <IconButton
                                            onClick={() => window.open(integration.url, "_blank")}
                                            sx={{
                                                color: config.color,
                                                transition: "transform 0.2s ease",
                                                "&:hover": { transform: "scale(1.2)" },
                                            }}
                                            size="small"

                                        >
                                            <Icon fontSize="medium" />
                                        </IconButton>
                                    </Tooltip>
                                );
                            })}
                        </Box>
                    )}
                </Box>

                <Paper sx={{ width: '100%', height: '40%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 1 }}>
                    {project.projectResponsibles?.length === 0 ? (
                        <NoResultsScreen message="Sin responsables asignados" iconSX={{ fontSize: 50 }} />
                    ) : (
                        <>
                            <Typography variant="h7" fontWeight="bold">Responsables del proyecto ({project.projectResponsibles?.length})</Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    flexGrow: 1,
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'flex-start',
                                    gap: 2,
                                    p: 2,
                                    "&::-webkit-scrollbar": { width: "4px" },
                                    "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: 2 },
                                    "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: 2 },
                                    "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                                }}
                            >
                                {project.projectResponsibles?.map((responsible) => (
                                    <Box
                                        key={responsible.id}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            width: 90,
                                            cursor: 'pointer',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                            '&:hover': {
                                                transform: 'scale(1.1)',

                                            },
                                        }}
                                        onClick={() => navigate(`/usuario/${encodeURIComponent(responsible.email)}`)}
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
                                                src={responsible.image_url ? `${API_UPLOADS}${responsible.image_url}` : undefined}
                                                alt={`${responsible.firstName} ${responsible.lastName}`}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: 0,
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {`${responsible.firstName[0]}${responsible.lastName[0]}`}
                                            </Avatar>

                                            {/* Iconos de estado/rol */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    display: 'flex',
                                                    gap: 2,
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                    bgcolor: 'background.paper',
                                                    p: 0.1,
                                                    boxShadow: 1,
                                                }}
                                            >
                                                {stateConfig[responsible.state] && (() => {
                                                    const StateIcon = stateConfig[responsible.state].icon;
                                                    return <StateIcon sx={{ fontSize: 16, color: stateConfig[responsible.state].color }} />;
                                                })()}
                                                {roleConfig[responsible.role] && (() => {
                                                    const RoleIcon = roleConfig[responsible.role].icon;
                                                    return <RoleIcon sx={{ fontSize: 16, color: 'primary.main' }} />;
                                                })()}
                                            </Box>
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
                                            {`${responsible.firstName} ${responsible.lastName}`}
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
};
