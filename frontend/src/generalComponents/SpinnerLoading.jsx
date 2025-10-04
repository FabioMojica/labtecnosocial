import * as React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export const SpinnerLoading = ({
  open = true,
  text,
  size= 60,
  sx,
}) => {
  if (!open) return null;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        ...sx, 
      }}
    >
      {text && (
        <Typography
          sx={{
            mb: 2,
            textAlign: "center",
            fontWeight: 500,
            fontSize: {
              xs: "1rem",   
              sm: "1.25rem",
              md: "1.5rem", 
              lg: "1rem" 
            },
          }}
        >
          {text}
        </Typography>
      )}

      <CircularProgress size={size} thickness={4} color="primary" />
    </Box>
  );
};
