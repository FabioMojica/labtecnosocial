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
import { IconButton } from "@mui/material";
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
import { getXAccountsApi } from "../../../api";

export const XApi = ({ panelHeight, selected = [], onChange }) => {
    const { icon: XIcon, label, color } = integrationsConfig.x;
    const theme = useTheme();
    const { headerHeight } = useHeaderHeight();
    const { loading, callEndpoint } = useFetchAndLoad();
    const [error, setError] = useState(false);
    const selectedAccounts = selected;

    const [accounts, setAccounts] = useState([]);
    const [filteredAccounts, setFilteredAccounts] = useState([]);

    const [tooltipContent, setTooltipContent] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    const getXAccounts = async () => {
        try {
            const accounts = await callEndpoint(getXAccountsApi());
            setAccounts(accounts);
            setFilteredAccounts(accounts);
            setError(false);
        } catch (error) {
            setError(true);
        }
    };

    useEffect(() => {
        getXAccounts();
    }, []);

    const handleToggleAccounts = (accounts) => {
        const alreadySelected = selectedAccounts.some((r) => r.id === accounts.id);

        let newSelected;
        if (alreadySelected) {
            newSelected = selectedAccounts.filter(r => r.id !== accounts.id);
        } else {
            newSelected = [...selectedAccounts, accounts];
        }

        onChange?.(newSelected);
    };

    const handleContextMenu = (e, accounts) => {
        e.preventDefault();
        setTooltipContent(
            <Box>
                <Typography variant="body2" fontWeight={500}>{accounts.name}</Typography>
                <Typography variant="caption" display="block" color="text.secondary">{accounts.url}</Typography>
                <Typography variant="caption" display="block" color="primary.main">Haz click en el icono para abrir</Typography>
            </Box>
        );
        setTooltipPosition({ top: e.clientY, left: e.clientX });

        setTimeout(() => {
            setTooltipContent(null);
        }, 3000);
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
                <XIcon sx={{ fontSize: 40, color }} />
                <Typography sx={{ fontSize: { md: "2rem", sm: "2rem", xs: "2rem" } }}>
                    {label}
                </Typography>
            </Box>

            {loading ? (
                <SpinnerLoading
                    text="Obteniendo las cuentas de X..."
                    size={30}
                    sx={{ height: "90%" }}
                />
            ) : error ? (
                <ErrorScreen
                    sx={{ height: "90%" }}
                    message="Ocurrió un error al obtener las cuentas de X"
                    buttonText="Reintentar"
                    onButtonClick={() => getXAccounts()}
                />
            ) : !accounts || accounts.length === 0 ? (
                <NoResultsScreen message="No tienes cuentas en X" />
            ) : (
                <Box sx={{ minHeight: "90%", display: "flex", flexDirection: 'column', gap: 1, justifyContent: 'space-between' }}>
                    <Box sx={{ width: '100%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0 }}>
                        {selectedAccounts.length > 0 ? (
                            <Stack
                                direction="column"
                                gap={1}
                                flexDirection={'row'}
                                alignContent={'center'}
                                justifyContent="flex-start"
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
                                {selectedAccounts.map((accounts) => (
                                    <Chip
                                        key={accounts.id}
                                        label={accounts.name}
                                        onDelete={() => handleToggleAccounts(accounts)}
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
                                Sin cuentas de X seleccionadas
                            </Typography>
                        )}
                    </Box>


                    <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Search */}
                        <SearchBar
                            data={accounts}
                            fields={["name", "url"]}
                            placeholder="Buscar cuenta..."
                            onResults={(results) => setFilteredAccounts(results)}
                        />
                        {
                            filteredAccounts.length === 0 ? (
                                <NoResultsScreen message="Búsqueda de cuentas sin resultados" sx={{ minHeight: '100%' }} />
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
                                    {filteredAccounts.map((account) => {
                                        const checked = selectedAccounts.some(r => r.id === account.id);

                                        const handleOpenAccounts = (e) => {
                                            e.stopPropagation();
                                            window.open(accounts.url, "_blank");
                                        };

                                        return (
                                            <ListItemButton
                                                key={account.id}
                                                onContextMenu={(e) => handleContextMenu(e, account)}
                                                onClick={() => handleToggleAccounts(account)}
                                                sx={{
                                                    "&:hover": { backgroundColor: "action.hover" },
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    pr: 0,
                                                    position: 'relative'
                                                }}
                                            >
                                                <IconButton
                                                    size="small"
                                                    onClick={handleOpenAccounts}
                                                    sx={{ position: 'absolute', top: -3, left: -3 }}
                                                >
                                                    <OpenInNewIcon sx={{ fontSize: '1rem' }} />
                                                </IconButton>

                                                <ListItemIcon>
                                                    <Avatar src={account.image_url} alt={account.name}>
                                                        {account.name?.[0] || "?"}
                                                    </Avatar>
                                                </ListItemIcon>

                                                <ListItemText
                                                    primary={account.name}
                                                    secondary={account.url}
                                                    primaryTypographyProps={{
                                                        fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                                                        fontWeight: 500,
                                                        noWrap: true,
                                                        sx: { textOverflow: 'ellipsis', overflow: 'hidden' }
                                                    }}
                                                    secondaryTypographyProps={{
                                                        fontSize: "0.8rem",
                                                        color: "text.secondary",
                                                        noWrap: true,
                                                        sx: { textOverflow: 'ellipsis', overflow: 'hidden' }
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
                            )
                        }
                    </Card>
                </Box>
            )}
        </Paper>
    );
};
