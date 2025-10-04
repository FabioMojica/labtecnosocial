import React from "react";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import VolumeUp from "@mui/icons-material/VolumeUp";
import VolumeOff from "@mui/icons-material/VolumeOff";
import { useSound } from "../contexts";

export const VolumenToggleButton = ({sizeIconButton = "small", sizeButton="small"}) => {
  const { settings, setSettings } = useSound();
  const theme = useTheme();

  const toggleSound = () => {
    setSettings({ ...settings, enabled: !settings.enabled });
  };

  return (
    <Tooltip arrow title={settings.enabled ? "Apagar sonido" : "Encender sonido"}>
      <IconButton onClick={toggleSound} size={sizeIconButton} sx={{ color: theme.palette.primary.principal }}>
        {settings.enabled ? <VolumeUp fontSize={sizeButton}/> : <VolumeOff fontSize={sizeButton}/>}
      </IconButton>
    </Tooltip>
  );
};
