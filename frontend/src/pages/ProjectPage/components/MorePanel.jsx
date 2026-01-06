import React, { useRef, useState } from "react";
import { Box, Button, List, ListItem, ListItemText, Paper, TextField, Typography } from "@mui/material";
import { useHeaderHeight, useNotification } from "../../../contexts";
import { useFetchAndLoad } from "../../../hooks";
import { useNavigate } from "react-router-dom";
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { FullScreenProgress } from "../../../generalComponents";
import { deleteProjectByIdApi } from "../../../api";
import { Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';


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
                minHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                height: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                maxHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                p: 1,
                display: "flex",
                flexDirection: "column",
                gap: 1,
            }}
        >
            <Paper elevation={3} sx={{ padding: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberRoundedIcon color="error" fontSize="large" />
                    <Typography variant='h4' alignContent='center'>
                        Eliminar Proyecto
                    </Typography>
                </Box>

                <Box>
                    <Typography gutterBottom>
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
                                            * El proyecto se encuentra asignado al programa "{project?.program?.description}" de la{' '}
                                            <MuiLink
                                            component={RouterLink}
                                                to={`/planificacion/estrategica/${project?.program?.objective?.strategicPlan?.year}`}
                                                
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
                            <ListItemText
                                primary={
                                    <>
                                        * Se eliminará también todo su{' '}
                                        <MuiLink
                                            component={RouterLink}
                                            to={`/planificacion/operativa/${project?.id}`}
                                            sx={{ color: 'orange', fontWeight: 'bold', textDecoration: 'none' }}
                                        >
                                            plan operativo
                                        </MuiLink>{' '}
                                        asociado.
                                    </>
                                }
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemText primary="* Se desasignarán del proyecto todos los responsables asignados al mismo." />
                        </ListItem>

                        <ListItem>
                            <ListItemText
                                primary="Esta operación es irreversible y no se podrá deshacer."
                            />
                        </ListItem>
                    </List>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button onClick={() => setInputName('')} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            disabled={!isConfirmed || loading}
                            onClick={handleDelete}
                        >
                            Eliminar
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};
