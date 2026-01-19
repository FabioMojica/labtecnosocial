import React, { useRef, useState } from "react";
import { Box, Button, List, ListItem, ListItemText, Paper, TextField, Typography, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff, WarningAmberRounded } from "@mui/icons-material";
import { useAuth, useHeaderHeight, useNotification } from "../../../contexts";
import { useFetchAndLoad } from "../../../hooks";
import { useNavigate } from "react-router-dom";
import { ErrorScreen, FullScreenProgress } from "../../../generalComponents";
import { deleteUserApi } from "../../../api";
import { Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const MorePanel = ({ user, panelHeight, isOwnProfile }) => {
    const navigate = useNavigate();
    if (!user) return (
        <ErrorScreen
            message="Usuario no encontrado"
            buttonText="Volver"
            onButtonClick={() => navigate('/usuarios')}
        />
    );
    const { headerHeight } = useHeaderHeight();
    const { loading, callEndpoint } = useFetchAndLoad();
    const { notify } = useNotification();
    const { user: loggedInUser } = useAuth();
    const { logout } = useAuth();

    const [inputEmail, setInputEmail] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const isConfirmed =
        inputEmail === user.email && inputPassword.length === 8;

    const handleDelete = async () => {
        try {
            await callEndpoint(deleteUserApi({
                email: user.email,
                password: inputPassword,
                requesterEmail: loggedInUser.email,
            }));
            
            if(isOwnProfile) {
                await logout();
                notify("Tu cuenta ha sido eliminada del sistema.", "info", { persist: true});
            } else {
                notify("Usuario eliminado correctamente del sistema.", "success");
                navigate('/usuarios');
            }
        } catch (error) {
            if (error.message?.includes('Email o contraseña incorrectos.')) {
                notify('No se pudo eliminar el usuario por que crecenciales no coinciden.', 'error');
            } else {
                notify("Ocurrió un error inesperado al eliminar el usuario. Inténtalo de nuevo más tarde.", "error");
            }
        }
    };

    if (loading) { 
        let text = "Eliminando el usuario del sistema";
        if(isOwnProfile) {
            text = "Eliminando tu cuenta del sistema"
        }
        return (
        <FullScreenProgress text={text} />);
    };

    return (
        <Box
            sx={{
                width: "100%",
                height: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                maxHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                p: 1,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Paper elevation={3} sx={{ padding: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberRounded color="error" fontSize="large" />
                    <Typography variant='h4'>
                        {isOwnProfile ? "Eliminar tu cuenta" : "Eliminar Usuario"}
                    </Typography>
                </Box>

                <Box>
                    {
                        isOwnProfile ?
                            <>
                                <Typography gutterBottom>
                                    Esta acción eliminará tu cuenta{' '}
                                    de forma <strong>IRREVERSIBLE</strong> del sistema.
                                </Typography>
                            </> : <>
                                <Typography gutterBottom>
                                    Esta acción eliminará el usuario{' '}
                                    <Box component="span">
                                        <strong>{user?.firstName} {user?.lastName}</strong>
                                    </Box>{' '}
                                    de forma <strong>IRREVERSIBLE</strong> del sistema.
                                </Typography>
                            </>
                    }

                    <Typography gutterBottom>
                        Por favor ten en cuenta lo siguiente antes de continuar:
                    </Typography>

                    <List>
                        <ListItem>
                            {user?.projects?.length > 0 ? (
                                <Box>
                                    <ListItemText
                                        primary={
                                            <>
                                                { isOwnProfile ? 
                                                <>
                                                * Eres responable de{' '}
                                                </> : 
                                                <>
                                                * Este usuario es responsable de{' '}
                                                </>
                                                }
                                                <MuiLink
                                                    sx={{ color: 'orange', fontWeight: 'bold', textDecoration: 'none' }}
                                                >
                                                    {user?.projects?.length} {user?.projects?.length === 1 ? 'proyecto' : 'proyectos'}
                                                </MuiLink>.
                                            </>
                                        }
                                    />
                                    <ListItemText
                                        primary={
                                            <>
                                            { 
                                            user?.projects?.length > 0 &&
                                              isOwnProfile ? 
                                                <>
                                                * Serás desasignado de todos los proyectos de los que eres responsable.
                                                </> : 
                                                <>
                                                * Al eliminar el usuario, se le desasignará de los proyectos de los que es responsable.
                                                </>
                                                }
                                            </>
                                        }
                                    />
                                </Box>
                            ) : (
                                <ListItemText
                                    primary="* Este usuario no es responsable de ningún proyecto."
                                />
                            )}
                        </ListItem>

                        <ListItem>
                            <ListItemText primary="Esta operación es irreversible y no se podrá deshacer." />
                        </ListItem>

                        <ListItem>
                            <ListItemText
                                primary={
                                    <>
                                        {
                                            isOwnProfile ?
                                                <>
                                                    Por favor ingresa tu <strong>email</strong> y <strong>contraseña</strong> de <strong>usuario</strong>.
                                                </> :
                                                <>
                                                    Por favor ingrese el <strong>email</strong> y la <strong>contraseña</strong> del <strong>usuario</strong>.
                                                </>
                                        }
                                    </>
                                }
                            />
                        </ListItem>

                    </List>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <form autoComplete="off">
                        <TextField
                            type="email"
                            autoComplete="new-email"
                            label="Ingrese el email"
                            value={inputEmail}
                            onChange={(e) => setInputEmail(e.target.value)}
                            fullWidth
                            maxLenght={100}
                            inputProps={{ maxLength: 100, autoComplete: "off", name: "no-email" }}
                        />
                    </form>
                    <form autoComplete="off">
                        <TextField
                            label="Ingrese la contraseña"
                            placeholder="Contraseña"
                            autoComplete="new-password"
                            type={showPassword ? "text" : "password"}
                            value={inputPassword}
                            onChange={(e) => setInputPassword(e.target.value)}
                            fullWidth
                            maxLenght={8}
                            inputProps={{ maxLength: 8, autoComplete: "new-password", name: "new-password" }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                maxLenght: 8,
                            }}
                        />
                    </form>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            onClick={() => { setInputEmail(""); setInputPassword(""); }}
                            disabled={loading}
                            variant="contained"
                            color="success"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            disabled={!isConfirmed || loading}
                            onClick={handleDelete}
                        >
                            Eliminar
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};
