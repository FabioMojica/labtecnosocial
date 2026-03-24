import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts";
import { ButtonWithLoader } from "./ButtonWithLoader";
import WarningIcon from "@mui/icons-material/Warning";
import CloseIcon from "@mui/icons-material/Close";

export const SessionExpirationModal = () => {
  const {
    showSessionModal,
    expiresAt,
    refreshSession,
    setShowSessionModal,
  } = useAuth();

  const [remaining, setRemaining] = useState(0);
  const [loadingButton, setLoadingButton] = useState(null);

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const diff = expiresAt - Date.now();
      setRemaining(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  const handleRefreshClick = async () => {
    setLoadingButton("refresh");
    try {
      await refreshSession(true);
    } finally {
      setLoadingButton(null);
    }
  };

  return (
    <Dialog
      open={showSessionModal}
      onClose={() => setShowSessionModal(false)}
      disableEscapeKeyDown
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningIcon />
            <Typography
              variant="h5"
              fontWeight={"bold"}
              fontSize={{
                xs: "1.2rem",
                sm: "1.5rem",
              }}
            >
              Informacion de la sesion
            </Typography>
          </Box>

          <IconButton
            aria-label="cerrar modal"
            size="small"
            onClick={() => setShowSessionModal(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography>
          Tu sesion expirara en <strong>{formatTime(remaining)}</strong>
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          height: "50px",
        }}
      >
        <ButtonWithLoader
          loading={loadingButton === "refresh"}
          onClick={handleRefreshClick}
          variant="contained"
          backgroundButton={(themeValue) => themeValue.palette.success.main}
          sx={{
            width: "100px",
            color: "white",
            minHeight: "100%",
            "&:hover": {
              backgroundColor: (themeValue) => themeValue.palette.success.dark,
            },
          }}
        >
          Refrescar
        </ButtonWithLoader>
      </DialogActions>
    </Dialog>
  );
};
