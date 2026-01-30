import { Box, Typography } from '@mui/material';
import SentimentDissatisfiedRoundedIcon from '@mui/icons-material/SentimentDissatisfiedRounded';
import { ButtonWithLoader } from './ButtonWithLoader';
import { useHeaderHeight } from '../contexts';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import React from "react";

export const NoResultsScreen = ({
  variant,
  message = "No se encontraron resultados",
  sx,
  iconSX,
  icon,
  iconType = 'sad',
  textSx,
  buttonText,
  triggerOnEnter = false,
  onButtonClick,
  buttonSx,
}) => {
  const { headerHeight } = useHeaderHeight();

  const getIcon = () => {
    if (icon) {
      return React.cloneElement(icon, {
        sx: { fontSize: 80, color: 'gray', ...iconSX },
      });
    }

    if (iconType === 'outline') {
      return <ErrorOutlineRoundedIcon sx={{ fontSize: 80, color: 'warning.main', ...iconSX }} />;
    }
    return <SentimentDissatisfiedRoundedIcon sx={{ fontSize: 80, color: 'gray', ...iconSX }} />;
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: `calc(100vh - ${headerHeight}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
        ...sx,
      }}
    >
      {getIcon()}

      <Typography variant="h6" color="text.secondary"
        sx={{
          ...textSx
        }}
      >
        {message}
      </Typography>

      {buttonText && onButtonClick && (
        <ButtonWithLoader sx={{
          minWidth: '200px',
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          "&:hover": {
            backgroundColor: "primary.dark",
          },
          "&.Mui-disabled": {
            backgroundColor: "action.disabledBackground",
            color: "action.disabled",
          },
          ...buttonSx
        }} onClick={onButtonClick} triggerOnEnter={triggerOnEnter}>
          {buttonText}
        </ButtonWithLoader>
      )}
    </Box>
  );
};
