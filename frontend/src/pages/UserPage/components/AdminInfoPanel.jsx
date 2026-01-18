import {
  Grid,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Button,
  useTheme,
  Stack,
  Avatar,
  Modal
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { useEffect, useRef, useState } from "react";
import { useAuth, useHeaderHeight, useNotification } from "../../../contexts";
import _ from "lodash";
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

import {
  ButtonWithLoader,
  ErrorScreen,
  FullScreenProgress,
  SelectComponent,
  TextField,
  UserImageDates,
} from "../../../generalComponents";
import {
  cleanExtraSpaces,
  validateRequiredText,
  validateTextLength,
  validateOnlyLetters,
} from "../../../utils/textUtils";
import { roleConfig, stateConfig } from "../../../utils";
import { validateEmail, validatePassword } from "../../../utils";
import { getUserByEmailApi, updateUserApi } from "../../../api";
import { useAuthEffects, useFetchAndLoad } from "../../../hooks";
import { useNavigate } from "react-router-dom";
import { FloatingActionButtons } from "../../../generalComponents/FloatingActionButtons";

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const AdminInfoPanel = ({ userEmail, panelHeight, onUserChange }) => {
  if (!userEmail) return;
  const fileInputRef = useRef(null);
  const { user: userSession, updateUserInContext } = useAuth();
  const [error, setError] = useState(false);
  const theme = useTheme();
  const [previewImage, setPreviewImage] = useState(null);
  const [overlayText, setOverlayText] = useState("Subir una imagen");
  const [errors, setErrors] = useState({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { notify } = useNotification();
  const [user, setUser] = useState(null);
  const originalUserRef = useRef(null);
  const { headerHeight } = useHeaderHeight();
  const [passwordsValid, setPasswordsValid] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const { loading, callEndpoint } = useFetchAndLoad();
  const [isDirty, setIsDirty] = useState(false);
  const [loadingUpdateUser, setLoadingUpdateUser] = useState(false);
  const [loadingChangePassword, setLoadingChangePassword] = useState(false);
  const navigate = useNavigate();
  const isMyProfile = userSession?.email === userEmail;

  const fetchUserByEmail = async () => {
    try {
      setError(false)
      const resp = await callEndpoint(getUserByEmailApi(userEmail));
      setUser(resp);

      originalUserRef.current = structuredClone({
        ...resp,
        originalEmail: resp.email
      });

    } catch (error) {
      setError(true);
      notify("Ocurrió un error inesperado al obtener el usuario. Inténtalo de nuevo más tarde.", "error");
    }
  }

  useEffect(() => {
    fetchUserByEmail();
  }, []);

  const handleOpenPasswordModal = () => {
    setOldPassword("");
    setNewPassword("");
    setOpenPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setOpenPasswordModal(false);
  };

  useEffect(() => {
    const oldValid = oldPassword.length > 0;
    const newValid = !validatePassword(newPassword.trim());
    setPasswordsValid(oldValid && newValid);
  }, [oldPassword, newPassword]);

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
    if (!user) {
      setPreviewImage(null);
      return;
    }

    if (user.image_file instanceof File) {
      setPreviewImage(URL.createObjectURL(user.image_file));
    }

    else if (user.image_url) {
      setPreviewImage(`${API_UPLOADS}${encodeURI(user.image_url)}`);
    } else {
      setPreviewImage(null);
    }
  }, [user]);

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
    handleFieldChange("image_file", file);
    handleFieldChange("image_url", null);

    event.target.value = "";
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    handleFieldChange("image_file", null);
    handleFieldChange("image_url", null);
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

  const generateSecurePassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+{}[]<>?";
    const all = upper + lower + numbers + special;

    let password = "";
    password += upper[Math.floor(Math.random() * upper.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    for (let i = password.length; i < 8; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    setNewPassword(password);
    onChange?.({ newPassword: password, passwordsValid: true });
  };

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
    const cleaned = cleanExtraSpaces(value);
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

    setErrors((prev) => ({ ...prev, [field]: error || "" }));
  };

  const normalize = (u) => ({
    ...u,
    image_file: u.image_file ?? null,
    image_url: u.image_url ?? null,
  });

  const handleFieldChange = (field, value) => {
    setUser((prev) => {
      const updatedUser = { ...prev, [field]: value };

      validateField(field, value);

      const cleanOriginal = normalize(originalUserRef.current);
      const cleanUpdated = normalize(updatedUser);

      const normalizeImageValue = (val) => (val instanceof File ? val : null);

      const dirty = (
        cleanOriginal.firstName !== cleanUpdated.firstName ||
        cleanOriginal.lastName !== cleanUpdated.lastName ||
        cleanOriginal.email !== cleanUpdated.email ||
        cleanOriginal.role !== cleanUpdated.role ||
        cleanOriginal.state !== cleanUpdated.state ||
        normalizeImageValue(cleanOriginal.image_file) !== normalizeImageValue(cleanUpdated.image_file) ||
        cleanOriginal.image_url !== cleanUpdated.image_url
      );

      setIsDirty(dirty);
      return updatedUser;
    });
  };

  const updateUser = async () => {
    const resp = await updateUserApi(originalUserRef.current.originalEmail, user);
    return resp;
  }

  const saveChangesUser = async () => {
    setLoadingUpdateUser(true);
    try {
      const newUser = await updateUser();

      const oldEmail = originalUserRef.current.email;
      const oldRole = originalUserRef.current.role;
      const oldState = originalUserRef.current.state;

      if (isMyProfile) {
        updateUserInContext(newUser);
      }

      const sensitiveChanged =
        isMyProfile &&
        (oldEmail !== newUser.email || oldRole !== newUser.role || oldState !== newUser.state);

      if (onUserChange) {
        onUserChange(newUser, sensitiveChanged);
      }

      originalUserRef.current = structuredClone({
        ...newUser,
        originalEmail: newUser.email
      });

      setIsDirty(false);

      if (sensitiveChanged) {
        return;
      }

      navigate(`/usuario/${encodeURIComponent(newUser?.email)}`);
      notify("Usuario actualizado correctamente", "success");
    } catch (err) {
      if (err?.response?.data?.message) {
        notify(err?.response?.data?.message, "error");
      } else {
        notify("Ocurrió un error inesperado al actualizar el usuario. Inténtalo de nuevo más tarde.", "error");
      }
    } finally {
      setLoadingUpdateUser(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoadingChangePassword(true);

      await updateUserApi(user.email, {
        oldPassword: oldPassword,
        newPassword: newPassword,
      });

      // Actualizamos el usuario localmente
      setUser(prev => ({ ...prev }));
      originalUserRef.current = structuredClone({ ...user });

      notify("Contraseña cambiada correctamente.", "success");
      handleClosePasswordModal();

      if (isMyProfile && onUserChange) {
        onUserChange({ ...user }, true);
      }

    } catch (err) {
      if (err?.response?.data?.message) {
        notify(err?.response?.data?.message, "error");
      } else {
        notify(
          "Ocurrió un error inesperado al cambiar la contraseña. Inténtalo de nuevo más tarde.",
          "error"
        );
      }
    } finally {
      setLoadingChangePassword(false);
    }
  }

  if (loading) return <FullScreenProgress text={'Obteniendo el usuario...'} />
  if (loadingUpdateUser) return <FullScreenProgress text={'Guardando cambios en el usuario...'} />
  if (error) return <ErrorScreen message="Hubo un error obteniendo el usuario" buttonText="Volver a intentar" onButtonClick={() => fetchUserByEmail(userEmail)} />

  const canSave = isDirty &&
    user?.firstName?.trim() &&
    user?.lastName?.trim() &&
    user?.email?.trim() &&
    Object.values(errors).every((e) => !e);

  const canNavigateToProject = () => {
    return userSession?.role === "admin" || (userSession?.role === "coordinator" && isMyProfile);
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
      <Grid size={{ xs: 12, md: 5 }} sx={{ width: '100%', height: { xs: '50%', lg: '100%' }, maxHeight: '1000px', display: 'flex', flexDirection: 'column' }}>
        <UserImageDates
          overlay 
          overlayText={overlayText}
          user={user}
          sx={{
            width: '100%', height: '100%', 
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
        size={{ xs: 12, md: 7 }}
        sx={{
          height: "auto",
          display: "flex",
          flexDirection: "column",
          pb: { xs: 20, sm: 0 },
        }}
      >
        {/* Nombre y Apellido */}
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 6 }}>


            <TextField
              id="first-name"
              label={
                user?.firstName !== "" ? null :
                  <>
                    Ingrese nombre para el usuario <span style={{ color: theme.palette.error.main }}>*</span>
                  </>
              }
              disabled={loading}
              variant="outlined"
              value={user?.firstName ?? ""}
              error={!!errors.firstName}
              onChange={(e) => handleFieldChange("firstName", e.target.value)}
              onBlur={(e) => validateField("firstName", e.target.value)}
              maxLength={100}
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
                user?.lastName !== "" ? null :
                  <>
                    Ingrese apellidos para el usuario <span style={{ color: theme.palette.error.main }}>*</span>
                  </>
              }
              onChange={(e) => handleFieldChange("lastName", e.target.value)}
              onBlur={(e) => validateField("lastName", e.target.value)}
              maxLength={100}
              disabled={loading}
              variant="outlined"
              value={user?.lastName ?? ""}
              error={!!errors.lastName}
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
        </Grid>

        {/* Email */}
        <Grid size={12}>
          <TextField
            id="new-email"
            disabled={loading}
            size='small'
            label={
              user?.email !== "" ? null :
                <>
                  Ingrese un correo electrónico para el usuario <span style={{ color: theme.palette.error.main }}>*</span>
                </>
            }
            variant="outlined"
            error={!!errors.email}
            value={user?.email ?? ""}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            onBlur={(e) => validateField("email", e.target.value)}
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
        </Grid>

        {/* Role y Estado */}
        <Grid size={12}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
            <SelectComponent
              label="Rol"
              options={roleOptions}
              value={user?.role}
              onChange={(newRole) => handleFieldChange("role", newRole)}
              fullWidth
            />
            <SelectComponent
              label="Estado"
              options={stateOptions}
              value={user?.state}
              onChange={(newState) => handleFieldChange("state", newState)}
              fullWidth
            />
          </Box>
        </Grid>

        <Grid size={12} sx={{ mt: 1 }}>
          <Button disabled={isDirty} variant="outlined" onClick={handleOpenPasswordModal}>
            Cambiar contraseña
          </Button>
        </Grid>

        <Box sx={{
          width: '100%',
          flex: 1,
        }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Proyectos asignados
              <Typography component="span" color="text.secondary">
                {" "}({user?.projects?.length})
              </Typography>
            </Typography>

            {user?.projects?.length > 0 ? (
              <Box
                display={'flex'}
                flexWrap={'wrap'}
                gap={1}
                sx={{
                  overflowY: "auto",
                  maxHeight: {
                    sm: '120px',
                  },
                  width: '100%',
                  "&::-webkit-scrollbar": { width: "2px" },
                  "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "8px" },
                  "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "8px" },
                  "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark }
                }}
              >
                {user?.projects?.map((project, index) => (
                  <Avatar
                    key={`${project.name}-${index}`}
                    src={project.image_url ? `${API_UPLOADS}${project.image_url}` : undefined}
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      cursor: canNavigateToProject() ? 'pointer' : 'default',
                      transition: "transform .2s",
                      "&:hover": {
                        transform: "scale(1.01)",
                      },
                      objectFit: 'cover',
                    }}
                    title={project.name}
                    onClick={() => {

                      if (!canNavigateToProject()) return;

                      navigate(`/proyecto/${project?.name}`, {
                        replace: true,
                        state: { id: project?.id },
                      });
                    }}
                  >
                    {project.name[0]}
                  </Avatar>
                ))}
              </Box>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  color: "gray",
                  fontStyle: "italic",
                  fontSize: "0.9rem",
                }}
              >
                Este usuario no tiene proyectos asignados
              </Typography>
            )}
          </Box>
        </Box>
      </Grid>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* MODAL CAMBIO DE CONTRASEÑA */}
      <Modal
        open={openPasswordModal}
        onClose={(event, reason) => {
          if (loadingChangePassword) {
            if (reason === 'backdropClick') {
              return;
            }
            return;
          }
          handleClosePasswordModal();
        }}
        disableEscapeKeyDown={loadingChangePassword}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: 330, sm: 500 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2} fontWeight="bold" textAlign={'center'}>
            Cambiar contraseña
          </Typography>

          <Stack spacing={2}>
            {/* OLD PASSWORD */}
            <TextField
              maxLength={8}
              disabled={loadingChangePassword}
              label="Contraseña antigua"
              labelFontSize={{
                xs: '1rem',
              }}
              valueFontSize={{
                xs: '1.1rem'
              }}
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              variant="outlined"
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowOldPassword(!showOldPassword)}>
                      {showOldPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* NEW PASSWORD */}
            <TextField
              maxLength={8}
              disabled={loadingChangePassword}
              label="Nueva contraseña"
              labelFontSize={{
                xs: '1rem',
              }}
              valueFontSize={{
                xs: '1.1rem'
              }}
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              variant="outlined"
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      sx={{
                        p: { xs: 0.2, sm: 0 },
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}
                    >
                      {showNewPassword ? <VisibilityOffIcon
                        sx={{
                          fontSize: { xs: '1.3rem', sm: '1.25rem' }
                        }}
                      /> :
                        <VisibilityIcon
                          sx={{
                            fontSize: { xs: '1.3rem', sm: '1.25rem' }
                          }}
                        />}
                    </IconButton>

                    <IconButton
                      onClick={generateSecurePassword}
                      sx={{
                        ml: { xs: 0, sm: 0 },
                        p: { xs: 0.2, sm: 1 },
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}
                      disabled={loadingChangePassword}
                    >
                      <AutorenewIcon
                        sx={{
                          fontSize: { xs: '1.3rem', sm: '1.25rem' }
                        }}
                      />
                    </IconButton>

                    <IconButton
                      onClick={() => {
                        if (newPassword) {
                          navigator.clipboard.writeText(newPassword);
                          notify("Contraseña copiada", "success");
                        }
                      }}
                      sx={{
                        ml: { xs: 0, sm: 0 },
                        p: { xs: 0.2, sm: 1 },
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}
                    >
                      <ContentCopyIcon
                        sx={{
                          fontSize: { xs: '1.3rem', sm: '1.25rem' }
                        }}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="contained"
                color="error"
                onClick={handleClosePasswordModal}
                sx={{
                  width: '100px'
                }}
                disabled={loadingChangePassword}
              >
                Cancelar
              </Button>
              <ButtonWithLoader
                loading={loadingChangePassword}
                onClick={handleChangePassword}
                disabled={!(oldPassword.length > 0 && !validatePassword(newPassword)) || loadingChangePassword}
                variant="contained"
                backgroundButton={theme => theme.palette.success.main}
                sx={{
                  width: '100px',
                  minHeight: 0,
                  color: "white",
                  "&:hover": {
                    backgroundColor: theme => theme.palette.success.dark,
                  },
                }}
              >
                Confirmar
              </ButtonWithLoader>
            </Box>
          </Stack>
        </Box>
      </Modal>

      <FloatingActionButtons
        text="Cambios sin guardar en el usuario"
        loading={loading}
        visible={isDirty}
        onSave={saveChangesUser}
        onCancel={() => {
          setUser(structuredClone(originalUserRef.current));
          setIsDirty(false);
          setErrors({});
        }}
        saveDisabled={!canSave}
      />
    </Grid>
  );
};
