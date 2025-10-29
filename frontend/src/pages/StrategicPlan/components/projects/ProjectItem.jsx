import React, { useState } from 'react';
import { Box, Typography, IconButton, Tooltip, Avatar } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditProjectModal from './EditProjectModal.jsx';
import RenderAvatar from '../../../../generalComponents/RenderAvatar.jsx';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTheme } from '@emotion/react';

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

const ProjectItem = ({ project, onClick, onDelete, onView, onEdit }) => {
  const [pressTimer, setPressTimer] = useState(null);
  const theme = useTheme();

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      window.open(`/proyectos/${project.id}`, '_blank');
    }, 2000);
    setPressTimer(timer);
  };

  const handleMouseUp = () => {
    clearTimeout(pressTimer);
  };

  if (!project) return null;
  const [showViewProject, setShowViewProject] = useState(false);

  const handleCloseViewProject = () => {
    setShowViewProject(false);
  };

  const handleSaveChangesProject = (editedProject) => {
    onEdit(editedProject);
    handleCloseViewProject();
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
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}
      onClick={onClick}
    >
      <Box sx={{ marginBottom: 1 }}>
        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Proyecto:</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>

          <Avatar
            src={project.image_url ? `${API_UPLOADS}${project.image_url}` : undefined}
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2,
              objectFit: "cover",
              fontWeight: "bold",
              boxShadow:
      theme.palette.mode === 'light'
        ? '0 0 0 1px rgba(0,0,0,0.3)'   
        : '0 0 0 1px rgba(255,255,255,0.3)',
            }}
          >
            {project.name[0].toUpperCase()}
          </Avatar>
          <Typography
            variant="caption"
            sx={{
              width: '100%',
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
            {project.name}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Descripción del proyecto:
        </Typography>
        <Typography
          variant="caption"
          sx={{
            width: '100%',
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
          {project.description}
        </Typography>
      </Box>
      {project.projectDescription && (
        <Box sx={{ marginBottom: 1 }}>
          <Typography sx={{ fontWeight: 600 }}>Descripción:</Typography>
          <Box
            sx={{
              padding: '4px',
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              WebkitLineClamp: 3,
            }}
          >
            {project.projectDescription}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
        <Tooltip title="Desvincular proyecto operativo">
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ir al proyecto, pulsa por 2 segundos">
          <IconButton
            size="small"
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown();
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              handleMouseUp();
            }}
            onMouseLeave={handleMouseUp}
            sx={{ position: 'absolute', top: 4, right: 4 }}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>

      </Box>

      <EditProjectModal
        open={showViewProject}
        onClose={handleCloseViewProject}
        project={project}
        onSave={handleSaveChangesProject}
      />
    </Box>
  );
};

export default ProjectItem;

