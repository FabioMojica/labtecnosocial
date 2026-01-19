import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, useTheme, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth, useNotification } from "../contexts";
import { ButtonWithLoader } from "./ButtonWithLoader";
import WarningIcon from '@mui/icons-material/Warning';

export const SessionExpirationModal = () => {
  const {
    showSessionModal,
    expiresAt,
    logout,
    refreshSession,
  } = useAuth();
  const theme = useTheme();

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


  const handleLogoutClick = async () => {
    setLoadingButton('logout');
    await logout(true, true);
    setLoadingButton(null);
  };

  const handleRefreshClick = async () => {
    setLoadingButton('refresh');
    try {
      await refreshSession(true);
    } finally {
      setLoadingButton(null);
    }
  };

  return (
    <Dialog
      open={showSessionModal}
      disableEscapeKeyDown
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'left',
          gap: 1
        }}>
          <WarningIcon />
          <Typography
            variant="h5"
            fontWeight={'bold'}
            fontSize={{
              xs: '1.2rem',
              sm: '1.5rem',
            }}
          >
            Información de la sesión
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography>
          Tu sesión expirará en <strong>{formatTime(remaining)}</strong>
        </Typography>
      </DialogContent>

      <DialogActions
      sx={{
        height: '50px'
      }}
      >
        <ButtonWithLoader
          loading={loadingButton === 'logout'}
          onClick={handleLogoutClick}
          variant="contained"
          backgroundButton={theme => theme.palette.error.main}
          sx={{
            width: '130px',
            color: "white",
            minHeight: '100%',
            "&:hover": {
              backgroundColor: theme => theme.palette.error.dark,
            },
          }}
        >
          Cerrar sesión
        </ButtonWithLoader>
        <ButtonWithLoader
          loading={loadingButton === 'refresh'}
          onClick={handleRefreshClick}
          variant="contained"
          backgroundButton={theme => theme.palette.success.main}
          sx={{
            width: '100px',
            color: "white",
            minHeight: '100%',
            "&:hover": {
              backgroundColor: theme => theme.palette.success.dark,
            },
          }}
        >
          Refrescar
        </ButtonWithLoader>
      </DialogActions>
    </Dialog>
  );
};
