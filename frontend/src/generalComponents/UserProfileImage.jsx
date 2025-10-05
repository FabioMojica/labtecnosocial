import { Avatar, Box } from "@mui/material";
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

export const UserProfileImage= ({ user, sx, src, boxSx }) => {
  if (!user) return null;

  const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const avatarSrc = user.image_url ? `${backendUrl}${user.image_url}` : undefined;

  const hasImage = Boolean(avatarSrc);

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
        src={src ?? avatarSrc}
        alt={`${user.firstName} ${user.lastName}`}
        sx={{
          width: '100%',
          height: '100%', 
          textTransform: 'uppercase',
          objectFit: 'cover',
          borderRadius: 0,
          fontWeight: 'bold',
          ...sx
        }}
      >
        <Box sx={{fontSize: '2rem', ...boxSx}}>
          {!hasImage ? (
          initials ? (
            initials
          ) : (
            <PersonRoundedIcon fontSize="large" />
          )
        ) : null}
        </Box>
      </Avatar>
    </Box>
  );
};
