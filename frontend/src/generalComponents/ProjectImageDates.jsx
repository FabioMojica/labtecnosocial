import { Box, Divider, Paper, Typography } from "@mui/material";
import { ProjectProfileImage } from "./ProjectProfileImage";
import { useHeaderHeight } from "../contexts";

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const ProjectImageDates = ({
    project,
    sx,
    overlay = false,
    overlayText = "Ir al proyecto",
    changeImage = false,
    onChangeImage,
    previewImage,
    ...rest
}) => {
    if (!project) return;
    const { headerHeight } = useHeaderHeight();

    const imageSrc = project.image_url
        ? `${API_UPLOADS}${encodeURI(project.image_url)}`
        : undefined;

        console.log("preview llegando aqui", previewImage)

    return (
        <Box
            {...rest}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: "100%",
                height: "100%",
                maxHeight: `calc(100vh - ${headerHeight}px)`,
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
                cursor: "pointer",
                "&:hover .overlay": {
                    opacity: 1,
                },
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
                    src={( previewImage || imageSrc ) ?? undefined}
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
                            fontSize: "1.2rem",
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
                            textAlign: 'center',
                            flex: 1,
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'scale(1.05)',
                            },
                        }}
                    >
                        <Typography variant="subtitle2" color="textSecondary">Creado</Typography>
                        <Typography variant="body2">
                            {new Date(project.created_at ?? Date.now()).toLocaleDateString()}
                        </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem color="primary" />

                    <Box
                        sx={{
                            textAlign: 'center',
                            flex: 1,
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                            },
                        }}
                    >
                        <Typography variant="subtitle2" color="textSecondary">Actualizado</Typography>

                        <Typography variant="body2">
                            {new Date(project.updated_at ?? Date.now()).toLocaleDateString()}
                        </Typography>
                    </Box>
                </Paper>
            )}
        </Box>
    );
}