import {
    Avatar,
    Box,
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
import { useEffect, useRef, useState } from "react";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { useFetchAndLoad } from "../../../../hooks";
import { getInstagramInsights, getInstagramMedia, getInstagramOverview } from "../../../../api";
import { useNotification, useReport } from "../../../../contexts";
import PageViewsCard from "./components/PageViewsCard";
import ProfileViewsCard from "./components/ProfileViewsCard";
import EngagedAccountsCard from "./components/EngagedAccountsCard";
import EngagementRateCard from "./components/EngagementRateCard";
import ContentTypePerformanceCard from "./components/ContentTypePerformanceCard";
import InteractionsBreakdownCard from "./components/InteractionsBreakdownCard";
import ProfileConversionFunnelCard from "./components/ProfileConversionFunnelCard";
import TopInstagramPostsOfThePeriod from "./components/TopInstagramPostsOfThePeriod";
import {
    formatInstagramContentTypeCard,
    formatInstagramEngagementRateCard,
    formatInstagramInteractionBreakdownCard,
    formatInstagramProfileConversionFunnelCard,
    formatInstagramMetricCard,
} from "./utils/cards";
import { CHART_IDS_INSTAGRAM } from "./utils/chartsIds";
import {
    generateMockInstagramInsights,
    generateMockInstagramMedia,
    generateMockInstagramOverview,
} from "./mock/mockInstagramData";

const EMPTY_METRIC = {
    chartData: [],
    dates: [],
    total: 0,
    delta: 0,
};

export const InstagramDashboard = ({ project, useMock = false, showingDialog = false }) => {
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
    const [reachData, setReachData] = useState(EMPTY_METRIC);
    const [engagedAccountsData, setEngagedAccountsData] = useState(EMPTY_METRIC);
    const [profileViewsData, setProfileViewsData] = useState(EMPTY_METRIC);
    const [engagementRateData, setEngagementRateData] = useState({
        total: 0,
        interactionsTotal: 0,
        reachTotal: 0,
        hasData: false,
    });
    const [contentTypePerformanceData, setContentTypePerformanceData] = useState(EMPTY_METRIC);
    const [interactionsBreakdownData, setInteractionsBreakdownData] = useState(EMPTY_METRIC);
    const [profileConversionFunnelData, setProfileConversionFunnelData] = useState(EMPTY_METRIC);
    const [topPostsData, setTopPostsData] = useState([]);
    const callEndpointRef = useRef(callEndpoint);
    const notifyRef = useRef(notify);
    const mockQueryValue =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("mock")
            : null;
    const shouldUseMock =
        mockQueryValue === null ? useMock : mockQueryValue.toLowerCase() === "true";

    const instagramIntegration = project?.integrations?.find((item) => item.platform === "instagram");

    useEffect(() => {
        callEndpointRef.current = callEndpoint;
    }, [callEndpoint]);

    useEffect(() => {
        notifyRef.current = notify;
    }, [notify]);

    const periodLabel =
        selectedPeriod === "today"
            ? "Hoy"
            : selectedPeriod === "lastWeek"
                ? "Última semana"
                : selectedPeriod === "lastMonth"
                    ? "Último mes"
                    : "Últimos seis meses";

    useEffect(() => {
        const integrationId = instagramIntegration?.integration_id;
        if (!integrationId) return;

        let active = true;

        const fetchInstagramData = async () => {
            try {
                setIsLoadingInsights(true);
                setErrorFetchData(false);

                const [overview, insights, mediaPayload] = shouldUseMock
                    ? [
                        generateMockInstagramOverview(instagramIntegration),
                        generateMockInstagramInsights(integrationId, selectedPeriod),
                        generateMockInstagramMedia(integrationId, selectedPeriod),
                    ]
                    : await Promise.all([
                        callEndpointRef.current(getInstagramOverview(integrationId)),
                        callEndpointRef.current(getInstagramInsights(integrationId, selectedPeriod)),
                        callEndpointRef.current(getInstagramMedia(integrationId, selectedPeriod)),
                    ]);

                if (!active) return;

                setOverviewData(overview ?? null);
                setReachData(formatInstagramMetricCard(insights, "reach", selectedPeriod));
                setEngagedAccountsData(formatInstagramMetricCard(insights, "accounts_engaged", selectedPeriod));
                setProfileViewsData(formatInstagramMetricCard(insights, "profile_views", selectedPeriod));
                setEngagementRateData(formatInstagramEngagementRateCard(insights, selectedPeriod));
                setContentTypePerformanceData(formatInstagramContentTypeCard(mediaPayload));
                setInteractionsBreakdownData(formatInstagramInteractionBreakdownCard(insights, selectedPeriod));
                setProfileConversionFunnelData(formatInstagramProfileConversionFunnelCard(insights, selectedPeriod));
                setTopPostsData(Array.isArray(mediaPayload?.topPosts) ? mediaPayload.topPosts : []);
                setErrorFetchData(false);
            } catch (err) {
                if (!active) return;
                setErrorFetchData(true);
                notifyRef.current(err?.message, "error");
            } finally {
                if (active) {
                    setIsLoadingInsights(false);
                }
            }
        };

        fetchInstagramData();

        return () => {
            active = false;
        };
    }, [selectedPeriod, instagramIntegration?.integration_id, shouldUseMock]);

    const integration = integrationsConfig["instagram"];
    const IntegrationIcon = integration.icon;
    const instagramName = instagramIntegration?.name || "Cuenta de Instagram";
    const instagramInitial = String(instagramName?.[0] ?? "I").toUpperCase();
    const hasInstagramUrl = Boolean(instagramIntegration?.url);
    const openInstagramProfile = () => {
        if (!hasInstagramUrl) return;
        window.open(instagramIntegration?.url, "_blank", "noopener,noreferrer");
    };
    const selectable = showingDialog;
    const buildChartPayload = (idName, title, data) => ({
        id_name: idName,
        integration_data: {
            project: {
                id: project?.id,
                name: project?.name,
            },
            integration: instagramIntegration,
        },
        period: selectedPeriod,
        periodLabel,
        title,
        data,
        interval: periodLabel,
    });

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
                    borderTopLeftRadius: !showingDialog ? 5 : 0,
                    borderTopRightRadius: !showingDialog ? 5 : 0,
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
                <Box
                    sx={{
                        display: "flex",
                        alignItems: {
                            xs: "flex-start",
                            sm: "center",
                        },
                        gap: 1.2,
                        pr: {
                            xs: 4,
                            md: 0,
                        },
                    }}
                >
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

                    <Box
                        sx={{
                            minWidth: 0,
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.35,
                        }}
                    >
                        <Typography fontWeight="bold" variant="h5" noWrap>
                            Instagram
                        </Typography>

                        <Box
                            display="flex"
                            gap={0.8}
                            alignItems="center"
                            sx={{
                                width: "fit-content",
                                maxWidth: "100%",
                                cursor: hasInstagramUrl ? "pointer" : "default",
                                color: "primary.main",
                                textDecoration: hasInstagramUrl ? "underline" : "none",
                                "&:hover": hasInstagramUrl
                                    ? {
                                        color: "primary.dark",
                                    }
                                    : undefined,
                            }}
                            onClick={() => {
                                openInstagramProfile();
                            }}
                        >
                            <Avatar
                                src={
                                    overviewData?.profile_picture_url ||
                                    `https://graph.facebook.com/${instagramIntegration?.integration_id}/picture?type=square`
                                }
                                sx={{
                                    bgcolor: integration.color,
                                    width: 16,
                                    height: 16,
                                    borderRadius: 1,
                                    boxShadow: (theme) =>
                                        theme.palette.mode === "light"
                                            ? "0 0 0 1px rgba(0,0,0,0.3)"
                                            : "0 0 0 1px rgba(255,255,255,0.3)",
                                }}
                            >
                                {instagramInitial}
                            </Avatar>
                            <Typography
                                fontWeight="bold"
                                variant="subtitle2"
                                sx={{
                                    cursor: hasInstagramUrl ? "pointer" : "default",
                                    textDecoration: hasInstagramUrl ? "underline" : "none",
                                    color: "primary.main",
                                    maxWidth: {
                                        xs: "calc(100vw - 180px)",
                                        sm: 260,
                                        md: 320,
                                    },
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    "&:hover": hasInstagramUrl ? { color: "primary.dark" } : undefined,
                                }}
                                onClick={() => {
                                    openInstagramProfile();
                                }}
                            >
                                {instagramName}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box display={'flex'} height={'100%'} alignItems={'center'}>
                    <Tabs
                        value={selectedPeriod}
                        onChange={(event, newValue) => setSelectedPeriod(newValue)}
                        variant="scrollable"
                        allowScrollButtonsMobile
                        sx={{
                            width: {
                                xs: "100%",
                                md: "auto",
                            },
                            mr: {
                                lg: !showingDialog ? 5 : 0,
                            },
                        }}
                    >
                        <Tab value="today" label="Hoy" disabled={isLoadingInsights} />
                        <Tab value="lastWeek" label="Última semana" disabled={isLoadingInsights} />
                        <Tab value="lastMonth" label="Último mes" disabled={isLoadingInsights} />
                        <Tab value="lastSixMonths" label="Últimos seis meses" disabled={isLoadingInsights} />
                    </Tabs>
                </Box>

                {!showingDialog && (
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
                )}
            </Box>

            <Box
                sx={{
                    mt: isFullscreen ? (isLaptop ? 10 : 20) : 1,
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
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <PageViewsCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Alcance"
                            interval={periodLabel}
                            data={reachData}
                            selected={selectedCharts.some(
                                (c) => c.id_name === CHART_IDS_INSTAGRAM.reachCard(selectedPeriod)
                            )}
                            selectable={selectable}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_INSTAGRAM.reachCard(selectedPeriod);
                                if (checked) {
                                    addChart(buildChartPayload(idName, "Alcance", reachData));
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <EngagedAccountsCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Cuentas con interacción"
                            interval={periodLabel}
                            data={engagedAccountsData}
                            selected={selectedCharts.some(
                                (c) => c.id_name === CHART_IDS_INSTAGRAM.engagedAccountsCard(selectedPeriod)
                            )}
                            selectable={selectable}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_INSTAGRAM.engagedAccountsCard(selectedPeriod);
                                if (checked) {
                                    addChart(buildChartPayload(idName, "Cuentas con interacción", engagedAccountsData));
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <ProfileViewsCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Visitas al perfil"
                            interval={periodLabel}
                            data={profileViewsData}
                            selected={selectedCharts.some(
                                (c) => c.id_name === CHART_IDS_INSTAGRAM.profileViewsCard(selectedPeriod)
                            )}
                            selectable={selectable}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_INSTAGRAM.profileViewsCard(selectedPeriod);
                                if (checked) {
                                    addChart(buildChartPayload(idName, "Visitas al perfil", profileViewsData));
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <EngagementRateCard
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Tasa de engagement"
                            interval={periodLabel}
                            data={engagementRateData}
                            selected={selectedCharts.some(
                                (c) => c.id_name === CHART_IDS_INSTAGRAM.engagementRateCard(selectedPeriod)
                            )}
                            selectable={selectable}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_INSTAGRAM.engagementRateCard(selectedPeriod);
                                if (checked) {
                                    addChart(buildChartPayload(idName, "Tasa de engagement", engagementRateData));
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, lg: 4 }}>
                        <ContentTypePerformanceCard
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Rendimiento por formato"
                            interval={periodLabel}
                            data={contentTypePerformanceData}
                            selected={selectedCharts.some(
                                (c) => c.id_name === CHART_IDS_INSTAGRAM.contentTypePerformanceCard(selectedPeriod)
                            )}
                            selectable={selectable}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_INSTAGRAM.contentTypePerformanceCard(selectedPeriod);
                                if (checked) {
                                    addChart(
                                        buildChartPayload(idName, "Rendimiento por formato", contentTypePerformanceData)
                                    );
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, lg: 4 }}>
                        <InteractionsBreakdownCard
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Desglose de interacciones"
                            interval={periodLabel}
                            data={interactionsBreakdownData}
                            selected={selectedCharts.some(
                                (c) => c.id_name === CHART_IDS_INSTAGRAM.interactionsBreakdownCard(selectedPeriod)
                            )}
                            selectable={selectable}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_INSTAGRAM.interactionsBreakdownCard(selectedPeriod);
                                if (checked) {
                                    addChart(
                                        buildChartPayload(idName, "Desglose de interacciones", interactionsBreakdownData)
                                    );
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, lg: 4 }}>
                        <ProfileConversionFunnelCard
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Embudo de conversión"
                            interval={periodLabel}
                            data={profileConversionFunnelData}
                            selected={selectedCharts.some(
                                (c) => c.id_name === CHART_IDS_INSTAGRAM.profileConversionFunnelCard(selectedPeriod)
                            )}
                            selectable={selectable}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_INSTAGRAM.profileConversionFunnelCard(selectedPeriod);
                                if (checked) {
                                    addChart(
                                        buildChartPayload(idName, "Embudo de conversión", profileConversionFunnelData)
                                    );
                                } else {
                                    removeChart({ id_name: idName });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TopInstagramPostsOfThePeriod
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Top publicaciones de Instagram"
                            interval={periodLabel}
                            data={topPostsData}
                            selected={selectedCharts.some(
                                (c) => c.id_name === CHART_IDS_INSTAGRAM.topPostsCard(selectedPeriod)
                            )}
                            selectable={selectable}
                            onSelectChange={(checked) => {
                                const idName = CHART_IDS_INSTAGRAM.topPostsCard(selectedPeriod);
                                if (checked) {
                                    addChart(
                                        buildChartPayload(
                                            idName,
                                            "Top publicaciones de Instagram",
                                            topPostsData
                                        )
                                    );
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
