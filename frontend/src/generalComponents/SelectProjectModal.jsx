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
import { NoResultsScreen } from ".";
import { useNavigate } from "react-router-dom";


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
  const navigate = useNavigate();

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
          width: {
            xs: '100px',
            sm: '200px'
          },
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
          <Typography textAlign={'center'} sx={{ fontSize: '1rem' }}>Seleccionar Proyecto</Typography>
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
          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={30} />
            </Box>
          ) : projects.length === 0 ? (
            // 🟡 Caso 1: No hay proyectos en el sistema
            <NoResultsScreen
              message="No tienes ningún proyecto registrado en el sistema"
              buttonText="Registrar un proyecto"
              onButtonClick={() => navigate('/proyectos/crear')}
              sx={{
                height: 'auto',
                width: '100%',
              }}
            />
          ) : (
            // ✅ Siempre mostrar el buscador
            <>
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
                inputProps={{ maxLength: 100 }}
              />

              {filteredProjects.length === 0 ? (

                <Box
                  textAlign="center"
                  py={4}
                  sx={{
                    maxWidth: "100%",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    px: 2,
                  }}
                >
                  <Typography variant="body1" color="textSecondary" sx={{

                    color: 'gray',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                  }}>

                    No se encontraron resultados para “{searchTerm}”
                  </Typography>
                </Box>
              ) : (
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
                          src={
                            project.image_url
                              ? `${API_UPLOADS}${project.image_url}`
                              : undefined
                          }
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: 2,
                            objectFit: "cover",
                            fontWeight: "bold",
                            boxShadow:
                              theme.palette.mode === "light"
                                ? "0 0 0 1px rgba(0,0,0,0.3)"
                                : "0 0 0 1px rgba(255,255,255,0.3)",
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
                              project.id === selectedProjectId
                                ? "bold"
                                : "normal",
                          },
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </>
          )}
        </Box>
      </Modal>

    </>
  );
};
