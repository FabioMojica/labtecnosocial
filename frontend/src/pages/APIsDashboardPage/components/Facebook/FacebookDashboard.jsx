import { Avatar, Box, Grid, Icon, IconButton, Tab, Tabs, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useLayout } from "../../../../contexts/LayoutContext";
import { integrationsConfig, useDrawerClosedWidth } from "../../../../utils";
import { useEffect, useState } from "react";
import { useFetchAndLoad } from "../../../../hooks";
import { getFacebookPageInsights, getFacebookPagePosts } from "../../../../api";
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { useNotification } from "../../../../contexts";
import { formatForFollowersCard } from "./utils/cards/formatForFollowersCard";
import { formatForPageViewsCard } from "./utils/cards/formatForPageViewsCard";
import { 
    ChartFollowersByCountry,
    TopPostOfThePeriod,
    OrganicOrPaidViewsCard,
    TotalActionsCard,
    PostEngagementsCard,
    FollowersCard,
    TotalReactionsCard,
    PageImpressionsCard,
    PageViewsCard
}from "./components/index.js";
import { formatForFollowersByCountryCard } from "./utils/cards/formatForFollowersByCountryCard";
import { formatForOrganicOrPaidViewsCard } from "./utils/cards/formatForOrganicOrPaidViewsCard";
import { formatForTotalReactionsCard } from "./utils/cards/formatTotalReactionsCard";
import { formatForTotalActionsCard } from "./utils/cards/formatForTotalActionsCard";
import { useReport } from "../../../../contexts/ReportContext";
import { CHART_IDS_FACEBOOK } from "./utils/chartsIds";


