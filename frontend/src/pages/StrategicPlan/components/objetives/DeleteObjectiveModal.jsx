import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { useTheme } from '@emotion/react';

const DeleteObjectiveModal = ({ open, onClose, objective, onDelete }) => {
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
        onDelete(objective.id);
        setShowModal(false);
    };

    return (
        <Dialog  
            open={showModal} 
            onClose={handleClose}
        >
            <Box
            sx={{
                backgroundColor: theme.palette.background.paper,
            }}
            >
            <DialogTitle sx={{ fontWeight: 'bold' }}>Eliminar Objetivo</DialogTitle>
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
                ⚠️ Ten en cuenta que tambien se eliminará sus indicadores y programas (y proyectos dentro).
            </Typography>
            <DialogContent sx={{ padding: 2 }}>

                <Typography variant="body2" sx={{ marginBottom: 1 }}>
                    <strong>Título del objetivo:</strong> {objective?.objectiveTitle || 'Sin texto'}
                </Typography>

                <Box sx={{ marginBottom: 2, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', padding: 2, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                        Indicadores:
                    </Typography>
                    {objective?.indicators && objective.indicators.length > 0 ? (
                        <Box
                            sx={{
                                maxHeight: '70px',
                                overflowY: 'auto',
                                "&::-webkit-scrollbar": { width: "2px" },
                                "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "4px" },
                                "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "4px" },
                                "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                            }}
                        >
                            {objective.indicators.map((indicator, index) => (
                                <Box key={index} sx={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 1, gap: 1 }}>
                                    <Typography variant="caption" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        {index + 1}.
                                    </Typography>
                                    <Box sx={{ width: '30%' }}>
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
                                                backgroundColor:
                                                    theme.palette.mode === 'light'
                                                        ? 'rgba(200, 200, 200, 0.3)'
                                                        : 'rgba(100, 100, 100, 0.3)',
                                                color: theme.palette.text.primary,
                                            }}
                                            variant="caption"
                                        >
                                            {indicator.amount}
                                        </Typography>
                                    </Box>
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
                                                backgroundColor:
                                                    theme.palette.mode === 'light'
                                                        ? 'rgba(200, 200, 200, 0.3)'
                                                        : 'rgba(100, 100, 100, 0.3)',
                                                color: theme.palette.text.primary,
                                            }}
                                            variant="caption"
                                        >
                                            {indicator.concept}
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
                            No tiene indicadores registrados
                        </Typography>
                    )}
                </Box>

                {/* Programas */}
                <Box sx={{ marginBottom: 2, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', padding: 2, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                        Programas:
                    </Typography>
                    {objective?.programs && objective.programs.length > 0 ? (
                        <Box
                            sx={{
                                maxHeight: '70px',
                                overflowY: 'auto',
                                "&::-webkit-scrollbar": { width: "2px" },
                                "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "4px" },
                                "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "4px" },
                                "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                            }}
                        >
                            {objective.programs.map((program, index) => (
                                <Box key={index} sx={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 1, gap: 1 }}>
                                    <Typography variant="caption" sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                        {index + 1}.
                                    </Typography>
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
                                                backgroundColor:
                                                    theme.palette.mode === 'light'
                                                        ? 'rgba(200, 200, 200, 0.3)'
                                                        : 'rgba(100, 100, 100, 0.3)',
                                                color: theme.palette.text.primary,
                                            }}
                                            variant="caption"
                                        >
                                            {program.programDescription}
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
                            No tiene programas registrados
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ padding: 2 }}>
                <Button onClick={handleClose} 
                variant='contained'
                >Cancelar
                </Button>
                <Button onClick={handleDelete} color="error" variant="contained">Eliminar</Button>
            </DialogActions>
            </Box>
        </Dialog>
    );
};

export default DeleteObjectiveModal;
