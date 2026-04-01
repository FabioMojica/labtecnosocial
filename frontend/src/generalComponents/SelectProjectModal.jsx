import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  Typography,
  CircularProgress,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  useTheme,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import { NoResultsScreen, SearchBar } from ".";
import { useNavigate } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useAuth } from "../contexts";
import { roleConfig } from "../utils";


export const SelectProjectModal = ({
  sx,
  projects = [],
  selectedProject,
  onChange,
  loading = false,
  disabled = false,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setFilteredProjects(projects);
  }, [projects]);


  const handleSelect = (project) => {
    onChange(project);
    setOpen(false);
  };

  return (
    <>

      <Button
        variant="outlined"
        onClick={() => setOpen(true)}
        disabled={disabled}
        endIcon={<KeyboardArrowDownRoundedIcon />}
        sx={{
          textTransform: "none",
          minWidth: { xs: "100%", sm: 260 },
          maxWidth: { xs: "100%", sm: 340 },
          borderRadius: 2,
          borderColor: "divider",
          backgroundColor: "background.paper",
          justifyContent: "space-between",
          alignItems: "center",
          px: 1.2,
          py: 0.9,
          gap: 1.2,
          overflow: "hidden",
          "& .MuiButton-endIcon": {
            ml: 0.5,
            color: "text.secondary",
          },
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "action.hover",
          },
          ...sx
        }}
      >
        {loading ? (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Cargando proyectos...
          </Typography>
        ) : selectedProject ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%", overflow: "hidden", pr: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", letterSpacing: 0.3, fontWeight: 600 }}
            >
              Proyecto activo
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
              <Avatar
                src={selectedProject.image_url || null}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  objectFit: "cover",
                  fontWeight: "bold",
                  boxShadow:
                    theme.palette.mode === "light"
                      ? "0 0 0 1px rgba(0,0,0,0.3)"
                      : "0 0 0 1px rgba(255,255,255,0.3)",
                }}
              >
                {selectedProject.name[0].toUpperCase()}
              </Avatar>

              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: "0.98rem",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  flex: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textAlign: "left",
                }}
              >
                {selectedProject.name}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%", overflow: "hidden", pr: 0.5 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: 0.3, fontWeight: 600 }}>
              Proyecto activo
            </Typography>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, textAlign: "left" }}>
              Seleccionar proyecto
            </Typography>
          </Box>
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
            display: 'flex',
            flexDirection: 'column',
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
          ) : projects.length === 0 ? user?.role === roleConfig.superAdmin.value ? (
            <NoResultsScreen
              message='Aún no tienes proyectos registrados'
              buttonText="Crear uno"
              onButtonClick={() => navigate("/proyectos/crear")}
              buttonSx={{
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                "&.Mui-disabled": {
                  backgroundColor: "action.disabledBackground",
                  color: "action.disabled", 
                },
              }} />
          ) : (
            <NoResultsScreen
              message='Aún no tienes proyectos asignados para acceder a su plan operativo'
              buttonText="Ir al inicio"
              onButtonClick={() => navigate("/inicio")}
              buttonSx={{
                backgroundColor: "primary.main", 
                color: "primary.contrastText",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                "&.Mui-disabled": {
                  backgroundColor: "action.disabledBackground",
                  color: "action.disabled",
                },
              }} />
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  mb: 1.2,
                  pr: 5,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    textAlign: "left",
                    fontWeight: "bold",
                    fontSize: {
                      xs: "1rem",
                      sm: "1.4rem",
                    },
                  }}
                >
                  Selecciona un proyecto
                </Typography>
                <Chip
                  size="small"
                  label={`${filteredProjects.length} / ${projects.length} proyectos`}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

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

              <Divider sx={{ mb: 1 }} />

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
                    flex: 1,
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
                      selected={project.id === selectedProject?.id}
                      onClick={() => handleSelect(project)}
                      sx={{
                        border: '1px solid',
                        borderColor: project.id === selectedProject?.id ? "primary.main" : "divider",
                        borderRadius: 2,
                        mb: 1,
                        gap: 1,
                        "&.Mui-selected": {
                          backgroundColor: "action.selected",
                        },
                        "&.Mui-selected:hover": {
                          backgroundColor: "action.selected",
                        },
                        "&:hover": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={
                            project.image_url
                              ? project?.image_url
                              : null
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
                              project.id === selectedProject?.id
                                ? "bold"
                                : "normal",
                          },
                        }}
                      />
                      {project.id === selectedProject?.id && (
                        <CheckCircleRoundedIcon color="primary" fontSize="small" />
                      )}
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
