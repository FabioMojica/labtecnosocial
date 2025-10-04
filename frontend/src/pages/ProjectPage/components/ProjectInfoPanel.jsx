import { Box, Grid } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useHeaderHeight, useNotification } from "../../../contexts";
import { 
    ProjectImageDates, 
    TextFieldViewOrEdit, 
    TextFieldMultilineViewOrEdit 
} from "../../../generalComponents";

import ModeStandbyRoundedIcon from '@mui/icons-material/ModeStandbyRounded';
import LibraryAddCheckRoundedIcon from '@mui/icons-material/LibraryAddCheckRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';

export const ProjectInfoPanel = ({ project, panelHeight, onChange }) => {
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [overlayText, setOverlayText] = useState("Subir una imagen");
    const { notify } = useNotification();

    useEffect(() => {
        setPreviewImage(project?.image_url ?? null);
    }, [project]);

    useEffect(() => {
        if (previewImage) {
            const hasHover = window.matchMedia("(hover: hover)").matches;
            if (hasHover) {
                setOverlayText("Cambiar imagen (click), borrar imagen (click derecho)");
            } else {
                setOverlayText("Cambiar imagen (click), borrar imagen (mantener presionado)");
            }
        } else {
            setOverlayText("Subir una imagen");
        }
    }, [previewImage]);

    const handleOverlayClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            notify("Solo se permiten archivos de imagen (jpg, png)", "info");
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);

        const formData = new FormData();
        formData.append("image", file);

        onChange?.({
            image_url: previewUrl,
            image_file: file, 
        });

        try {
            
        } catch (err) {
            notify("No se pudo actualizar la imagen", "error");
        }
    };


    const handleContextMenu = (e) => {
        e.preventDefault();
        handleRemoveImage();
    };

    const handleRemoveImage = () => {
        setPreviewImage(null);
        onChange?.({
            image_url: null,
            image_file: null,
        });
        notify("Imagen eliminada", "info");
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
                    <TextFieldViewOrEdit
                        label="Nombre del proyecto"
                        value={project?.name ?? ""}
                        onChange={(e) => onChange?.({ name: e.target.value })}
                    />
                </Grid>
                <Grid size={12}>
                    <TextFieldMultilineViewOrEdit
                        label="Descripción del proyecto"
                        value={project?.description ?? ""}
                        onChange={(e) => onChange?.({ description: e.target.value })}
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

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            cursor: "pointer",
                            transition: "transform 0.3s ease",
                            "&:hover": {
                                transform: "scale(1.1)",
                            },
                        }}
                    >
                        <ModeStandbyRoundedIcon
                            sx={{
                                fontSize: { xs: 30, sm: 40, md: 50, lg: 60 },
                                color: "white",
                                transition: "color 0.3s ease",
                                "&:hover": {
                                    color: "yellow",
                                },
                            }}
                        />
                        <Box
                            sx={{
                                fontSize: { xs: 10, md: 12, lg: 14 },
                                mt: 1,
                                color: "white",
                                transition: "color 0.3s ease",
                                "&:hover": {
                                    color: "yellow",
                                },
                            }}
                        >
                            Misión: {project?.description ?? "Texto de la misión"}
                        </Box>
                    </Box>


                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            cursor: "pointer",
                            transition: "transform 0.3s ease",
                            "&:hover": {
                                transform: "scale(1.1)",
                            },
                        }}
                    >
                        <LibraryAddCheckRoundedIcon
                            sx={{
                                fontSize: { xs: 30, sm: 40, md: 50, lg: 60 },
                                color: "white",
                                transition: "color 0.3s ease",
                                "&:hover": {
                                    color: "yellow",
                                },
                            }}
                        />
                        <Box
                            sx={{
                                fontSize: { xs: 10, md: 12, lg: 14 },
                                mt: 1,
                                color: "white",
                                transition: "color 0.3s ease",
                                "&:hover": {
                                    color: "yellow",
                                },
                            }}
                        >
                            Objetivo: {project?.program?.description ?? "Texto del objetivo"}
                        </Box>
                    </Box>


                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            cursor: "pointer",
                            transition: "transform 0.3s ease",
                            "&:hover": {
                                transform: "scale(1.1)",
                            },
                        }}
                    >
                        <BookmarkRoundedIcon
                            sx={{
                                fontSize: { xs: 30, sm: 40, md: 50, lg: 60 },
                                color: "white",
                                transition: "color 0.3s ease",
                                "&:hover": {
                                    color: "yellow",
                                },
                            }}
                        />
                        <Box
                            sx={{
                                fontSize: { xs: 10, md: 12, lg: 14 },
                                mt: 1,
                                color: "white",
                                transition: "color 0.3s ease",
                                "&:hover": {
                                    color: "yellow",
                                },
                            }}
                        >
                            Programa: {project?.program?.description ?? "Texto del programa"}
                        </Box>
                    </Box>
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