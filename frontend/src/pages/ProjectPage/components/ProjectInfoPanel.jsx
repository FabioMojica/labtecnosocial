import { Box, Grid, IconButton, InputAdornment, Tooltip, Typography, useTheme, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useHeaderHeight, useNotification } from "../../../contexts";
import {
    ProjectImageDates,
    TextFieldMultiline,
} from "../../../generalComponents";
import { cleanExtraSpaces, validateRequiredText, validateSpaces, validateTextLength } from "../../../utils/textUtils";
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import { projectSchema } from "../../../utils/schemas/projectSchema";

export const ProjectInfoPanel = ({ project, panelHeight, onChange, onErrorsChange, resetTrigger }) => {
    const theme = useTheme();
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [overlayText, setOverlayText] = useState("Subir una imagen");
    const [errors, setErrors] = useState({ name: "", description: "" });
    const { notify } = useNotification();
    const { headerHeight } = useHeaderHeight();

    useEffect(() => {
        setErrors({ name: "", description: "" });
    }, [resetTrigger]);

    useEffect(() => {
        onErrorsChange?.({ ...errors });
    }, [errors]);

    
    useEffect(() => {
        if (previewImage) {
            const hasHover = window.matchMedia("(hover: hover)").matches;
            setOverlayText(
                hasHover
                    ? "Cambiar imagen (click izquierdo), borrar imagen (click derecho)"
                    : "Toca para cambiar la imagen, borrar imagen (mantener presionado)"
            );
        } else {
            setOverlayText("Subir una imagen");
        }
    }, [previewImage]);

    const handleOverlayClick = () => fileInputRef.current?.click();

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            notify("Solo se permiten archivos de imagen (jpg, png)", "warning");
            return;
        }

        const MAX_SIZE_MB = 2;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

        if (file.size > MAX_SIZE_BYTES) {
            notify(`La imagen es demasiado pesada. Máximo permitido: ${MAX_SIZE_MB}MB`, "warning");
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);
        onChange?.({ image_url: file });
        event.target.value = "";
    };
 
    const handleRemoveImage = () => { 
        setPreviewImage(null);
        onChange?.({ image_url: null });
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        handleRemoveImage();
    };

    let longPressTimer;
    const handleTouchStart = () => {
        longPressTimer = setTimeout(() => handleRemoveImage(), 1000);
    };
    const handleTouchEnd = () => clearTimeout(longPressTimer);

    // --- Validación de texto ---
    const handleNameChange = (e) => {
        const value = e.target.value;
        const error =
            validateSpaces(value, "Nombre del proyecto") || 
            validateRequiredText(value, "Nombre del proyecto") ||
            validateTextLength(value, projectSchema.MIN_LENGTH_NAME, projectSchema.MAX_LENGTH_NAME, "Nombre del proyecto");
        setErrors((prev) => ({ ...prev, name: error || "" }));
        onChange?.({ name: value });
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        const error =
            validateSpaces(value, "Descripción") || 
            validateRequiredText(value, "Descripción") ||
            validateTextLength(value, projectSchema.MIN_LENGTH_DESCRIPTION, projectSchema.MAX_LENGTH_DESCRIPTION, "Descripción");
        setErrors((prev) => ({ ...prev, description: error || "" }));
        onChange?.({ description: value });
    };


    return (
        <Grid
            container
            spacing={2}
            sx={{
                width: "100%",
                minHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                height: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                maxHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                p: 1,
            }}
        >
            <Grid
                size={{ xs: 12, md: 4.5 }}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    height: `calc(100vh - ${headerHeight}px - ${panelHeight}px - 24px)`,
                    maxHeight: {
                        xs: 250,
                        sm: 300,
                        lg: `calc(100vh - ${headerHeight}px - ${panelHeight}px - 24px)`,
                    },
                }}
            >
                <ProjectImageDates
                    overlay
                    overlayText={overlayText}
                    project={project}
                    fallbackLetter={(project.name)?.trim().charAt(0)?.toUpperCase()}
                    sx={{ 
                        width: {
                            xs: 250,
                            sm: 300,
                            lg: '100%'
                        },
                        height: "100%",
                        maxHeight: 500,
                    }}
                    changeImage
                    onChangeImage={handleOverlayClick} 
                    previewImage={previewImage}
                    onContextMenu={handleContextMenu}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                />
            </Grid>


            <Grid
                container
                spacing={1}
                size={{ xs: 12, md: 7.5 }}
                sx={{ display: "flex", flexDirection: "column" }}
            >
                <Grid sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 1,
                        mb: 1,
                    }}>
                        <DriveFileRenameOutlineIcon />
                        <Typography
                            sx={{
                                fontWeight: 'bold'
                            }}
                            variant="h5"
                        >
                            Nombre del proyecto
                        </Typography>
                    </Box>
                    <TextField
                        label={
                            project?.name !== "" ? null :
                                <>
                                    Ingrese un nombre para el proyecto <span style={{ color: theme.palette.error.main }}>*</span>
                                </>
                        }
                        variant="outlined"
                        value={project?.name ?? ""}
                        onChange={handleNameChange}
                        error={!!errors.name}
                        slotProps={{
                            htmlInput: {
                                maxLength: projectSchema.MAX_LENGTH_NAME
                            }
                        }}
                        size='small'
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                minHeight: {
                                    xs: 50,
                                    sm: 60
                                },
                                maxHeight: {
                                    xs: 50,
                                    sm: 60
                                },
                                width: '100%',
                            },
                            '& .MuiOutlinedInput-input': {
                                padding: '8px 12px',
                                fontSize: '0.95rem',
                                lineHeight: '1.2',
                                textAlign: 'justify'
                            }
                        }}
                    />

                    {/* Error + contador */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 0.5,
                            px: 0.5,
                        }}
                    >
                        {/* Error a la izquierda */}
                        <Typography
                            variant="caption"
                            color="error"
                            sx={{
                                visibility: errors.name ? "visible" : "hidden",
                                fontSize: {
                                    xs: '0.6rem',
                                    sm: '0.65rem'
                                }
                            }}
                        >
                            {errors.name || "placeholder"}
                        </Typography>

                        {/* Contador a la derecha */}
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                fontSize: {
                                    xs: '0.6rem'
                                },
                                height: 20,
                            }}
                        >
                            {(project?.name?.length ?? 0)} / {projectSchema.MAX_LENGTH_NAME}
                        </Typography>
                    </Box>
                </Grid>

                <Grid
                    sx={{ display: 'flex', flexDirection: 'column' }}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 1,
                        mb: 1,
                    }}>
                        <DescriptionIcon />
                        <Typography
                            sx={{
                                fontWeight: 'bold'
                            }}
                            variant="h5"
                        >
                            Descripción
                        </Typography>
                    </Box>
                    <TextFieldMultiline
                        rows={6}
                        value={project?.description ?? ""}
                        onChange={handleDescriptionChange}
                        error={!!errors.description}
                        variant="outlined"
                        label={
                            project?.description !== "" ? null :
                                <>
                                    Ingrese una descripción para el proyecto <span style={{ color: theme.palette.error.main }}>*</span>
                                </>
                        }
                        slotProps={{
                            htmlInput: {
                                maxLength: projectSchema.MAX_LENGTH_DESCRIPTION
                            }
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                width: '100%',
                            },
                            '& .MuiOutlinedInput-input': {
                                padding: '8px 12px',
                                fontSize: '0.95rem',
                                lineHeight: '1.2',
                                textAlign: 'justify'
                            }
                        }}
                    />

                    {/* Error + contador */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 0.5,
                            px: 0.5,
                        }}
                    >
                        {/* Error a la izquierda */}
                        <Typography
                            variant="caption"
                            color="error"
                            sx={{
                                visibility: errors.description ? "visible" : "hidden",
                                fontSize: {
                                    xs: '0.6rem',
                                    sm: '0.65rem'
                                }
                            }}
                        >
                            {errors.description || "placeholder"}
                        </Typography>

                        {/* Contador a la derecha */}
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                fontSize: {
                                    xs: '0.6rem'
                                },
                                height: 20,
                            }}
                        >
                            {(project?.description.length ?? 0)} / {projectSchema.MAX_LENGTH_DESCRIPTION}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
        </Grid>
    );
};
