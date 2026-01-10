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
import { getGitHubRepositoriesApi } from "../../../api";

export const GithubApi = ({ panelHeight, selected = [], onChange }) => {
    const { icon: GitHubIcon, label, color } = integrationsConfig.github;
    const theme = useTheme();
    const { headerHeight } = useHeaderHeight();
    const { loading, callEndpoint } = useFetchAndLoad();
    const [error, setError] = useState(false);
    const selectedRepos = selected;

    const [repos, setRepos] = useState([]);
    const [filteredRepos, setFilteredRepos] = useState([]);

    const [tooltipContent, setTooltipContent] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    const getGitHubRepositories = async () => {
        try {
            const repos = await callEndpoint(getGitHubRepositoriesApi());
            setRepos(repos);
            setFilteredRepos(repos);
            setError(false);
        } catch (error) {
            setError(true);
        }
    };

    useEffect(() => {
        getGitHubRepositories();
    }, []);

    const handleToggleRepo = (repo) => {
        const alreadySelected = selectedRepos.some((r) => r.id === repo.id);

        let newSelected;
        if (alreadySelected) {
            newSelected = selectedRepos.filter(r => r.id !== repo.id);
        } else {
            newSelected = [...selectedRepos, repo];
        }

        onChange?.(newSelected);
    };

    const handleContextMenu = (e, repo) => {
        e.preventDefault();
        setTooltipContent(
            <Box>
                <Typography variant="body2" fontWeight={500}>{repo.name}</Typography>
                <Typography variant="caption" display="block" color="text.secondary">{repo.url}</Typography>
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
                <GitHubIcon sx={{ fontSize: 40, color }} />
                <Typography sx={{ fontSize: { md: "2rem", sm: "2rem", xs: "2rem" } }}>
                    {label}
                </Typography>
            </Box>

            {loading ? (
                <SpinnerLoading
                    text="Obteniendo los repositorios de github..."
                    size={30}
                    sx={{ height: "90%" }}
                />
            ) : error ? (
                <ErrorScreen
                    sx={{ height: "90%" }}
                    message="Ocurrió un error al obtener los repositorios de GitHub"
                    buttonText="Reintentar"
                    onButtonClick={() => getGitHubRepositories()}
                />
            ) : !repos || repos.length === 0 ? (
                <NoResultsScreen message="No tienes repositorios en la organización" />
            ) : (
                <Box sx={{ minHeight: "90%", display: "flex", flexDirection: 'column', gap: 1, justifyContent: 'space-between' }}>
                    <Box sx={{ width: '100%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0 }}>
                        {selectedRepos.length > 0 ? (
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
                                {selectedRepos.map((repo) => (
                                    <Chip
                                        key={repo.id}
                                        label={repo.name}
                                        onDelete={() => handleToggleRepo(repo)}
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
                                Sin repositorios seleccionados
                            </Typography>
                        )}
                    </Box>


                    <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Search */}
                        <SearchBar
                            data={repos}
                            fields={["name", "url"]}
                            placeholder="Buscar repositorio..."
                            onResults={(results) => setFilteredRepos(results)}
                        />
                        {
                            filteredRepos.length === 0 ? (
                                <NoResultsScreen message="Búsqueda de repositorios sin resultados" sx={{ minHeight: '100%' }} />
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
                                    {filteredRepos.map((repo) => {
                                        const checked = selectedRepos.some(r => r.id === repo.id);

                                        const handleOpenRepo = (e) => {
                                            e.stopPropagation();
                                            window.open(repo.url, "_blank");
                                        };

                                        return (
                                            <ListItemButton
                                                key={repo.id}
                                                onContextMenu={(e) => handleContextMenu(e, repo)}
                                                onClick={() => handleToggleRepo(repo)}
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
                                                    onClick={handleOpenRepo}
                                                    sx={{ position: 'absolute', top: -3, left: -3 }}
                                                >
                                                    <OpenInNewIcon sx={{ fontSize: '1rem' }} />
                                                </IconButton>

                                                <ListItemIcon>
                                                    <Avatar src={repo.image_url} alt={repo.name}>
                                                        {repo.name?.[0] || "?"}
                                                    </Avatar>
                                                </ListItemIcon>

                                                <ListItemText
                                                    primary={repo.name}
                                                    secondary={repo.url}
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
                                                    sx={{
                                                        maxWidth: {
                                                            xs: 150,
                                                            sm: '100%'
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
