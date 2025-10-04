import { Box, Paper, Toolbar, Typography, Grid, Avatar, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { roleConfig, stateConfig } from "../../../utils";
import { NoResultsScreen, ProjectImageDates } from "../../../generalComponents";

export const ViewProjectDrawer= ({ project }) => {
    if (!project) return null;
    console.log("---->drawe", project);
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
                        minHeight: "45%",
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
                            width: "80%",
                            height: "100%",
                            overflow: "hidden",
                            cursor: "pointer",
                            "&:hover .overlay": {
                                opacity: 1,
                            },
                        }}
                    >
                        <ProjectImageDates overlay={true} overlayText="Ir al proyecto" project={project}
                        />
                    </Box>

                </Box>

                <Box sx={{ width: "100%", textAlign: "center", mt: 1, mb: 1, px: 2 }}>
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        noWrap
                        sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                        {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{project.description}</Typography>
                </Box>
                <Paper sx={{ width: '100%', height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', overflowY: 'auto', overflowX: 'hidden' }}>
                    {project.projectResponsibles?.length === 0 ? (
                        <NoResultsScreen message="Sin responsables asignados" iconSX={{ fontSize: 50, }} />
                    ) : (
                        <>
                            <Typography variant="h6" fontWeight="bold">Responsables del proyecto</Typography>
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
                                            onClick={() => navigate(`/proyecto/${project.id}`)}
                                        >
                                            <Avatar
                                                src={responsible.image_url ?? undefined}
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
