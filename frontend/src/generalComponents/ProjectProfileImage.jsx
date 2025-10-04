import { Avatar, Box } from "@mui/material";
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';

/**
 * Muestra la imagen del proyecto si existe, sino la primera letra del nombre.
 * Se adapta al tamaño del contenedor y permite sobreescribir estilos con sx.
 */
export const ProjectProfileImage = ({ project, sx, src }) => {
  if (!project) return null;


  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <Avatar
        src={src ?? project.image_url ?? undefined}
        alt={project.name}
        sx={{
          width: '100%',
          height: '100%',
          fontSize: '2rem',
          textTransform: 'uppercase',
          objectFit: 'cover',
          borderRadius: 0,
          fontWeight: 'bold',
        }}
      >
        {project.name ? project.name[0] : <FolderRoundedIcon fontSize="large" />}
      </Avatar>
    </Box>
  );
};
