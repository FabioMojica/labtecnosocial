import { IconButton, Tooltip, useTheme } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { useThemeContext } from "../contexts";

export const ThemeToggleButton = ({ tooltip = "Cambiar tema", sizeIconButton = "small", sizeButton="small" }) => {
  const { isDarkMode, toggleTheme } = useThemeContext();
  const theme = useTheme()

  return (
    <Tooltip title={tooltip} arrow>
      <IconButton onClick={toggleTheme} size={sizeIconButton} sx={{ color: theme.palette.primary.principal }}>
        {isDarkMode ? <LightMode fontSize={sizeButton}/> : <DarkMode fontSize={sizeButton}/>}
      </IconButton>
    </Tooltip>
  );
};
