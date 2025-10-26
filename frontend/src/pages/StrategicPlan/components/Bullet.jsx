import { Box } from '@mui/material';

const Bullet = () => (
  <Box
    component="span"
    sx={{
      display: 'inline-flex',
      width: 6,
      height: 6,
      backgroundColor: 'text.primary',
      borderRadius: '50%',
      mr: 1,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  />
);


export default Bullet;