import { Box, LinearProgress, Typography } from "@mui/material";

export const FullScreenProgress = ({ open = true, text }) => {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "rgba(0,0,0,0.8)", 
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300,
        p: 2, 
        pointerEvents: "auto",
      }}
    >
      {text && (
        <Typography variant="h6" sx={{ mb: 2 }} textAlign={'center'}>
          {text}
        </Typography>
      )}
      <Box sx={{ width: "50%", height: 10 }}> 
        <LinearProgress color="primary" />
      </Box>
    </Box>
  );
};
