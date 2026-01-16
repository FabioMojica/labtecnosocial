import { Box, Grid, Typography, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useHeaderHeight, useNotification } from "../../../contexts";
import {
    ProjectImageDates,
    TextField,
    TextFieldMultiline,
} from "../../../generalComponents";
import {
    cleanExtraSpaces,
    validateRequiredText,
    validateTextLength,
} from "../../../utils/textUtils";
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DescriptionIcon from '@mui/icons-material/Description';


const debounce = (func, delay = 100) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};

export const CreateProjectInfoPanel = ({ project, panelHeight, onChange, onValidationChange }) => {
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [overlayText, setOverlayText] = useState("Subir una imagen");
    const [errors, setErrors] = useState({ name: "", description: "" });
    const [localName, setLocalName] = useState(project?.name ?? "");
    const [localDescription, setLocalDescription] = useState(project?.description ?? "");
    const theme = useTheme();
    const { notify } = useNotification();
    const { headerHeight } = useHeaderHeight();
    const debouncedChange = useRef(debounce(onChange, 1));

    useEffect(() => {
        const isValid =
            !errors.name &&
            !errors.description &&
            project?.name?.trim().length >= 3 &&
            project?.description?.trim().length >= 5;
        onValidationChange?.(isValid);
    }, [errors, project, onValidationChange]);

    useEffect(() => {
        setOverlayText(
            previewImage
                ? window.matchMedia("(hover: hover)").matches
                    ? "Cambiar imagen (click izquierdo), borrar imagen (click derecho)"
                    : "Toca para cambiar la imagen, borrar imagen (mantener presionado)"
                : "Subir una imagen"
        );
    }, [previewImage]);

    useEffect(() => {
        setPreviewImage(project?.image_url ?? null);
    }, [project]);

    const handleOverlayClick = () => fileInputRef.current?.click();

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            notify("Solo se permiten archivos de imagen (jpg, png)", "warning");
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);
        onChange?.({ image_file: file, image_url: previewUrl });
        event.target.value = "";
    };

    const handleRemoveImage = () => {
        setPreviewImage(null);
        onChange?.({ image_url: null, image_file: null });
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

    const handleNameChange = (e) => {
        const raw = e.target.value;
        setLocalName(raw);

        const error =
            validateRequiredText(raw, "Nombre del proyecto") ||
            validateTextLength(raw, 3, 100, "Nombre del proyecto");
        setErrors((prev) => ({ ...prev, name: error || "" }));
    };

    const handleNameBlur = () => {
        const cleaned = cleanExtraSpaces(localName);
        setLocalName(cleaned);
        onChange?.({ name: cleaned }); 
        debouncedChange.current({ name: cleaned });
    };

    const handleDescriptionChange = (e) => {
        const raw = e.target.value;
        setLocalDescription(raw);

        const error =
            validateRequiredText(raw, "Descripción") ||
            validateTextLength(raw, 5, 300, "Descripción");
        setErrors((prev) => ({ ...prev, description: error || "" }));
    };

    const handleDescriptionBlur = () => {
        const cleaned = cleanExtraSpaces(localDescription);
        setLocalDescription(cleaned);
        onChange?.({ description: cleaned });
        debouncedChange.current({ description: cleaned });

    };


    return (
        <Grid
            container
            spacing={2}
            sx={{
                width: "100%",
                height: {
                    xs: 'auto',
                    sm: `calc(100vh - ${headerHeight}px - ${panelHeight}px - 24px)`
                },
                maxHeight: {
                    xs: 'auto',
                    sm: `calc(100vh - ${headerHeight}px - ${panelHeight}px - 24px)`
                },
                minHeight: {
                    xs: 'auto',
                    sm: `calc(100vh - ${headerHeight}px - ${panelHeight}px - 24px)`
                },
                mt: 1,
                px: { xs: 1, lg: 0 }
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
                    sx={{ 
                        width: {
                            xs: 250,
                            sm: 300,
                            lg: '100%' 
                        },
                        height: "100%",
                        maxHeight: 500,
                        boxShadow:
                            theme.palette.mode === "light"
                                ? "0 0 0 1px rgba(0,0,0,0.3)"
                                : "0 0 0 1px rgba(255,255,255,0.3)",
                        borderRadius: 2,
                    }}
                    changeImage
                    onChangeImage={handleOverlayClick}
                    previewImage={previewImage ?? undefined}
                    onContextMenu={handleContextMenu}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    fallbackLetter={(localName)?.trim().charAt(0)?.toUpperCase()}
                />
            </Grid>

            <Grid
                container
                spacing={1}
                size={{ xs: 12, md: 7.5 }}
                sx={{ display: "flex", flexDirection: "column" }}
            >
                <Grid sx={{display: 'flex', flexDirection: 'column'}}>
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
                            <>
                                Ingrese un nombre para el proyecto <span style={{ color: theme.palette.error.main }}>*</span>
                            </>
                        }
                        variant="outlined"
                        value={localName}
                        error={!!errors.name}
                        onChange={handleNameChange}
                        onBlur={handleNameBlur}
                        maxLength={100}
                        inputProps={{ maxLength: 100 }}
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
                            {(localName.length ?? 0)} / 100
                        </Typography>
                    </Box>
                </Grid>

                <Grid 
                    sx={{display: 'flex', flexDirection: 'column'}}
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
                        rows={8}
                        variant="outlined"
                        label={
                            <>
                                Ingrese una descripción para el proyecto <span style={{ color: theme.palette.error.main }}>*</span>
                            </>
                        }
                        value={localDescription}
                        onChange={handleDescriptionChange}
                        onBlur={handleDescriptionBlur}
                        maxLength={300}
                        error={!!errors.description}
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
                            {(localDescription.length ?? 0)} / 300
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
