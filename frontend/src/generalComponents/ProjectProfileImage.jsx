// ProjectProfileImage.jsx
import { Avatar, Box, useTheme } from "@mui/material";
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import React, { memo, useEffect } from "react";


const ProjectProfileImageComponent = ({ fallbackLetter, src, boxShadow= false, sx }) => {
  useEffect(() => {
      },[fallbackLetter]);
  
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <Avatar
        src={src}
        sx={{
          width: '100%',
          height: '100%',
          fontSize: '2rem',
          textTransform: 'uppercase',
          objectFit: 'cover',
          borderRadius: 0,
          fontWeight: 'bold',
        }}
      >
        {fallbackLetter || <FolderRoundedIcon fontSize="large" />}
      </Avatar>
    </Box>
  );
};

export const ProjectProfileImage = memo(ProjectProfileImageComponent, (prev, next) => {
    return prev.src === next.src && prev.fallbackLetter === next.fallbackLetter;
});