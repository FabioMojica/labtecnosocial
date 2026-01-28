import {
    Grid,
    Typography,
    Box,
    IconButton,
    Stack,
    Avatar,
    Divider,
    Tooltip,
    useTheme,
    Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth, useHeaderHeight } from "../../../contexts";

import {
    ProjectImageDates,
} from "../../../generalComponents";
import { integrationsConfig } from "../../../utils";
import { getUserIcons, getRoleAndStateData } from "../../../utils/getRoleAndStateData";

import EditIcon from '@mui/icons-material/Edit';
import { EditProjectDialog } from "./EditProjectDialog";
import { useNavigate } from "react-router-dom";

export const ViewProject = ({ projectData, panelHeight = 0, onProjectUpdated }) => {
    const { headerHeight } = useHeaderHeight();
    const [project, setProject] = useState(projectData);
    const { isUser, isAdmin, isSuperAdmin } = useAuth();
    const [modalEditProjectOpen, setModalEditProjectpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setProject(projectData);
    }, [projectData])

    return (
        <Grid
            container
            rowSpacing={1}
            columnSpacing={3}
            sx={{
                width: "100%",
                minHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                height: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                maxHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                p: 1,
                position: 'relative',
                maxWidth: '100vw'
            }}
        >
            {
                (isAdmin || isSuperAdmin) &&
                <IconButton sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    boxShadow: 3,
                    zIndex: 500
                }}

                    onClick={() => { setModalEditProjectpen(true) }}
                >
                    <Tooltip title="Editar proyecto">
                        <EditIcon fontSize="large"></EditIcon>
                    </Tooltip>
                </IconButton>
            }

            <Grid
                size={{ xs: 12, md: 5 }}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    height: `calc(100vh - ${headerHeight}px - ${panelHeight}px - 24px)`,
                    maxHeight: {
                        xs: 250,
                        sm: 300,
                        lg: `calc(100vh - ${headerHeight}px - ${panelHeight}px - 24px)`,
                    },
                    pointerEvents: 'none'
                }}>
                <ProjectImageDates
                    sx={{
                        height: '100%',
                        width: {
                            xs: 250,
                            sm: 400,
                            lg: '100%'
                        },
                        maxHeight: 500,
                        cursor: "pointer"
                    }}
                    project={project}
                    fallbackLetter={(project?.name)?.trim().charAt(0)?.toUpperCase()}
                />

            </Grid>

            <Grid
                container
                spacing={1}
                size={{ xs: 12, md: 7 }}
                sx={{
                    height: "auto",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" fontWeight="bold">
                        Información del proyecto
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: { xs: 'normal' },
                        }}
                    >
                        {project?.name}
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {project?.description}
                    </Typography>
                </Box>
                <Divider sx={{ width: '100%' }} />
                <Typography variant="h6" fontWeight="bold">
                    Programa
                </Typography>
                {project?.program ? (
                    <Stack direction="row" spacing={1}>
                        <Box
                            sx={{
                                px: 1.5,
                                py: 1,
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                boxShadow: 3,
                                fontWeight: 500,
                                fontSize: "0.85rem",
                                fontWeight: 'bold',
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                navigate(`/planificacion-estrategica/${encodeURIComponent(project?.program?.objective?.strategicPlan?.year)}`)
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: 250, maxWidth: 300 }}>
                                {/* Plan estratégico */}
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body1" fontWeight="bold" sx={{ flexShrink: 0 }} lineHeight={1}>
                                        🧭 Plan estratégico:
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        lineHeight={1}
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            flexGrow: 1,
                                        }}
                                    >
                                        {project?.program?.objective?.strategicPlan?.year}
                                    </Typography>
                                </Box>
                                <Divider />

                                {/* Objetivo */}
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body1" fontWeight="bold" sx={{ flexShrink: 0 }} lineHeight={1}>
                                        🎯 Objetivo:
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        fontWeight="bold"
                                        lineHeight={1}
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            flexGrow: 1,
                                        }}
                                    >
                                        {project?.program?.objective?.title}
                                    </Typography>
                                </Box>
                                <Divider />

                                {/* Programa */}
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body1" fontWeight="bold" sx={{ flexShrink: 0 }} lineHeight={1}>
                                        📦 Programa:
                                    </Typography>
                                    <Typography
                                        lineHeight={1}
                                        variant="caption"
                                        fontWeight="bold"
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            flexGrow: 1,
                                        }}
                                    >
                                        {project?.program?.description}
                                    </Typography>
                                </Box>
                            </Box>

                        </Box>
                    </Stack>
                ) : (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            color: "gray",
                            fontStyle: "italic",
                            fontSize: "0.9rem",
                        }}
                    >
                        Este proyecto no está asociado a ningún programa de algún plan estratégico
                    </Typography>
                )}
            </Grid>

            <Divider sx={{ width: '100%' }} />

            <Grid columns={12} sx={{ width: '100%', mt: 1 }}>
                <Typography variant="h5" fontWeight="bold" mb={1}>
                    Integraciones
                    <Typography component="span" color="text.secondary">
                        {" "}({project?.integrations?.length || 0})
                    </Typography>
                </Typography>

                {project?.integrations?.length > 0 ? (
                    <Stack
                        direction="row"
                        rowGap={1}
                        columnGap={1}
                        flexWrap="wrap"
                        marginY={1}
                        justifyContent={{
                            xs: 'center',
                            lg: 'flex-start'
                        }}
                    >
                        {
                            Array(1).fill(project?.integrations || []).flat().map((i, index) => {
                                const config = integrationsConfig[i?.platform];

                                if (!config) return null;

                                const Icon = config.icon;


                                return (
                                    <Paper
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation(); window.open(i?.url, "_blank")
                                        }}
                                        sx={{
                                            p: 1,
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-start',
                                            alignItems: 'flex-start',
                                            gap: 1,
                                            minWidth: {
                                                xs: 300,
                                                lg: 250
                                            }
                                        }}>
                                        <Box

                                            sx={{
                                                display: 'flex',
                                                gap: 1,
                                                justifyContent: 'start'
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    bgcolor: config.color,
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: 2,
                                                    boxShadow: (theme) =>
                                                        theme.palette.mode === 'light'
                                                            ? '0 0 0 1px rgba(0,0,0,0.3)'
                                                            : '0 0 0 1px rgba(255,255,255,0.3)',
                                                }}
                                            >
                                                <Icon sx={{ color: "#fff" }} />
                                            </Avatar>
                                            <Typography fontWeight="bold" variant="h4" noWrap>
                                                {config.label}
                                            </Typography>
                                        </Box>

                                        <Typography width={{
                                            xs: 300,
                                            lg: 230
                                        }} textAlign={'center'} variant="body1" fontWeight={'bold'} color="text.secondary" noWrap>
                                            {i?.name}
                                        </Typography>
                                        <Typography sx={{
                                            textDecoration: 'underline',
                                            ":hover": {
                                                color: 'primary.main',
                                            },
                                            fontWeight: 'bold'
                                        }} width={{
                                            xs: 300,
                                            lg: 230
                                        }} textAlign={'left'} variant="caption" color="text.secondary" noWrap>
                                            {i?.url}
                                        </Typography>
                                    </Paper>
                                )
                            })}
                    </Stack>
                ) : (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            color: "gray",
                            fontStyle: "italic",
                            fontSize: "0.9rem",
                        }}
                    >
                        Este proyecto no se ha integrado con ninguna plataforma
                    </Typography>
                )}
            </Grid>


            <Divider sx={{ width: '100%' }} />

            <Grid size={{ xs: 12, md: 7 }} sx={{ pb: 20 }}>
                <Typography variant="h5" fontWeight="bold">
                    Responsables del proyecto
                    <Typography component="span" color="text.secondary">
                        {" "}({project?.projectResponsibles?.length})
                    </Typography>
                </Typography>

                {project?.projectResponsibles?.length > 0 ? (
                    <Stack
                        direction="row"
                        rowGap={1}
                        columnGap={1}
                        flexWrap="wrap"
                        marginY={1}
                    >
                        {Array(1).fill(project?.projectResponsibles || []).flat().map((r, index) => (
                            <Paper sx={{
                                p: 1,
                                borderRadius: 2,
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 1,
                            }}
                                key={index}
                                onClick={() => {
                                    navigate(`/usuario/${encodeURIComponent(r?.email)}`)
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                    }}
                                >
                                    <Avatar
                                        title={`${r?.firstName} ${r?.lastName}`}
                                        key={`${r?.id}-${index}`}
                                        src={r?.image_url || null}
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: 2,
                                            boxShadow: (theme) =>
                                                theme.palette.mode === 'light'
                                                    ? '0 0 0 1px rgba(0,0,0,0.3)'
                                                    : '0 0 0 1px rgba(255,255,255,0.3)',
                                        }}
                                    >
                                        {String(r?.firstName[0]).toUpperCase()}{String(r?.lastName[0]).toUpperCase()}
                                    </Avatar>

                                    {(() => {
                                        const { RoleIcon } = getUserIcons(r);
                                        return (
                                            <RoleIcon
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: -10,
                                                    right: -10,
                                                    fontSize: 30,
                                                }}
                                            />
                                        );
                                    })()}

                                </Box>
                                <Typography textOverflow={'ellipsis'} fontWeight={'bold'} noWrap maxWidth={64}>{`${String(r.firstName)} ${String(r.lastName)}`}</Typography>
                            </Paper>
                        ))}
                    </Stack>
                ) : (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            color: "gray",
                            fontStyle: "italic",
                            fontSize: "0.9rem",
                        }}
                    >
                        Este proyecto no tiene responsables asignados
                    </Typography>
                )}
            </Grid>



            <EditProjectDialog
                open={modalEditProjectOpen}
                onClose={() => { setModalEditProjectpen(false) }}
                projectData={project}
                onSaved={onProjectUpdated}
            />
        </Grid>
    );
};
