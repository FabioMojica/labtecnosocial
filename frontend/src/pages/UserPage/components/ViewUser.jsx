import {
    Grid,
    Typography,
    Box,
    IconButton,
    Stack,
    Avatar,
    Divider,
    Tooltip,
    useTheme,
    Paper,
} from "@mui/material";
import { useState } from "react";
import { useAuth, useHeaderHeight } from "../../../contexts";

import {
    UserImageDates,
} from "../../../generalComponents";
import { roleConfig } from "../../../utils";

import EditIcon from '@mui/icons-material/Edit';
import { EditProfileModal } from "./EditProfileModal";
import { getUserIcons, getRoleAndStateData } from "../../../utils/getRoleAndStateData";
import { useNavigate } from "react-router-dom";

export const ViewUser = ({ user, panelHeight = 0, isOwnProfile, onChange }) => {
    const { headerHeight } = useHeaderHeight();
    const [modalEditProfileOpen, setModalEditProfileOpen] = useState(false);
    const { selected } = getRoleAndStateData(user);
    const { selected: selectedCreator } = getRoleAndStateData(user?.createdBy);
    const theme = useTheme();
    const { isSuperAdmin, isAdmin, isUser } = useAuth();
    const navigate = useNavigate();


    let RoleIconUser = selected.role.icon;
    let RoleIconCreator = selectedCreator.role.icon;


    let canEditProfile = false;

    if (isOwnProfile) {
        canEditProfile = true;
    } else if (isSuperAdmin) {
        canEditProfile = true;
    } else if (isAdmin) {
        if (user?.role === roleConfig.user.value) {
            canEditProfile = true;
        }
    } else if (isUser) {
        canEditProfile = false;
    } else {
        return;
    }

    let showCreatedUsers = false;

    if (isOwnProfile) {
        if(isAdmin || isSuperAdmin) showCreatedUsers = true;
    } else if (isSuperAdmin || isAdmin) {
        if (user?.role !== roleConfig.user.value) {
            showCreatedUsers = true;
        }
    } else if (isUser) {
        if (user?.role !== roleConfig.user.value) {
            showCreatedUsers = true;
        }
    } else {
        return;
    }

    return (
        <Grid
            container
            rowSpacing={1}
            columnSpacing={3}
            sx={{
                width: "100%",
                minHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                height: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                maxHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
                p: 1,
                position: 'relative',
            }}
        >
            {
                user && canEditProfile &&
                <IconButton sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    boxShadow: 3,
                    zIndex: 500
                }}

                    onClick={() => setModalEditProfileOpen(true)}
                >
                    <Tooltip title="Editar perfil">
                        <EditIcon fontSize="large"></EditIcon>
                    </Tooltip>
                </IconButton>
            }

            <Grid
                size={{ xs: 12, md: 5 }}
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
                    pointerEvents: 'none'
                }}>
                <UserImageDates
                    sx={{
                        height: '100%',
                        width: {
                            xs: 250,
                            sm: 400,
                            lg: '100%'
                        },
                        maxHeight: 500,
                        cursor: "pointer"
                    }}
                    user={user}
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
                }}
            >
                <Box sx={{ width: '100%' }}>
                    <Typography variant="h6" fontWeight="bold">
                        {
                            isOwnProfile ? "Tus datos personales" : "Datos del usuario"
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
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <RoleIconUser icon={selected.role.icon} />
                            {selected.role.label}
                        </Box>
                        <Box
                            sx={{
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                bgcolor: selected?.state?.color,
                                color: "#fff",
                                fontWeight: 500,
                                fontSize: "0.85rem",
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {selected.state.label}
                        </Box>
                    </Stack>
                </Box>

                {user?.role !== roleConfig.superAdmin.value &&
                    <>
                        <Divider sx={{ width: '100%' }} />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">
                                Creado por:
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <Box
                                    sx={{
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        boxShadow: 3,
                                        fontWeight: 500,
                                        fontSize: "0.85rem",
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        gap: 1,
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        navigate(`/usuario/${encodeURIComponent(user?.createdBy?.email)}`)
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: 'relative',
                                        }}
                                    >
                                        <Avatar
                                            src={user?.createdBy?.image_url || null}
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: 2,
                                                boxShadow: (theme) =>
                                                    theme.palette.mode === 'light'
                                                        ? '0 0 0 1px rgba(0,0,0,0.3)'
                                                        : '0 0 0 1px rgba(255,255,255,0.3)',
                                            }}
                                            title={user?.createdBy?.firstName}
                                        >
                                            {user?.createdBy?.firstName[0]}{user?.createdBy?.lastName[0]}
                                        </Avatar>
                                        {(() => {
                                            const { RoleIcon } = getUserIcons(user);
                                            return (
                                                <RoleIcon
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: -4,
                                                        right: -10,
                                                        fontSize: 20
                                                    }}
                                                />
                                            );
                                        })()}
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: 300 }}>
                                        <Typography variant="caption" fontWeight={'bold'} textOverflow={'ellipsis'} noWrap>
                                            {user?.createdBy?.firstName} {user?.createdBy?.lastName}
                                        </Typography>
                                        <Typography variant="caption" textOverflow={'ellipsis'} noWrap>
                                            {user?.createdBy?.email}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Box>
                    </>
                }
            </Grid>

            <Divider sx={{ width: '100%' }} />

            <Grid columns={12} sx={{ width: '100%', pb: showCreatedUsers ? 0 : 20 }}>
                <Typography variant="h5" fontWeight="bold">
                    Proyectos asignados
                    <Typography component="span" color="text.secondary">
                        {" "}({user?.projects?.length})
                    </Typography>
                </Typography>

                {user?.projects?.length > 0 ? (
                    <Stack
                        direction="row"
                        rowGap={1}
                        columnGap={1}
                        flexWrap="wrap"
                        marginY={1}
                    >
                        {Array(1).fill(user?.projects || []).flat().map((project, index) => (
                            <Paper sx={{
                                p: 1,
                                borderRadius: 2,
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 1,
                            }}>
                                <Avatar
                                    title={project?.name}
                                    key={`${project.name}-${index}`}
                                    src={project.image_url || null}
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 2,
                                        boxShadow: (theme) =>
                                            theme.palette.mode === 'light'
                                                ? '0 0 0 1px rgba(0,0,0,0.3)'
                                                : '0 0 0 1px rgba(255,255,255,0.3)',
                                    }}
                                    onClick={() => {
                                        navigate(`/proyecto/${project?.name}`, {
                                            replace: true,
                                            state: { id: project?.id },
                                        });
                                    }}
                                >
                                    {project.name[0]}
                                </Avatar>
                                <Typography textOverflow={'ellipsis'} fontWeight={'bold'} noWrap maxWidth={64}>{project.name}</Typography>
                            </Paper>
                        ))}
                    </Stack>
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
            </Grid>

            { showCreatedUsers &&
                <>
                    <Divider sx={{ width: '100%' }} />

                    <Grid columns={12} sx={{ width: '100%', mt: 1 , pb: 20}}>
                        <Typography variant="h5" fontWeight="bold" mb={1}>
                            Usuarios creados
                            <Typography component="span" color="text.secondary">
                                {" "}({user?.createdUsers?.length || 0})
                            </Typography>
                        </Typography>

                        {user?.createdUsers?.length > 0 ? (
                            <Stack
                                direction="row"
                                rowGap={1}
                                columnGap={1}
                                flexWrap="wrap"
                                marginY={1}
                            >
                                {
                                    Array(1).fill(user?.createdUsers || []).flat().map((u, index) => (
                                        <Paper sx={{
                                            p: 1,
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                }}
                                            >
                                                <Avatar
                                                    title={`${u?.firstName} ${u?.lastName}`}
                                                    key={`${u?.id}-${index}`}
                                                    src={u?.image_url || null}
                                                    sx={{
                                                        width: 64,
                                                        height: 64,
                                                        borderRadius: 2,
                                                        boxShadow: (theme) =>
                                                            theme.palette.mode === 'light'
                                                                ? '0 0 0 1px rgba(0,0,0,0.3)'
                                                                : '0 0 0 1px rgba(255,255,255,0.3)',
                                                    }}
                                                >
                                                    {String(u.firstName[0]).toUpperCase()}{String(u.lastName[0]).toUpperCase()}
                                                </Avatar>

                                                {(() => {
                                                    const { RoleIcon } = getUserIcons(u);
                                                    return (
                                                        <RoleIcon
                                                            sx={{
                                                                position: 'absolute',
                                                                bottom: -10,
                                                                right: -10,
                                                                fontSize: 30,
                                                            }}
                                                        />
                                                    );
                                                })()}

                                            </Box>
                                            <Typography textOverflow={'ellipsis'} fontWeight={'bold'} noWrap maxWidth={64}>{u?.firstName} {u?.lastName}</Typography>
                                        </Paper>

                                    ))}
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
                                Este usuario no ha creado otros usuarios
                            </Typography>
                        )}
                    </Grid>
                </>}
            

            {user &&
                <EditProfileModal
                    userProfile={user}
                    open={modalEditProfileOpen}
                    onClose={() => setModalEditProfileOpen(false)}
                    panelHeight={headerHeight}
                    onUserChange={onChange}
                />
            }
        </Grid>
    );
};
