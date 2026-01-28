import { Box, Typography, Button, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useHeaderHeight } from "../../contexts";

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { headerHeight } = useHeaderHeight();
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: `calc(100vh - ${headerHeight}px)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 100, color: theme.palette.error.main, mb: 2 }} />
      <Typography variant="h2" sx={{ fontWeight: "bold", mb: 1 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 3, color: "text.secondary" }}>
        Oops! Página no encontrada.
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, maxWidth: 400 }}>
        La página que estás buscando no existe o ha sido movida. Puedes volver a la página anterior.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate(-1, {replace: true})}
        sx={{
          px: 4,
          py: 1.5,
          borderRadius: 3,
          fontWeight: "bold",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}
      >
        Volver atrás
      </Button>
    </Box>
  );
};
