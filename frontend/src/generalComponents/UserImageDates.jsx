import { Box, Divider, Paper, Typography, useTheme } from "@mui/material";
import { UserProfileImage } from "./UserProfileImage";
import { useHeaderHeight } from "../contexts";
import { formatDate } from '../utils/formatDate'

export const UserImageDates = ({
  user,
  sx,
  overlay = false,
  overlayText = "Ver usuario",
  changeImage = false,
  onChangeImage,
  previewImage,
  ...rest
}) => {
  if (!user) return null;
  const { headerHeight } = useHeaderHeight();
  const theme = useTheme();

  return (
    <Box
      {...rest}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        maxHeight: `calc(100vh - ${headerHeight}px)`,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        cursor: "pointer",
        "&:hover .overlay": {
          opacity: 1,
        },
        boxShadow:
          theme.palette.mode === 'light'
            ? '0 0 0 1px rgba(0,0,0,0.3)'
            : '0 0 0 1px rgba(255,255,255,0.3)',
        borderRadius: 2,
        ...sx,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderTopLeftRadius: user && "created_at" in user && "updated_at" in user ? 8 : 8,
          borderTopRightRadius: user && "created_at" in user && "updated_at" in user ? 8 : 8,
          borderBottomLeftRadius: user && "created_at" in user && "updated_at" in user ? 0 : 8,
          borderBottomRightRadius: user && "created_at" in user && "updated_at" in user ? 0 : 8,
          overflow: "hidden",
          cursor: overlay ? "pointer" : "default",
          ...sx,

        }}
      >
        <UserProfileImage 
          user={user}
          src={(previewImage || user?.image_url) ?? undefined}
          sx={{
            width: "100%", 
            height: "100%",
            objectFit: "cover",
            maxHeight: "100%",
          }}
        />

        {/* Overlay solo sobre la imagen */}
        {overlay && changeImage && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.3s",
              "&:hover": {
                opacity: 1,
              },
            }}
            onClick={changeImage ? onChangeImage : undefined}
          >
            <Typography align="center" sx={{
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}>{overlayText}</Typography>
          </Box>
        )}
      </Box>

      {user && "created_at" in user && "updated_at" in user && (
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            borderTopRightRadius: 0,
            borderTopLeftRadius: 0,
            p: 1.5,
            gap: 2,
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              flex: 1,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Creado
            </Typography>
            <Typography variant="body2">
              {formatDate(user?.created_at)}
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem color="primary" />

          <Box
            sx={{
              textAlign: "center",
              flex: 1,
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Actualizado
            </Typography>
            <Typography variant="body2">
              {formatDate(user?.updated_at)}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};
