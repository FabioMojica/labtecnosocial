import { useState, useMemo, useEffect } from "react";
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
  IconButton,
  Divider,
} from "@mui/material";
import { NoResultsScreen, SearchBar } from ".";
import { useNavigate } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';


const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const SelectProjectModal = ({
  sx,
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

  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    console.log("hla")
    setFilteredProjects(projects);
  }, [projects]);


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
          fontSize: "1rem",
          textTransform: "none",
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          overflow: 'hidden',
          width: 150,
          ...sx
        }}
      >
        {loading ? (
          "Cargando..."
        ) : selectedProject ? (
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1 }}>
            <Avatar
              src={selectedProject.image_url ? `${API_UPLOADS}${selectedProject.image_url}` : undefined}
              sx={{
                width: 36,
                height: 36,
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
                WebkitLineClamp: 1,
              }}
              textAlign={'start'}
            >
              {selectedProject.name}
            </Typography>
          </Box>
        ) : (
          <Typography textAlign={'center'} sx={{ fontSize: '1rem' }}>Seleccionar Proyecto</Typography>
        )}
      </Button>


      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: 400 },
            height: '80vh',
            maxHeight: "80vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            px: 3,
            pt: 2,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: theme.palette.text.primary,
            }}
          >
            <CloseIcon />
          </IconButton>
          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={30} />
            </Box>
          ) : projects.length === 0 ? (
            <NoResultsScreen
              message="No tienes ningún proyecto registrado en el sistema"
              buttonText="Registrar un proyecto"
              onButtonClick={() => navigate('/proyectos/crear')}
              sx={{
                height: '100%',
                width: '100%',
              }}
            />
          ) : (
            <>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: {
                    xs: '1rem',
                    sm: '1.4rem'
                  }
                }}
              >
                Selecciona un proyecto
              </Typography>

              <SearchBar
                data={projects}
                fields={["name"]}
                placeholder="Buscar proyectos..."
                onResults={(results, query) => {
                  setFilteredProjects(results);
                  setSearchQuery(query);
                }}
                sx={{ height: 'auto', mb: 1 }}
              />
              
              <Divider sx={{mb: 1}}/>

              {filteredProjects.length === 0 ? (
                <Box
                  textAlign="center"
                  py={4}
                  sx={{
                    maxWidth: "100%",
                    height: '70%',
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    px: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body1" color="textSecondary" sx={{
                    color: 'gray',
                    fontStyle: 'italic',
                    textAlign: 'center', 
                    fontSize: '0.9rem',
                  }}>
                    No se encontraron resultados para “{searchQuery}”
                  </Typography>
                </Box>
              ) : (
                <List
                  sx={{
                    maxHeight: "80%",
                    minHeight: "auto",
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
                    px: 1,
                  }}
                  
                >
                  {filteredProjects.map((project) => (
                    <ListItemButton
                      key={project.id}
                      selected={project.id === selectedProjectId}
                      onClick={() => handleSelect(project)}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 1
                      }}
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
