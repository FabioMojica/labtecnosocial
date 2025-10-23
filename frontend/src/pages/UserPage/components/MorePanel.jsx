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

export const MorePanel = ({ user, panelHeight }) => {
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
            navigate('/usuarios');
            notify("Usuario eliminado correctamente", "success");
        } catch (err) {
            notify(err.message, "error");
        }
    };

    if (loading) return <FullScreenProgress text="Borrando el usuario" />;

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
                    <Typography variant='h4'>Eliminar Usuario</Typography>
                </Box>

                <Box>
                    <Typography gutterBottom>
                        Esta acción eliminará el usuario{' '}
                        <Box component="span">
                            <strong>{user?.firstName} {user?.lastName}</strong>
                        </Box>{' '}
                        de forma <strong>IRREVERSIBLE</strong> del sistema.
                    </Typography>

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
                                                    component={RouterLink}
                                                    to={`?tab=Proyectos asignados`}
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

                        <ListItem>
                            <ListItemText primary="Esta operación es irreversible y no se podrá deshacer." />
                        </ListItem>

                        <ListItem>
                            <ListItemText
                                primary={
                                    <>
                                        Por favor ingrese el <strong>email</strong> y la <strong>contraseña</strong> del <strong>usuario</strong> que desea eliminar.
                                    </>
                                }
                            />
                        </ListItem>

                    </List>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextField
                        label="Email del usuario a eliminar"
                        placeholder="Email"
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        fullWidth
                        inputProps={{ maxLength: 100, autoComplete: "off", name: "no-email" }}
                    />
                    <TextField
                        label="Contraseña del usuario a eliminar"
                        placeholder="Contraseña"
                        type={showPassword ? "text" : "password"}
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        fullWidth
                        inputProps={{ maxLength: 8, autoComplete: "off", name: "no-email" }}
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
                        <Button
                            onClick={() => { setInputEmail(""); setInputPassword(""); }}
                            disabled={loading}
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
