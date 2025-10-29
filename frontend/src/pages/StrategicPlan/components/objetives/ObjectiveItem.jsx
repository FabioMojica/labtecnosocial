import React, { useState } from 'react';
import { Box, Typography, IconButton, List, ListItem, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewEditObjective from './ViewEditObjective';
import { useTheme } from '@emotion/react';

const ObjectiveItem = ({ objective, onClick, onEdit, onDelete, isSelected }) => {
    const theme = useTheme();
    const [showViewObjective, setShowViewObjective] = useState(false);

    const handleViewObjective = () => {
        setShowViewObjective(true); 
    };

    const handleCloseViewObjective = () => {
        setShowViewObjective(false);
    };

    const handleSaveChanges = (editedObjective) => {
        onEdit(editedObjective);
        setShowViewObjective(false);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 1,
                '&:hover': {
                    backgroundColor:
                        theme.palette.mode === 'light'
                            ? 'rgba(0, 0, 0, 0.05)'
                            : 'rgba(255, 255, 255, 0.08)',
                    transition: 'background-color 0.2s ease',
                },
                borderRadius: 1,
                marginBottom: 1,
                cursor: 'pointer',
                border: '1px solid #e0e0e0',
                boxShadow: isSelected
                    ? '0 6px 15px rgba(25, 118, 210, 0.5)'
                    : '0px 2px 5px rgba(0, 0, 0, 0.1)',
                maxHeight: '300px',
            }}
            onClick={onClick}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Titulo de objetivo:
                </Typography>
                <Typography
                    sx={{
                        padding: '4px',
                        backgroundColor: '#f5f5f5',
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
                    {objective.objectiveTitle}
                </Typography>
            </Box>

            {/* Indicadores */}
            <Typography variant="body2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', p: 1 }}>
                Indicadores:
            </Typography>

            <Box
                sx={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                        "&::-webkit-scrollbar": { width: "2px" },
                        "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
                        "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
                        "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                }}
            >
                {objective.indicators?.length > 0 ? (
                    <List dense>
                        {objective.indicators.map((indicator, index) => (
                            <ListItem key={index} sx={{ mb: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                                    <Box sx={{ width: '5%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginRight: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: 0.8 }}>
                                            {index + 1}.
                                        </Typography>
                                    </Box>
                                    <Box sx={{ width: '30%', marginRight: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.55rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            Cantidad:
                                        </Typography>
                                        <Typography
                                            sx={{
                                                padding: '4px',
                                                backgroundColor:
                                                    theme.palette.mode === 'light'
                                                        ? 'rgba(200, 200, 200, 0.3)'
                                                        : 'rgba(100, 100, 100, 0.3)',
                                                color: theme.palette.text.primary,
                                                borderRadius: 1,
                                                whiteSpace: 'normal',
                                                wordBreak: 'break-word',
                                                display: '-webkit-box',
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                WebkitLineClamp: 1,
                                                height: 'auto',
                                            }}
                                            variant="caption"
                                        >
                                            {indicator.amount}
                                        </Typography> 
                                    </Box>
                                    <Box sx={{ width: '60%' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.55rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            Concepto:
                                        </Typography>
                                        <Typography
                                            sx={{
                                                padding: '4px',
                                                backgroundColor:
                                                    theme.palette.mode === 'light'
                                                        ? 'rgba(200, 200, 200, 0.3)'
                                                        : 'rgba(100, 100, 100, 0.3)',
                                                color: theme.palette.text.primary,
                                                borderRadius: 1,
                                                whiteSpace: 'normal',
                                                wordBreak: 'break-all',
                                                display: '-webkit-box',
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                WebkitLineClamp: 1,
                                                height: 'auto',
                                            }}
                                            variant="caption"
                                        >
                                            {indicator.concept}
                                        </Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                        ))}

                    </List>
                ) : (
                    <Typography
                        variant="body2"
                        sx={{
                            padding: '4px',
                            color: 'gray',
                            fontStyle: 'italic',
                            textAlign: 'center',
                            fontSize: '0.75rem',
                        }}
                    >
                        No se han creado indicadores.
                    </Typography>
                )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 1 }}>
                <Tooltip title="Ver o editar objetivo">
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleViewObjective(); }}
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar objetivo">
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <ViewEditObjective
                open={showViewObjective}
                onClose={handleCloseViewObjective}
                objective={objective}
                onSave={handleSaveChanges}
            />
        </Box>
    );
};

export default ObjectiveItem;
