import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

export const stateConfig = {
  enabled: {
    icon: CheckCircleIcon,
    value: "enabled",
    label: "Habilitado",
    color: "success.main",
  },
  disabled: {
    icon: CancelIcon,
    value: "disabled",
    label: "Deshabilitado",
    color: "error.main",
  },
};
 