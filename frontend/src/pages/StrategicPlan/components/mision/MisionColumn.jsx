import React from 'react';
import { Box, Typography, Tooltip, IconButton, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MisionItem from './MisionItem';
import { useTheme } from '@emotion/react';

const MisionColumn = ({ mission, onEdit, onDelete, onCreate, isSelected, onSelect }) => {
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
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1.5}}>
          <Typography variant="h6">Misión</Typography>
          {!mission && (
            <Tooltip title="Agregar misión">
              <IconButton onClick={onCreate} size="small" color="primary">
                <AddIcon fontSize="small"/>
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Divider sx={{ marginBottom: 5.9 }} />
        <Divider sx={{ marginBottom: 1 }} />
      </Box>

      {mission ? (
        <MisionItem
          text={mission}
          onEdit={onEdit}
          onDelete={onDelete}
          isSelected={isSelected}
          onSelect={onSelect}
        />
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
          No se ha definido una misión.
        </Typography>
      )}
    </Box>
  );
};

export default MisionColumn;
