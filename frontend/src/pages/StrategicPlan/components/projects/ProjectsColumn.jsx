import React from 'react';
import { Box, Typography, IconButton, Tooltip, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ProjectItem from './ProjectItem';
import { useTheme } from '@emotion/react';

const ProjectsColumn = ({
  objectives = [],
  selectedProgramId,
  onEditProgram,
  onUnlinkProject,
  onViewProject,
  onAddProject,
}) => {
  const theme = useTheme();

  // Todos los programas disponibles
  const allPrograms = objectives.flatMap(obj => obj.programs || []);

  // Programa seleccionado actualmente
  const selectedProgram = allPrograms.find(p => p.id === selectedProgramId);

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
            ? '0 4px 12px rgba(0,0,0,0.8)'
            : 3,
      }}
    >
      {/* Header con título y botón de agregar */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Proyectos</Typography>
          {selectedProgram && (
            <Tooltip title="Agregar proyecto operativo">
              <IconButton onClick={onAddProject}>
                <AddIcon fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.5,
            height: '35px',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            WebkitLineClamp: 2,
          }}
        >
          {selectedProgram
            ? `Programa seleccionado: ${selectedProgram.programDescription}`
            : allPrograms.length > 0
              ? 'Seleccione un programa'
              : 'No hay programas'}
        </Typography>

        <Divider sx={{ mb: 1 }} />
      </Box>

      {/* Contenido principal */}
      {allPrograms.length === 0 ? (
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
          No hay programas para mostrar proyectos.
        </Typography>
      ) : !selectedProgram ? (
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
          Selecciona un programa para ver sus proyectos.
        </Typography>
      ) : selectedProgram.operationalProjects?.length > 0 ? (
        selectedProgram.operationalProjects.map(project => (
          <ProjectItem
            key={project.id}
            project={project}
            onDelete={() => onUnlinkProject(selectedProgram.id, project.id)}
            onEdit={(editedProject) => {
              const updatedProgram = {
                ...selectedProgram,
                operationalProjects: selectedProgram.operationalProjects.map(p =>
                  p.id === editedProject.id ? editedProject : p
                ),
              };
              onEditProgram(updatedProgram);
            }}
            onView={() => onViewProject(project.id)}
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
          }}
        >
          No hay proyectos vinculados a este programa.
        </Typography>
      )}
    </Box>
  );
};

export default ProjectsColumn;