export const FacebookDashboard = ({ project, useMock = true }) => {
    const { scrollbarWidth } = useLayout();
    const { loading, callEndpoint } = useFetchAndLoad();
    const [selectedPeriod, setSelectedPeriod] = useState('lastMonth');
    const periodLabel =
        selectedPeriod === 'today' ? 'Hoy' :
            selectedPeriod === 'lastWeek' ? 'Última semana' :
                selectedPeriod === 'lastMonth' ? 'Último mes' :
                    selectedPeriod === 'lastSixMonths' && 'Últimos seis meses';

    const { addChart, removeChart, selectedCharts } = useReport();

    const navBarWidth = useDrawerClosedWidth();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const theme = useTheme();
    const isLaptop = useMediaQuery(theme.breakpoints.up("md"));
    const { notify } = useNotification();
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [errorFetchData, setErrorFetchData] = useState(false);

    const [totalActionsData, setTotalActionsData] = useState({
        total: 0,
        delta: 0
    });

    const [postEngagementsData, setPostEngagementsData] = useState({
        total: 0,
        delta: 0
    });

    const [organicOrPaidViewsData, setOrganicOrPaidViewsData] = useState({
        chartData: [],
        dates: [],
        total: 0,
        delta: 0,
    });

    const [followersData, setFollowersData] = useState({
        chartData: [],
        dates: [],
        total: 0,
        delta: 0,
    });

    const [impressionsPageData, setImpressionsPageData] = useState({
        chartData: [],
        dates: [],
        total: 0,
        delta: 0,
    });

    const [viewsPageData, setViewsPageData] = useState({
        chartData: [],
        dates: [],
        total: 0,
        delta: 0,
    });

    const [totalReactionsOfPage, setTotalReactionsOfPage] = useState();

    const [countryFollowersData, setCountryFollowersData] = useState([]);

    const [topPostsData, setTopPostsData] = useState([]);

    const facebookIntegration = project?.integrations?.find(i => i.platform === 'facebook');


    const fetchFacebookPageData = async () => {
        try {
            //const resp = await callEndpoint(getFacebookPageOverview(facebookIntegration?.integration_id));
            setIsLoadingInsights(true);
            setErrorFetchData(false);

            const insights = await callEndpoint(getFacebookPageInsights(facebookIntegration?.integration_id, selectedPeriod));
            const posts = await callEndpoint(getFacebookPagePosts(facebookIntegration?.integration_id, selectedPeriod));
            setTopPostsData(posts);

            console.log("insights", insights);
            console.log("posts", posts);

            const followersInsight = insights.find(i => i.name === "page_follows");
            setFollowersData(formatForFollowersCard(followersInsight?.values, selectedPeriod));

            const pageImpressionsInsight = insights.find(i => i.name === "page_media_view");
            setImpressionsPageData(formatForPageViewsCard(pageImpressionsInsight?.values, selectedPeriod));
            setOrganicOrPaidViewsData(formatForOrganicOrPaidViewsCard(pageImpressionsInsight?.values, selectedPeriod));

            const pageViewsInsight = insights.find(i => i.name === "page_views_total");
            setViewsPageData(formatForPageViewsCard(pageViewsInsight?.values, selectedPeriod));

            const reactionsInsights = insights.filter(i => i.name.includes("page_actions_post_reactions"));
            const totalReactionsData = formatForTotalReactionsCard(reactionsInsights);
            setTotalReactionsOfPage(totalReactionsData);

            const followersCountryInsight = insights.find(i => i.name === "page_follows_country");
            const countryData = formatForFollowersByCountryCard(followersCountryInsight?.values, selectedPeriod);
            setCountryFollowersData(countryData);

            const totalActionsInsight = insights.find(i => i.name === "page_total_actions");
            const totalActions = formatForTotalActionsCard(totalActionsInsight?.values, selectedPeriod);
            setTotalActionsData(totalActions);

            const postEngagementsInsight = insights.find(i => i.name === "page_post_engagements");
            const postEngagements = formatForTotalActionsCard(postEngagementsInsight?.values, selectedPeriod);
            setPostEngagementsData(postEngagements);

            setErrorFetchData(false);

        } catch (err) {
            setErrorFetchData(true);
            notify(err?.message, "error");
        } finally {
            setIsLoadingInsights(false);
        }
    };

    useEffect(() => {
        fetchFacebookPageData();
    }, [selectedPeriod]);

    const integration = integrationsConfig["facebook"];
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
                                    Facebook
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
                                        // acción al hacer click, ejemplo abrir url
                                        window.open(facebookIntegration?.url, "_blank");
                                    }}
                                >
                                    <Avatar
                                        src={`https://graph.facebook.com/${facebookIntegration?.integration_id}/picture?type=square`}
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
                                        {String(facebookIntegration?.name[0]).toUpperCase()}
                                    </Avatar>

                                    <Typography fontWeight="bold" variant="subtitle2" noWrap>
                                        {facebookIntegration?.name}
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
                    <Tab value="today" label="Hoy" disabled={isLoadingInsights} />
                    <Tab value="lastWeek" label="Última semana" disabled={isLoadingInsights} />
                    <Tab value="lastMonth" label="Último mes" disabled={isLoadingInsights} />
                    <Tab value="lastSixMonths" label="Últimos seis meses" disabled={isLoadingInsights} />
                </Tabs>

                <Tooltip
                    title={isFullscreen ? "Minimizar" : "Maximizar"}
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
                <Grid container columns={12} spacing={1} sx={{ mb: 1 }}>
                    <Grid container spacing={1} columns={{ xs: 12, sm: 12 }} size={{ xs: 12, lg: 9 }}>
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                            <FollowersCard
                                error={errorFetchData}
                                title="Seguidores de la página"
                                loading={isLoadingInsights}
                                interval={periodLabel}
                                period={selectedPeriod}
                                followersData={followersData}
                                selected={selectedCharts.some(c => c.id === CHART_IDS_FACEBOOK.followersCard(selectedPeriod))}
                                onSelectChange={(checked) => {
                                    if (checked) {
                                        addChart({
                                            id: CHART_IDS_FACEBOOK.followersCard(selectedPeriod),
                                            selectedPeriod,
                                            periodLabel: periodLabel,
                                            platform: 'facebook',
                                            title: 'Seguidores de la página',
                                            data: followersData,
                                            interval: periodLabel,
                                        });
                                    } else {
                                        removeChart({ id: CHART_IDS_FACEBOOK.followersCard(selectedPeriod) });
                                    }
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                            <PageViewsCard
                                error={errorFetchData}
                                title="Visitas a la página"
                                loading={isLoadingInsights}
                                interval={periodLabel}
                                period={selectedPeriod}
                                viewsPageData={viewsPageData}
                                selected={selectedCharts.some(c => c.id === CHART_IDS_FACEBOOK.pageViewsCard(selectedPeriod))}
                                onSelectChange={(checked) => {
                                    if (checked) {
                                        addChart({
                                            id: CHART_IDS_FACEBOOK.pageViewsCard(selectedPeriod),
                                            selectedPeriod,
                                            periodLabel: periodLabel,
                                            platform: 'facebook',
                                            title: "Visitas a la página",
                                            data: viewsPageData,
                                            interval: periodLabel,
                                        });
                                    } else {
                                        removeChart({ id: CHART_IDS_FACEBOOK.pageViewsCard(selectedPeriod) });
                                    }
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                            <PageImpressionsCard
                                title="Page impressions"
                                error={errorFetchData}
                                loading={isLoadingInsights}
                                interval={periodLabel}
                                period={selectedPeriod}
                                impressionsPageData={impressionsPageData}
                                selected={selectedCharts.some(c => c.id === CHART_IDS_FACEBOOK.pageImpressionsCard(selectedPeriod))}
                                onSelectChange={(checked) => {
                                    if (checked) {
                                        addChart({
                                            id: CHART_IDS_FACEBOOK.pageImpressionsCard(selectedPeriod),
                                            selectedPeriod,
                                            periodLabel: periodLabel,
                                            platform: 'facebook',
                                            title: "Page impressions",
                                            data: impressionsPageData,
                                            interval: periodLabel,
                                        });
                                    } else {
                                        removeChart({ id: CHART_IDS_FACEBOOK.pageViewsCard(selectedPeriod) });
                                    }
                                }}
                            />
                        </Grid>


                        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                            <TotalActionsCard
                                error={errorFetchData}
                                title="Total actions"
                                loading={isLoadingInsights}
                                interval={periodLabel}
                                period={selectedPeriod}
                                totalActionsData={totalActionsData}
                                selected={selectedCharts.some(c => c.id === CHART_IDS_FACEBOOK.totalActionsCard(selectedPeriod))}
                                onSelectChange={(checked) => {
                                    if (checked) {
                                        addChart({
                                            id: CHART_IDS_FACEBOOK.totalActionsCard(selectedPeriod),
                                            selectedPeriod,
                                            title: "Total actions",
                                            periodLabel: periodLabel,
                                            platform: 'facebook',
                                            data: totalActionsData,
                                            interval: periodLabel,
                                        });
                                    } else {
                                        removeChart({ id: CHART_IDS_FACEBOOK.totalActionsCard(selectedPeriod) });
                                    }
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                            <PostEngagementsCard
                                error={errorFetchData}
                                title="Post engagements"
                                loading={isLoadingInsights}
                                interval={periodLabel}
                                period={selectedPeriod}
                                postEngagementsData={postEngagementsData}
                                selected={selectedCharts.some(c => c.id === CHART_IDS_FACEBOOK.postEngagementsCard(selectedPeriod))}
                                onSelectChange={(checked) => {
                                    if (checked) {
                                        addChart({
                                            id: CHART_IDS_FACEBOOK.postEngagementsCard(selectedPeriod),
                                            selectedPeriod,
                                            periodLabel: periodLabel,
                                            platform: 'facebook',
                                            title: "Post engagements",
                                            data: postEngagementsData,
                                            interval: periodLabel,
                                        });
                                    } else {
                                        removeChart({ id: CHART_IDS_FACEBOOK.postEngagementsCard(selectedPeriod) });
                                    }
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                            <TotalReactionsCard
                                error={errorFetchData}
                                title="Reacciones totales"
                                loading={isLoadingInsights}
                                interval={periodLabel}
                                period={selectedPeriod}
                                totalReactionsOfPage={totalReactionsOfPage}
                                selected={selectedCharts.some(c => c.id === CHART_IDS_FACEBOOK.totalReactionsCard(selectedPeriod))}
                                onSelectChange={(checked) => {
                                    if (checked) {
                                        addChart({
                                            id: CHART_IDS_FACEBOOK.totalReactionsCard(selectedPeriod),
                                            selectedPeriod,
                                            periodLabel: periodLabel,
                                            platform: 'facebook',
                                            title: "Reacciones totales",
                                            data: totalReactionsOfPage,
                                            interval: periodLabel,
                                        });
                                    } else {
                                        removeChart({ id: CHART_IDS_FACEBOOK.totalReactionsCard(selectedPeriod) });
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Grid container size={{ xs: 12, sm: 12, lg: 3 }}>
                        <OrganicOrPaidViewsCard
                            error={errorFetchData}
                            title="Page impressions orgánicas vs pagadas"
                            loading={isLoadingInsights}
                            interval={periodLabel}
                            period={selectedPeriod} 
                            organicOrPaidViewsData={organicOrPaidViewsData}
                            selected={selectedCharts.some(c => c.id === CHART_IDS_FACEBOOK.organicOrPaidViewsCard(selectedPeriod))}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart({
                                        id: CHART_IDS_FACEBOOK.organicOrPaidViewsCard(selectedPeriod),
                                        selectedPeriod,
                                        periodLabel: periodLabel,
                                        platform: 'facebook',
                                        title: "Page impressions orgánicas vs pagadas",
                                        data: organicOrPaidViewsData,
                                        interval: periodLabel,
                                    });
                                } else {
                                    removeChart({ id: CHART_IDS_FACEBOOK.organicOrPaidViewsCard(selectedPeriod) });
                                }
                            }}
                        />
                    </Grid>
                </Grid>

                <Grid container columns={12} spacing={1} size={{ xs: 12, sm: 12, lg: 6 }} sx={{ mb: 1 }}>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} >
                        <ChartFollowersByCountry
                            error={errorFetchData}
                            title="Seguidores por país"
                            loading={isLoadingInsights}
                            interval={periodLabel}
                            period={selectedPeriod}
                            countryFollowersData={countryFollowersData}
                            selected={selectedCharts.some(c => c.id === CHART_IDS_FACEBOOK.chartFollowersByCountry(selectedPeriod))}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart({
                                        id: CHART_IDS_FACEBOOK.chartFollowersByCountry(selectedPeriod),
                                        selectedPeriod,
                                        periodLabel: periodLabel,
                                        platform: 'facebook',
                                        title: "Seguidores por país",
                                        data: countryFollowersData,
                                        interval: periodLabel,
                                    });
                                } else {
                                    removeChart({ id: CHART_IDS_FACEBOOK.chartFollowersByCountry(selectedPeriod) });
                                }
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 9 }} >
                        <TopPostOfThePeriod
                            error={errorFetchData}
                            title="Top 5 posts populares"
                            loading={isLoadingInsights}
                            interval={periodLabel}
                            period={selectedPeriod}
                            topPostsData={topPostsData}
                            selected={selectedCharts.some(c => c.id === CHART_IDS_FACEBOOK.topPostOfThePeriod(selectedPeriod))}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart({
                                        id: CHART_IDS_FACEBOOK.topPostOfThePeriod(selectedPeriod),
                                        selectedPeriod,
                                        periodLabel: periodLabel,
                                        platform: 'facebook',
                                        title: "Top 5 posts populares",
                                        data: topPostsData,
                                        interval: periodLabel,
                                    });
                                } else {
                                    removeChart({ id: CHART_IDS_FACEBOOK.topPostOfThePeriod(selectedPeriod) });
                                }
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}