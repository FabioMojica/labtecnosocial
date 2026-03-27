import {
    Avatar,
    Box,
    Chip,
    Grid,
    IconButton,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useLayout } from "../../../../contexts/LayoutContext";
import { integrationsConfig, useDrawerClosedWidth } from "../../../../utils";
import { useEffect, useState } from "react";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { useFetchAndLoad } from "../../../../hooks";
import { getXOverview, getXTweets } from "../../../../api";
import { useNotification, useReport } from "../../../../contexts";
import FollowersCard from "./components/FollowersCard";
import TotalLikesCard from "./components/TotalLikesCard";
import TotalReactionsCard from "./components/TotalReactionsCard";
import PageViewsCard from "./components/PageViewsCard";
import RepliesCard from "./components/RepliesCard";
import QuotesCard from "./components/QuotesCard";
import ImpressionsCard from "./components/ImpressionsCard";
import BookmarksCard from "./components/BookmarksCard";
import ActivityRateCard from "./components/ActivityRateCard";
import { TopPostOfThePeriod } from "../Facebook/components/TopPostOfThePeriod";
import { formatNumber } from "../Facebook/utils/cards";
import { CHART_IDS_X } from "./utils/chartsIds";
import { generateMockXOverview, generateMockXTweets } from "./mock/mockXData";

const EMPTY_METRIC = {
    chartData: [],
    dates: [],
    total: 0,
    delta: 0,
};

