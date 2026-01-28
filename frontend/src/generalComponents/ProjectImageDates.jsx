import { Box, Divider, Paper, Typography, useTheme } from "@mui/material";
import { ProjectProfileImage } from "./ProjectProfileImage";
import { useHeaderHeight } from "../contexts";
import React, { memo, useEffect, useState } from "react";
import { formatDateParts } from "../utils/formatDate";

export const ProjectImageDates = ({
    project,
    sx,
    overlay = false,
    overlayText = "Ir al proyecto",
    changeImage = false,
    fallbackLetter,
    onChangeImage,
    previewImage,
    ...rest
}) => {
    if (!project) return;
    const { headerHeight } = useHeaderHeight();
    const [previewSrc, setPreviewSrc] = useState();
    const theme = useTheme();

    useEffect(() => {
        if (!project?.image_url) {
            setPreviewSrc(null);
            return;
        }

        if (project.image_url instanceof File || project.image_url instanceof Blob) {
            const url = URL.createObjectURL(project.image_url);
            setPreviewSrc(url);
            return () => URL.revokeObjectURL(url);
        }

        if (typeof project.image_url === "string") {
            setPreviewSrc(project.image_url);
        }
    }, [project?.image_url]);


    return (
        <Box
            {...rest}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: "100%",
                height: "100%",
                maxHeight: `calc(100vh - ${headerHeight}px)`,
                cursor: "pointer",
                "&:hover .overlay": {
                    opacity: 1,
                },
                borderRadius: 2,
                border: `1px solid ${theme.palette.mode === "light" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)"}`,
                ...sx
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderTopLeftRadius: project && 'created_at' in project && 'updated_at' in project ? 8 : 8,
                    borderTopRightRadius: project && 'created_at' in project && 'updated_at' in project ? 8 : 8,
                    borderBottomLeftRadius: project && 'created_at' in project && 'updated_at' in project ? 0 : 8,
                    borderBottomRightRadius: project && 'created_at' in project && 'updated_at' in project ? 0 : 8,
                    overflow: 'hidden',
                    cursor: overlay ? 'pointer' : 'default',
                    ...sx
                }}
            >
                <ProjectProfileImage
                    project={project}
                    fallbackLetter={fallbackLetter}
                    src={previewSrc}
                    sx={{
                        width: '100%',
                        objectFit: 'cover',
                        maxHeight: '100%'
                    }}
                />

                {overlay && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            opacity: 0,
                            transition: 'opacity 0.3s',
                            '&:hover': {
                                opacity: 1,
                            },
                        }}
                        onClick={changeImage ? onChangeImage : undefined}
                    >
                        <Typography align="center" sx={{
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                        }}>{overlayText}</Typography>
                    </Box>
                )}
            </Box>

            {project && 'created_at' in project && 'updated_at' in project && (
                <Paper
                    elevation={3}
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        borderBottomLeftRadius: 8,
                        borderBottomRightRadius: 8,
                        borderTopRightRadius: 0,
                        borderTopLeftRadius: 0,
                        p: 1.5,
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            textAlign: "center",
                            flex: 1,
                        }}
                    >
                        <Typography variant="subtitle2" color="textSecondary">
                            Creado
                        </Typography>
                        <Typography variant="body2">
                            {formatDateParts(project?.created_at).date}
                        </Typography>
                        <Typography variant="body2">
                            {formatDateParts(project?.created_at).time}
                        </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem color="primary" />

                    <Box
                        sx={{
                            textAlign: "center",
                            flex: 1,
                            cursor: 'default'
                        }}
                    >
                        <Typography variant="subtitle2" color="textSecondary">
                            Actualizado
                        </Typography>
                        <Typography variant="body2">
                            {formatDateParts(project?.updated_at).date}
                        </Typography>
                        <Typography variant="body2">
                            {formatDateParts(project?.updated_at).time}
                        </Typography>
                    </Box>
                </Paper>
            )}
        </Box>
    );
}