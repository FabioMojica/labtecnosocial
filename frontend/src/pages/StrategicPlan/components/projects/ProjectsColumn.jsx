import React from 'react';
import { Box, Typography, IconButton, Tooltip, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ProjectItem from './ProjectItem';
import { useTheme } from '@emotion/react';

const ProjectsColumn = ({
  projectsRef,
  objectives = [],
  selectedProgramId,
  onEditProgram,
  onUnlinkProject,
  onViewProject,
  onAddProject,
  highlightedItem,
  isFullscreen,
  headerHeight
}) => {
  const theme = useTheme();

  // Todos los programas disponibles
  const allPrograms = objectives.flatMap(obj => obj.programs || []);

  // Programa seleccionado actualmente
  const selectedProgram = allPrograms.find(p => p.id === selectedProgramId);

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
      {/* Header con título y botón de agregar */}
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
            Proyectos{" "}
            <Typography
              component="span"
              color="text.secondary"
              fontWeight="normal"
            >
              {`(${allPrograms.reduce((acc, p) => acc + (p.operationalProjects?.length || 0), 0)})`}
            </Typography>
          </Typography>
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
            ...(selectedProgram
              ? {}
              : {
                color: 'gray',
                fontStyle: 'italic',
                textAlign: 'center',
                fontSize: '0.75rem',
              }),
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

      <Box sx={{
        px: 2,
        width: '100%',
        height: '100%'
      }}>

        {/* Contenido principal */}
        {allPrograms.length === 0 ? (
          <Box sx={{
            p: 5,
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
              }}
            >
              No hay programas para mostrar proyectos.
            </Typography>
          </Box>
        ) : !selectedProgram ? (
          <Box sx={{
            p: 5,
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
            }}
          >
            Seleccione un programa para ver sus proyectos.
          </Typography>
          </Box>
        ) : selectedProgram.operationalProjects?.length > 0 ? (
          <Box
            key={selectedProgram.id}
            ref={(el) => (projectsRef.current = el)}
            className={highlightedItem === 'projects' ? 'flash-highlight' : ''}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: 1,
              cursor: 'pointer',
              borderRadius: 1,
              marginBottom: 3,
              border: theme.palette.mode === "light"
  ? `1px solid #b9c0b3ff`
  : "1px solid #e0e0e0",
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
                mb: 0.5
              }}
            >
              {`Proyectos (${selectedProgram.operationalProjects.length}):`}
            </Typography>

            {selectedProgram.operationalProjects.map(project => (
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
            ))}
          </Box>
        ) : (
          <Box
            ref={(el) => (projectsRef.current = el)}
            className={highlightedItem === 'projects' ? 'flash-highlight' : ''}
            sx={{
              py: 5,
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
              No hay proyectos vinculados a este programa.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProjectsColumn;
