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
    programRefs,
    selectedObjectiveId,
    onSelectProgram,
    handleSelectObjective,
    onEditProgram,
    onDeleteProgram,
    onViewProgram,
    onCreateProgram,
    selectedObjective,
    highlightedItem,
    isFullscreen,
    headerHeight
}) => {
    const theme = useTheme();

    const totalPrograms = objectives.reduce(
        (acc, obj) => acc + (obj.programs?.length || 0),
        0
    );

    return (
        <Box
            sx={{
                width: '100%',
                minWidth: 'auto',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '100%',
                backgroundColor:
                    theme.palette.background.paper,
                borderRadius: 2,
                boxShadow:
                    theme.palette.mode === 'dark'
                        ? '0 4px 12px rgba(0,0,0,1)' : 3,
            }}
        >

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                position: 'sticky',
                top: isFullscreen ? 0 : 80 + headerHeight,
                overflow: 'hidden',
                borderRadius: 2,
                zIndex: isFullscreen ? 3000 : 998,
                px: 2,
                pl: 2,
                pr: 2,
                pt: 2,
                backgroundColor:
                    theme.palette.background.paper,
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                        variant="h6"
                    >
                        Programas{" "}
                        <Typography
                            component="span"
                            color="text.secondary"
                            fontWeight="normal"
                        >
                            ({totalPrograms})
                        </Typography>
                    </Typography>
                    <Tooltip title="Agregar programa">
                        <span>
                            <IconButton
                                onClick={onCreateProgram}
                                disabled={(!selectedObjectiveId && !selectedObjective)}
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
                    ...(selectedObjective
                        ? {}
                        : {
                            color: 'gray',
                            fontStyle: 'italic',
                            textAlign: 'center',
                            fontSize: '0.75rem',
                        }),
                }}>
                    {selectedObjective
                        ? `Objetivo: ${selectedObjective.objectiveTitle}`
                        : 'Seleccione un objetivo'}
                </Typography>
                <Divider sx={{ marginBottom: 1 }} />
            </Box>


            <Box sx={{
                px: 2,
                width: '100%',
                height: '100%'
            }}>
                {objectives.length === 0 && (
                    <Box sx={{
                        width: '100%',
                        height: '100%',
                        p: 5
                    }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{
                                padding: '4px',
                                color: 'gray',
                                fontStyle: 'italic',
                                textAlign: 'center',
                                fontSize: '0.75rem',
                            }}
                        >
                            No hay objetivos para mostrar programas
                        </Typography>
                    </Box>
                )}

                {objectives.map((objective) => (
                    <Box
                        key={objective.id}
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
                            cursor: 'pointer',
                            borderRadius: 1,
                            marginBottom: 3,
                            border: theme.palette.mode === "light"
                                ? `1px solid #b9c0b3ff`
                                : "1px solid #e0e0e0",
                            boxShadow: ((objective.id === selectedObjectiveId))
                                ? '0 6px 15px rgba(25, 118, 210, 0.5)'
                                : '0px 2px 5px rgba(0, 0, 0, 0.1)',
                        }}
                        onClick={() => {
                            handleSelectObjective(objective.id)
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
                            🎯{objective.objectiveTitle || 'Sin título'}
                        </Typography>

                        {objective.programs && objective.programs.length > 0 && (
                            <Typography
                                fontWeight="bold"
                                noWrap
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    width: '100%',
                                    mb: 0.5
                                }}
                            >
                                Programas ({objective.programs?.length || 0}):
                            </Typography>
                        )}

                        {objective.programs && objective.programs.length > 0 ? (
                            objective.programs.map((program, index) => (
                                <Box
                                    key={program.id}
                                    ref={(el) => (programRefs.current[program.id] = { current: el })}
                                >
                                    <ProgramItem
                                        key={program.id}
                                        highlightedItem={highlightedItem}
                                        program={program}
                                        index={index + 1}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectObjective(objective.id);
                                            onSelectProgram(program.id)
                                        }}
                                        onDelete={() => onDeleteProgram(program.id)}
                                        onEdit={onEditProgram}
                                        onView={() => onViewProgram(program.id)}
                                        isSelected={selectedProgramId === program.id}
                                    />
                                </Box>
                            ))
                        ) : (
                            <Box sx={{
                                py: 5,
                                width: '100%',
                                height: '100%'
                            }}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    align="center"
                                    sx={{
                                        padding: '4px',
                                        color: 'gray',
                                        fontStyle: 'italic',
                                        textAlign: 'center',
                                        fontSize: '0.75rem',
                                    }}>
                                    No hay programas en este objetivo.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default ProgramsColumn;
