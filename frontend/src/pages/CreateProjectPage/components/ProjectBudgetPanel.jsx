import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Grid, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { useHeaderHeight } from "../../../contexts";

export const ProjectBudgetPanel = ({ budgetAmount, panelHeight, onChange }) => {
    const { headerHeight } = useHeaderHeight();

    const handleBudgetChange = (event) => {
        const rawValue = event.target.value;

        if (rawValue === '') {
            onChange?.({ budget_amount: '' });
            return;
        }

        const normalizedValue = rawValue.replace(',', '.');

        if (!/^\d*\.?\d{0,2}$/.test(normalizedValue)) return;

        onChange?.({ budget_amount: normalizedValue });
    };

    return (
        <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{
                width: "100%",
                minHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                height: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                maxHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                p: 2,
            }}
        >
            <Grid size={{ xs: 12, md: 8, lg: 6 }}>
                <Paper
                    elevation={4}
                    sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <AttachMoneyIcon />
                        <Typography variant="h5" fontWeight="bold">
                            Presupuesto del proyecto
                        </Typography>
                    </Box>

                    <Typography color="text.secondary">
                        Registra el presupuesto base del proyecto en bolivianos. Este monto servirá como referencia
                        para el control presupuestario del proyecto.
                    </Typography>

                    <TextField
                        label="Presupuesto en bolivianos"
                        value={budgetAmount ?? ''}
                        onChange={handleBudgetChange}
                        fullWidth
                        size="small"
                        slotProps={{
                            htmlInput: {
                                inputMode: 'decimal',
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    Bs
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'flex-start',
                            color: 'text.secondary',
                        }}
                    >
                        <InfoOutlinedIcon sx={{ fontSize: 18, mt: '2px' }} />
                        <Typography variant="body2">
                            Esta pestaña se muestra únicamente al rol de super administrador.
                        </Typography>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
};
