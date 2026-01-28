import React from "react";
import {
    Grid,
    Typography,
    Box,
    IconButton,
    InputAdornment,
    Button,
    useTheme,
    Stack,
    TextField,
    Tooltip,
    useMediaQuery,
    Dialog,
    Slide,
    DialogActions,
    DialogTitle
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { useEffect, useRef, useState } from "react";
import { useAuth, useHeaderHeight, useNotification } from "../../../contexts";
import InfoIcon from '@mui/icons-material/Info';
import { updateUserFormData } from '../utils/updateUserFormData.js';
import { getRoleAndStateDataWithoutSA } from "../../../utils/getRoleAndStateData.js";

import {
    ButtonWithLoader,
    FullScreenProgress,
    SelectComponent,
    UserImageDates,
} from "../../../generalComponents";
import {
    validateRequiredText,
    validateTextLength,
    validateOnlyLetters,
    validateSpaces,
} from "../../../utils/textUtils";
import { roleConfig, roleConfigWithoutSA, stateConfig } from "../../../utils";
import { validateEmail, validatePassword } from "../../../utils";
import { updateUserApi } from "../../../api";
import { useFetchAndLoad } from "../../../hooks";
import { useNavigate } from "react-router-dom";
import { getChangedFields } from "../utils/getChangedFields.js";
import { userSchema } from "../../../utils/schemas/userSchema.js";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const EditProfileDialog = ({ open, onClose, userProfile, panelHeight, onUserChange }) => {
    if (!userProfile) return;
    const fileInputRef = useRef(null);
    const { user: userSession, updateUserInContext, isUser, isAdmin, isSuperAdmin } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const [previewImage, setPreviewImage] = useState(null);
    const [overlayText, setOverlayText] = useState("Subir una imagen");

    const {
        createdBy,
        created_by,
        projects,
        session_version,
        createdUsers,
        ...cleanedUser
    } = userProfile;

    const [errors, setErrors] = useState({
        firstName: null,
        lastName: null,
        email: null,
        password: null,
    });

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const { notify } = useNotification();
    const [user, setUser] = useState(cleanedUser);

    const originalUserRef = useRef(null);
    const { headerHeight } = useHeaderHeight();
    const [passwordsValid, setPasswordsValid] = useState(false);
    const [openPassword, setOpenPassword] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [loadingUpdateUser, setLoadingUpdateUser] = useState(false);
    const navigate = useNavigate();
    const isMyProfile = userSession?.email === userProfile?.email;
    originalUserRef.current = structuredClone({
        ...userProfile,
        originalEmail: userProfile?.email,
    });
    const { options } = getRoleAndStateDataWithoutSA(user);

    const handleOpenPassword = () => {
        setOldPassword("");
        setNewPassword("");
        setOpenPassword(prev => !prev);
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

    const passwordDirty =
        openPassword &&
        oldPassword.trim() &&
        newPassword.trim();

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
        setPreviewImage(previewUrl);
        handleFieldChange("image_url", file);

        event.target.value = "";
    };


    const handleRemoveImage = () => {
        setPreviewImage(null);
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


    let roleOptions = Object.values(roleConfigWithoutSA).map((value) => ({
        value: value.value,
        label: value.label,
        icon: value.icon,
    }));

    if (isMyProfile && userSession.role === roleConfig.superAdmin.value) {
        roleOptions =
            Object.values(roleConfig).map((value) => ({
                value: value.value,
                label: value.label,
                icon: value.icon,
            }));
    }

    const validateField = (field, value) => {
        const cleaned = value;
        let error = null;

        switch (field) {
            case "firstName":
                error =
                    validateSpaces(cleaned, "Nombre del usuario") ||
                    validateRequiredText(cleaned, "Nombre del usuario") ||
                    validateTextLength(cleaned, userSchema.MIN_LENGTH_FIRST_NAME, userSchema.MAX_LENGTH_FIRST_NAME, "Nombre del usuario") ||
                    validateOnlyLetters(cleaned, "Nombre del usuario");
                break;
            case "lastName":
                error =
                    validateSpaces(cleaned, "Apellido del usuario") ||
                    validateRequiredText(cleaned, "Apellido del usuario") ||
                    validateTextLength(cleaned, userSchema.MIN_LENGTH_LAST_NAME, userSchema.MAX_LENGTH_LAST_NAME, "Apellido del usuario") ||
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

    const handleFieldChange = (field, value) => {
        setUser((prev) => {
            const updatedUser = { ...prev, [field]: value };

            validateField(field, value);

            const cleanOriginal = originalUserRef.current;
            const cleanUpdated = updatedUser;

            const dirty = (
                cleanOriginal.firstName !== cleanUpdated.firstName ||
                cleanOriginal.lastName !== cleanUpdated.lastName ||
                cleanOriginal.email !== cleanUpdated.email ||
                cleanOriginal.role !== cleanUpdated.role ||
                cleanOriginal.state !== cleanUpdated.state ||
                cleanOriginal.image_url !== cleanUpdated.image_url
            );

            setIsDirty(dirty);
            return updatedUser;
        });
    };

    const updateUser = async () => {
        const original = originalUserRef.current;

        const changedFields = getChangedFields(user, original);

        if (oldPassword && newPassword) {
            changedFields.oldPassword = oldPassword;
            changedFields.newPassword = newPassword;
        }

        if (Object.keys(changedFields).length === 0) {
            notify("No hay cambios para guardar", "info");
            return;
        }

        const formData = updateUserFormData(changedFields);

        return await updateUserApi(
            original.originalEmail,
            formData
        );
    };


    const saveChangesUser = async () => {
        setLoadingUpdateUser(true);
        try {
            const newUser = await updateUser();
            console.log("neeee", newUser)


            const oldEmail = originalUserRef.current.email;
            const oldRole = originalUserRef.current.role;
            const oldState = originalUserRef.current.state;

            if (isMyProfile) {
                updateUserInContext(newUser);
            }

            const sensitiveChanged =
                isMyProfile &&
                (
                    oldEmail !== newUser.email
                    || oldRole !== newUser.role
                    || oldState !== newUser.state
                    || (oldPassword && newPassword)
                );

            const roleChanged = oldRole !== newUser.role;

            if (onUserChange) {
                onUserChange(newUser, {
                    sensitiveChanged,
                    roleChanged,
                });
            }

            originalUserRef.current = structuredClone({
                ...newUser,
                originalEmail: newUser.email
            });

            setUser(structuredClone(newUser));
            setPreviewImage(null);

            setIsDirty(false);

            if (sensitiveChanged) {
                return;
            }

            setNewPassword("");
            setOldPassword("");
            setOpenPassword(false);

            navigate(`/usuario/${encodeURIComponent(newUser?.email)}`);
            notify("Usuario actualizado correctamente", "success");
            onClose();
        } catch (error) {
            notify(error.message, "error");
        } finally {
            setLoadingUpdateUser(false);
        }
    };

    if (loadingUpdateUser) return <FullScreenProgress text={'Guardando cambios en el perfil...'} />

    const requiredFieldsFilled =
        user?.firstName?.trim() &&
        user?.lastName?.trim() &&
        user?.email?.trim();

    const passwordSectionValid =
        !openPassword ||
        (
            oldPassword.trim() &&
            newPassword.trim() &&
            passwordsValid
        );

    const hasErrors = Object.values(errors).some(Boolean);

    const canSave =
        (isDirty || passwordDirty) &&
        requiredFieldsFilled &&
        !hasErrors &&
        passwordSectionValid;

    const displayedTitle = isUser ? "Actualizar tu foto de perfil" : "Actualizar perfil"

    return (
        <>
            <Dialog
                open={open}
                fullWidth
                maxWidth="xl"
                fullScreen
                slots={{
                    transition: Transition,
                }}
                PaperProps={{
                    style: {
                        height: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
                aria-describedby="alert-dialog-slide-description"
                onClose={(event, reason) => {
                    return;
                }}
            >
                <DialogTitle variant="h5" textAlign={'center'} fontWeight={'bold'}>
                    {displayedTitle}
                </DialogTitle>
                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        px: {
                            xs: 1,
                            lg: 2
                        }
                    }}
                >
                    <Grid
                        container
                        spacing={2}
                        sx={{
                            width: "100%",
                            p: 1,
                            position: 'relative',
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                    >
                        { !isUser && 
                            <Tooltip
                                title={
                                    isMyProfile ?
                                        <>Si editas el email o contraseña de tu cuenta se cerrará tu sesión automáticamente.</>
                                        :
                                        <>Si editas el email, contraseña o estado de este usario se cerrará la sesión iniciada de su cuenta.</>
                                }
                                componentsProps={{
                                    popper: {
                                        sx: {
                                            zIndex: 100000,
                                        },
                                    },
                                }}
                                arrow
                            >
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        zIndex: theme => theme.zIndex.tooltip + 1,
                                    }}
                                >
                                    <InfoIcon color="info" fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        }
                        <Grid
                            size={{ xs: 12, md: 5 }}
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                height: `calc(100vh - ${headerHeight}px - ${panelHeight}px - 24px)`,
                                maxHeight: {
                                    xs: 250,
                                    sm: 300,
                                    lg: 1000,
                                },
                            }}
                        >
                            <UserImageDates
                                overlay
                                overlayText={overlayText}
                                user={user}
                                sx={{
                                    width: {
                                        xs: 270,
                                        sm: 400,
                                        lg: '100%'
                                    },
                                    height: "100%",
                                    maxHeight: "auto",
                                }}
                                changeImage
                                onChangeImage={handleOverlayClick}
                                previewImage={previewImage ?? undefined}
                                onContextMenu={handleContextMenu}
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            />
                        </Grid>

                        {!isUser &&
                            <Grid
                                container
                                spacing={1}
                                size={{ xs: 12, md: 7 }}
                                sx={{
                                    position: 'relative',
                                    height: "auto",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                {!isMyProfile &&
                                    <>
                                        <Grid size={12}>
                                            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Typography sx={{ mb: 1 }} variant="h6" fontWeight="bold">
                                                    Rol y estado
                                                </Typography>
                                            </Box>
                                            <>
                                                <Grid size={12} sx={{ display: "flex", width: "100%", gap: 2, mb: 1.5 }}>
                                                    <SelectComponent
                                                        label="Rol"
                                                        disabled={isAdmin}
                                                        options={options.role}
                                                        value={user?.role}
                                                        onChange={(newRole) => handleFieldChange("role", newRole)}
                                                        fullWidth
                                                    />
                                                    <SelectComponent
                                                        label="Estado"
                                                        options={options.state}
                                                        value={user?.state}
                                                        onChange={(newState) => handleFieldChange("state", newState)}
                                                        fullWidth
                                                    />
                                                </Grid>
                                            </>
                                        </Grid>
                                    </>
                                }

                                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        Datos del usuario
                                    </Typography>
                                </Box>

                                <Grid container spacing={1} sx={{ mb: 1 }}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            id="first-name"
                                            label={
                                                user?.firstName !== "" ? <>Nombre</> :
                                                    <>
                                                        Ingrese nombre para el usuario <span style={{ color: theme.palette.error.main }}>*</span>
                                                    </>
                                            }
                                            disabled={loadingUpdateUser}
                                            variant="outlined"
                                            value={user?.firstName ?? ""}
                                            error={!!errors.firstName}
                                            onChange={(e) => handleFieldChange("firstName", e.target.value)}
                                            slotProps={{
                                                htmlInput: {
                                                    maxLength: userSchema.MAX_LENGTH_FIRST_NAME
                                                }
                                            }}
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

                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                mt: 0.5,
                                                px: 0.5,
                                            }}
                                        >
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
                                                {(user?.firstName?.length ?? 0)} / {userSchema.MAX_LENGTH_FIRST_NAME}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            id="last-name"
                                            label={
                                                user?.lastName !== "" ? <>Apellido</> :
                                                    <>
                                                        Ingrese apellidos para el usuario <span style={{ color: theme.palette.error.main }}>*</span>
                                                    </>
                                            }
                                            onChange={(e) => handleFieldChange("lastName", e.target.value)}
                                            disabled={loadingUpdateUser}
                                            variant="outlined"
                                            value={user?.lastName ?? ""}
                                            error={!!errors.lastName}
                                            slotProps={{
                                                htmlInput: {
                                                    maxLength: userSchema.MAX_LENGTH_LAST_NAME,
                                                }
                                            }}
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

                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                mt: 0.5,
                                                px: 0.5,
                                                height: 20,
                                            }}
                                        >
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

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: {
                                                        xs: '0.6rem',
                                                    }
                                                }}
                                            >
                                                {(user?.lastName?.length ?? 0)} / {userSchema.MAX_LENGTH_LAST_NAME}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Grid size={12}>
                                    <TextField
                                        id="new-email"
                                        disabled={loadingUpdateUser}
                                        size='small'
                                        label={
                                            user?.email !== "" ? <>Correo electrónico</> :
                                                <>
                                                    Ingrese un correo electrónico para el usuario <span style={{ color: theme.palette.error.main }}>*</span>
                                                </>
                                        }
                                        variant="outlined"
                                        error={!!errors.email}
                                        value={user?.email ?? ""}
                                        onChange={(e) => handleFieldChange("email", e.target.value)}
                                        slotProps={{
                                            htmlInput: {
                                                maxLength: userSchema.MAX_LENGTH_FIRST_NAME,
                                            },
                                            input: {
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
                                                            disabled={!!errors.email || !user?.email || loadingUpdateUser}
                                                        >
                                                            <ContentCopyIcon fontSize="small" />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }
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

                                        <Typography variant="caption" color="text.secondary"
                                            sx={{
                                                fontSize: {
                                                    xs: '0.6rem',
                                                }
                                            }}
                                        >
                                            {user?.email?.length ?? 0} / {userSchema.MAX_LENGTH_EMAIL}
                                        </Typography>
                                    </Box>

                                    <Grid size={12} sx={{ mb: 2 }}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleOpenPassword}
                                        >
                                            {openPassword ? "Cancelar" : "Cambiar Contraseña"}
                                        </Button>
                                    </Grid>
                                    {
                                        openPassword &&
                                        <Stack spacing={2}>
                                            <TextField
                                                disabled={loadingUpdateUser}
                                                label={
                                                    isSuperAdmin ? <>Contraseña de tu cuenta</> :
                                                        isAdmin ? <>Contraseña antigua</> : null
                                                }
                                                type={showOldPassword ? "text" : "password"}
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                variant="outlined"
                                                fullWidth
                                                slotProps={{
                                                    htmlInput: {
                                                        maxLength: userSchema.MAX_LENGTH_PASSWORD,
                                                    },
                                                    input: {
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={() => setShowOldPassword(!showOldPassword)}>
                                                                    {showOldPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }
                                                }}
                                            />

                                            <TextField
                                                disabled={loadingUpdateUser}
                                                label="Nueva contraseña"
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                variant="outlined"
                                                fullWidth
                                                slotProps={{
                                                    htmlInput: {
                                                        maxLength: userSchema.MAX_LENGTH_PASSWORD,
                                                    },
                                                    input: {
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
                                                                    disabled={loadingUpdateUser}
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
                                                        )
                                                    },
                                                }}
                                            />

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    px: 0.5,
                                                    minHeight: 20,
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    color="error"
                                                    sx={{
                                                        visibility: validatePassword(newPassword) ? "visible" : "hidden",
                                                        fontSize: {
                                                            xs: '0.6rem',
                                                            sm: '0.65rem',
                                                        }
                                                    }}
                                                >
                                                    {validatePassword(newPassword) || "placeholder"}
                                                </Typography>


                                                <Typography
                                                    variant="caption"
                                                    color={!validatePassword(newPassword) ? "success.main" : "warning.main"}
                                                    sx={{
                                                        fontSize: {
                                                            xs: '0.6rem'
                                                        }
                                                    }}
                                                >
                                                    {(newPassword?.length ?? 0)} / {userSchema.MAX_LENGTH_PASSWORD}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    }
                                </Grid>
                            </Grid>
                        }
                    </Grid>

                </Box>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />

                <DialogActions>
                    <Button
                        variant="contained"
                        color="error"
                        sx={{ width: '170px', height: '45px' }}
                        onClick={() => {
                            setUser(structuredClone(originalUserRef.current));
                            setIsDirty(false);
                            setErrors({});
                            setNewPassword("");
                            setOldPassword("");
                            setOpenPassword(false);
                            onClose();
                        }}
                        disabled={loadingUpdateUser}
                    >
                        Cancelar edición
                    </Button>

                    <ButtonWithLoader
                        loading={loadingUpdateUser}
                        onClick={saveChangesUser}
                        disabled={!canSave}
                        variant="contained"
                        backgroundButton={theme => theme.palette.success.main}
                        sx={{ color: 'white', px: 2, width: '170px' }}
                    >
                        Guardar Cambios
                    </ButtonWithLoader>
                </DialogActions>
            </Dialog >
        </>
    );
};