import { useSnackbar } from "notistack";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export const useNotification = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const notify = (
    message,
    severity = "info",
    options = {}
  ) => {
  
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
