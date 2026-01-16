import { Box, Grid, IconButton, InputAdornment, Tooltip, Typography, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useHeaderHeight, useNotification } from "../../../contexts";
import {
    ProjectImageDates,
    TextField,
    TextFieldMultiline,
} from "../../../generalComponents";
import { cleanExtraSpaces, validateRequiredText, validateTextLength } from "../../../utils/textUtils";
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const ProjectInfoPanel = ({ project, panelHeight, onChange }) => {
    const theme = useTheme();
    const fileInputRef = useRef(null); 
    const [previewImage, setPreviewImage] = useState(null);
    const [overlayText, setOverlayText] = useState("Subir una imagen");
    const [errors, setErrors] = useState({ name: "", description: "" });
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [originalName, setOriginalName] = useState("");
    const [originalDescription, setOriginalDescription] = useState("");
    const { notify } = useNotification();
    const { headerHeight } = useHeaderHeight();

    const startEditName = () => {
        setOriginalName(project?.name ?? "");
        setIsEditingName(true);
    };

    const startEditDescription = () => {
        setOriginalDescription(project?.description ?? "");
        setIsEditingDescription(true);
    };

    const cancelEditName = () => {
        onChange?.({ name: originalName });
        setErrors((prev) => ({ ...prev, name: "" }));
        setIsEditingName(false);
    };

    const cancelEditDescription = () => {
        onChange?.({ description: originalDescription });
        setErrors((prev) => ({ ...prev, description: "" }));
        setIsEditingDescription(false);
    };


    useEffect(() => {
        if (!project) {
            setPreviewImage(null);
            return;
        }


        if (project.image_file instanceof File) {
            setPreviewImage(URL.createObjectURL(project.image_file));
        }
        // Si no hay cambio local, usar la URL del backend
        else if (project.image_url) {
            setPreviewImage(`${API_UPLOADS}${encodeURI(project.image_url)}`);
        } else {
            setPreviewImage(null);
        }
    }, [project]);



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
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);
        onChange?.({ image_file: file, image_url: previewUrl });
        event.target.value = "";
    };

    const handleRemoveImage = () => {
        setPreviewImage(null);
        onChange?.({ image_file: null, image_url: null });
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
            validateRequiredText(value, "Nombre del proyecto") ||
            validateTextLength(value, 3, 100, "Nombre del proyecto");
        setErrors((prev) => ({ ...prev, name: error || "" }));
        onChange?.({ name: value });
    };

    const handleNameBlur = (e) => {
        const cleaned = cleanExtraSpaces(e.target.value);
        onChange?.({ name: cleaned });
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        const error =
            validateRequiredText(value, "Descripción") ||
            validateTextLength(value, 5, 300, "Descripción");
        setErrors((prev) => ({ ...prev, description: error || "" }));
        onChange?.({ description: value });
    };

    const handleDescriptionBlur = (e) => {
        const cleaned = cleanExtraSpaces(e.target.value);
        onChange?.({ description: cleaned });
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
                    previewImage={previewImage ?? undefined}
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
                        onBlur={handleNameBlur}
                        maxLength={100}
                        error={!!errors.name}
                        inputProps={{ maxLength: 100 }}
                        disabled={!isEditingName}
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
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Tooltip title={
                                        isEditingName ? "Borrar cambios" : "Editar nombre"
                                    }>
                                        <span>
                                            <IconButton
                                                size="small"
                                                onClick={isEditingName ? cancelEditName : startEditName}
                                            >
                                                {
                                                    isEditingName ? (
                                                        <CancelIcon fontSize="small" />
                                                    ) : (
                                                        <EditIcon fontSize="small" />
                                                    )
                                                }
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </InputAdornment>
                            ),
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
                            {(project?.name?.length ?? 0)} / 100
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
                        onBlur={handleDescriptionBlur}
                        maxLength={300}
                        error={!!errors.description}
                        variant="outlined"
                        disabled={!isEditingDescription}
                        label={
                            project?.description !== "" ? null :
                                <>
                                    Ingrese una descripción para el proyecto <span style={{ color: theme.palette.error.main }}>*</span>
                                </>
                        }
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
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Tooltip title={
                                        isEditingDescription ? "Borrar cambios" : "Editar descripción"
                                    }>
                                        <span>
                                            <IconButton 
                                                size="small"
                                                onClick={isEditingDescription ? cancelEditDescription : startEditDescription}
                                            >
                                                {
                                                    isEditingDescription ? (
                                                        <CancelIcon fontSize="small" />
                                                    ) : (
                                                        <EditIcon fontSize="small" />
                                                    )
                                                }
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </InputAdornment>
                            ),
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
                            {(project?.description.length ?? 0)} / 300
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
