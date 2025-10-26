

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import RenderAvatar from '../../../../generalComponents/RenderAvatar';

const DeleteProgramModal = ({ open, onClose, program, onDelete }) => {
    const [showModal, setShowModal] = useState(open);

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
            <DialogTitle sx={{ backgroundColor: '#f5f5f5', fontWeight: 600 }}>Eliminar Programa</DialogTitle>
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
                        <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {program.operationalProjects.map((project, index) => (
                                <Box key={index} sx={{ display: 'flex', flexDirection: 'row',justifyContent: 'flex-start', marginBottom: 1, gap: 2}}>
                                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 600}}>
                                        {index + 1}.
                                    </Box>
                                    <RenderAvatar
                                        image={project.image_url || project.image }
                                        fallbackText={project.name}
                                        size={38}
                                        type="project"
                                    />
                                    <Box sx={{ width: '30%' }}>
                                        <Box
                                            sx={{
                                                padding: '4px',
                                                backgroundColor: '#f9f9f9',
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                height: "auto",
                                                whiteSpace: 'nowrap', 
                                                wordBreak: 'break-all',
                                            }}
                                        >
                                            {project.name}
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" sx={{ color: 'gray' }}>No tiene proyectos operativos vinculados</Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ padding: 2 }}>
                <Button onClick={handleClose} sx={{ color: '#1976d2' }}>Cancelar</Button>
                <Button onClick={handleDelete} color="error" variant="contained">Eliminar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteProgramModal;
