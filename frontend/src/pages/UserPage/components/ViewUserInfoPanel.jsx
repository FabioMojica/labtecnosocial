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
  FullScreenProgress,
  UserImageDates,
} from "../../../generalComponents";
import { roleConfig, roleConfigWithoutSA, stateConfig } from "../../../utils";
import { updateUserApi } from "../../../api";
import { useNavigate, useParams } from "react-router-dom";
import { FloatingActionButtons } from "../../../generalComponents/FloatingActionButtons";
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const ViewUserInfoPanel = ({ user, onChange, isEditable }) => {
  const fileInputRef = useRef(null);
  const [loadingUpdateUser, setLoadingUpdateUser] = useState(false);
  const { user: userSession, updateUserInContext } = useAuth();
  const { email: userEmail } = useParams();
  const isMyProfile = userSession?.email === userEmail;
  const navigate = useNavigate();

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

    if (user?.image_file instanceof File) {
      setPreviewImage(URL.createObjectURL(user?.image_file));
    }

    else if (user?.image_url) {
      setPreviewImage(`${API_UPLOADS}${encodeURI(user?.image_url)}`);
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

    const MAX_SIZE_MB = 2;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    if (file.size > MAX_SIZE_BYTES) {
      notify(`La imagen es demasiado pesada. Máximo permitido: ${MAX_SIZE_MB}MB`, "warning");
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

  const roleData = Object.values(roleConfig).find(r => r.value === user?.role);
  const RoleIcon = roleData?.icon ?? QuestionMarkRoundedIcon;

  const roleLabel =
    Object.values(roleConfig).find(r => r.value === user?.role) ?? {
      label: user?.role,
    };

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


  if (loadingUpdateUser) return <FullScreenProgress text={'Guardando cambios en el usuario...'} />

  if (!user) {
    return <FullScreenProgress text="Cargando usuario..." />;
  }

  const canNavigateToProject = () => {
    return userSession?.role === roleConfig.superAdmin.value || (userSession?.role === roleConfig.user.value && isMyProfile);
  };


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
      <Grid
        size={{ xs: 12, md: 5 }}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          height: `calc(100vh - ${headerHeight}px - 24px)`,
          maxHeight: {
            xs: 250,
            sm: 300,
            lg: `calc(100vh - ${headerHeight}px - 24px)`,
          },
        }}>

        <UserImageDates
          overlay
          overlayText={overlayText}
          sx={{
            height: '100%',
            width: {
              xs: 250,
              sm: 400,
              lg: '100%'
            },
            maxHeight: 500,
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
            {
              isMyProfile ? "Tus datos personales" : "Datos del usuario"
            }
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
            {user?.firstName} {user?.lastName}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user?.email}
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
              {roleLabel.label}
            </Box>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: stateConfig[user?.state]?.color,
                color: "#fff",
                fontWeight: 500,
                fontSize: "0.85rem",
              }}
            >
              {stateConfig[user?.state]?.label}
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
                {" "}({user?.projects.length})
              </Typography>
            </Typography>

            {user?.projects.length > 0 ? (
              <Box
                display={'flex'}
                flexWrap={'wrap'}
                gap={1}
                sx={{
                  overflowY: "auto",
                  maxHeight: {
                    xs: '100%',
                    sm: '260px',
                  },
                  width: '100%',
                  "&::-webkit-scrollbar": { width: "2px" },
                  "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "8px" },
                  "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "8px" },
                  "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark }
                }}
              >
                {user?.projects.map((project, index) => (
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
                    }}

                    onClick={() => {

                      if (!canNavigateToProject()) return;

                      navigate(`/proyecto/${project?.name}`, {
                        replace: true,
                        state: { id: project?.id },
                      });
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

      <FloatingActionButtons
        text="Cambios sin guardar en el usuario"
        loading={loadingUpdateUser}
        visible={isDirty}
        onSave={saveChangesUser}
        onCancel={() => {
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
        }}
        saveDisabled={!canSave}
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
