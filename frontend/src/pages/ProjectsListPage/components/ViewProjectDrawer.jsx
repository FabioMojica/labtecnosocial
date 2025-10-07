import { Box, Paper, Toolbar, Typography, Grid, Avatar, Tooltip, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { integrationsConfig, roleConfig, stateConfig } from "../../../utils";
import { NoResultsScreen, ProjectImageDates } from "../../../generalComponents";

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const ViewProjectDrawer = ({ project }) => {
    if (!project) return null;
    const navigate = useNavigate();

    return (
        <>
            <Toolbar />
            <Box sx={{
                width: '100%',
                height: '100%',
                px: 2,
                py: 2,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box
                    sx={{
                        width: "100%",
                        minHeight: "40%",
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

                <Box sx={{ width: "100%", textAlign: "center", mt: 1, mb: 0.5, px: 2 }}>
                    {/* <Typography
                        variant="h7"
                        fontWeight="bold"
                        noWrap
                        sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                        {project.name}
                    </Typography>
                    <Typography sx={{fontSize: '0.7rem'}} color="text.secondary">{project.description}</Typography> */}
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

                    {/* --- DESCRIPCIÓN (máximo 2 líneas) --- */}
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

                <Box sx={{ width: "100%", mb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
                                    <Tooltip key={integration.id} title={`${config.label}: ${integration.name}`}>
                                        <IconButton
                                            onClick={() => window.open(integration.url, "_blank")}
                                            sx={{
                                                color: config.color,
                                                transition: "transform 0.2s ease",
                                                "&:hover": { transform: "scale(1.2)" },
                                            }}
                                        >
                                            <Icon fontSize="medium" />
                                        </IconButton>
                                    </Tooltip>
                                );
                            })}
                        </Box>
                    )}
                </Box>

                <Paper sx={{ width: '100%', height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', overflowY: 'auto', overflowX: 'hidden' }}>
                    {project.projectResponsibles?.length === 0 ? (
                        <NoResultsScreen message="Sin responsables asignados" iconSX={{ fontSize: 50 }} />
                    ) : (
                        <>
                            <Typography variant="h7" fontWeight="bold">Responsables del proyecto</Typography>
                            <Grid container spacing={2} columns={4} sx={{ mt: 1 }}>
                                {project.projectResponsibles?.map((responsible) => (
                                    <Grid size={1}>
                                        <Box
                                            sx={{
                                                width: "100%",
                                                aspectRatio: "1 / 1",
                                                borderRadius: 2,
                                                overflow: "hidden",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                position: "relative",
                                                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                                boxShadow: 1,
                                                "&:hover": {
                                                    transform: "scale(1.1)",
                                                    boxShadow: 6,
                                                },
                                            }}
                                            onClick={() => navigate(`/usuario/${encodeURIComponent(responsible.email)}`)}
                                        >
                                            <Avatar
                                                src={
                                                    responsible.image_url
                                                        ? `${API_UPLOADS}${responsible.image_url}`
                                                        : undefined
                                                }
                                                alt={`${responsible.firstName} ${responsible.lastName}`}
                                                sx={{
                                                    width: "100%",
                                                    height: "100%",
                                                    borderRadius: 0,
                                                    objectFit: "cover",
                                                    fontSize: "1rem",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {`${responsible.firstName[0]}${responsible.lastName[0]}`}
                                            </Avatar>

                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    gap: 2,
                                                    p: 0.1,
                                                    width: '100%',
                                                    bottom: 0,
                                                    right: 0,
                                                    bgcolor: "background.paper",
                                                    boxShadow: 1,
                                                }}
                                            >
                                                {stateConfig[responsible.state] && (() => {
                                                    const StateIcon = stateConfig[responsible.state].icon;
                                                    return <StateIcon sx={{ fontSize: 16, color: stateConfig[responsible.state].color }} />;
                                                })()}

                                                {roleConfig[responsible.role] && (() => {
                                                    const RoleIcon = roleConfig[responsible.role].icon;
                                                    return <RoleIcon sx={{ fontSize: 16, color: "primary.main" }} />;
                                                })()}
                                            </Box>
                                        </Box>
                                        <Tooltip title={`${responsible.firstName} ${responsible.lastName}`}>

                                            <Typography
                                                variant="body2"
                                                align="center"
                                                noWrap
                                                sx={{ mt: 0.5, fontSize: "0.8rem" }}
                                            >
                                                {`${responsible.firstName} ${responsible.lastName}`}
                                            </Typography>
                                        </Tooltip>
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}
                </Paper>
            </Box>
        </>
    );
};
