import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { Box, Typography, Button } from '@mui/material';
import { useHeaderHeight } from '../contexts';

export const ErrorScreen = ({
  message = "Ocurrió un error",
  buttonText = "Reintentar",
  onButtonClick,
  sx
}) => {
    const { headerHeight }= useHeaderHeight();

  return (
    <Box
      sx={{
        width: '100%',
        height: `calc(100vh - ${headerHeight}px)`,
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center', 
        gap: 2,
        ...sx,
      }}
    >
      <ErrorOutlineRoundedIcon sx={{ fontSize: 80, color: 'error.main' }} />
      <Typography variant="h6" color="error">
        {message}
      </Typography>
      {onButtonClick && (
        <Button variant="contained" color="error" onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </Box>
  );
};
