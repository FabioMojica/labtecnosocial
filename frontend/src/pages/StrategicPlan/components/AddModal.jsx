// ReusableModal.jsx
import React from "react";
import { Modal, Box, Typography, IconButton, Button, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from "@emotion/react";
import { cleanAndValidatePositiveNumber, cleanExtraSpaces } from "../../../utils/textUtils";

const AddModal = ({
    open,
    onClose,
    title,
    contentType,
    value,
    setValue,
    onSave,
}) => {
    const theme = useTheme();

    const handleIndicatorChange = (index, field, val) => {
        const newIndicators = [...value.indicators];
        newIndicators[index] = { ...newIndicators[index], [field]: val };
        setValue(prev => ({ ...prev, indicators: newIndicators }));
    };

    const handleAddIndicator = () => {
        setValue(prev => ({
            ...prev,
            indicators: [...prev.indicators, { id: Date.now(), quantity: 0, concept: '' }]
        }));
    };

    const handleRemoveIndicator = (index) => {
        const newIndicators = value.indicators.filter((_, i) => i !== index);
        setValue(prev => ({ ...prev, indicators: newIndicators }));
    };

    return (
        <Modal
            open={open}
            onClose={(event, reason) => {
                if (reason === 'backdropClick') {
                    return;
                }
                onClose();
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 500,
                    maxHeight: '80vh',
                    height: 'auto',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                }}

            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{title}</Typography>
                    <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {contentType === 'objective' ? (
                    <Box sx={{
                        flex: 1,
                        minHeight: 0,
                        p: 1,
                    }}>
                        <TextField
                            fullWidth
                            label="Título del objetivo"
                            value={value.title}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || val[0] !== ' ') {
                                    setValue(prev => ({ ...prev, title: val }));
                                }
                            }}
                            onBlur={() => {
                                setValue(prev => ({
                                    ...prev,
                                    title: cleanExtraSpaces(prev.title)
                                }));
                            }}
                            inputProps={{ maxLength: 100 }}
                            helperText={`${value.title.length}/100 caracteres`}
                            sx={{ mt: 2 }}
                            required
                        />

                        {value.indicators?.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography sx={{ fontWeight: 'bold' }}>Indicadores:</Typography>

                                {/* Contenedor con scroll solo para los indicadores */}
                                <Box
                                    sx={{
                                        maxHeight: 200, // Altura máxima para activar scroll
                                        overflowY: 'auto',
                                        "&::-webkit-scrollbar": { width: "2px" },
                                        "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
                                        "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
                                        "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                                    }}
                                >
                                    {value.indicators.map((indicator, index) => (
                                        <Box key={indicator.id} sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                                            <TextField
                                                label="Cantidad"
                                                autoComplete="off"
                                                type="text"
                                                value={indicator.quantity === 0 ? '' : indicator.quantity}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '' || /^\d*$/.test(val)) handleIndicatorChange(index, 'quantity', val);
                                                }}
                                                onBlur={() => {
                                                    const cleaned = cleanAndValidatePositiveNumber(indicator.quantity);
                                                    handleIndicatorChange(index, 'quantity', cleaned);
                                                }}
                                                sx={{ flex: 1 }}
                                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 0 }}
                                            />
                                            <TextField
                                                label="Concepto"
                                                autoComplete="off"
                                                value={indicator.concept}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // Evita solo si el primer caracter es un espacio
                                                    if (val.length === 1 && val[0] === ' ') return;
                                                    handleIndicatorChange(index, 'concept', val);
                                                }}
                                                onBlur={() => {
                                                    handleIndicatorChange(index, 'concept', cleanExtraSpaces(indicator.concept));
                                                }}
                                                sx={{ flex: 2 }}
                                                inputProps={{ maxLength: 100 }}
                                            />
                                            <IconButton onClick={() => handleRemoveIndicator(index)} size="small">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}


                        <Button onClick={handleAddIndicator} size="small" sx={{ mt: 2 }}>
                            Añadir indicador
                        </Button>
                    </Box>
                ) : (
                    <TextField
                        fullWidth
                        multiline
                        autoComplete="off"
                        rows={4}
                        value={value}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val.length === 1 && val[0] === ' ') return;
                            setValue(val);
                        }}
                        onBlur={() => setValue(cleanExtraSpaces(value))}
                        sx={(theme) => ({
                            mt: 2,
                            "& .MuiInputBase-input": {
                                overflowY: 'auto',
                                maxHeight: '150px',
                            },
                            "& .MuiInputBase-input::-webkit-scrollbar": { width: "2px" },
                            "& .MuiInputBase-input::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
                            "& .MuiInputBase-input::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
                            "& .MuiInputBase-input::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                        })}
                    />
                )}

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                        variant="contained"
                        onClick={onSave}
                        disabled={
                            (contentType === 'objective' && (
                                !value.title?.trim() ||
                                value.indicators?.some(ind => !ind.quantity || !ind.concept?.trim())
                            )) ||
                            (contentType === 'text' && !value.trim())
                        }
                    >
                        Guardar
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default AddModal;