export const XDashboard = ({ project, useMock = true, showingDialog = false }) => {
    const { scrollbarWidth } = useLayout();
    const { callEndpoint } = useFetchAndLoad();
    const { addChart, removeChart, selectedCharts } = useReport();
    const [selectedPeriod, setSelectedPeriod] = useState("lastMonth");
    const navBarWidth = useDrawerClosedWidth();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [errorFetchData, setErrorFetchData] = useState(false);
    const theme = useTheme();
    const isLaptop = useMediaQuery(theme.breakpoints.up("md"));
    const { notify } = useNotification();

    const [overviewData, setOverviewData] = useState(null);
    const [postsData, setPostsData] = useState(EMPTY_METRIC);
    const [likesData, setLikesData] = useState(EMPTY_METRIC);
    const [repostsData, setRepostsData] = useState(EMPTY_METRIC);
    const [repliesData, setRepliesData] = useState(EMPTY_METRIC);
    const [quotesData, setQuotesData] = useState(EMPTY_METRIC);
    const [impressionsData, setImpressionsData] = useState(EMPTY_METRIC);
    const [bookmarksData, setBookmarksData] = useState(EMPTY_METRIC);
    const [interactionsData, setInteractionsData] = useState({
        ...EMPTY_METRIC,
        likesTotal: 0,
        repostsTotal: 0,
        repliesTotal: 0,
        quotesTotal: 0,
        impressionsTotal: 0,
        bookmarksTotal: 0,
        topPosts: [],
    });

    const xIntegration = project?.integrations?.find((item) => item.platform === "x");
    const mockQueryValue =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("mock")
            : null;
    const shouldUseMock =
        mockQueryValue === null ? useMock : mockQueryValue.toLowerCase() === "true";

    const periodLabel =
        selectedPeriod === "today"
            ? "Hoy"
            : selectedPeriod === "lastWeek"
                ? "Ultima semana"
                : selectedPeriod === "lastMonth"
                    ? "Ultimo mes"
                    : "Ultimos seis meses";

    const fetchXData = async () => {
        try {
            setIsLoadingInsights(true);
            setErrorFetchData(false);

            const integrationId = xIntegration?.integration_id || "mock_x_account";
            const [overview, tweetsPayload] = shouldUseMock
                ? [generateMockXOverview(xIntegration), generateMockXTweets(xIntegration, selectedPeriod)]
                : await Promise.all([
                    callEndpoint(getXOverview(integrationId)),
                    callEndpoint(getXTweets(integrationId, selectedPeriod)),
                ]);

            const metrics = tweetsPayload?.metrics || {};
            const totals = tweetsPayload?.totals || {};

            setOverviewData(overview ?? null);
            setPostsData(metrics?.posts ?? EMPTY_METRIC);
            setLikesData(metrics?.likes ?? EMPTY_METRIC);
            setRepostsData(metrics?.reposts ?? EMPTY_METRIC);
            setRepliesData(metrics?.replies ?? EMPTY_METRIC);
            setQuotesData(metrics?.quotes ?? EMPTY_METRIC);
            setImpressionsData(metrics?.impressions ?? EMPTY_METRIC);
            setBookmarksData(metrics?.bookmarks ?? EMPTY_METRIC);
            setInteractionsData({
                ...(metrics?.interactions ?? EMPTY_METRIC),
                likesTotal: Number(totals?.likes ?? 0),
                repostsTotal: Number(totals?.reposts ?? 0),
                repliesTotal: Number(totals?.replies ?? 0),
                quotesTotal: Number(totals?.quotes ?? 0),
                impressionsTotal: Number(totals?.impressions ?? 0),
                bookmarksTotal: Number(totals?.bookmarks ?? 0),
                topPosts: Array.isArray(tweetsPayload?.topPosts) ? tweetsPayload.topPosts : [],
            });

            setErrorFetchData(false);
        } catch (err) {
            setErrorFetchData(true);
            notify(err?.message, "error");
        } finally {
            setIsLoadingInsights(false);
        }
    };

    useEffect(() => {
        if (!xIntegration?.integration_id) return;
        fetchXData();
    }, [selectedPeriod, xIntegration?.integration_id, shouldUseMock]);

    const integration = integrationsConfig["x"];
    const IntegrationIcon = integration.icon;
    const selectable = showingDialog;

    const activityHasData =
        (Array.isArray(interactionsData?.chartData) && interactionsData.chartData.length > 0) ||
        (Array.isArray(postsData?.chartData) && postsData.chartData.length > 0);

    const followerCount = Number(overviewData?.public_metrics?.followers_count ?? 0);
    const followingCount = Number(overviewData?.public_metrics?.following_count ?? 0);
    const tweetCount = Number(overviewData?.public_metrics?.tweet_count ?? 0);
    const listedCount = Number(overviewData?.public_metrics?.listed_count ?? 0);

    const buildChartPayload = (idName, title, data) => ({
        id_name: idName,
        integration_data: {
            project: {
                id: project?.id,
                name: project?.name,
            },
            integration: xIntegration,
        },
        period: selectedPeriod,
        periodLabel,
        title,
        data,
        interval: periodLabel,
    });

    const isChartSelected = (idName) => selectedCharts.some((chart) => chart.id_name === idName);

    const activityRateCardData = {
        interactionsTotal: Number(interactionsData?.total ?? 0),
        postsTotal: Number(postsData?.total ?? 0),
        hasData: activityHasData,
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                position: isFullscreen ? "fixed" : "relative",
                top: isFullscreen ? 0 : "auto",
                left: isFullscreen ? 0 : "auto",
                width: isFullscreen ? "100vw" : "100%",
                maxWidth: {
                    xs: "100vw",
                    lg: showingDialog
                        ? "100vw"
                        : isFullscreen
                            ? "100vw"
                            : `calc(100vw - ${navBarWidth} - ${scrollbarWidth}px - 16px)`,
                },
                height: isFullscreen ? "100vh" : "auto",
                bgcolor: (themeArg) => themeArg.palette.background.default,
                zIndex: isFullscreen ? 1500 : "auto",
                overflow: isFullscreen ? "hidden" : "visible",
                p: showingDialog ? 1 : 0,
            }}
        >
            <Box
                sx={{
                    position: isFullscreen ? "fixed" : "sticky",
                    top: 0,
                    left: 0,
                    zIndex: isFullscreen ? 1600 : 999,
                    bgcolor: "background.paper",
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    p: 1,
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    flexDirection: {
                        xs: "column",
                        md: "row",
                    },
                    gap: 1,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <Avatar
                        sx={{
                            bgcolor: integration.color,
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            boxShadow: (themeArg) =>
                                themeArg.palette.mode === "light"
                                    ? "0 0 0 1px rgba(0,0,0,0.3)"
                                    : "0 0 0 1px rgba(255,255,255,0.3)",
                        }}
                    >
                        <IntegrationIcon sx={{ color: "#fff", fontSize: 38 }} />
                    </Avatar>

                    <Box display="flex" flexDirection="column" gap={0.3}>
                        <Typography fontWeight="bold" variant="h5" noWrap>
                            X
                        </Typography>

                        <Box display="flex" alignItems="center" gap={0.8} flexWrap="wrap">
                            <Typography
                                fontWeight="bold"
                                variant="subtitle2"
                                sx={{
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                    color: "primary.main",
                                    "&:hover": { color: "primary.dark" },
                                }}
                                onClick={() => {
                                    if (xIntegration?.url) {
                                        window.open(xIntegration.url, "_blank");
                                    }
                                }}
                            >
                                {overviewData?.username || xIntegration?.name || "Cuenta de X"}
                            </Typography>

                            <Chip size="small" label={`Seguidores: ${formatNumber(followerCount)}`} />
                            <Chip size="small" label={`Siguiendo: ${formatNumber(followingCount)}`} />
                            <Chip size="small" label={`Tweets: ${formatNumber(tweetCount)}`} />
                            <Chip size="small" label={`Listas: ${formatNumber(listedCount)}`} />
                        </Box>
                    </Box>
                </Box>

                <Tabs
                    value={selectedPeriod}
                    onChange={(event, newValue) => setSelectedPeriod(newValue)}
                    variant="scrollable"
                    allowScrollButtonsMobile
                    sx={{ mr: { lg: 5 } }}
                >
                    <Tab value="today" label="Hoy" />
                    <Tab value="lastWeek" label="Ultima semana" />
                    <Tab value="lastMonth" label="Ultimo mes" />
                    <Tab value="lastSixMonths" label="Ultimos seis meses" />
                </Tabs>

                <Tooltip title={isFullscreen ? "Minimizar" : "Maximizar"}>
                    <IconButton
                        size="small"
                        onClick={() => setIsFullscreen((current) => !current)}
                        sx={{
                            transition: "transform 0.3s ease",
                            transform: isFullscreen ? "rotate(180deg)" : "rotate(0deg)",
                            position: "absolute",
                            top: { xs: 10, lg: 15 },
                            right: 10,
                        }}
                    >
                        {isFullscreen ? <CloseFullscreenIcon fontSize="small" /> : <FullscreenIcon fontSize="medium" />}
                    </IconButton>
                </Tooltip>
            </Box>

            <Box
                sx={{
                    mt: isFullscreen ? (isLaptop ? 10 : 17) : 1,
                    px: {
                        xs: 1,
                        lg: isFullscreen ? 1 : 0,
                    },
                    width: "100%",
                    height: "auto",
                    overflowY: isFullscreen ? "auto" : "visible",
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
                }}
            >
                <Grid container columns={12} spacing={1} sx={{ mb: 1 }}>
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <FollowersCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Publicaciones"
                            interval={periodLabel}
                            data={postsData}
                            selectable={selectable}
                            selected={isChartSelected(CHART_IDS_X.postsCard(selectedPeriod))}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_X.postsCard(selectedPeriod);
                                if (checked) {
                                    addChart(buildChartPayload(idName, "Publicaciones", postsData));
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <PageViewsCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Likes"
                            interval={periodLabel}
                            data={likesData}
                            selectable={selectable}
                            selected={isChartSelected(CHART_IDS_X.likesCard(selectedPeriod))}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_X.likesCard(selectedPeriod);
                                if (checked) {
                                    addChart(buildChartPayload(idName, "Likes", likesData));
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <TotalLikesCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Reposts"
                            interval={periodLabel}
                            data={repostsData}
                            selectable={selectable}
                            selected={isChartSelected(CHART_IDS_X.repostsCard(selectedPeriod))}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_X.repostsCard(selectedPeriod);
                                if (checked) {
                                    addChart(buildChartPayload(idName, "Reposts", repostsData));
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <RepliesCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Respuestas"
                            interval={periodLabel}
                            data={repliesData}
                            selectable={selectable}
                            selected={isChartSelected(CHART_IDS_X.repliesCard(selectedPeriod))}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_X.repliesCard(selectedPeriod);
                                if (checked) {
                                    addChart(buildChartPayload(idName, "Respuestas", repliesData));
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <QuotesCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Citas"
                            interval={periodLabel}
                            data={quotesData}
                            selectable={selectable}
                            selected={isChartSelected(CHART_IDS_X.quotesCard(selectedPeriod))}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_X.quotesCard(selectedPeriod);
                                if (checked) {
                                    addChart(buildChartPayload(idName, "Citas", quotesData));
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <ImpressionsCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Impresiones"
                            interval={periodLabel}
                            data={impressionsData}
                            selectable={selectable}
                            selected={isChartSelected(CHART_IDS_X.impressionsCard(selectedPeriod))}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_X.impressionsCard(selectedPeriod);
                                if (checked) {
                                    addChart(buildChartPayload(idName, "Impresiones", impressionsData));
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <BookmarksCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Guardados"
                            interval={periodLabel}
                            data={bookmarksData}
                            selectable={selectable}
                            selected={isChartSelected(CHART_IDS_X.bookmarksCard(selectedPeriod))}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_X.bookmarksCard(selectedPeriod);
                                if (checked) {
                                    addChart(buildChartPayload(idName, "Guardados", bookmarksData));
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <ActivityRateCard
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            interval={periodLabel}
                            data={activityRateCardData}
                            selectable={selectable}
                            selected={isChartSelected(CHART_IDS_X.activityRateCard(selectedPeriod))}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_X.activityRateCard(selectedPeriod);
                                if (checked) {
                                    addChart(buildChartPayload(idName, "Interacciones por post", activityRateCardData));
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TotalReactionsCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Interacciones totales"
                            interval={periodLabel}
                            data={interactionsData}
                            selectable={selectable}
                            selected={isChartSelected(CHART_IDS_X.interactionsCard(selectedPeriod))}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_X.interactionsCard(selectedPeriod);
                                if (checked) {
                                    addChart(buildChartPayload(idName, "Interacciones totales", interactionsData));
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TopPostOfThePeriod
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Top tweets de X"
                            interval={periodLabel}
                            data={interactionsData?.topPosts ?? []}
                            selectable={selectable}
                            selected={isChartSelected(CHART_IDS_X.topPostsCard(selectedPeriod))}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_X.topPostsCard(selectedPeriod);
                                if (checked) {
                                    addChart(buildChartPayload(idName, "Top tweets de X", interactionsData?.topPosts ?? []));
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};
