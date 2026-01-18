import { Avatar, Box } from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { useState, useEffect } from "react";
import { SpinnerLoading } from "./SpinnerLoading";

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const UserProfileImage = ({ user, boxSx, sx, src }) => {
  if (!user) return null;

  const finalSrc =
    src ||
    (user.image_url ? `${API_UPLOADS}${user.image_url}` : null);

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [finalSrc]);

  const initials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : null;

  const showFallback = !finalSrc || imgError;

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
        src={showFallback ? undefined : finalSrc}
        alt={`${user.firstName ?? ""} ${user.lastName ?? ""}`}
        onError={() => setImgError(true)}
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
