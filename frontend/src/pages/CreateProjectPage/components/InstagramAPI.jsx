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
} from "@mui/material";
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

export const InstagramApi = ({ panelHeight }) => {
    const { icon: InstagramIcon, label, color } = integrationsConfig.instagram;
    const theme = useTheme();
    const { headerHeight } = useHeaderHeight();
    const { loading, callEndpoint } = useFetchAndLoad();
    const [error, setError] = useState(false);

    const [pages, setPages] = useState([]);
    const [filteredPages, setFilteredPages] = useState([]);
    const [selectedPages, setSelectedPages] = useState([]);
    const [tooltipOpenId, setTooltipOpenId] = useState(null);

    const getInstagramPages = async () => {
        try {
            const pages = await callEndpoint(getInstagramPagesApi());
            setPages(pages);
            setFilteredPages(pages);
            setError(false);
        } catch (error) {
            setError(true);
        }
    };

    useEffect(() => {

    }, [filteredPages]);

    useEffect(() => {
        getInstagramPages();
    }, []);

    const handleTogglePage = (page) => {
        const alreadySelected = selectedPages.some((r) => r.id === page.id);
        if (alreadySelected) {
            setSelectedPages((prev) => prev.filter((r) => r.id !== page.id));
        } else {
            setSelectedPages((prev) => [...prev, page]);
        }
    };

    return (
        <Paper elevation={3} sx={{ height: `calc(100vh - ${headerHeight}px - ${panelHeight}px - 16px)`, justifyContent: 'space-between', display: 'flex', flexDirection: 'column', p: 0.5 }}>
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    justifyContent: "flex-start",
                    height: '10%',
                }}
            >
                <InstagramIcon sx={{ fontSize: 40, color }} />
                <Typography sx={{ fontSize: { md: "2rem", sm: "2rem", xs: "2rem" } }}>
                    {label}
                </Typography>
            </Box>

            {loading ? (
                <SpinnerLoading
                    text="Obteniendo las páginas de instagram..."
                    size={30}
                    sx={{ height: "90%" }}
                />
            ) : error ? (
                <ErrorScreen
                    sx={{ height: "90%" }}
                    message="Ocurrió un error al obtener las páginas de Instagram"
                    buttonText="Reintentar"
                    onButtonClick={() => getInstagramPages()}
                />
            ) : !pages || pages.length === 0 ? (
                <NoResultsScreen message="No tienes páginas de instagram en la organización" />
            ) : (
                <Box sx={{ minHeight: "90%", display: "flex", flexDirection: 'column', gap: 1, justifyContent: 'space-between' }}>
                    <Box sx={{ width: '100%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0 }}>
                        {selectedPages.length > 0 ? (
                            <Stack
                                direction="column"
                                gap={1}
                                flexDirection={'row'}
                                alignContent={'center'}
                                justifyContent={'center'}
                                alignItems={'center'}
                                sx={{
                                    maxHeight: '100%',
                                    overflowX: 'auto',
                                    "&::-webkit-scrollbar": {
                                        height: "2px",
                                    },
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
                                    pb: 1
                                }}
                            >
                                {selectedPages.map((page) => (
                                    <Chip
                                        key={page.id}
                                        label={page.name}
                                        onDelete={() => handleTogglePage(page)}
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))}
                            </Stack>
                        ) : (
                            <Typography align="center" variant="body1">Sin páginas seleccionadas</Typography>
                        )}
                    </Box>


                    <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Search */}
                        <SearchBar
                            data={pages}
                            fields={["name", "url"]}
                            placeholder="Buscar páginas..."
                            onResults={(results) => setFilteredPages(results)}
                        />

                        {
                            filteredPages.length === 0 ? (
                                <NoResultsScreen message="Búsqueda de páginas sin resultados" sx={{ minHeight: '100%' }} />
                            ) : (
                                <List
                                    sx={{
                                        overflowY: "auto",
                                        "&::-webkit-scrollbar": {
                                            width: "2px",
                                        },
                                        "&::-webkit-scrollbar-track": {
                                            backgroundColor: theme.palette.background.default,
                                            borderRadius: "8px",
                                        },
                                        "&::-webkit-scrollbar-thumb": {
                                            backgroundColor: theme.palette.primary.main,
                                            borderRadius: "8px",
                                        },
                                        "&::-webkit-scrollbar-thumb:hover": {
                                            backgroundColor: theme.palette.primary.dark,
                                        },
                                        minHeight: '100%',
                                        width: '100%',
                                        pb: 6
                                    }}>
                                    {filteredPages.map((page) => {
                                        const checked = selectedPages.some((r) => r.id === page.id);

                                        let timer;

                                        const handlePressStart = () => {
                                            timer = window.setTimeout(() => {
                                                window.open(page.url, "_blank");
                                            }, 2000);
                                        };

                                        const handlePressEnd = () => {
                                            clearTimeout(timer);
                                        };
                                        return (
                                            <Tooltip
                                                placement="top"
                                                open={tooltipOpenId === page.id}
                                                title={
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {page.name}
                                                        </Typography>
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            {page.url}
                                                        </Typography>
                                                        <Typography variant="caption" display="block" color="primary.main">
                                                            Presiona 2 segundos para abrir
                                                        </Typography>
                                                    </Box>
                                                }
                                            >
                                                <ListItemButton
                                                    key={page.id}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        setTooltipOpenId(page.id);
                                                        setTimeout(() => setTooltipOpenId(null), 3000);
                                                    }}
                                                    onMouseDown={handlePressStart}
                                                    onMouseUp={handlePressEnd}
                                                    onMouseLeave={handlePressEnd}
                                                    onTouchStart={handlePressStart}  
                                                    onTouchEnd={handlePressEnd}      
                                                    onTouchCancel={handlePressEnd}
                                                    onClick={() => handleTogglePage(page)}
                                                    sx={{ "&:hover": { backgroundColor: "action.hover" }, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', pr: 0 }}
                                                >
                                                    <ListItemIcon>
                                                        <Avatar src={page.image_url} alt={page.name}>
                                                            {page.name?.[0] || "?"}
                                                        </Avatar>
                                                    </ListItemIcon>

                                                    <ListItemText
                                                        primary={page.name}
                                                        secondary={page.url}
                                                        primaryTypographyProps={{
                                                            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                                                            fontWeight: 500,
                                                            noWrap: true, // equivalente a white-space: nowrap
                                                            sx: {
                                                                textOverflow: 'ellipsis',
                                                                overflow: 'hidden',
                                                            }
                                                        }}
                                                        secondaryTypographyProps={{
                                                            fontSize: "0.8rem",
                                                            color: "text.secondary",
                                                            noWrap: true, // equivalente a white-space: nowrap
                                                            sx: {
                                                                textOverflow: 'ellipsis',
                                                                overflow: 'hidden',
                                                            }
                                                        }}
                                                    />
                                                    <ListItemIcon sx={{ alignContent: 'center', justifyContent: 'center' }}>
                                                        <Checkbox
                                                            edge="end"
                                                            checked={checked}
                                                            tabIndex={-1}
                                                            disableRipple
                                                        />
                                                    </ListItemIcon>
                                                </ListItemButton>
                                            </Tooltip>
                                        );
                                    })}
                                </List>
                            )
                        }
                    </Card>
                </Box>
            )}
        </Paper>
    );
};
