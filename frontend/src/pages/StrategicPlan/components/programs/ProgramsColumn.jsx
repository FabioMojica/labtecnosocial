import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ProgramItem from './ProgramItem';
import { useTheme } from '@emotion/react';

const ProgramsColumn = ({
    objectives,
    selectedProgramId,
    selectedObjectiveId,
    onSelectProgram,
    onEditProgram,
    onDeleteProgram,
    onViewProgram,
    onCreateProgram,
    selectedObjective
}) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                width: 300,
                minWidth: 'auto',
                display: 'flex',
                flexDirection: 'column',
                padding: 2,
                borderRadius: 2,
                boxShadow:
                    theme.palette.mode === 'dark'
                        ? '0 4px 12px rgba(0,0,0,1)' : 3,
            }}
        >

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Programas</Typography>
                    <Tooltip title="Agregar objetivo">
                        <span>
                            <IconButton
                                onClick={onCreateProgram}
                                disabled={!selectedObjectiveId}
                                size="small"
                                color="primary"
                            >
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
                <Divider />
                <Typography variant="caption" color="text.secondary" sx={{
                    display: '-webkit-box',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.5,
                    height: '35px',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    WebkitLineClamp: 2,
                }}>
                    {selectedObjective
                        ? `Objetivo: ${selectedObjective.objectiveTitle}`
                        : 'Seleccione un objetivo'}
                </Typography>
                <Divider sx={{ marginBottom: 1 }} />
            </Box>

            {objectives.length === 0 && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{
                        mt: 5,
                        padding: '4px',
                        color: 'gray',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                    }}
                >
                    No hay objetivos para mostrar programas
                </Typography>
            )}

            {objectives.map((objective) => (
                <Box
                    key={objective.id}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: 1,
                        '&:hover': { backgroundColor: '#f5f5f5' },
                        borderRadius: 1,
                        marginBottom: 3,
                        border: '1px solid #e0e0e0',
                        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                        backgroundColor: objective.id === selectedObjectiveId ? '#e3f2fd' : 'white',
                    }}
                >

                    <Typography
                        fontWeight="bold"
                        noWrap
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '100%',
                        }}
                    >
                        🎯: {objective.objectiveTitle || 'Sin título'}
                    </Typography>

                    {objective.programs && objective.programs.length > 0 ? (
                        objective.programs.map((program, index) => (
                            <ProgramItem
                                key={program.id}
                                program={program}
                                index={index + 1}
                                onClick={() => onSelectProgram(program.id)}
                                onDelete={() => onDeleteProgram(program.id)}
                                onEdit={onEditProgram}
                                onView={() => onViewProgram(program.id)}
                                isSelected={selectedProgramId === program.id}
                            />
                        ))
                    ) : (

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{
                                mt: 5,
                                padding: '4px',
                                color: 'gray',
                                fontStyle: 'italic',
                                textAlign: 'center',
                                fontSize: '0.75rem',
                            }}>
                            No hay programas en este objetivo.
                        </Typography>
                    )}
                </Box>
            ))}
        </Box>
    );
};

export default ProgramsColumn;
