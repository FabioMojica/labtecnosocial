import React, { useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditProgramModal from './EditProgramModal';
import DeleteProgramModal from './DeleteProgramModal';
import { useTheme } from '@emotion/react';

const ProgramItem = ({ program, index, onClick, onDelete, onView, onEdit, isSelected }) => {
  if (!program) return null; 
  const [showViewProgram, setShowViewProgram] = useState(false);
  const [showDeleteProgram, setShowDeleteProgram] = useState(false);
  const theme = useTheme();


  const handleViewProgram = () => {
    setShowViewProgram(true);
    onView?.();
  };
  
  const handleViewDeleteProgram = () => {
    setShowDeleteProgram(true);
  }

  const handleCloseViewProgram = () => {
    setShowViewProgram(false);
  };

  const handleSaveChangesProgram = (editedProgram) => {
    onEdit(editedProgram);
    handleCloseViewProgram();
  }

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
                            : 'rgba(255, 255, 255, 0.1)',
                    transition: 'background-color 0.2s ease',
                },
        border: isSelected ? '2px solid #4b9ce9ff' : theme.palette.mode === "light"
  ? `1px solid #b9c0b3ff`
  : "1px solid #e0e0e0", 
        borderRadius: 1,
        marginBottom: 1,
        cursor: 'pointer',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
      }}
      onClick={onClick}
    >

      <Box sx={{ marginBottom: 1 }}>
        <Typography sx={{ fontWeight: 600 }}>Programa {index}:</Typography>
        <Typography
        variant="caption"
          sx={{
            padding: '4px',
            borderRadius: 1,
            whiteSpace: 'normal',
            wordBreak: 'break-word', 
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            WebkitLineClamp: 2,
            backgroundColor:
                            theme.palette.mode === 'light'
                                ? 'rgba(200, 200, 200, 0.3)'
                                : 'rgba(100, 100, 100, 0.3)',
                        color: theme.palette.text.primary,
          }}
        >
          {program?.programDescription}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
        <Tooltip title='Ver o editar programa'
        
        PopperProps={{
                            modifiers: [
                                { 
                                    name: 'zIndex',
                                    enabled: true, 
                                    options: {
                                        zIndex: 997, 
                                    },
                                },
                            ],
                            style: { zIndex: 997 }, 
                        }}
              >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleViewProgram();
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title='Eliminar programa'
        PopperProps={{
                            modifiers: [
                                { 
                                    name: 'zIndex',
                                    enabled: true, 
                                    options: {
                                        zIndex: 997, 
                                    },
                                },
                            ],
                            style: { zIndex: 997 }, 
                        }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <EditProgramModal
        open={showViewProgram}
        onClose={handleCloseViewProgram}
        program={program}
        onSave={handleSaveChangesProgram}
      />
    </Box>
  );
};

export default ProgramItem;
