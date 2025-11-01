import { Box, Grid, Typography, Button, Avatar, Stack, useTheme, Tooltip, IconButton } from "@mui/material";
import { ProjectImageDates } from "../../../generalComponents";
import { useHeaderHeight } from "../../../contexts";
import LibraryAddCheckRoundedIcon from '@mui/icons-material/LibraryAddCheckRounded';
import ModeStandbyRoundedIcon from '@mui/icons-material/ModeStandbyRounded';
import { integrationsConfig } from "../../../utils";


const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const ProjectPreviewPanel = ({
    project,
    panelHeight,
    onCancel,
    onSave,
}) => {
    const { headerHeight } = useHeaderHeight();
    const heightCalc = `calc(100vh - ${headerHeight}px - ${panelHeight}px)`;
    const theme = useTheme();
    
    return (
        <Grid
            container
            spacing={2}
            sx={{
                width: "100%",
                minHeight: heightCalc,
                height: heightCalc,
                maxHeight: heightCalc,
                p: 1,
            }}
        >
            <Grid
                size={{
                    xs: 12,
                    md: 5
                }}
                sx={{
                    height: { xs: "50%", md: "100%" },
                }}
            >
                <ProjectImageDates
    project={project}
    sx={{ width: "100%", height: "100%" }}
    fallbackLetter={project.name ? project.name[0].toUpperCase() : "?"}
/>
            </Grid>

            <Grid
                size={{
                    xs: 12,
                    md: 7
                }}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                }}
            >
                <Box sx={{ width: '100%' }}>
                    <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Nombre del proyecto:</Typography>

                    <Typography
                        sx={{
                            display: "block",
                            padding: 1,
                            maxWidth: "100%",
                            whiteSpace: "pre-wrap",
                            wordWrap: "break-word",
                            wordBreak: 'break-word',
                            borderRadius: 1,
                            backgroundColor:
                                theme.palette.mode === 'light'
                                    ? 'rgba(200, 200, 200, 0.3)'
                                    : 'rgba(100, 100, 100, 0.3)',
                            color: theme.palette.text.primary,
                        }}
                        variant="h7"
                        fontWeight="bold"
                    >
                        {project.name}
                    </Typography>
                    <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Descripción del proyecto:</Typography>
                    <Typography
                        sx={{
                            display: "block",
                            padding: 1,
                            maxWidth: "100%",
                            whiteSpace: "pre-wrap",
                            wordWrap: "break-word",
                            wordBreak: 'break-word',
                            borderRadius: 1,
                            backgroundColor:
                                theme.palette.mode === 'light'
                                    ? 'rgba(200, 200, 200, 0.3)'
                                    : 'rgba(100, 100, 100, 0.3)',
                            color: theme.palette.text.primary,
                        }}
                        variant="body1"
                    >
                        {project.description}
                    </Typography>

                    <Box>
                        <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                            Responsables asignados
                            {project.newResponsibles?.length > 0 && ` (${project.newResponsibles.length})`}
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={1}

                            sx={{
                                height: 'auto',
                                p: 1,
                                overflowX: 'auto',
                                "&::-webkit-scrollbar": { height: "2px" },
                                "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
                                "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
                                "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                            }}
                        >
                            {project.newResponsibles && project.newResponsibles.length > 0 ? (
                                project.newResponsibles.map((user) => (
                                    <Avatar
                                        key={user.email}
                                        src={user.image_url ? `${API_UPLOADS}${user.image_url}` : undefined}

                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 2,
                                            objectFit: 'cover',
                                            fontWeight: 'bold',
                                            zIndex: 1,
                                        }}
                                    >
                                        {user.firstName[0].toUpperCase()}
                                        {user.lastName[0].toUpperCase()}
                                    </Avatar>
                                ))
                            ) : (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    align="center"
                                    sx={{
                                        color: "gray",
                                        fontStyle: "italic",
                                        textAlign: "center",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    Este proyecto no tiene responsables asignados
                                </Typography>
                            )}
                        </Stack>

                    </Box>
                    <Box>
                        <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Integraciones con APIs:</Typography>
                        <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap" justifyContent="center" alignItems="center">
                            {project.integrations && project.integrations.length > 0 ? (
                                project.integrations.map((integration) => {
                                    const config = integrationsConfig[integration.type];
                                    if (!config) return null;

                                    const IconComponent = config.icon;

                                    console.log("aaaaaaaaaaaaaa", integration)

                                    return (
                                        <Tooltip
                                            key={integration.type}
                                            title={
                                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span>{config.label}</span>
                                                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{integration.data.url}</span>
                                                </Box>
                                            }>
                                            <IconButton
                                                sx={(theme) => ({
                                                    backgroundColor: config.color,
                                                    color: "#fff",
                                                    "&:hover": {
                                                        backgroundColor:
                                                            theme.palette.mode === "light"
                                                                ? `${config.color}CC`
                                                                : `${config.color}88`,
                                                    },
                                                })}
                                                onClick={() => window.open(integration.data.url, "_blank")}
                                            >
                                                <IconComponent />
                                            </IconButton>
                                        </Tooltip>
                                    );
                                })
                            ) : (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    align="center"
                                    sx={{
                                        color: 'gray',
                                        fontStyle: 'italic',
                                        textAlign: 'center',
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    Este proyecto no tiene integraciones con ninguna plataforma
                                </Typography>
                            )}
                        </Stack>
                    </Box>
                </Box>

                {/* Botones de acción */}
                <Box display="flex" gap={2} sx={{
                    
                    justifyContent: 'end',
                    mt: {
                        xs: 2,
                        sm: 0
                    }
                }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<LibraryAddCheckRoundedIcon />}
                        onClick={onSave}
                    >
                        Guardar Proyecto
                    </Button>

                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<ModeStandbyRoundedIcon />}
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                </Box>
            </Grid>
        </Grid>
    );
};
