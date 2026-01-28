import { Avatar, Box } from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

export const UserProfileImage = ({ user, boxSx, sx, src }) => {

  const finalSrc = src || user?.image_url || null ;
 
  const initials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : null;

  return ( 
    <Box
      sx={{
        width: "100%", 
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Avatar
        src={finalSrc}
        slotProps={{
          img: {
            loading: 'lazy'
          }
        }}
        alt={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
        sx={{
          width: "100%", 
          height: "100%",
          textTransform: "uppercase", 
          borderRadius: 0,
          fontWeight: "bold",
          ...sx,
        }}
      > 
        <Box sx={{ fontSize: "2rem", ...boxSx }}>
          {initials ?? <PersonRoundedIcon fontSize="large" />}
        </Box>
      </Avatar>
    </Box>
  );
};
