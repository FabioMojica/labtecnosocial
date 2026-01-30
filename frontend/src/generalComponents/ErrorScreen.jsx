import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { Box, Typography, Button } from '@mui/material';
import { useHeaderHeight } from '../contexts';

export const ErrorScreen = ({
  message = "Ocurrió un error",
  buttonText = "Reintentar",
  onButtonClick,
  sx,
  textSx,
  buttonSx,
  iconSx,
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
      <ErrorOutlineRoundedIcon sx={{ fontSize: 80, color: 'error.main', ...iconSx }} />
      <Typography variant="h6" color="error" sx={{ ...textSx }}>
        {message}
      </Typography>
      {onButtonClick && (
        <Button variant="contained" color="error" onClick={onButtonClick} sx={{...buttonSx}}>
          {buttonText}
        </Button>
      )}
    </Box>
  );
};
