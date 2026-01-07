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
  Divider,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useAuth, useHeaderHeight, useNotification } from "../../../contexts";

import {
  ActionBarButtons,
  FullScreenProgress,
  UserImageDates,
} from "../../../generalComponents";
import { roleConfig, stateConfig } from "../../../utils";
import { updateUserApi } from "../../../api";
import { useNavigate, useParams } from "react-router-dom";

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const ViewUserInfoPanel = ({ user, onChange, isEditable }) => {
  const fileInputRef = useRef(null);
  const [loadingUpdateUser, setLoadingUpdateUser] = useState(false);
  const { user: userSession, updateUserInContext } = useAuth();
  const { email: userEmail } = useParams();
  const isMyProfile = userSession?.email === userEmail;
  const navigate = useNavigate();

  console.log('ViewUserInfoPanel ---------', user)

  const theme = useTheme();
  const [previewImage, setPreviewImage] = useState(null);
  const [overlayText, setOverlayText] = useState("Subir una imagen");
  const { notify } = useNotification();
  const { headerHeight } = useHeaderHeight();
  const [isDirty, setIsDirty] = useState(false);
  const originalUserRef = useRef(structuredClone(user));
  const [localUser, setLocalUser] = useState(user);

  useEffect(() => {
    setLocalUser(user);
  }, [user]);


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

    const updatedUser = { ...localUser, image_file: file, image_url: previewUrl };
    setLocalUser(updatedUser);
    setPreviewImage(previewUrl);
    onChange?.({ image_file: file, image_url: previewUrl });

    setIsDirty(checkDirty(updatedUser, originalUserRef.current));
    event.target.value = "";
  };

  const checkDirty = (userA, userB) => {
    const aUrl = userA.image_url ?? null;
    const bUrl = userB.image_url ?? null;

    return aUrl !== bUrl;
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    const updatedUser = { ...localUser, image_file: null, image_url: null };
    setLocalUser(updatedUser);
    onChange?.({ image_file: null, image_url: null });
    setIsDirty(checkDirty(updatedUser, originalUserRef.current));
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

  const RoleIcon = roleConfig[user.role]?.icon;

  const canSave = isDirty;


  const saveChangesUser = async () => {
    if (!isDirty) return;

    setLoadingUpdateUser(true);
    try {
      const payload = localUser.image_file
        ? { image_file: localUser.image_file }
        : { image_url: null };

      const newUser = await updateUserApi(originalUserRef.current.email, payload);

      if (isMyProfile) {
        updateUserInContext(newUser);
      }

      originalUserRef.current.image_file = localUser.image_file ?? null;
      originalUserRef.current.image_url = localUser.image_url ?? null;

      setIsDirty(false);
      notify("Imagen de usuario actualizada correctamente", "success");

      navigate(`/usuario/${encodeURIComponent(newUser.email)}`);
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



  const actionButtons = [
    {
      label: "Cancelar",
      color: "inherit",
      onClick: () => {
        if (originalUserRef.current.image_file instanceof File) {
          setPreviewImage(URL.createObjectURL(originalUserRef.current.image_file));
        } else if (originalUserRef.current.image_url) {
          setPreviewImage(`${API_UPLOADS}${encodeURI(originalUserRef.current.image_url)}`);
        } else {
          setPreviewImage(null);
        }
        onChange?.({
          image_file: originalUserRef.current.image_file ?? null,
          image_url: originalUserRef.current.image_url ?? null,
        });

        setIsDirty(false);
      },
    },
    {
      label: "Guardar",
      variant: "contained",
      color: "primary",
      disabled: !canSave,
      onClick: saveChangesUser,
    }

  ];

  if (loadingUpdateUser) return <FullScreenProgress text={'Guardando cambios en el usuario...'} />


  return (
    <Grid
      container
      spacing={2}
      sx={{
        width: "100%",
        minHeight: `calc(100vh - ${headerHeight}px)`,
        height: `calc(100vh - ${headerHeight}px)`,
        maxHeight: `calc(100vh - ${headerHeight}px)`,
        p: 1,
      }}
    >
      <Grid size={{ xs: 12, md: 5 }} sx={{ width: '100%', height: { xs: '50%', lg: '100%' }, maxHeight: '1000px', display: 'flex', flexDirection: 'column' }}>
        <UserImageDates
          overlay
          overlayText={overlayText}
          sx={{
            height: '100%',
            flex: 1,
            cursor: isEditable ? "pointer" : "default",
          }}
          user={user}
          changeImage={isEditable}
          onChangeImage={isEditable ? handleOverlayClick : undefined}
          previewImage={previewImage ?? undefined}
          onContextMenu={isEditable ? handleContextMenu : undefined} 
          onTouchStart={isEditable ? handleTouchStart : undefined}  
          onTouchEnd={isEditable ? handleTouchEnd : undefined}
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
        <Box sx={{ width: '100%' }}>
          <Typography variant="h6" fontWeight="bold">
            Datos del usuario
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: { xs: 'normal', sm: 'nowrap' },
            }}
          >
            {user.firstName} {user.lastName}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.email}
          </Typography>

        </Box>

        <Divider sx={{ width: '100%' }} />

        <Box>
          <Typography variant="h6" fontWeight="bold">
            Rol y estado
          </Typography>
          <Stack direction="row" spacing={1}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.8,
                px: 1.5,
                py: 0.6,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontWeight: 500,
                fontSize: "0.85rem",
              }}
            >
              {RoleIcon && <RoleIcon sx={{ fontSize: 18 }} />}
              {roleConfig[user.role]?.role}
            </Box>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: stateConfig[user.state]?.color,
                color: "#fff",
                fontWeight: 500,
                fontSize: "0.85rem",
              }}
            >
              {stateConfig[user.state]?.label}
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ width: '100%' }} />

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
                {" "}({user.projects.length})
              </Typography>
            </Typography>

            {user.projects.length > 0 ? (
              <Box
                display={'flex'}
                flexWrap={'wrap'}
                gap={1}
                sx={{
                  overflowY: "auto",
                  maxHeight: {
                    sm: '260px',
                  },
                  width: '100%',
                  "&::-webkit-scrollbar": { width: "2px" },
                  "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "8px" },
                  "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "8px" },
                  "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark }
                }}
              >
                {user.projects.map((project, index) => (
                  <Avatar
                    key={`${project.name}-${index}`}
                    src={project.image_url ? `${API_UPLOADS}${project.image_url}` : undefined}
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      cursor: "pointer",
                      transition: "transform .2s",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                    title={project.name}
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

      <ActionBarButtons
        visible={isDirty}
        buttons={actionButtons}
        position={{ bottom: 20, right: 20 }}
      />


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
