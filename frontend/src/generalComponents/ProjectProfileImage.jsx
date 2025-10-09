import { Avatar, Box } from "@mui/material";
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';

export const ProjectProfileImage = ({ project, sx, src }) => {
  if (!project) return null;

  const fallbackLetter = project.name?.trim().charAt(0)?.toUpperCase() || null;

  console.log("src por aqu", src)

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
        {fallbackLetter ? fallbackLetter : <FolderRoundedIcon fontSize="large" />}
      </Avatar>
    </Box>
  );
};
