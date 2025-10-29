import React from 'react';
import { Box, Typography, IconButton, Tooltip, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ObjectiveItem from './ObjectiveItem';
import { useTheme } from '@emotion/react';

const ObjectivesColumn = ({
  objectives = [],
  selectedObjectiveId,
  onSelectObjective,
  onEditObjective,
  onDeleteObjective,
  onCreateObjective,
  mission
}) => {
  const theme = useTheme();

  const isAddDisabled = !mission;

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
          <Typography variant="h6">{`Objetivos (${objectives.length})`}</Typography>
          <Tooltip 
            size="small"
            title={ 
              isAddDisabled
                ? "Debes crear o seleccionar una misión antes de agregar objetivos"
                : "Agregar objetivo"
            }>
            <IconButton onClick={onCreateObjective} size="small" color="primary" disabled={isAddDisabled}>
              <AddIcon fontSize="small"/>
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


      {objectives.length === 0 ? (

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
          No hay objetivos creados.
        </Typography>
      ) : (
        objectives.map((obj) => (
          <ObjectiveItem
            key={obj.id}
            objective={obj}
            isSelected={selectedObjectiveId === obj.id}
            onClick={() => onSelectObjective(obj.id)}
            onEdit={(edited) => onEditObjective(obj.id, edited)}
            onDelete={() => onDeleteObjective(obj.id)}
          />
        ))
      )}
    </Box>
  );
};

export default ObjectivesColumn;
