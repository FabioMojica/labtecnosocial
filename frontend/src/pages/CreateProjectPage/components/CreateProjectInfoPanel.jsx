import { Grid } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useHeaderHeight, useNotification } from "../../../contexts";

import {
    ProjectImageDates, 
    TextField, 
    TextFieldMultiline
} from "../../../generalComponents";

export const CreateProjectInfoPanel = ({ project, panelHeight, onChange }) => {
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [overlayText, setOverlayText] = useState("Subir una imagen");

    useEffect(() => {
        if (previewImage) {
            const hasHover = window.matchMedia("(hover: hover)").matches;
            if (hasHover) {
                setOverlayText("Cambiar imagen (click izquierdo), borrar imagen (click derecho)");
            } else {
                setOverlayText("Toca para cambiar la imagen, borrar imagen (mantener presionado)");
            }
        } else {
            setOverlayText("Subir una imagen");
        }
    }, [previewImage]);

    const { notify } = useNotification();

    useEffect(() => {
        setPreviewImage(project?.image_url ?? null);
    }, [project]);

    const handleOverlayClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            notify("Solo se permiten archivos de imagen (jpg, png)", "warning");
            return;
        }
 
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);

        onChange?.({
            image_file: file,
            image_url: previewUrl, 
        });

        event.target.value = '';
    };

    const handleRemoveImage = () => {
        setPreviewImage(null);
        onChange?.({
            image_url: null,
            image_file: null,
        });
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        handleRemoveImage();
    };


    let longPressTimer;

    const handleTouchStart = () => {
        longPressTimer = setTimeout(() => {
            handleRemoveImage();
        }, 1000);
    };

    const handleTouchEnd = () => {
        clearTimeout(longPressTimer);
    };

    const { headerHeight } = useHeaderHeight();
    return (
        <Grid
            container
            spacing={2}
            sx={{
                width: '100%',
                minHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                height: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                maxHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                p: 1
            }}
        >
            <Grid size={{ xs: 12, md: 5 }} sx={{
                height: {
                    xs: "50%",
                    sm: "100%",
                },
            }}>
                <ProjectImageDates
                    overlay
                    overlayText={overlayText}
                    project={project}
                    sx={{ width: '100%', height: '100%' }}
                    changeImage={true}
                    onChangeImage={handleOverlayClick}
                    previewImage={previewImage ?? undefined}
                    onContextMenu={handleContextMenu}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                />
            </Grid>
            <Grid container spacing={2} size={{ xs: 12, md: 7 }} sx={{ height: 'auto', display: 'flex', alignItems: 'center' }}>
                <Grid size={12}>
                    <TextField 
                        label="Ingrese un nombre para el proyecto (máx. 100 car.)*"
                        value={project?.name}
                        onChange={(e) => onChange?.({ name: e.target.value })}
                        maxLength={100}
                    />
                </Grid>
                <Grid size={12}>
                    <TextFieldMultiline
                        rows={8}
                        label="Ingrese una descripción para el proyecto (máx. 300 car.)*"
                        value={project?.description}
                        onChange={(e) => onChange?.({ description: e.target.value })}
                        maxLength={300}
                    />
                </Grid>
                <Grid
                    container
                    spacing={2}
                    size={{ xs: 12, md: 12 }}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: { xs: 2, md: 5 },
                        py: 2,
                    }}
                >

                </Grid>
            </Grid>

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </Grid >
    );
}