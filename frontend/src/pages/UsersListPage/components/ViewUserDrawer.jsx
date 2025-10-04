import { Avatar, Box, Divider, Paper, Toolbar, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import { UserProfileImage, NoResultsScreen } from "../../../generalComponents";
import { useNavigate } from "react-router-dom";

export const ViewUserDrawer = ({ user }) => {
    if (!user) return;
    const navigate = useNavigate();

    return (
        <>
            <Toolbar></Toolbar>
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
                        borderTopLeftRadius: 2,
                        borderTopRightRadius: 2,
                    }}
                    onClick={() => navigate(`/usuario/${encodeURIComponent(user.email)}`)}
                >
                    <Box
                        sx={{
                            position: "relative",
                            width: "80%",
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
                            width: '80%',
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
                        textAlign: "center",
                        mt: 1,
                        mb: 1,
                        px: 2,
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

                    {/* Email */}
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "100%",
                        }}
                    >
                        {user.email}
                    </Typography>
                </Box>

                <Paper sx={{ width: '100%', height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', overflowY: 'auto', overflowX: 'hidden' }}>
                    {user.projectResponsibles?.length === 0 ? (
                        <NoResultsScreen message="Sin proyectos asignados" iconSX={{ fontSize: 50, }} />
                    ) : (
                        <>
                            <Typography variant="h6" fontWeight="bold">Proyectos Asignados</Typography>
                            <Grid container spacing={2} columns={4} sx={{ mt: 1 }}>
                                {user.projectResponsibles?.map((project) => (
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
                                                src={project.operationalProject.image_url ?? undefined}
                                                alt={project.operationalProject.name}
                                                sx={{
                                                    width: "100%",
                                                    height: "100%",
                                                    borderRadius: 0,
                                                    objectFit: "cover",
                                                    fontSize: "1rem",
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {project.operationalProject.name[0]}
                                            </Avatar>
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            align="center"
                                            noWrap
                                            sx={{ mt: 0.5, fontSize: "0.8rem" }}
                                        >
                                            {project.operationalProject.name}
                                        </Typography>
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}
                </Paper>
            </Box>
        </>
    );
}
