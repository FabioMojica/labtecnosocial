import {
  Grid,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  useTheme,
  Button,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { useEffect, useRef, useState } from "react";
import { useHeaderHeight, useNotification } from "../../../contexts";
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import KeyIcon from '@mui/icons-material/Key';

import {
  QuestionModal,
  SelectComponent,
  TextField,
  UserImageDates,
  ButtonWithLoader,
} from "../../../generalComponents";
import {
  cleanExtraSpaces,
  validateRequiredText,
  validateTextLength,
  validateOnlyLetters,
} from "../../../utils/textUtils";
import { generateSecurePassword, roleConfig, stateConfig } from "../../../utils";
import { validateEmail, validatePassword } from "../../../utils";
import { useNavigate } from "react-router-dom";

// 1. Librerías externas
import ModeStandbyRoundedIcon from '@mui/icons-material/ModeStandbyRounded';
import LibraryAddCheckRoundedIcon from '@mui/icons-material/LibraryAddCheckRounded';

// 2. Hooks personalizados
import { useFetchAndLoad } from "../../../hooks";

// 3. Utilidades / helpers 
import { isUserEqual } from "../utils/isUserEqual";
import { createUserFormData } from "../utils/createUserFormData";


// 5. Servicios / UseCases
import { createUserApi } from "../../../api";
import { useLayout } from "../../../contexts/LayoutContext";
import { downloadUserCredentials } from "../utils/downloadUserCredentials";

export const CreateUserInfoPanel = ({ panelHeight }) => {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [overlayText, setOverlayText] = useState("Subir una imagen");
  const [showPassword, setShowPassword] = useState(false);
  const { notify } = useNotification();
  const { headerHeight } = useHeaderHeight();
  const theme = useTheme();
  const initialUser = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    image_file: null,
    image_url: null,
    role: 'coordinator', 
    state: 'habilitado',
  };
  const [user, setUser] = useState({ ...initialUser });
  const [isDirty, setIsDirty] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const { loading, callEndpoint } = useFetchAndLoad();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const { right } = useLayout();

  const handleCreateUser = async () => {
    if (!user) {
      notify("Completa los datos del usuario antes de guardar", "info");
      return;
    }
    try {
      const userToSend = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        image_file: user.image_file ?? null,
        role: user.role,
        state: user.state,
      };

      const formData = createUserFormData(userToSend);
      const newUser = await callEndpoint(createUserApi(formData));
      console.log(newUser);
      notify("Usuario creado correctamente", "success");
      navigate(`/usuario/${encodeURIComponent(newUser?.email)}`)

      downloadUserCredentials({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: user.password,
      });

    } catch (error) {
      if (error?.response?.status === 413) {
        notify(error.response.data.message || "La imagen supera el tamaño máximo permitido (2MB)", "error");
        return;
      }

      if (
        error?.message ===
        "El correo que ingresaste ya pertenece a otro usuario. Prueba con uno diferente."
      ) {
        notify(error.message, "info");
        return;
      }
      notify(
        error?.response?.data?.message ||
        error?.message ||
        "Ocurrió un error inesperado al crear el usuario. Inténtalo de nuevo más tarde.",
        "error"
      );
    }
  };

  const handleUserChange = (changes) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...changes };
      setIsDirty(!isUserEqual(updated, initialUser));
      return updated;
    });
  };

  const handleCancelChanges = () => {
    setQuestionModalOpen(true);
  }

  const handleConfirmCancelModal = () => {
    setUser({ ...initialUser });
    setIsDirty(false);
    setQuestionModalOpen(false);
    notify("Cambios descartados correctamente.", "info");
    setErrors({});
  };

  const isFormValid = () => {
    return (
      user.firstName?.trim() &&
      user.lastName?.trim() &&
      user.email?.trim() &&
      user.password?.trim() &&
      user.role?.trim() &&
      user.state?.trim() &&
      !user.firstNameError &&
      !user.lastNameError &&
      !user.emailError &&
      !user.passwordError
    );
  };

  useEffect(() => {
    setOverlayText( 
      previewImage
        ? window.matchMedia("(hover: hover)").matches
          ? "Cambiar imagen (click izquierdo), borrar imagen (click derecho)"
          : "Toca para cambiar la imagen, borrar imagen (mantener presionado)"
        : "Subir una imagen"
    );
  }, [previewImage]);

  useEffect(() => {
    setPreviewImage(user?.image_url ?? null);
  }, [user]);

  const handleOverlayClick = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Solo se permiten archivos de imagen (jpg, png).", "warning");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    handleUserChange?.({ image_file: file, image_url: previewUrl });
    event.target.value = "";
  };

  const handleRemoveImage = () => {
    if (!previewImage) return;
    setPreviewImage(null);
    handleUserChange?.({ image_url: null, image_file: null });
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


  const roleOptions = Object.entries(roleConfig).map(([key, value]) => ({
    value: key,
    label: value.role,
    icon: value.icon,
  }));

  const stateOptions = Object.entries(stateConfig).map(([key, value]) => ({
    value: key,
    label: value.label,
    icon: value.icon,
    color: value.color,
  }));

  const validateField = (field, value) => {
    const cleaned = value;
    let error = null;

    switch (field) {
      case "firstName":
        error =
          validateRequiredText(cleaned, "Nombre del usuario") ||
          validateTextLength(cleaned, 3, 100, "Nombre del usuario") ||
          validateOnlyLetters(cleaned, "Nombre del usuario");
        break;
      case "lastName":
        error =
          validateRequiredText(cleaned, "Apellido del usuario") ||
          validateTextLength(cleaned, 3, 100, "Apellido del usuario") ||
          validateOnlyLetters(cleaned, "Apellido del usuario");
        break;
      case "email":
        error = validateEmail(cleaned);
        break;
      case "password":
        error = validatePassword(cleaned);
        break;
      default:
        break;
    }

    setErrors((prev) => {
      const newErrors = { ...prev, [field]: error || "" };
      handleUserChange?.({ [`${field}Error`]: newErrors[field] });
      return newErrors;
    });

    handleUserChange?.({ [field]: cleaned });
  };
  const isPasswordValid = !validatePassword(user?.password ?? "");

  return (
    <>
      <Grid
        container
        spacing={2}
        sx={{  
          width: "100%",
          height: {
            xs: 'auto',
            sm: `calc(100vh - ${headerHeight}px - ${panelHeight}px - 24px)`
          },
          maxHeight: {
            xs: 'auto',
            sm: `calc(100vh - ${headerHeight}px - ${panelHeight}px - 24px)`
          },
          minHeight: {
            xs: 'auto',
            sm: `calc(100vh - ${headerHeight}px - ${panelHeight}px - 24px)`
          },
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
          }}>
          <UserImageDates 
            overlay 
            overlayText={overlayText}
            user={user}
            sx={{ 
              width: {
                xs: 250,
                sm: 300,
                lg: '100%'
              },
              height: "100%",
              maxHeight: 500,
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 0 0 1px rgba(0,0,0,0.3)"
                  : "0 0 0 1px rgba(255,255,255,0.3)",
              borderRadius: 2,
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
          <Grid container spacing={1}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center', 
              width: '100%',
              gap: 1,
              flexDirection: {
                xs: 'column',
                sm: 'row'
              },
              height: {
                xs: 'auto',
                sm: 80
              },
            }}>
              <Box sx={{
                display: 'flex',
                width: {
                  xs: '100%',
                  sm: 'auto',
                  lg: 'auto'
                },
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 1,
              }}>
                <BadgeIcon sx={{
                  mb: {
                    xs: 0,
                    sm: 3
                  },
                }} />
                <Typography
                  sx={{
                    display: {
                      xs: 'block',
                      sm: 'none'
                    },
                    fontWeight: 'bold'
                  }}
                  variant="h5"
                >
                  Datos personales
                </Typography>
              </Box>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  id="first-name"
                  label={
                    <>
                      Nombre <span style={{ color: theme.palette.error.main }}>*</span>
                    </>
                  }
                  disabled={loading}
                  variant="outlined"
                  value={user?.firstName ?? ""}
                  error={!!errors.firstName}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleUserChange?.({ firstName: value });
                    validateField("firstName", value);
                  }}
                  onBlur={(e) => {
                    const cleaned = cleanExtraSpaces(e.target.value);
                    handleUserChange?.({ firstName: cleaned });
                    validateField("firstName", cleaned);
                  }}
                  inputProps={{ maxLength: 100 }}
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
                    }
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
                      visibility: errors.firstName ? "visible" : "hidden",
                      fontSize: {
                        xs: '0.6rem',
                        sm: '0.65rem'
                      }
                    }}
                  >
                    {errors.firstName || "placeholder"}
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
                    {(user?.firstName?.length ?? 0)} / 100
                  </Typography>
                </Box>
              </Grid>


              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  id="last-name"
                  label={
                    <>
                      Apellidos <span style={{ color: theme.palette.error.main }}>*</span>
                    </>
                  }
                  disabled={loading}
                  variant="outlined"
                  value={user?.lastName ?? ""}
                  error={!!errors.lastName}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleUserChange?.({ lastName: value });
                    validateField("lastName", value);
                  }}
                  onBlur={(e) => {
                    const cleaned = cleanExtraSpaces(e.target.value);
                    handleUserChange?.({ lastName: cleaned });
                    validateField("lastName", cleaned);
                  }}
                  inputProps={{ maxLength: 100 }}
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
                    },
                    width: '100%'
                  }}
                />

                {/* Error + contador */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 0.5,
                    px: 0.5,
                    height: 20,
                  }}
                >
                  {/* Error a la izquierda */}
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{
                      visibility: errors.lastName ? "visible" : "hidden",
                      fontSize: {
                        xs: '0.6rem',
                        sm: '0.65rem',
                      }
                    }}
                  >
                    {errors.lastName || "placeholder"}
                  </Typography>

                  {/* Contador a la derecha */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: {
                        xs: '0.6rem',
                      }
                    }}
                  >
                    {(user?.lastName?.length ?? 0)} / 100
                  </Typography>
                </Box>
              </Grid>
            </Box>
          </Grid>

          {/* Email */}
          <Grid size={12} sx={{
            width: '100%',
            mt: {
              xs: 2,
              sm: 2,
              lg: 1
            }
          }}>
            <Box sx={{
              display: 'flex',
              width: '100%',
              height: '100%',
              flex: 1,
              flexDirection: 'column',
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
                <EmailIcon sx={{

                }} />
                <Box sx={{
                  width: '100%',
                }}>
                  <TextField
                    id="new-email"
                    disabled={loading}
                    size='small'
                    value={user?.email ?? ""}
                    label={
                    <>
                      Correo electrónico <span style={{ color: theme.palette.error.main }}>*</span>
                    </>
                  }
                    variant="outlined"
                    error={!!errors.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleUserChange?.({ email: value });
                      validateField("email", value);
                    }}
                    onBlur={(e) => {
                      console.log("anyes on blute", e.target.value)
                      const cleaned = cleanExtraSpaces(e.target.value);
                      console.log("cleaness", cleaned, "xs")
                      handleUserChange?.({ email: cleaned });
                      validateField("email", cleaned);
                    }}

                    inputProps={{ maxLength: 100 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            onClick={() => {
                              if (user?.email) {
                                navigator.clipboard.writeText(user.email);
                                notify("Correo copiado al portapapeles.", "info");
                              }
                            }}
                            disabled={!!errors.email || !user?.email || loading}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        minHeight: {
                          xs: 50,
                          sm: 60
                        },
                        maxHeight: {
                          xs: 50,
                          sm: 60
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        padding: '8px 12px',
                        fontSize: '0.95rem',
                        lineHeight: '1.2',
                      },
                      width: '100%'
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 0.5,
                      px: 0.5,
                      minHeight: 20,
                    }}
                  >
                    {/* Error a la izquierda */}
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{
                        visibility: errors.email ? "visible" : "hidden",
                        fontSize: {
                          xs: '0.6rem',
                          sm: '0.65rem'
                        }
                      }}
                    >
                      {errors.email || "placeholder"}
                    </Typography>

                    {/* Contador a la derecha */}
                    <Typography variant="caption" color="text.secondary"
                      sx={{
                        fontSize: {
                          xs: '0.6rem',
                        }
                      }}
                    >
                      {user?.email?.length ?? 0} / 100
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
            }}>
              <KeyIcon sx={{
                mb: 3
              }} />

              <Box sx={{
                width: '100%',
              }}>
                <TextField
                  id="new-password"
                  disabled={loading}
                  label={
                    <>
                      Contraseña <span style={{ color: theme.palette.error.main }}>*</span>
                    </>
                  }
                  variant="outlined"
                  size='small'
                  type={showPassword ? "text" : "password"}
                  value={user?.password ?? ""}
                  error={!!errors.password}
                  onChange={(e) => {
                    handleUserChange?.({ password: e.target.value });
                    validateField("password", e.target.value);
                  }}
                  onBlur={(e) => validateField("password", e.target.value)}
                  inputProps={{ maxLength: 8 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showPassword ? (
                            <VisibilityOffIcon fontSize="small" />
                          ) : (
                            <VisibilityIcon fontSize="small" />
                          )}
                        </IconButton>

                        <IconButton
                          edge="end"
                          disabled={loading}
                          onClick={() => {
                            const password = generateSecurePassword();
                            handleUserChange?.({ password });
                            validateField("password", password);
                            notify("Contraseña segura generada correctamente.", "info");
                          }}
                          title="Generar contraseña segura"
                          sx={{
                            ml: 1
                          }}
                        >
                          <AutorenewIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          edge="end"
                          disabled={!isPasswordValid || loading}
                          onClick={() => {
                            if (user?.password) {
                              navigator.clipboard.writeText(user.password);
                              notify("Contraseña copiada al portapapeles.", "info");
                            } else {
                              notify("No hay contraseña para copiar", "warning");
                            }
                          }}
                          title="Copiar contraseña"
                          sx={{
                            ml: 1
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '8px 12px',
                      fontSize: '0.95rem',
                      lineHeight: '1.2',
                    },
                    width: '100%'
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 0.5,
                    px: 0.5,
                    minHeight: 20,
                  }}
                >
                  {/* Error a la izquierda */}
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{
                      visibility: errors.password ? "visible" : "hidden",
                      fontSize: {
                        xs: '0.6rem',
                        sm: '0.65rem',
                      }
                    }}
                  >
                    {errors.password || "placeholder"}
                  </Typography>


                  <Typography
                    variant="caption"
                    color={isPasswordValid ? "success.main" : "warning.main"}
                    sx={{
                      fontSize: {
                        xs: '0.6rem'
                      }
                    }}
                  >
                    {(user?.password?.length ?? 0)} / 8
                  </Typography>

                </Box>
              </Box>
            </Box>
          </Grid>


          {/* Role y Estado */}
          <Grid size={12}>
            <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <SelectComponent
                label="Rol"
                disabled={loading}
                options={roleOptions}
                value={user?.role}
                onChange={(newRole) => handleUserChange?.({ role: newRole })}
                fullWidth
              />
              <SelectComponent
                label="Estado"
                disabled={loading}
                options={stateOptions}
                value={user?.state}
                onChange={(newState) => handleUserChange?.({ state: newState })}
                fullWidth
              />
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
        <Box sx={{ 
          mt: {
            xs: 5,
            sm: 5,
            lg: 0
          },
          position: {
            lg: 'fixed',
          },
          bottom: 20,
          right: right + 20,
          display: 'flex',
          gap: 1,
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelChanges}
            disabled={!isDirty || loading}
          >
            Borrar Todo
          </Button>
          <ButtonWithLoader
            loading={loading}
            onClick={handleCreateUser}
            backgroundButton={theme => theme.palette.success.main}
            disabled={!isFormValid()}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: theme => theme.palette.success.dark,
              },
              width: 140,
            }}
          >
            Crear usuario
          </ButtonWithLoader>
        </Box>

      </Grid>
      <QuestionModal
        open={questionModalOpen}
        question="¿Deseas borrar todos los cambios no guardados?"
        onCancel={() => setQuestionModalOpen(false)}
        onConfirm={handleConfirmCancelModal}
      />
    </>
  );
};
