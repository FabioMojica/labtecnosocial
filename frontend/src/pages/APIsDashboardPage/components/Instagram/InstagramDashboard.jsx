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
import { useEffect, useRef, useState } from "react";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { useFetchAndLoad } from "../../../../hooks";
import { getInstagramInsights, getInstagramMedia, getInstagramOverview } from "../../../../api";
import { useNotification } from "../../../../contexts";
import FollowersCard from "./components/FollowersCard";
import PageViewsCard from "./components/PageViewsCard";
import TotalLikesCard from "./components/TotalLikesCard";
import TotalReactionsCard from "./components/TotalReactionsCard";
import MetricSparkCard from "./components/MetricSparkCard";
import { TopPostOfThePeriod } from "../Facebook/components/TopPostOfThePeriod";
import { DashboardCard } from "../Facebook/components/DashboardCard";
import { formatNumber } from "../Facebook/utils/cards";
import {
    formatInstagramFollowersCard,
    formatInstagramInteractionsCard,
    formatInstagramMetricCard,
} from "./utils/cards";

const EMPTY_METRIC = {
    chartData: [],
    dates: [],
    total: 0,
    delta: 0,
};

function EngagementRateCard({ loading, error, interval, interactionsTotal, reachTotal, hasData }) {
    const engagementRate = reachTotal > 0 ? (interactionsTotal / reachTotal) * 100 : 0;

    return (
        <DashboardCard
            title="Tasa de engagement"
            titleSpinner="Obteniendo tasa de engagement de Instagram..."
            titleError="Ocurrio un error al obtener la tasa de engagement"
            sxSpinner={{
                fontSize: "0.9rem",
                pt: 3.5,
            }}
            interval={interval}
            loading={loading}
            error={error}
            isEmpty={!hasData}
            smallCard
            selectable={false}
            selected={false}
        >
            <Box
                sx={{
                    mt: 3.2,
                    minHeight: 92,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 0.45,
                }}
            >
                <Typography variant="h3" fontWeight={500} lineHeight={1}>
                    {engagementRate.toLocaleString("es-BO", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                    })}
                    %
                </Typography>
                <Typography variant="caption" color="text.secondary" lineHeight={1}>
                    Interacciones / Alcance
                </Typography>
                <Typography variant="caption" color="text.secondary" lineHeight={1} textAlign="center">
                    {formatNumber(interactionsTotal)} interacciones sobre {formatNumber(reachTotal)} de alcance
                </Typography>
            </Box>
        </DashboardCard>
    );
}

export const InstagramDashboard = ({ project, showingDialog = false }) => {
    const { scrollbarWidth } = useLayout();
    const { callEndpoint } = useFetchAndLoad();
    const [selectedPeriod, setSelectedPeriod] = useState("lastMonth");
    const navBarWidth = useDrawerClosedWidth();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [errorFetchData, setErrorFetchData] = useState(false);
    const theme = useTheme();
    const isLaptop = useMediaQuery(theme.breakpoints.up("md"));
    const { notify } = useNotification();

    const [overviewData, setOverviewData] = useState(null);
    const [followersData, setFollowersData] = useState(EMPTY_METRIC);
    const [reachData, setReachData] = useState(EMPTY_METRIC);
    const [impressionsData, setImpressionsData] = useState(EMPTY_METRIC);
    const [profileViewsData, setProfileViewsData] = useState(EMPTY_METRIC);
    const [interactionsData, setInteractionsData] = useState({
        ...EMPTY_METRIC,
        likesTotal: 0,
        commentsTotal: 0,
        topPosts: [],
    });
    const callEndpointRef = useRef(callEndpoint);
    const notifyRef = useRef(notify);

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
                ? "Ultima semana"
                : selectedPeriod === "lastMonth"
                    ? "Ultimo mes"
                    : "Ultimos seis meses";

    useEffect(() => {
        const integrationId = instagramIntegration?.integration_id;
        if (!integrationId) return;

        let active = true;

        const fetchInstagramData = async () => {
            try {
                setIsLoadingInsights(true);
                setErrorFetchData(false);

                const [overview, insights, mediaPayload] = await Promise.all([
                    callEndpointRef.current(getInstagramOverview(integrationId)),
                    callEndpointRef.current(getInstagramInsights(integrationId, selectedPeriod)),
                    callEndpointRef.current(getInstagramMedia(integrationId, selectedPeriod)),
                ]);

                if (!active) return;

                setOverviewData(overview ?? null);
                setFollowersData(formatInstagramFollowersCard(insights));
                setReachData(formatInstagramMetricCard(insights, "reach"));
                setImpressionsData(formatInstagramMetricCard(insights, "impressions"));
                setProfileViewsData(formatInstagramMetricCard(insights, "profile_views"));
                setInteractionsData(formatInstagramInteractionsCard(mediaPayload));
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
    }, [selectedPeriod, instagramIntegration?.integration_id]);

    const integration = integrationsConfig["instagram"];
    const IntegrationIcon = integration.icon;
    const instagramName = instagramIntegration?.name || "Cuenta de Instagram";
    const instagramInitial = String(instagramName?.[0] ?? "I").toUpperCase();
    const hasInstagramUrl = Boolean(instagramIntegration?.url);

    const rateHasData =
        (Array.isArray(interactionsData?.chartData) && interactionsData.chartData.length > 0) ||
        (Array.isArray(reachData?.chartData) && reachData.chartData.length > 0);

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
                                if (hasInstagramUrl) {
                                    window.open(instagramIntegration?.url, "_blank");
                                }
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
                                    if (hasInstagramUrl) {
                                        window.open(instagramIntegration.url, "_blank");
                                    }
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
                        <Tab value="lastWeek" label="Ultima semana" disabled={isLoadingInsights} />
                        <Tab value="lastMonth" label="Ultimo mes" disabled={isLoadingInsights} />
                        <Tab value="lastSixMonths" label="Ultimos seis meses" disabled={isLoadingInsights} />
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
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <FollowersCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Nuevos seguidores"
                            interval={periodLabel}
                            data={followersData}
                            selectable={false}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <PageViewsCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Alcance"
                            interval={periodLabel}
                            data={reachData}
                            selectable={false}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <TotalLikesCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Impresiones"
                            interval={periodLabel}
                            data={impressionsData}
                            selectable={false}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <MetricSparkCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Visitas al perfil"
                            titleSpinner="Obteniendo visitas al perfil de Instagram..."
                            titleError="Ocurrio un error al obtener visitas al perfil"
                            interval={periodLabel}
                            data={profileViewsData}
                            singular="visita"
                            plural="visitas"
                            cumulativeLabel="acumuladas"
                            gradientId="instagram-profile-views-gradient"
                            selectable={false}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <TotalReactionsCard
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Interacciones totales"
                            interval={periodLabel}
                            data={interactionsData}
                            selectable={false}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                        <EngagementRateCard
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            interval={periodLabel}
                            interactionsTotal={interactionsData.total}
                            reachTotal={reachData.total}
                            hasData={rateHasData}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TopPostOfThePeriod
                            mode="dashboard"
                            loading={isLoadingInsights}
                            error={errorFetchData}
                            title="Top publicaciones de Instagram"
                            interval={periodLabel}
                            data={interactionsData?.topPosts ?? []}
                            selectable={false}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};
