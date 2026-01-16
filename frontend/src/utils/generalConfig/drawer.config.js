// utils/useDrawerClosedWidth.js
import { useTheme, useMediaQuery } from "@mui/material";

export const useDrawerClosedWidth = () => {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  return isSmUp ? theme.spacing(8) : theme.spacing(7);
};
