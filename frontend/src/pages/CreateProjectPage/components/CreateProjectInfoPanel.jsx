import { Grid, Typography } from "@mui/material";
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

export const CreateProjectInfoPanel = ({ project, panelHeight, onChange }) => {
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [overlayText, setOverlayText] = useState("Subir una imagen");
    const [errors, setErrors] = useState({ name: "", description: "" });

    const { notify } = useNotification();
    const { headerHeight } = useHeaderHeight();

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

    // --- Validación de texto ---
    const handleNameChange = (e) => {
        const raw = e.target.value;
        const cleaned = cleanExtraSpaces(raw);
        const error =
            validateRequiredText(cleaned, "Nombre del proyecto") ||
            validateTextLength(cleaned, 3, 100, "Nombre del proyecto");

        setErrors((prev) => ({ ...prev, name: error || "" }));
        onChange?.({ name: cleaned });
    };

    const handleDescriptionChange = (e) => {
        const raw = e.target.value;
        const cleaned = cleanExtraSpaces(raw);
        const error =
            validateRequiredText(cleaned, "Descripción") ||
            validateTextLength(cleaned, 5, 300, "Descripción");

        setErrors((prev) => ({ ...prev, description: error || "" }));
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
                size={{ xs: 12, md: 5 }}
                sx={{
                    height: { xs: "50%", sm: "100%" },
                }}
            >
                <ProjectImageDates
                    overlay
                    overlayText={overlayText}
                    project={project}
                    sx={{ width: "100%", height: "100%" }}
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
                spacing={2}
                size={{ xs: 12, md: 7 }}
                sx={{ height: "auto", display: 'flex', flexDirection: 'column', pb: {
                    xs: 20,
                    sm: 0,
                }}}
            >
                <Grid size={12}>
                    <TextField
                        label="Ingrese un nombre para el proyecto (máx. 100 car.)*"
                        value={project?.name}
                        onChange={(e) => onChange?.({ name: e.target.value })}
                        onBlur={(e) => {
                            const cleaned = cleanExtraSpaces(e.target.value);
                            const error =
                                validateRequiredText(cleaned, "Nombre del proyecto") ||
                                validateTextLength(cleaned, 3, 100, "Nombre del proyecto");
                            setErrors((prev) => ({ ...prev, name: error || "" }));
                            onChange?.({ name: cleaned });
                        }}
                        maxLength={100}
                        error={!!errors.name}
                    />

                    {errors.name && (
                        <Typography color="error" variant="caption">
                            {errors.name}
                        </Typography>
                    )}
                </Grid>

                <Grid size={12}>
                    <TextFieldMultiline
                        rows={8}
                        label="Ingrese una descripción para el proyecto (máx. 300 car.)*"
                        value={project?.description}
                        onChange={(e) => onChange?.({ description: e.target.value })}
                        onBlur={(e) => {
                            const cleaned = cleanExtraSpaces(e.target.value);
                            const error =
                                validateRequiredText(cleaned, "Descripción") ||
                                validateTextLength(cleaned, 5, 300, "Descripción");
                            setErrors((prev) => ({ ...prev, description: error || "" }));
                            onChange?.({ description: cleaned });
                        }}
                        maxLength={300}
                        error={!!errors.description}
                    />

                    {errors.description && (
                        <Typography color="error" variant="caption">
                            {errors.description}
                        </Typography>
                    )}
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
