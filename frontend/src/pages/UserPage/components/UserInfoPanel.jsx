import {
  Grid,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  Button,
  useTheme,
  Stack,
  Avatar
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { useEffect, useRef, useState } from "react";
import { useHeaderHeight, useNotification } from "../../../contexts";

import {
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

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const UserInfoPanel = ({ user, panelHeight, onChange }) => {
  if(!user) return;
  const fileInputRef = useRef(null);
  const theme = useTheme();
  const [previewImage, setPreviewImage] = useState(null);
  const [overlayText, setOverlayText] = useState("Subir una imagen");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { notify } = useNotification();
  const { headerHeight } = useHeaderHeight();

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
    onChange?.({ image_file: file, image_url: previewUrl });
    event.target.value = "";
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    onChange?.({ image_url: null, image_file: null });
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
    onChange?.({ password });
    notify("Contraseña segura generada correctamente", "info");
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
    onChange?.({ [field]: cleaned });
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
      <Grid
        size={{ xs: 12, md: 5 }}
        sx={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Box sx={{
          height: '75%',
          minHeight: '75%',
          width: '100%'
        }}>
          <UserImageDates
            overlay
            overlayText={overlayText}
            user={user}
            sx={{ width: '100%', height: '100%' }}
            changeImage
            onChangeImage={handleOverlayClick}
            previewImage={previewImage ?? undefined}
            onContextMenu={handleContextMenu}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
        </Box>

        <Box
          sx={{
            width: '100%',
            height: {xs: '150px', sm: '25%'},
            m: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
            Proyectos asignados
            {user.projects?.length > 0 && ` (${user.projects.length})`}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              height: 'auto',
              p: 1,
              overflowX: 'auto',
              "&::-webkit-scrollbar": { height: "2px" },
              "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
              "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
              "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
            }}
          >
            {user.projects && user.projects.length > 0 ? (
              user.projects.map((project) => (
                <Avatar
                  key={project.id}
                  src={project.image_url ? `${API_UPLOADS}${project.image_url}` : undefined}
                  title={`${project.name}`}
                  sx={{
                    width: 66,
                    height: 66,
                    borderRadius: 2,
                    objectFit: "cover",
                    fontWeight: "bold",
                    zIndex: 1,
                    boxShadow:
                      theme.palette.mode === 'light'
                        ? '0 0 0 1px rgba(0,0,0,0.3)'
                        : '0 0 0 1px rgba(255,255,255,0.3)',
                  }}

                >
                  {project.name[0].toUpperCase()}
                </Avatar>
              ))
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
          </Stack>

        </Box>
      </Grid>


      <Grid
        container
        spacing={2}
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
              label="Nombre(s)*"
              variant="filled"
              value={user?.firstName ?? ""}
              onChange={(e) => onChange?.({ firstName: e.target.value })}
              onBlur={(e) => validateField("firstName", e.target.value)}
              maxLength={100}
              error={!!errors.firstName}
              labelFontSize="1.1rem"
              valueFontSize="1.3rem"
            />
            {errors.firstName && (
              <Typography color="error" variant="caption">
                {errors.firstName}
              </Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Apellido(s)*"
              variant="filled"
              value={user?.lastName ?? ""}
              onChange={(e) => onChange?.({ lastName: e.target.value })}
              onBlur={(e) => validateField("lastName", e.target.value)}
              maxLength={100}
              error={!!errors.lastName}
              labelFontSize="1.1rem"
              valueFontSize="1.3rem"
            />
            {errors.lastName && (
              <Typography color="error" variant="caption">
                {errors.lastName}
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* Email */}
        <Grid size={12}>
          <TextField
            label="Email del usuario*"
            variant="filled"
            value={user?.email ?? ""}
            onChange={(e) => onChange?.({ email: e.target.value })}
            onBlur={(e) => validateField("email", e.target.value)}
            maxLength={100}
            error={!!errors.email}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      if (user?.email) {
                        navigator.clipboard.writeText(user.email);
                        notify("Correo copiado al portapapeles", "success");
                      }
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            labelFontSize="1.1rem"
            valueFontSize="1.3rem"
          />
          {errors.email && (
            <Typography color="error" variant="caption">
              {errors.email}
            </Typography>
          )}
        </Grid>

        {/* Role y Estado */}
        <Grid size={12}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
            <SelectComponent
              options={roleOptions}
              value={user?.role}
              onChange={(newRole) => onChange?.({ role: newRole })}
              fullWidth
            />
            <SelectComponent
              options={stateOptions}
              value={user?.state}
              onChange={(newState) => onChange?.({ state: newState })}
              fullWidth
            />
          </Box>
        </Grid>

        <Grid size={12}>
          <Button
            variant="outlined"
            onClick={() => setShowChangePassword(!showChangePassword)}

          >
            {showChangePassword ? "Cancelar cambio de contraseña" : "Cambiar contraseña"}
          </Button>
        </Grid>

        {/* Campos de cambio de contraseña */}
        {showChangePassword && (
          <Grid container spacing={2} >
            <Grid size={12}>
              <TextField
                label="Contraseña antigua"
                variant="filled"
                type={showPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                labelFontSize="1.1rem"
                valueFontSize="1.5rem"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Nueva contraseña"
                variant="filled"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                labelFontSize="1.1rem"
                valueFontSize="1.5rem"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                      <IconButton onClick={generateSecurePassword}>
                        <AutorenewIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          if (newPassword) navigator.clipboard.writeText(newPassword);
                        }}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        )}
      </Grid>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange} 
      />
    </Grid>
  );
};
