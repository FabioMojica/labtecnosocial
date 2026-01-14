import { useTheme, useMediaQuery } from "@mui/material";

export const drawerWidth = 270;

export const getDrawerClosedWidth = () => {
  const theme = useTheme();

  const isSmUp = useMediaQuery(theme.breakpoints.up("sm")); 

  const spacing7 = theme.spacing(7);
  const spacing8 = theme.spacing(8);
 
  const base = isSmUp ? spacing8 : spacing7;

  return `calc(${base})`;
};
