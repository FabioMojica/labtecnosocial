

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Avatar } from '@mui/material';
import RenderAvatar from '../../../../generalComponents/RenderAvatar';
import { useTheme } from '@emotion/react';
const API_UPLOADS = import.meta.env.VITE_BASE_URL;


const DeleteProgramModal = ({ open, onClose, program, onDelete }) => {
    const [showModal, setShowModal] = useState(open);
    const theme = useTheme();

    useEffect(() => {
        setShowModal(open);
    }, [open]);

    const handleClose = () => {
        setShowModal(false);
        onClose();
    };

    const handleDelete = () => {
        onDelete();
        setShowModal(false);
    };

    return ( 
        <Dialog open={showModal} onClose={handleClose}>
            <Box
                        sx={{
                            backgroundColor: theme.palette.background.paper,
                        }}
                        >
            <DialogTitle sx={{ fontWeight: 'bold' }}>Eliminar Programa</DialogTitle>
            <Typography
                sx={{
                    backgroundColor: '#fdecea',
                    color: '#d32f2f',
                    fontSize: '12px',
                    padding: '4px',
                    borderRadius: '4px',
                    marginTop: 1,
                    marginX: 1,
                }}
            >
                ⚠️ Ten en cuenta que el programa desvinculará también sus proyectos operativos asociados.
            </Typography>
            <DialogContent sx={{ padding: 2 }}>

                <Typography variant="body2" sx={{ marginBottom: 1 }}>
                    <strong>Título del programa:</strong> {program?.programDescription || 'Sin descripción'}
                </Typography>

                <Box sx={{ marginBottom: 2, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', padding: 2, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: 1 }}>
                        Proyectos asociados:
                    </Typography>
                    {program?.operationalProjects && program.operationalProjects.length > 0 ? (
                        <Box sx={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                            "&::-webkit-scrollbar": { width: "2px" },
                            "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
                            "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
                            "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                        }}>
                            {program.operationalProjects.map((project, index) => (
                                <Box key={index} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 1, gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 600 }}>
                                        {index + 1}.
                                    </Box>
                                    <Avatar
                                        src={project.image_url ? `${API_UPLOADS}${project.image_url}` : undefined}
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 2,
                                            objectFit: "cover",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {project.name[0]}
                                    </Avatar>
                                    <Box sx={{ width: '100%' }}>
                                        <Typography
                                            sx={{
                                                padding: '4px',
                                                borderRadius: 1,
                                                whiteSpace: 'normal',
                                                wordBreak: 'break-word',
                                                display: '-webkit-box',
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                WebkitLineClamp: 2,
                                                height: 'auto',
                                                width: '100%',
                                                backgroundColor:
                                                    theme.palette.mode === 'light'
                                                        ? 'rgba(200, 200, 200, 0.3)'
                                                        : 'rgba(100, 100, 100, 0.3)',
                                                color: theme.palette.text.primary,
                                            }}
                                            variant="caption"
                                        >
                                            {project.name}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                       <Typography
                                                                       variant="body2"
                                                                       sx={{
                                                                           padding: '4px',
                                                                           color: 'gray',
                                                                           fontStyle: 'italic',
                                                                           textAlign: 'left',
                                                                           fontSize: '0.75rem',
                                                                       }}
                                                                   >
                            No tiene proyectos operativos vinculados
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ padding: 2 }}>
                <Button 
                variant='contained'
                onClick={handleClose}>
                    Cancelar</Button>
                <Button onClick={handleDelete} color="error" variant="contained">Eliminar</Button>
            </DialogActions>
            </Box>
        </Dialog>
    );
};

export default DeleteProgramModal;
