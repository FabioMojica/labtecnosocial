import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { ButtonWithLoader } from ".";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const PANEL_WIDTH = 280;
const HANDLE_HEIGHT = 50;
const PANEL_HEIGHT = 180;

// Posiciones Y
const HIDDEN_Y = -PANEL_HEIGHT;
const HANDLE_ONLY_Y = -HANDLE_HEIGHT;
const EXPANDED_Y = 0;

// Animaciones
const panelVariants = {
    hidden: {
        y: HIDDEN_Y,
        transition: { duration: 0.25, ease: "easeIn" },
    },
    handleOnly: {
        y: HANDLE_ONLY_Y,
        transition: { duration: 0.3, ease: "easeOut" },
    },
    expanded: {
        y: EXPANDED_Y,
        transition: { duration: 0.35, ease: "easeOut" },
    },
};

export const FloatingActionButtons = ({
    text = "Tienes cambios pendientes",
    visible,
    onSave,
    onCancel,
    saveDisabled, 
    loading,
    sx,
}) => {
    const [open, setOpen] = useState(false);
    const [ openBody, setOpenBody ] = useState(false);
    const theme = useTheme();


    useEffect(() => { 
        if (!visible) setOpen(false);
    }, [visible]);

    return (
        <AnimatePresence
        style={{
            ...sx
        }}
        >
            {visible && (
                <>
                    {/* OVERLAY */}
                    {open && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{
                                position: "fixed",
                                inset: 0,
                                backgroundColor: "rgba(0,0,0,0.4)",
                                zIndex: theme.zIndex.drawer + 1,
                                ...sx,
                            }}
                            onClick={() => { 
                                if(!loading) setOpen(false)
                            }}
                        />
                    )}
                    <motion.div
                        variants={panelVariants}
                        initial="hidden"
                        animate={open ? "expanded" : "handleOnly"}
                        exit="hidden"
                        style={{
                            position: "fixed",
                            top: !open ? -PANEL_HEIGHT + HANDLE_HEIGHT : 0,
                            left: 0,
                            right: 0,
                            margin: "0 auto",
                            width: PANEL_WIDTH,
                            zIndex: theme.zIndex.drawer + 10,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            ...sx
                        }}
                    >
                        <Box
                            sx={{
                                width: PANEL_WIDTH,
                                px: 3,
                                py: 2, 
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
                                bgcolor: "background.paper",
                                boxShadow: 4,
                            }}
                        >
                            <Typography fontWeight="bold" fontSize="1rem" textAlign="center">
                                {text}
                            </Typography>

                            <ButtonWithLoader
                                loading={loading}
                                onClick={onSave}
                                disabled={saveDisabled}
                                variant="contained"
                                sx={{
                                    color: "white",
                                    minHeight: 30,
                                    bgcolor: theme.palette.success.main,
                                }}
                            >
                                Guardar Cambios
                            </ButtonWithLoader>

                            <Button
                                onClick={() => {
                                    setOpen(false);
                                    onCancel();
                                }}
                                disabled={loading}
                                sx={{
                                    height: 36,
                                    border: "none",
                                    borderRadius: 1,
                                    cursor: "pointer",
                                    bgcolor: theme.palette.error.main,
                                    color: theme.palette.error.contrastText,
                                    fontSize: "0.9rem",
                                }}
                            >
                                Descartar cambios
                            </Button>
                        </Box>


                        {/* HANDLE */}
                        <Button
                            onClick={() => { 
                                if(!loading) setOpen((prev) => !prev)}
                            }
                            sx={{
                                width: PANEL_WIDTH,
                                height: HANDLE_HEIGHT,
                                bgcolor: open
                                    ? theme.palette.primary.main
                                    : theme.palette.warning.main,
                                color: theme.palette.primary.contrastText,
                                borderBottomLeftRadius: "12px",
                                borderBottomRightRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                boxShadow: 6,
                                userSelect: "none",
                            }}
                        >
                            {open ? (
                                <>
                                    Ver menos <ExpandLessIcon sx={{ ml: 0.5 }} />
                                </>
                            ) : (
                                <>
                                    Tienes cambios pendientes <ExpandMoreIcon sx={{ ml: 0.5 }} />
                                </>
                            )}
                        </Button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
