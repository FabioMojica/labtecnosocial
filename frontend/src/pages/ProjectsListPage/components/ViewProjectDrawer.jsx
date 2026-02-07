import { Box, Paper, Toolbar, Typography, Grid, Avatar, Tooltip, IconButton, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { integrationsConfig, roleConfig, stateConfig } from "../../../utils";
import { NoResultsScreen, ProjectImageDates, ProjectProfileImage } from "../../../generalComponents";
import { useTheme } from "@emotion/react";
import { formatDateParts } from "../../../utils/formatDate";
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';

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
                maxHeight: 1000,
            }}>
                <Typography 
                    variant="h7"
                    fontWeight="bold" 
                    sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 220,
                        mb: 0.5
                    }}
                >
                    {project.name}
                </Typography>

                <Box
                    sx={{
                        width: "75%",
                        height: 190,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1,
                        borderRadius: 2,
                        boxShadow:
                            theme.palette.mode === 'light'
                                ? '0 0 0 1px rgba(0,0,0,0.3)'
                                : '0 0 0 1px rgba(255,255,255,0.3)',
                    }}
                >
                    <Box
                        onClick={() =>
                            navigate(`/proyecto/${project?.name}`, {
                                replace: true,
                                state: { id: project?.id },
                            })
                        }
                        sx={{
                            position: "relative",
                            width: "100%",
                            height: 200,
                            overflow: "hidden",
                            cursor: "pointer",
                            "&:hover .overlay": {
                                opacity: 1,
                            },
                        }}
                    >
                        <ProjectProfileImage
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8,
                                overflow: 'hidden'
                            }}
                            src={project?.image_url || null}
                            fallbackLetter={project?.name?.trim().charAt(0)?.toUpperCase()}
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
                            Ir al proyecto
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
                            py: 0.5,
                            gap: 2,
                        }}
                    >
                        <Box 
                            sx={{
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                            }}
                        >
                            <Typography variant="subtitle2" color="textSecondary">Creado</Typography>
                            <Typography variant="caption">{formatDateParts(project?.created_at).date}</Typography>
                            <Typography variant="caption">{formatDateParts(project?.created_at).time}</Typography>
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
                            <Typography variant="caption">{formatDateParts(project?.updated_at).date}</Typography>
                            <Typography variant="caption">{formatDateParts(project?.updated_at).time}</Typography>
                        </Box>
                    </Paper>
                </Box>

                <Paper sx={{
                    width: "100%", height: '15%', mb: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow:
                        theme.palette.mode === 'dark'
                            ? '0 4px 12px rgba(0,0,0,0.8)'
                            : 3,
                }}>
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
                </Paper>

                <Paper sx={{
                    width: '100%', height: '40%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 1, boxShadow:
                        theme.palette.mode === 'dark'
                            ? '0 4px 12px rgba(0,0,0,0.8)'
                            : 3,
                }}>
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
                                    overflowX: 'hidden',
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
                                        onClick={() =>
                                            navigate(`/usuario/${encodeURIComponent(responsible.email)}`)
                                        }


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
                                                 boxShadow:
                                                theme.palette.mode === 'light'
                                                    ? '0 0 0 1px rgba(0,0,0,0.3)'
                                                    : '0 0 0 1px rgba(255,255,255,0.3)',
                                            }}
                                        >
                                            <Avatar
                                                src={responsible?.image_url || null}
                                                alt={`${responsible?.firstName} ${responsible?.lastName}`}
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

                                                {(() => {
                                                    const roleData = Object.values(roleConfig).find(r => r.value === responsible.role);
                                                    const RoleIcon = roleData?.icon ?? QuestionMarkRoundedIcon;
                                                    
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
            </Box >
        </>
    );
};
