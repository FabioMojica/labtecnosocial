import { Box, Typography } from '@mui/material';
import SentimentDissatisfiedRoundedIcon from '@mui/icons-material/SentimentDissatisfiedRounded';
import { ButtonWithLoader } from './ButtonWithLoader';
import { useHeaderHeight } from '../contexts';

export const NoResultsScreen = ({ 
  message = "No se encontraron resultados", 
  sx,
  iconSX,
  icon,
  textSx,
  buttonText,
  triggerOnEnter = false,
  onButtonClick,
  buttonSx,
}) => {
  const { headerHeight } = useHeaderHeight();
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
      {icon || <SentimentDissatisfiedRoundedIcon sx={{ fontSize: 80, color: 'gray', ...iconSX }} />}
      
      <Typography variant="h6" color="text.secondary"
      sx={{
        ...textSx
      }}
      >
        {message}
      </Typography>

      {buttonText && onButtonClick && (
        <ButtonWithLoader sx={{minWidth: '200px', ...buttonSx}} onClick={onButtonClick} triggerOnEnter={triggerOnEnter}>
          {buttonText}
        </ButtonWithLoader>
      )}
    </Box>
  );
};
