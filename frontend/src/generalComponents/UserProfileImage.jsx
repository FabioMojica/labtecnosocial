import { Avatar, Box } from "@mui/material";
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const UserProfileImage = ({ user, sx, src, boxSx }) => {
  if (!user) return null;
  
  const finalSrc =
    src ||
    (user.image_url ? `${API_UPLOADS}${user.image_url}` : undefined);

  const hasImage = Boolean(finalSrc);

  const initials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : null;

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
        src={finalSrc}
        alt={`${user.firstName ?? ""} ${user.lastName ?? ""}`}
        sx={{
          width: '100%',
          height: '100%',
          textTransform: 'uppercase',
          objectFit: 'cover',
          borderRadius: 0,
          fontWeight: 'bold',
          ...sx,
        }}
      >
        <Box sx={{ fontSize: '2rem', ...boxSx }}>
          {!hasImage ? (
            initials ? initials : <PersonRoundedIcon fontSize="large" />
          ) : null}
        </Box>
      </Avatar>
    </Box>
  );
};
