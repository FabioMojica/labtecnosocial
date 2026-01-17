import {
    Box,
    Card,
    List,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
    Typography,
    useTheme,
    Checkbox,
    Chip,
    ListItemButton,
    Tooltip,
    Avatar,
    IconButton,
} from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useEffect, useState } from "react";
import { useFetchAndLoad } from "../../../hooks";
import { integrationsConfig } from "../../../utils";
import {
    ErrorScreen,
    NoResultsScreen,
    SearchBar,
    SpinnerLoading,
} from "../../../generalComponents";
import { useHeaderHeight } from "../../../contexts";
import { getInstagramPagesApi } from "../../../api";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

export const InstagramApi = ({ panelHeight, selected = [], onChange }) => {
    const { icon: InstagramIcon, label, color } = integrationsConfig.instagram;
    const theme = useTheme();
    const { headerHeight } = useHeaderHeight();
    const { loading, callEndpoint } = useFetchAndLoad();
    const [error, setError] = useState(false);

    const [pages, setPages] = useState([]);
    const [filteredPages, setFilteredPages] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [tempSelected, setTempSelected] = useState(selected);
    const selectedPages = isEditing ? tempSelected : selected;

    // Tooltip global
    const [tooltipContent, setTooltipContent] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        setTempSelected(selected);
    }, [selected]);

    const handleEditToggle = () => {
        if (isEditing) {
            setTempSelected(selected);
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    };


    // Fetch pages
    const getInstagramPages = async () => {
        try {
            const pages = await callEndpoint(getInstagramPagesApi());
            setPages(pages);
            setFilteredPages(pages);
            setError(false);
        } catch (err) {
            setError(true);
        }
    };

    useEffect(() => {
        getInstagramPages();
    }, []);

    // const handleTogglePage = (page) => {
    //     const alreadySelected = selectedPages.some((r) => r.id === page.id);

    //     let newSelected;
    //     if (alreadySelected) {
    //         newSelected = selectedPages.filter(r => r.id !== page.id);
    //     } else {
    //         newSelected = [...selectedPages, page];
    //     }

    //     onChange?.(newSelected);
    // };

    const handleTogglePage = (page) => {
        const alreadySelected = selected.some(r => r.id === page.id);
        // Si ya está seleccionado, lo borramos; si no, lo seleccionamos
        onChange?.(alreadySelected ? [] : [page]);
    };

    // Tooltip en context menu
    const handleContextMenu = (e, page) => {
        e.preventDefault();
        setTooltipContent(
            <Box>
                <Typography variant="body2" fontWeight={500}>{page.name}</Typography>
                <Typography variant="caption" display="block" color="text.secondary">{page.url}</Typography>
                <Typography variant="caption" display="block" color="primary.main">Haz click en el icono para abrir</Typography>
            </Box>
        );
        setTooltipPosition({ top: e.clientY, left: e.clientX });

        setTimeout(() => setTooltipContent(null), 3000);
    };

    return (
        <Paper elevation={3} sx={{ height: `calc(100vh - ${headerHeight}px - ${panelHeight}px - 16px)`, display: 'flex', flexDirection: 'column', p: 0.5 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "space-between", height: '10%' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <InstagramIcon sx={{ fontSize: 40, color }} />
                    <Typography sx={{ fontSize: { md: "2rem", sm: "2rem", xs: "2rem" } }}>{label}</Typography>
                </Box>
                {/* NUEVO: Botón Edit/Close */}
                <Tooltip title={isEditing ? "Cancelar edición" : "Editar integración"} arrow>
                    <IconButton size="small" onClick={handleEditToggle}>
                        {isEditing ? <CloseIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>

            </Box>

            {loading ? (
                <SpinnerLoading text="Obteniendo las páginas de Instagram..." size={30} sx={{ height: "90%" }} />
            ) : error ? (
                <ErrorScreen
                    sx={{ height: "90%" }}
                    message="Ocurrió un error al obtener las páginas de Instagram"
                    buttonText="Reintentar"
                    onButtonClick={getInstagramPages}
                />
            ) : !pages || pages.length === 0 ? (
                <NoResultsScreen message="No tienes páginas de Instagram en la organización" />
            ) : (
                <Box sx={{ minHeight: "90%", display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'space-between' }}>
                    {/* Chips de seleccionadas */}
                    <Box sx={{ width: '100%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0 }}>
                        {selectedPages.length > 0 ? (
                            <Stack
                                direction="row"
                                gap={1}
                                alignItems="center"
                                justifyContent="flex-start"
                                sx={{
                                    maxHeight: '100%',
                                    overflowX: 'auto',
                                    "&::-webkit-scrollbar": { height: "2px" },
                                    "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
                                    "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
                                    "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                                    pb: 1
                                }}
                            >
                                {selectedPages.map(page => (
                                    <Chip
                                        disabled={!isEditing}
                                        key={page.id}
                                        label={page.name}
                                        onDelete={() => handleTogglePage(page)}
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))}
                            </Stack>
                        ) : (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                                sx={{
                                    padding: '4px',
                                    color: 'gray',
                                    fontStyle: 'italic',
                                    textAlign: 'center',
                                    fontSize: '0.9rem',
                                }}
                            >
                                Sin páginas seleccionadas
                            </Typography>
                        )}
                    </Box>

                    <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <SearchBar
                            data={pages}
                            fields={["name", "url"]}
                            placeholder="Buscar páginas..."
                            onResults={setFilteredPages}
                        />

                        {filteredPages.length === 0 ? (
                            <NoResultsScreen message="Búsqueda de páginas sin resultados" sx={{ minHeight: '100%' }} />
                        ) : (
                            <List sx={{
                                overflowY: "auto",
                                "&::-webkit-scrollbar": { width: "2px" },
                                "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "8px" },
                                "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "8px" },
                                "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                                minHeight: '100%',
                                width: '100%',
                                pb: 6
                            }}>
                                {filteredPages.map(page => {
                                    const checked = selectedPages.some(r => String(r.id) === String(page.id));

                                    const handleOpenPage = (e) => {
                                        e.stopPropagation();
                                        window.open(page.url, "_blank");
                                    };

                                    return (
                                        <ListItemButton
                                            disabled={!isEditing}
                                            key={page.id}
                                            onContextMenu={(e) => handleContextMenu(e, page)}
                                            onClick={() => handleTogglePage(page)}
                                            sx={{
                                                "&:hover": { backgroundColor: "action.hover" },
                                                display: 'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                pr: 0,
                                                position: 'relative'
                                            }}
                                        >
                                            <IconButton size="small" onClick={handleOpenPage} sx={{ position: 'absolute', top: -3, left: -3 }}>
                                                <OpenInNewIcon sx={{ fontSize: '1rem' }} />
                                            </IconButton>

                                            <ListItemIcon>
                                                <Avatar src={page.image_url} alt={page.name}>{page.name?.[0] || "?"}</Avatar>
                                            </ListItemIcon>

                                            <ListItemText
                                                primary={page.name}
                                                secondary={page.url}
                                                primaryTypographyProps={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" }, fontWeight: 500, noWrap: true, sx: { textOverflow: 'ellipsis', overflow: 'hidden' } }}
                                                secondaryTypographyProps={{ fontSize: "0.8rem", color: "text.secondary", noWrap: true, sx: { textOverflow: 'ellipsis', overflow: 'hidden' } }}
                                                sx={{
                                                    maxWidth: {
                                                        xs: 150,
                                                        sm: '100%'
                                                    }
                                                }}
                                            />

                                            <ListItemIcon sx={{ alignContent: 'center', justifyContent: 'center' }}>
                                                <Checkbox edge="end" checked={checked} tabIndex={-1} disableRipple />
                                            </ListItemIcon>
                                        </ListItemButton>
                                    );
                                })}

                                {/* Tooltip global */}
                                {tooltipContent && (
                                    <Tooltip
                                        open
                                        title={tooltipContent}
                                        PopperProps={{
                                            anchorEl: {
                                                getBoundingClientRect: () => ({
                                                    top: tooltipPosition.top,
                                                    left: tooltipPosition.left,
                                                    right: tooltipPosition.left,
                                                    bottom: tooltipPosition.top,
                                                    width: 0,
                                                    height: 0,
                                                }),
                                            },
                                        }}
                                        placement="top-start"
                                    >
                                        <span />
                                    </Tooltip>
                                )}
                            </List>
                        )}
                    </Card>
                </Box>
            )}
        </Paper>
    );
};
