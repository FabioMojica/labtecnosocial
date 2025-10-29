import { IconButton, Tooltip, useTheme } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { useThemeContext } from "../contexts";

export const ThemeToggleButton = ({ tooltip = "Cambiar tema", sizeIconButton = "small", sizeButton="small", sx={} }) => {
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
    <Tooltip title={tooltip} arrow>
      <IconButton onClick={toggleTheme} size={sizeIconButton} sx={{
          transition: "color 0.2s",
          ...sx, 
        }}>
        {isDarkMode ? <LightMode fontSize={sizeButton}/> : <DarkMode fontSize={sizeButton}/>}
      </IconButton>
    </Tooltip>
  );
};
