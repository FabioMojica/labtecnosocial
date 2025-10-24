// DeleteModal.jsx
import React from 'react';
import { Modal, Box, Typography, IconButton, Paper, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DeleteModal = ({
    open,
    onClose,
    item,
    onConfirm,
    contentType,
    modalStyle = {},
}) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            disableBackdropClick
        >
            <Box sx={{ ...modalStyle, p: 2 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="error.main" gutterBottom>
                        ¿Estás seguro que deseas borrar este elemento?
                    </Typography>
                    <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Contenido según tipo */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 2
                    }}
                >
                    {contentType === 'Objetivos' && item && (
                        <>
                            <Typography variant="subtitle1" gutterBottom><b>Objetivo a eliminar:</b></Typography>
                            <Typography paragraph>{item.title}</Typography>

                            <Typography variant="subtitle2" gutterBottom>Indicadores:</Typography>
                            {item.indicators?.map((ind, index) => (
                                <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                                    • {ind.quantity} {ind.concept}
                                </Typography>
                            ))}

                            {item.relatedContent?.programs?.length > 0 && (
                                <>
                                    <Typography variant="subtitle2" sx={{ mt: 2, color: 'warning.main' }}>
                                        Este objetivo contiene los siguientes programas que también serán eliminados:
                                    </Typography>
                                    {item.relatedContent.programs.map((prog, idx) => (
                                        <Box key={idx} sx={{ ml: 2, mt: 1 }}>
                                            <Typography variant="body2">• Programa: {prog.description}</Typography>
                                            {prog.projects?.length > 0 && (
                                                <Box sx={{ ml: 2 }}>
                                                    <Typography variant="body2" color="warning.main">
                                                        Proyectos que serán desvinculados:
                                                    </Typography>
                                                    {prog.projects.map((proj, i) => (
                                                        <Typography key={i} variant="body2" sx={{ ml: 2 }}>
                                                            ◦ {proj.title || proj.name}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </>
                            )}
                        </>
                    )}

                    {contentType === 'Programas' && item && (
                        <>
                            <Typography variant="subtitle1" gutterBottom><b>Programa a eliminar:</b></Typography>
                            <Typography paragraph>{item.text || item.description}</Typography>

                            {item.relatedContent?.projects?.length > 0 && (
                                <>
                                    <Typography variant="subtitle2" sx={{ color: 'warning.main' }}>
                                        Los siguientes proyectos serán desvinculados:
                                    </Typography>
                                    {item.relatedContent.projects.map((proj, index) => (
                                        <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                                            • {proj.title || proj.name}
                                        </Typography>
                                    ))}
                                </>
                            )}
                        </>
                    )}

                    {contentType === 'Proyectos' && item && (
                        <>
                            <Typography variant="subtitle1" gutterBottom><b>Proyecto a desvincular:</b></Typography>
                            <Typography variant="body1">{item.title}</Typography>
                            {item.description && (
                                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                    {item.description}
                                </Typography>
                            )}
                        </>
                    )}
                </Paper>

                {/* Botón eliminar */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            if (contentType === 'objective') {
                                setValue(prev => ({
                                    ...prev,
                                    title: cleanExtraSpaces(prev.title),
                                    indicators: prev.indicators.map(ind => ({
                                        ...ind,
                                        concept: cleanExtraSpaces(ind.concept)
                                    }))
                                }));
                            } else {
                                setValue(prev => cleanExtraSpaces(prev));
                            }

                            onSave();
                        }}
                    >
                        Eliminar
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default DeleteModal;
