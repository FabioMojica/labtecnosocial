import React from 'react';
import { Box, Typography, IconButton, Tooltip, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ObjectiveItem from './ObjectiveItem';
import { useTheme } from '@emotion/react';

const ObjectivesColumn = ({
  objectives = [],
  selectedObjectiveId,
  objectiveRefs,
  onSelectObjective,
  onEditObjective,
  onDeleteObjective,
  onCreateObjective,
  mission,
  highlightedItem,
  isFullscreen,
  headerHeight
}) => {
  const theme = useTheme(); 
  console.log("fullscreen", isFullscreen)

  const isAddDisabled = !mission;

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="h6"
          >
            Objetivos{" "}
            <Typography
              component="span"
              color="text.secondary"
              fontWeight="normal"
            >
              ({objectives?.length})
            </Typography>
          </Typography>
          <Tooltip
            size="small"
            title={
              isAddDisabled
                ? "Debes crear o seleccionar una misión antes de agregar objetivos"
                : "Agregar objetivo"
            }>
            <IconButton onClick={onCreateObjective} size="small" color="primary" disabled={isAddDisabled}>
              <AddIcon fontSize="small" />
            </IconButton>
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
          ...(mission
            ? {}
            : {
              color: 'gray',
              fontStyle: 'italic',
              textAlign: 'center',
              fontSize: '0.75rem',
            }),
        }}>
          {mission ? (
            <>
              <strong>Misión:</strong> {mission}
            </>
          ) : (
            'Sin misión seleccionada'
          )}
        </Typography>
        <Divider sx={{ marginBottom: 1 }} />
      </Box>


      <Box sx={{
        px: 2,
        width: '100%',
        height: '100%'
      }}>
        {objectives.length === 0 ? (
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
              No hay objetivos creados.
            </Typography>
          </Box>
        ) : (
          objectives.map((obj) => (
            <Box
              key={obj.id}
              ref={(el) => (objectiveRefs.current[obj.id] = { current: el })}
            >
              <ObjectiveItem
                highlightedItem={highlightedItem}
                key={obj.id}
                objective={obj}
                isSelected={selectedObjectiveId === obj.id}
                onClick={() => onSelectObjective(obj.id)}
                onEdit={(edited) => onEditObjective(obj.id, edited)}
                onDelete={() => onDeleteObjective(obj.id)}
                isFullscreen={isFullscreen}
              />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default ObjectivesColumn;
