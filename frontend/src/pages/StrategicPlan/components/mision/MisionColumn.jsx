import React from 'react';
import { Box, Typography, Tooltip, IconButton, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MisionItem from './MisionItem';
import { useTheme } from '@emotion/react';

const MisionColumn = ({ missionRef, mission, onEdit, onDelete, onCreate, isSelected, onSelect, highlightedItem, isFullscreen, headerHeight }) => {
  const theme = useTheme();
  
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
        zIndex: 998,
        px: 2,
        pl: 2,
        pr: 2,
        pt: 2,
        backgroundColor:
          theme.palette.background.paper,
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="h6">Misión</Typography>
            {!mission && (
              <Tooltip title="Agregar misión">
                <IconButton onClick={onCreate} size="small" color="primary">
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Divider sx={{ marginBottom: 5.9 }} />
          <Divider sx={{ marginBottom: 1 }} />
        </Box>
      </Box>

      <Box
        sx={{
          px: 2,
          width: '100%',
          height: '100%',
        }}>
        {mission ? (
          <Box 
            ref={(el) => (missionRef.current = el)}
          >
            <MisionItem 
              highlightedItem={highlightedItem}
              text={mission}
              onEdit={onEdit}
              onDelete={onDelete}
              isSelected={isSelected}
              onSelect={onSelect}
              isFullscreen={isFullscreen}
            />
          </Box>
        ) : (
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
              }}>
              No se ha definido una misión.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MisionColumn;
