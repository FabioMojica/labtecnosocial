import { useState, useMemo } from "react";
import {
    Box,
    Button,
    Modal,
    Typography,
    TextField,
    CircularProgress,
    List,
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
    useTheme,
} from "@mui/material";


const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const SelectProjectModal = ({
    projects = [],
    selectedProjectId,
    onChange,
    loading = false,
    disabled = false,
}) => {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filtrado de proyectos según el término de búsqueda
    const filteredProjects = useMemo(() => {
        if (!searchTerm) return projects;
        return projects.filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [projects, searchTerm]);

    const handleSelect = (project) => {
        onChange(project.id);
        setOpen(false);
    };

    const selectedProject = projects.find((p) => p.id === selectedProjectId);

    return (
        <>
            <Button
                variant="outlined"
                onClick={() => setOpen(true)}
                disabled={disabled}
                sx={{
                    width: '200px',
                    height: '60px',
                    fontSize: "1rem",
                    textTransform: "none",
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    overflow: 'hidden'
                }}
            >
                {loading ? (
                    "Cargando..."
                ) : selectedProject ? (
                    <>
                        <Avatar
                            src={selectedProject.image_url ? `${API_UPLOADS}${selectedProject.image_url}` : undefined}
                            sx={{
                                width: 46,
                                height: 46,
                                borderRadius: 2,
                                objectFit: "cover",
                                fontWeight: "bold",
                                boxShadow:
                                    theme.palette.mode === 'light'
                                        ? '0 0 0 1px rgba(0,0,0,0.3)'
                                        : '0 0 0 1px rgba(255,255,255,0.3)',
                            }}
                        >
                            {selectedProject.name[0].toUpperCase()}
                        </Avatar>

                        <Typography
                            variant="subtitle1"
                            sx={{
                                flex: 1,
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                WebkitLineClamp: 2,
                            }}
                            textAlign={'start'}
                        >
                            {selectedProject.name}
                        </Typography>
                    </>
                ) : (
                    <Typography textAlign={'center'}>Seleccionar Proyecto</Typography>
                )}
            </Button>


            <Modal open={open} onClose={() => setOpen(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: { xs: "95%", sm: 400 },
                        maxHeight: "80vh",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        borderRadius: 2,
                        p: 3,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}
                    >
                        Selecciona un proyecto
                    </Typography>

                    <TextField
                        fullWidth
                        placeholder="Buscar proyecto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    {loading ? (
                        <Box display="flex" justifyContent="center" py={3}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : filteredProjects.length > 0 ? (
                        <List
                            sx={{
                                maxHeight: "50vh",
                                overflowY: "auto",
                                "&::-webkit-scrollbar": { width: "2px" },
                                "&::-webkit-scrollbar-track": {
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: "2px",
                                },
                                "&::-webkit-scrollbar-thumb": {
                                    backgroundColor: theme.palette.primary.main,
                                    borderRadius: "2px",
                                },
                                "&::-webkit-scrollbar-thumb:hover": {
                                    backgroundColor: theme.palette.primary.dark,
                                },
                            }}
                        >
                            {filteredProjects.map((project) => (
                                <ListItemButton
                                    key={project.id}
                                    selected={project.id === selectedProjectId}
                                    onClick={() => handleSelect(project)}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={project.image_url ? `${API_UPLOADS}${project.image_url}` : undefined}
                                            sx={{
                                                width: 46,
                                                height: 46,
                                                borderRadius: 2,
                                                objectFit: "cover",
                                                fontWeight: "bold",
                                                boxShadow:
                                                    theme.palette.mode === 'light'
                                                        ? '0 0 0 1px rgba(0,0,0,0.3)'
                                                        : '0 0 0 1px rgba(255,255,255,0.3)',
                                            }}
                                        >
                                            {project.name[0].toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={project.name}
                                        primaryTypographyProps={{
                                            noWrap: true,
                                            sx: {
                                                fontWeight:
                                                    project.id === selectedProjectId ? "bold" : "normal",
                                            },
                                        }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    ) : (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{ mt: 2 }}
                        >
                            No se encontraron proyectos
                        </Typography>
                    )}
                </Box>
            </Modal>
        </>
    );
};
