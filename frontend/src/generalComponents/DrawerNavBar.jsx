import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useAuth } from '../contexts';
import { navBarOptionsConfig } from '../utils/generalConfig';
import { Tooltip } from '@mui/material';
import { useNavigationGuard } from '../hooks/useBlockNavigation';
import { useLayout } from '../contexts/LayoutContext';

const drawerWidth = 270;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: 0,
  [theme.breakpoints.up('lg')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    backgroundColor: 'purple',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': openedMixin(theme),
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': closedMixin(theme),
        },
      },
    ],
  }),
);

export const DrawerNavBar = ({ open, onClose }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const { handleNavigate } = useNavigationGuard();
  if (!user) return null;
  const { left } = useLayout();

  const role = user?.role ?? 'guest';
  const menuItems = navBarOptionsConfig[role] || [];

  return (
    <Box
      sx={{
        display: 'flex',
        backgroundColor: `${theme.palette.primary.backgroundNavBar}`,
      }}
    >
      <CssBaseline />

      {open && (
        <Box
          onClick={onClose}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.4)', 
            zIndex: theme.zIndex.drawer - 1,
          }}
        />
      )}

      <Drawer
        variant="permanent"
        open={open}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor: theme.palette.primary.backgroundNavBar,
            color: theme.palette.primary.principalText,
            ml: `calc(${left}px)`
          },
        }}
      >
        <DrawerHeader />
        <Divider />
        {menuItems.map(({ text, icon, link }) => (
          <ListItem key={text} disablePadding sx={{ display: 'block' }}>
            <Tooltip
              arrow
              title={text}
              placement="right"
              disableHoverListener={open}
              disableFocusListener={open}
              disableTouchListener={open}
            >
              <ListItemButton
                onClick={() => {

                  handleNavigate(link);
                  onClose();
                }}
                sx={[
                  { minHeight: 48, px: 2.5 },
                  open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                ]}
              >
                <ListItemIcon
                  sx={[
                    {
                      minWidth: 0,
                      justifyContent: 'center',
                      color: theme.palette.primary.principal,
                    },
                    open ? { mr: 3 } : { mr: 'auto' },
                  ]}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  sx={[open ? { opacity: 1 } : { opacity: 0 }]}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
        <Divider />
      </Drawer>
    </Box>
  );
};
