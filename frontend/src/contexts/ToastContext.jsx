import { useSnackbar } from "notistack";
import { Howl } from "howler";
import { useSound } from "./SoundContext";
import { ReactNode } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export const useNotification = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { settings } = useSound();

  const soundMap = {
    success: "/sounds/notifications/success.mp3",
    error: "/sounds/notifications/error.mp3",
    info: "/sounds/notifications/info.mp3",
    warning: "/sounds/notifications/warning.mp3",
  };

  const notify = (
    message,
    severity = "info",
    options = {}
  ) => {
    if (settings.enabled) {
      const sound = new Howl({ src: [soundMap[severity]], volume: settings.volume });
      sound.play();
    }

    // botón de cerrar
    const action = options?.action ?? ((key) => (
      <IconButton onClick={() => closeSnackbar(key)} size="small" color="inherit">
        <CloseIcon fontSize="small" />
      </IconButton>
    ));

    enqueueSnackbar(message, {
      variant: severity,
      autoHideDuration: options?.persist ? undefined : options?.duration ?? 2000,
      persist: options?.persist,
      action,
    });
  };

  return { notify };
};
