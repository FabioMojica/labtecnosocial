import {
  Grid,
  Typography,
  Box,
  IconButton,
  InputAdornment,
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

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export const CreateUserInfoPanel = ({ user, panelHeight, onChange }) => {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [overlayText, setOverlayText] = useState("Subir una imagen");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
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
    setPreviewImage(user?.image_url ?? null);
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

    onChange?.({ password });
    validateField("password", password);
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

    setErrors((prev) => {
      const newErrors = { ...prev, [field]: error || "" };
      onChange?.({ [`${field}Error`]: newErrors[field] });
      return newErrors;
    });

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
      <Grid size={{ xs: 12, md: 5 }} sx={{ height: { xs: "50%", sm: "100%" } }}>
        <UserImageDates
          overlay
          overlayText={overlayText}
          user={user}
          sx={{ width: "100%", height: "100%" }}
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
        spacing={2}
        size={{ xs: 12, md: 7 }}

        sx={{ height: "auto", display: "flex", flexDirection: "column", pb: { xs: 20, sm: 0 } }}
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
                        notify("Correo copiado al portapapeles", "info");
                      }
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {errors.email && (
            <Typography color="error" variant="caption">
              {errors.email}
            </Typography>
          )}
        </Grid>

        {/* Contraseña */}
        <Grid size={12}>
          <TextField
            label="Contraseña del usuario*"
            variant="filled"
            type={showPassword ? "text" : "password"}
            value={user?.password ?? ""}
            onChange={(e) => {
              onChange?.({ password: e.target.value });
              validateField("password", e.target.value);
            }}
            onBlur={(e) => validateField("password", e.target.value)}
            maxLength={8}
            error={!!errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
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
                    onClick={generateSecurePassword}
                    title="Generar contraseña segura"
                  >
                    <AutorenewIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    onClick={() => {
                      if (user?.password) {
                        navigator.clipboard.writeText(user.password);
                        notify("Contraseña copiada al portapapeles", "info");
                      } else {
                        notify("No hay contraseña para copiar", "warning");
                      }
                    }}
                    title="Copiar contraseña"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {errors.password && (
            <Typography color="error" variant="caption">
              {errors.password}
            </Typography>
          )}
        </Grid>

        {/* Role y Estado */}
        <Grid size={12}>
          <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
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
