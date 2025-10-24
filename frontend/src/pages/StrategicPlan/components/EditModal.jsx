// EditModal.jsx
import React from "react";
import { Modal, Box, Typography, IconButton, Button, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from "@emotion/react";
import { cleanAndValidatePositiveNumber, cleanExtraSpaces } from "../../../utils/textUtils";


const EditModal = ({
    open,
    onClose,
    title,
    item,
    setItem,
    onSave,
    contentType
}) => {
    const theme = useTheme();


    const handleFieldChange = (e) => {
        const { name, value } = e.target;

        
            if (value.length === 1 && value[0] === ' ') return;
        

        setItem(prev => ({ ...prev, [name]: value }));
    };

    const handleIndicatorChange = (index, field, value) => {
        const newIndicators = [...item.indicators];
        newIndicators[index] = { ...newIndicators[index], [field]: value };
        setItem(prev => ({ ...prev, indicators: newIndicators }));
    };

    const addIndicator = () => {
        setItem(prev => ({
            ...prev,
            indicators: [...prev.indicators, { id: Date.now(), quantity: 0, concept: '' }]
        }));
    };

    const removeIndicator = (id) => {
        setItem(prev => ({
            ...prev,
            indicators: prev.indicators.filter(ind => ind.id !== id)
        }));
    };

    return (
        <Modal
            open={open}
            onClose={(e, reason) => {
                if (reason === 'backdropClick') return;
                onClose();
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: 310, sm: 500 },
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    borderRadius: 2,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '80vh'
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{title}</Typography>
                    <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {item && (
                    <Box sx={{ flex: 1, minHeight: 0, pt: 2 }}>
                        {contentType === 'Misión' && (
                            <TextField
                                autoComplete="off"
                                fullWidth
                                multiline
                                rows={4}
                                label="Misión"
                                name="text"
                                value={item.text}
                                onChange={handleFieldChange}
                                onBlur={() => setItem(prev => ({ ...prev, text: cleanExtraSpaces(prev.text) }))} 
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

                        {contentType === 'Objetivos' && (
                            <Box sx={{
                                flex: 1,
                                minHeight: 0,
                                p: 1,
                            }}>
                                <TextField
                                    fullWidth
                                    autoComplete="off"
                                    label="Título del objetivo"
                                    name="title"
                                    value={item.title}
                                    onChange={handleFieldChange}
                                    inputProps={{ maxLength: 100 }}
                                    helperText={`${item.title.length}/100 caracteres`}
                                    onBlur={() => {
                                        setItem(prev => ({
                                            ...prev,
                                            title: cleanExtraSpaces(prev.title)
                                        }));
                                    }}

                                    required
                                    sx={{ mb: 2 }}
                                />
                                {/* Contenedor con scroll solo para los indicadores */}
                                {item.indicators?.length > 0 && (


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
                                            {item.indicators.map((indicator, index) => (
                                                <Box key={indicator.id} sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                                                    <TextField
                                                        autoComplete="off"
                                                        label="Cantidad"
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

                                                    <IconButton onClick={() => removeIndicator(indicator.id)} size="small">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                <Button onClick={addIndicator} size="small" sx={{ mt: 2 }}>
                                    Añadir indicador
                                </Button>
                            </Box>
                        )}

                        {contentType === 'Programas' && (
                            <TextField
                                fullWidth
                                autoComplete="off"
                                label="Programa"
                                name="text"
                                value={item.text}
                                onChange={handleFieldChange}
                            />
                        )}

                        {contentType === 'Proyectos' && (
                            <>
                                <TextField
                                    fullWidth
                                    autoComplete="off"
                                    label="Título del proyecto"
                                    name="title"
                                    value={item.title}
                                    onChange={handleFieldChange}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    autoComplete="off"
                                    label="Descripción del proyecto"
                                    name="description"
                                    multiline
                                    rows={4}
                                    value={item.description}
                                    onChange={handleFieldChange}
                                />
                            </>
                        )}
                    </Box>
                )}

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                        variant="contained"
                        onClick={onSave}
                        disabled={
                            (contentType === 'Objetivos' && (
                                !item?.title?.trim() ||
                                item.indicators?.some(ind => !ind.quantity || !ind.concept?.trim())
                            )) ||
                            (contentType === 'Misión' && (!item?.text?.trim()))
                        }
                    >
                        Guardar
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditModal;
