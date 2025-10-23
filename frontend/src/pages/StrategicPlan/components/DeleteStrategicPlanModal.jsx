import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    Box,
} from "@mui/material";
import { deleteStrategicPlanApi } from "../../../api/strategicPlan";
import { useNotification } from "../../../contexts";
import { useTheme } from "@emotion/react";
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useNavigate } from "react-router-dom";
import { useFetchAndLoad } from "../../../hooks";
import { ButtonWithLoader } from "../../../generalComponents";


export default function DeleteStrategicPlanModal({
    open,
    onClose,
    selectedYear,
}) {
    const [inputYear, setInputYear] = useState("");
    const { notify } = useNotification();
    const navigate = useNavigate();
    const { loading, callEndpoint } = useFetchAndLoad();

    const theme = useTheme();

    const handleConfirmDeletePlan = async () => {
        try {

            const result = await callEndpoint(deleteStrategicPlanApi(selectedYear));

            if (result) {
                notify(
                    `Plan estratégico del año ${selectedYear} eliminado exitosamente`,
                    "success"
                );

                setTimeout(() => {
                    navigate(`/planificacion-estrategica/${selectedYear}`);
                }, 1500);

                window.location.reload();
            }
        } catch (error) {
            console.error("Error deleting strategic plan:", error);
            notify(
                "Error al eliminar el plan estratégico. Inténtalo de nuevo más tarde.",
                "error"
            );
        }

        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <WarningAmberRoundedIcon color="error" fontSize="large" />
                    <Typography variant='h4'>Eliminar Plan Estratégico</Typography>
                </Box>

                <DialogContent sx={{ p: 0 }}>
                    <Typography sx={{ color: theme => theme.palette.error.main, mb: 2 }}>
                        <strong>Esta acción es irreversible.</strong>
                    </Typography>

                    <Typography sx={{ mb: 2 }}>
                        Para confirmar la eliminación del plan estratégico del año{" "}
                        <strong>{selectedYear}</strong>, escribe el año a continuación:
                    </Typography>

                    <TextField
                        label="Año"
                        fullWidth
                        value={inputYear}
                        onChange={(e) => setInputYear(e.target.value)}
                        inputProps={{ maxLength: 4, inputMode: "numeric", pattern: "[0-9]*" }}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <ButtonWithLoader
                        variant="contained"
                        color="error"
                        loaderColor="white"
                        loading={loading}
                        disabled={inputYear !== String(selectedYear)}
                        onClick={handleConfirmDeletePlan}
                        sx={{
                            backgroundColor: (theme) => theme.palette.error.main,
                            "&:hover": {
                                backgroundColor: (theme) => theme.palette.error.dark,
                            },
                            width: '100px'
                        }}
                    >
                        Eliminar
                    </ButtonWithLoader>

                </DialogActions>
            </Box>
        </Dialog>

    );
}
