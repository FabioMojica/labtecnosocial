import React, { useRef, useState } from "react";
import { Box, Button, List, ListItem, ListItemText, Paper, TextField, Typography, IconButton, InputAdornment, Tooltip } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth, useHeaderHeight, useNotification } from "../../../contexts";
import { useFetchAndLoad } from "../../../hooks";
import { useNavigate } from "react-router-dom";
import { ButtonWithLoader, ErrorScreen, FullScreenProgress } from "../../../generalComponents";
import { deleteUserApi } from "../../../api";
import { Link as MuiLink } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import InfoIcon from '@mui/icons-material/Info';
import { roleConfig } from "../../../utils";


export const MorePanel = ({ user, panelHeight, isOwnProfile, userRoleSession }) => {
    console.log(userRoleSession);

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


            notify("Usuario eliminado correctamente del sistema.", "success");
            navigate('/usuarios');

        } catch (error) {
            notify(error.message, "error");
        }
    };

    if (loading) {
        let text = "Eliminando el usuario del sistema";
        if (isOwnProfile) {
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
                maxWidth: {
                    xs: '100vw',
                    lg: '100%',
                },
                p: 1,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                maxHeight: 1000
            }}
        >
            <Paper elevation={3} sx={{ padding: 1, display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, flex: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarningAmberRoundedIcon color="error" fontSize="large" />
                            <Typography variant='h4' alignContent='center'>
                                Eliminar Usuario
                            </Typography>
                        </Box>
                        {
                            <Typography gutterBottom>
                                Esta acción eliminará el usuario{' '}
                                <Box component="span">
                                    <strong>{user?.firstName} {user?.lastName}</strong>
                                </Box>{' '}
                                de forma <strong>IRREVERSIBLE</strong> y <strong>PERMANENTE</strong> del sistema.
                            </Typography>
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
                                                    * Este usuario es responsable de{' '}
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
                                                    * Al eliminar el usuario, se le desasignará de los proyectos de los que es responsable.
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

                            {
                                userRoleSession?.isSuperAdmin && user.role === roleConfig.admin.value &&
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <>
                                                * Este administrador ha creado{' '}
                                                <MuiLink
                                                    sx={{ color: 'orange', fontWeight: 'bold', textDecoration: 'none' }}
                                                >
                                                    {user?.createdUsers?.length} {user?.createdUsers?.length === 1 ? 'usuario' : 'usuarios'}
                                                </MuiLink>
                                                {' '}en el sistema, los cuales pasarán a mostrarse como creados por ti.
                                            </>
                                        }
                                    /></ListItem>

                            }


                            <ListItem>
                                <ListItemText primary="* Esta operación es irreversible y no se podrá deshacer." />
                            </ListItem>

                            <ListItem>
                                <ListItemText
                                    primary={
                                        <>
                                            {
                                                userRoleSession?.isSuperAdmin ?
                                                    <>
                                                        Por favor ingresa el <strong>email</strong> del usuario a eliminar y la <strong>contraseña</strong> de tu cuenta.
                                                    </> :
                                                    userRoleSession?.isAdmin ?
                                                        <>
                                                            Por favor ingrese el <strong>email</strong> y la <strong>contraseña</strong> del <strong>usuario</strong> a eliminar.
                                                        </> : <>
                                                        </>
                                            }
                                        </>
                                    }
                                />
                            </ListItem>

                        </List>
                    </Box>

                    <Box
                        sx={{
                            display: {
                                xs: 'none',
                                lg: 'flex'
                            },
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                            minHeight: 150,

                        }}
                    >
                        <PersonRemoveIcon sx={{ fontSize: 200 }} />
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

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

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <ButtonWithLoader
                            loading={loading}
                            onClick={handleDelete}
                            disabled={!isConfirmed || loading}
                            variant="contained"
                            backgroundButton={theme => theme.palette.error.main}
                            sx={{
                                color: 'white', px: 2,
                                width: {
                                    xs: 100,
                                    lg: 170
                                },
                                fontSize: {
                                    xs: '0.9rem',
                                    sm: '0.9rem',
                                    lg: '0.9rem'
                                }
                            }}
                        >
                            Eliminar
                        </ButtonWithLoader>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};
