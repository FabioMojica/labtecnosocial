import React, { useEffect, useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Image } from "./Image";
import { Link as RouterLink } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { ThemeToggleButton } from './ThemeToggleButton';
import { VolumenToggleButton } from './VolumenToggleButton';
import { useAuth, useHeaderHeight, useNotification } from '../contexts';

import { Divider, Link, useTheme } from '@mui/material';
import { useAuthEffects, useFetchAndLoad } from '../hooks';
import { ButtonWithLoader } from './ButtonWithLoader';
 
import logoLight from "../assets/labTecnoSocialLogoLight.png";
import logoDark from "../assets/labTecnoSocialLogoDark.png";
import { DrawerNavBar } from './DrawerNavBar';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { UserProfileImage } from './UserProfileImage';
import { logoutUserApi } from '../api';


export const Header = () => {
    const { user } = useAuth();
    const { notify } = useNotification();
    const [anchorEl, setAnchorEl] = useState(null);
    const { handleLogout } = useAuthEffects();
    const { loading, callEndpoint } = useFetchAndLoad();
    const theme = useTheme();
    const toolbarRef = useRef(null);
    const { setHeaderHeight } = useHeaderHeight();
    const logoToShow = theme.palette.mode === 'dark' ? logoDark : logoLight;
    //const logoutUseCase = new LogoutUser(new ApiSessionRepository());
    const [open, setIsOpen] = React.useState(false);
    const toggleNav = () => setIsOpen(!open);

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
            await callEndpoint(logoutUserApi());
            handleLogout(); 
            setAnchorEl(null);
        } catch (err) {
            handleLogout();
            notify("Sesión cerrada de emergencia por error", "error");
        }
    };


    return (
        <Box sx={{ flexGrow: 1 }}>
            {user && (
                <>
                    <AppBar position="fixed" sx={{
                        backgroundColor: theme.palette.primary.backgroundHeader,
                        zIndex: theme.zIndex.drawer + 1,
                        maxWidth: 1600,
                        top: 0,
                        left: 0
                    }}>
                        <Toolbar ref={toolbarRef} disableGutters sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', pr: '18px' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2, pl: 1 }}>
                                <IconButton size="medium" onClick={toggleNav} sx={{ color: theme.palette.primary.principal }}>
                                    {open
                                        ? <ChevronLeftIcon fontSize="large" />
                                        : <ChevronRightIcon fontSize="large" />
                                    }
                                </IconButton>
                                <Link
                                    component={RouterLink}
                                    to="/inicio"
                                >
                                    <Image src={logoToShow} alt="Lab Tecno Social Logo" width={100} height={43} />
                                </Link>
                            </Box>


                            <div>
                                <ThemeToggleButton />
                                <VolumenToggleButton />

                                <IconButton
                                    size="large"
                                    aria-label="account of current user"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleMenu}
                                    sx={{ color: theme.palette.primary.principal }}
                                >
                                    <UserProfileImage user={user} sx={{ width: 40, height: 40, borderRadius: 2 }} boxSx={{ fontSize: '1rem' }} />
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
                                    <MenuItem onClick={handleClose}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Typography variant='body1'>{user.firstName}</Typography>
                                                    <Typography variant='body1'>{user.lastName}</Typography>
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

                                            <Typography variant='body2'>{user.email}</Typography>
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
                                            <Typography variant="button" sx={{ color: theme => theme.palette.primary.principalText }}>Cerrar sesión</Typography>
                                            <LogoutRoundedIcon fontSize='small' />
                                        </ButtonWithLoader>
                                    </MenuItem>
                                </Menu>
                            </div>

                        </Toolbar>
                    </AppBar>
                    <DrawerNavBar open={open} onClose={handleCloseDrawer} />
                </>
            )}

        </Box>
    );
}
