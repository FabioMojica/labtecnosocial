import React, { useEffect, useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Image } from "./Image";
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { ThemeToggleButton } from './ThemeToggleButton';
import { useAuth, useHeaderHeight, useNotification } from '../contexts';

import { Divider, Link, useTheme } from '@mui/material';
import { ButtonWithLoader } from './ButtonWithLoader';

import logoLight from "../assets/labTecnoSocialLogoLight.png";
import logoDark from "../assets/labTecnoSocialLogoDark.png";
import { DrawerNavBar } from './DrawerNavBar';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { UserProfileImage } from './UserProfileImage';
import { useNavigationGuard } from '../hooks/useBlockNavigation';
import { useDirty } from '../contexts/DirtyContext';

export const Header = () => {
    const { user, logout, loading } = useAuth();
    const { notify } = useNotification();
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const toolbarRef = useRef(null);
    const { setHeaderHeight } = useHeaderHeight();
    const logoToShow = theme.palette.mode === 'dark' ? logoDark : logoLight;
    const [open, setIsOpen] = React.useState(false);
    const toggleNav = () => setIsOpen(!open);
    const navigate = useNavigate();
    const { handleNavigate } = useNavigationGuard();
    const { isDirty } = useDirty();

    useEffect(() => {
        const updateHeight = () => {
            if (toolbarRef.current) {
                const extraHeight = 16 / window.devicePixelRatio;
                setHeaderHeight(toolbarRef.current.clientHeight + extraHeight);
            }
        };

        updateHeight();
        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, [setHeaderHeight]);


    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleCloseDrawer = () => setIsOpen(false);

    const handleClickLogout = async () => {
        try {
            const resp = await logout(false, true);
            setAnchorEl(null);
        } catch (err) {
            console.log(err);
            notify("Sesión cerrada de emergencia por error en la red.", "error");
        }
    };

    const handleClickProfile = async () => {
        handleClose();
        handleCloseDrawer();
        handleNavigate(`/usuario/${encodeURIComponent(user.email)}`);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            {user && (
                <>
                    <AppBar
                        position="fixed"
                        sx={{
                            zIndex: theme.zIndex.drawer + 1,
                            width: '100%',
                            top: 0,
                            left: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'transparent'
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: theme.palette.primary.backgroundHeader,
                                maxWidth: 2000,
                                width: '100%',
                            }}
                        >
                            <Toolbar ref={toolbarRef} disableGutters sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', pr: '18px' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2, pl: 1 }}>
                                    <IconButton size="medium" onClick={toggleNav} sx={{ color: theme.palette.primary.principal }}>
                                        {open
                                            ? <ChevronLeftIcon fontSize="large" />
                                            : <ChevronRightIcon fontSize="large" />
                                        }
                                    </IconButton>
                                    <Box
                                        sx={{ cursor: 'pointer', display: 'inline-block' }}
                                        onClick={() => handleNavigate(`/inicio`)}
                                    >
                                        <Image
                                            src={logoToShow}
                                            alt="Lab Tecno Social Logo"
                                            width={100}
                                            height={43}
                                        />
                                    </Box>
                                </Box>


                                <div>
                                    <ThemeToggleButton sx={{ color: '#FFFFFF' }} />

                                    <IconButton
                                        size="large"
                                        aria-label="account of current user"
                                        aria-controls="menu-appbar"
                                        aria-haspopup="true"
                                        onClick={handleMenu}
                                        sx={{
                                            color: theme.palette.primary.principal,
                                        }}
                                    >
                                        <UserProfileImage
                                            user={user}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 2, 
                                                boxShadow:
                                                    theme.palette.mode === "light"
                                                        ? "0 0 0 1px rgba(0,0,0,0.3)"
                                                        : "0 0 0 1px rgba(255,255,255,0.3)",
                                            }}
                                            boxSx={{ fontSize: '1rem' }}
                                        />

                                    </IconButton>


                                    <Menu
                                        id="menu-appbar"
                                        disableScrollLock
                                        anchorEl={anchorEl}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'right',
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        open={Boolean(anchorEl)}
                                        onClose={handleClose}
                                        slotProps={{
                                            paper: {
                                                sx: {
                                                    minWidth: 220,
                                                    maxWidth: 250,
                                                    mt: 1,
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem onClick={() => handleClickProfile()}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '70%' }}>
                                                        <Typography
                                                            variant='body1'
                                                            sx={{
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {user.firstName}
                                                        </Typography>
                                                        <Typography
                                                            variant='body1'
                                                            sx={{
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {user.lastName}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                                        {user.role === "admin" ? (
                                                            <>
                                                                <AdminPanelSettingsIcon fontSize="large" color="primary" />
                                                                <Typography fontSize={8}>Administrador</Typography>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <PersonIcon fontSize="large" color="primary" />
                                                                <Typography fontSize={8}>Coordinador</Typography>
                                                            </>
                                                        )}
                                                    </Box>
                                                </Box>

                                                <Typography variant='body2' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                        <Divider />

                                        <MenuItem
                                            onClick={handleClickLogout} sx={{
                                                "&:hover": {
                                                    backgroundColor: "transparent"
                                                },
                                                "&.Mui-focusVisible": {
                                                    backgroundColor: "transparent"
                                                }
                                            }}>
                                            <ButtonWithLoader
                                                backgroundButton='transparent'
                                                loading={loading}
                                                disabled={loading}
                                                variant="outlined"
                                                fullWidth
                                                sx={{ gap: 2 }}
                                            >
                                                <Typography variant="button" sx={{ color: theme => theme.primary }}>Cerrar sesión</Typography>
                                                <LogoutRoundedIcon fontSize='small' />
                                            </ButtonWithLoader>
                                        </MenuItem>
                                    </Menu>
                                </div>
                            </Toolbar>
                        </Box>
                    </AppBar>
                    
            
                    <DrawerNavBar open={open} onClose={handleCloseDrawer} />
                </>
            )}

        </Box>
    );
}
