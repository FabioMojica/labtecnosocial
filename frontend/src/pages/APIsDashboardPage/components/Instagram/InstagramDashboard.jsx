import { Avatar, Box, Grid, Icon, IconButton, Tab, Tabs, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useLayout } from "../../../../contexts/LayoutContext";
import { integrationsConfig, useDrawerClosedWidth } from "../../../../utils";
import FollowersCard from "./components/FollowersCard";
import TotalLikesCard from "./components/TotalLikesCard";
import TotalReactionsCard from "./components/TotalReactionsCard";
import PageViewsCard from "./components/PageViewsCard";
import { useEffect, useState } from "react";
import { useFetchAndLoad } from "../../../../hooks";
import { getFacebookPageInsights, getFacebookPageOverview } from "../../../../api";

import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';


export const InstagramDashboard = ({ project, useMock = true }) => {
    const { scrollbarWidth } = useLayout();
    const { loading, callEndpoint } = useFetchAndLoad();
    const [selectedPeriod, setSelectedPeriod] = useState('lastMonth');
    const navBarWidth = useDrawerClosedWidth();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const theme = useTheme();
    const isLaptop = useMediaQuery(theme.breakpoints.up("md"));


    const instagramIntegration = project?.integrations?.find(i => i.platform === 'instagram');

    const fetchFacebookPageData = async () => {
        try {
            const resp = await callEndpoint(getFacebookPageOverview(instagramIntegration?.integration_id));
            const insights = await callEndpoint(getFacebookPageInsights(instagramIntegration?.integration_id, "today"));

            console.log("hola", resp);
            console.log("insights", insights);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchFacebookPageData();
    }, []);

    const integration = integrationsConfig["instagram"];
    const IntegrationIcon = integration.icon;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                position: isFullscreen ? 'fixed' : 'relative',
                top: isFullscreen ? 0 : 'auto',
                left: isFullscreen ? 0 : 'auto',
                width: isFullscreen ? '100vw' : '100%',
                maxWidth: {
                    xs: '100vw',
                    lg: isFullscreen ? '100vw' : `calc(100vw - ${navBarWidth} - ${scrollbarWidth}px - 16px)`
                },
                height: isFullscreen ? '100vh' : 'auto',
                bgcolor: (theme) => theme.palette.background.default,
                zIndex: isFullscreen ? 1500 : 'auto',
                overflow: isFullscreen ? 'hidden' : 'visible',
            }}
        >
            <Box
                sx={{
                    position: isFullscreen ? 'fixed' : 'sticky',
                    top: 0,
                    left: 0,
                    zIndex: isFullscreen ? 1600 : 999,
                    bgcolor: 'background.paper',
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    p: 1,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexDirection: {
                        xs: 'column',
                        md: 'row',
                    },
                    gap: 1
                }}
            >
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: {
                        xs: 'column',
                        sm: 'row',
                        md: 'row',
                        lg: 'row'
                    },
                    gap: 1,

                }}>
                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        justifyContent: {
                            xs: 'space-between',
                            sm: 'left'
                        },
                        width: '100%',
                        alignItems: 'center'
                    }}>
                        <Box display={'flex'} alignItems={'center'} gap={1}>
                            <Avatar
                                sx={{
                                    bgcolor: integration.color,
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    boxShadow: (theme) =>
                                        theme.palette.mode === 'light'
                                            ? '0 0 0 1px rgba(0,0,0,0.3)'
                                            : '0 0 0 1px rgba(255,255,255,0.3)',
                                }}
                            >
                                <IntegrationIcon sx={{ color: "#fff", fontSize: 38 }} />
                            </Avatar>
                            <Box display={'flex'} flexDirection={'column'}>
                                <Typography fontWeight="bold" variant="h5" noWrap>
                                    Instagram
                                </Typography>
                                <Box
                                    display="flex"
                                    gap={1}
                                    alignItems="center"
                                    sx={{
                                        cursor: "pointer",
                                        textDecoration: "underline",
                                        color: "primary.main",
                                        "&:hover": {
                                            color: "primary.dark",
                                        },
                                    }}
                                    onClick={() => {
                                        window.open(instagramIntegration?.url, "_blank");
                                    }}
                                >
                                    <Avatar
                                        //src={`https://graph.facebook.com/${instagramIntegration?.integration_id}/picture?type=square`}
                                        sx={{
                                            bgcolor: integration.color,
                                            width: 15,
                                            height: 15,
                                            borderRadius: 1,
                                            boxShadow: (theme) =>
                                                theme.palette.mode === "light"
                                                    ? "0 0 0 1px rgba(0,0,0,0.3)"
                                                    : "0 0 0 1px rgba(255,255,255,0.3)",
                                        }}
                                    >
                                        {String(instagramIntegration?.name[0]).toUpperCase()}
                                    </Avatar>

                                    <Typography fontWeight="bold" variant="subtitle2" noWrap>
                                        {instagramIntegration?.name}
                                    </Typography>
                                </Box>

                            </Box>
                        </Box>
                    </Box>

                </Box>

                <Tabs
                    value={selectedPeriod}
                    onChange={(event, newValue) => setSelectedPeriod(newValue)}
                    variant='scrollable'
                    allowScrollButtonsMobile
                    sx={{
                        mr: {
                            lg: 5
                        }
                    }}
                    aria-label="secondary tabs example"
                >
                    <Tab value="today" label="Hoy" />
                    <Tab value="lastWeek" label="Última semana" />
                    <Tab value="lastMonth" label="Último mes" />
                    <Tab value="lastSixMonths" label="Últimos seis meses" />
                    <Tab value="all" label="Todo" />
                </Tabs>

                <Tooltip
                    title={isFullscreen ? "Minimizar" : "Maximizar"}
                    onOpen={() => setTooltipOpen(true)}
                    onClose={() => setTooltipOpen(false)}
                >
                    <IconButton
                        size="small"
                        onClick={() => {
                            setIsFullscreen(!isFullscreen);
                            setTooltipOpen(false);
                        }}
                        sx={{
                            transition: 'transform 0.3s ease',
                            transform: isFullscreen ? 'rotate(180deg)' : 'rotate(0deg)',
                            position: 'absolute',
                            top: {
                                xs: 10,
                                lg: 15
                            },
                            right: 10
                        }}
                    >
                        {isFullscreen ? <CloseFullscreenIcon fontSize="small" /> : <FullscreenIcon fontSize="medium" />}
                    </IconButton>
                </Tooltip>
            </Box>

            <Box sx={{
                mt: isFullscreen ? isLaptop ? 10 : 17 : 1,
                px: {
                    xs: 1,
                    lg: isFullscreen ? 1 : 0,
                },
                width: '100%',
                height: 'auto',
                overflowY: isFullscreen ? 'auto' : 'visible',
                "&::-webkit-scrollbar": { height: "2px", width: "2px" },
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
            }}>
                <Grid container columns={12} spacing={1} size={{ xs: 12, sm: 12, lg: 6 }} sx={{ mb: 1 }}>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <FollowersCard />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <TotalLikesCard />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <TotalReactionsCard />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <PageViewsCard />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}