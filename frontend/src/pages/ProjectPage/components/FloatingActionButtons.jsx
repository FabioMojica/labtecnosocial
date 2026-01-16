import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
    Box,
    Button,
    Typography,
    useTheme,
} from "@mui/material";
import { useState } from "react";
import { ButtonWithLoader } from '../../../generalComponents';

const PANEL_WIDTH = 280;
const HANDLE_HEIGHT = 50;
const PANEL_HEIGHT = 180;

export const FloatingActionButtons = ({
    visible,
    onSave,
    onCancel,
    saveDisabled,
}) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    if (!visible) return null;

    return (
        <>
            {open && (
                <Box
                    onClick={() => setOpen(false)}
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                    }}
                />
            )}
            <Box
                sx={{
                    position: "fixed",
                    top: -2,
                    left: "50%",
                    transform: `translate(-50%, ${open ? 0 : `-${PANEL_HEIGHT}px`})`,
                    transition: "transform 0.35s ease",
                    zIndex: (theme) => theme.zIndex.drawer + 10,
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    bgcolor: "background.paper",
                    borderBottomLeftRadius: "12px",
                    borderBottomRightRadius: "12px",
                }}
            >
                {/* PANEL */}
                <Box
                    sx={{
                        width: PANEL_WIDTH,
                        px: 3,
                        py: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                    }}
                >
                    <Typography fontWeight="bold" fontSize="1rem" textAlign={'center'}>
                        Cambios sin guardar en el proyecto
                    </Typography>

                    <Button
                        variant="contained"
                        color="error"
                        sx={{ height: '100%' }}
                        onClick={onCancel}
                    >
                        Descartar cambios
                    </Button>

                    <ButtonWithLoader
                        onClick={onSave}
                        disabled={saveDisabled}
                        variant="contained"
                        backgroundButton={theme => theme.palette.success.main}
                        sx={{ color: 'white', minHeight: '30px' }}

                    >
                        Guardar Cambios
                    </ButtonWithLoader>
                </Box>

                <Box
                    sx={{
                        width: PANEL_WIDTH,
                        height: HANDLE_HEIGHT,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        borderBottomLeftRadius: "12px",
                        borderBottomRightRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: 6,
                        bgcolor: theme.palette.warning.main, // <-- fondo warning
                        color: theme.palette.warning.contrastText, // <-- texto contrastante
                        transition: "background-color 0.25s",
                        "&:hover": { bgcolor: "primary.dark" },
                    }}
                    onClick={() => setOpen(prev => !prev)}
                >
                    {open ?
                        <>
                            Ver menos
                            <ExpandLessIcon />
                        </>
                        :
                        <>
                            Tienes cambios pendientes
                            <ExpandMoreIcon />
                        </>
                    }
                </Box>
            </Box>
        </>
    );
};
