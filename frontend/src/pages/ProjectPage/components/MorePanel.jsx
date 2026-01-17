import React, { useRef, useState } from "react";
import { Box, Button, List, ListItem, ListItemText, Paper, TextField, Typography } from "@mui/material";
import { useHeaderHeight, useNotification } from "../../../contexts";
import { useFetchAndLoad } from "../../../hooks";
import { useNavigate } from "react-router-dom";
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { ButtonWithLoader, FullScreenProgress } from "../../../generalComponents";
import { deleteProjectByIdApi } from "../../../api";
import { Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { slugify } from "../../../utils/slugify";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';


export const MorePanel = ({ project, panelHeight }) => {
    if (!project) return;
    const { headerHeight } = useHeaderHeight();
    const { loading, callEndpoint } = useFetchAndLoad();
    const { notify } = useNotification();
    const [inputName, setInputName] = useState('');
    const inputRef = useRef(null);
    const navigate = useNavigate();


    if (loading) return <FullScreenProgress text="Borrando el proyecto" />;

    const isConfirmed = inputName === project?.name;

    const handleDelete = async () => {
        try {
            await callEndpoint(deleteProjectByIdApi(project.id));
            navigate('/proyectos');
            notify("Proyecto eliminado correctamente", "success");
        } catch (err) {
            notify("Ocurrió un error inesperado al eliminar el proyecto. Inténtalo de nuevo más tarde.", "error");
        }
    };

    return (
        <Box
            sx={{
                width: "100%",
                
                height: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                maxHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                maxWidth: {
                    xs: '100vw',
                    lg: '100%',
                },
                p: 1,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                maxHeight: 1000,
            }}
        >
            <Paper elevation={3} sx={{ padding: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberRoundedIcon color="error" fontSize="large" />
                    <Typography variant='h4' alignContent='center'>
                        Eliminar Proyecto
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex' }}>
                    <Box sx={{ display: 'flex', flex: 4, flexDirection: 'column' }}>
                        <Typography
                            sx={{ wordBreak: 'break-word' }}
                            gutterBottom>
                            Esta acción eliminará el proyecto{' '}
                            <Box
                                component="span"
                            >
                                "{project?.name}"
                            </Box>{' '}
                            de forma <strong>IRREVERSIBLE</strong>.
                        </Typography>
                        <Typography gutterBottom>
                            Por favor ten en cuenta lo siguiente antes de continuar:
                        </Typography>
                        <List>
                            <ListItem>
                                {project?.program?.objective?.strategicPlan?.year ? (
                                    <ListItemText
                                        primary={
                                            <>
                                                * El proyecto se encuentra asignado al programa{' '}
                                                <Box component="span" sx={{ wordBreak: 'break-word', fontWeight: 'bold' }}>
                                                    "{project?.program?.description}"
                                                </Box>{' '}
                                                de la{' '}
                                                <MuiLink
                                                    component={RouterLink}
                                                    to={`/planificacion-estrategica/${project?.program?.objective?.strategicPlan?.year}`}
                                                    sx={{ color: 'orange', fontWeight: 'bold', textDecoration: 'none' }}
                                                >
                                                    planificación estratégica del año {project?.program?.objective?.strategicPlan?.year}
                                                </MuiLink>.
                                            </>
                                        }
                                    />
                                ) : (
                                    <ListItemText
                                        primary="* Este proyecto no está asignado en ningún programa de algún plan estratégico actualmente."
                                    />
                                )}
                            </ListItem>

                            <ListItem>
                                {
                                    project?.operationalPlanVersion ? (
                                        <ListItemText
                                            primary={
                                                <>
                                                    * Se eliminará también todo su{' '}
                                                    <MuiLink
                                                        component={RouterLink}
                                                        to={`/planificacion-operativa/${slugify(project?.name)}`}
                                                        state={{ id: project?.id }}
                                                        sx={{ color: 'orange', fontWeight: 'bold', textDecoration: 'none' }}
                                                    >
                                                        plan operativo
                                                    </MuiLink>{' '}
                                                    asociado.
                                                </>
                                            }
                                        />
                                    ) : (
                                        <ListItemText
                                            primary="* Este proyecto no tiene un plan operativo asociado."
                                        />
                                    )
                                }
                            </ListItem>

                            <ListItem>
                                <ListItemText
                                    primary={
                                        <>
                                            {project?.projectResponsibles?.length === 0 ? (
                                                "* Este proyecto no tiene ningún responsable asignado."
                                            ) : (
                                                    <>
                                                        * Este proyecto tiene {project?.projectResponsibles?.length}{" "}
                                                        {project?.projectResponsibles?.length === 1 ? "responsable" : "responsables"}{" "}
                                                        {project?.projectResponsibles?.length === 1
                                                            ? "que será desasignado del mismo."
                                                            : "que serán desasignados del mismo."}
                                                    </>
                                            )}
                                        </>
                                    }
                                />
                            </ListItem>

                            <ListItem>
                                <ListItemText
                                    primary="Esta operación es irreversible y no se podrá deshacer."
                                />
                            </ListItem>
                        </List>
                    </Box>

                    <Box
                        sx={{
                            display: {
                                xs: 'none',
                                lg: 'flex'
                            },
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                            minHeight: 150,
                        }}
                    >
                        <DeleteOutlineIcon sx={{ fontSize: 200 }} /> {/* 🔹 Icono grande */}
                    </Box>
                </Box>

                <Box sx={{
                    display: 'flex',
                    width: '100%',
                    flexDirection: {
                        xs: 'column',
                        lg: 'row'
                    },
                    gap: 1,
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                        <Typography variant="subtitle2">
                            Por favor, escribe el nombre exacto del proyecto para confirmar:
                        </Typography>

                        <TextField
                            inputRef={inputRef}
                            fullWidth
                            value={inputName}
                            onChange={(e) => setInputName(e.target.value)}
                            variant="outlined"
                            placeholder="Nombre del proyecto"
                            autoComplete="off"
                            slotProps={{ htmlInput: { maxLength: 100 } }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', alignSelf: 'self-end', justifyContent: 'flex-end', gap: 1, height: 55 }}>
                        <Button
                            sx={{
                                width: {
                                    xs: 100,
                                    lg: 170},
                                fontSize: {
                                    xs: '0.9rem',
                                    sm: '0.9rem',
                                    lg: '0.9rem'
                                }
                            }}
                            variant="contained"
                            color="success"
                            onClick={() => setInputName('')}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <ButtonWithLoader
                            loading={loading}
                            onClick={handleDelete}
                            disabled={!isConfirmed || loading}
                            variant="contained"
                            backgroundButton={theme => theme.palette.error.main}
                            sx={{
                                color: 'white', px: 2,
                                width: {
                                    xs: 100,
                                    lg: 170},
                                fontSize: {
                                    xs: '0.9rem',
                                    sm: '0.9rem',
                                    lg: '0.9rem'
                                }
                            }}
                        >
                            Eliminar
                        </ButtonWithLoader>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};
