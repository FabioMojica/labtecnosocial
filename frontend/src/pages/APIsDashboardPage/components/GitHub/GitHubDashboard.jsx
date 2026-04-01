import { Avatar, Box, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, Tab, Tabs, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useFetchAndLoad } from '../../../../hooks';
import { generateMockBranches, generateMockStats } from './mock/mockStats';
import { useEffect, useState } from 'react';
import { ErrorScreen, FullScreenProgress, NoResultsScreen } from '../../../../generalComponents';
import { getGithubBranchesApi, getGithubStatsApi } from '../../../../api';
import { SessionsChart } from './SessionsChart';
import { CommitsByWeekdayHour } from './CommitsByWeekdayHour';
import { CustomizedDataGrid } from './CustomizedDataGrid';
import { TopCollaboratorsOfThePeriod } from './TopCollaboratorsOfThePeriod';
import { useReport } from '../../../../contexts/ReportContext';
import CommitsInThePeriod from './CommitsInThePeriod';
import ChartCommitsByAuthor from './ChartCommitsByAuthor';
import PullRequestsCard from './PullRequestCard';
import CollaboratorsWithoutPushCard from './CollaboratorsWithoutPushCard';
import { useLayout } from '../../../../contexts/LayoutContext';
import { integrationsConfig, useDrawerClosedWidth } from '../../../../utils';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { CHART_IDS_GITHUB } from './utils/chartsIds';

const DEFAULT_GOALS = {
    commitsInThePeriodCard: 50,
    pullRequestsCard: 10,
};

const compactCommitForReport = (commit = {}) => {
    const authorDate = commit?.commit?.author?.date ?? null;
    const committerDate = commit?.commit?.committer?.date ?? authorDate;

    return {
        sha: commit?.sha ?? null,
        html_url: commit?.html_url ?? null,
        author: {
            login: commit?.author?.login ?? commit?.commit?.author?.name ?? null,
            avatar_url: commit?.author?.avatar_url ?? null,
        },
        commit: {
            message: commit?.commit?.message ?? '',
            author: {
                name: commit?.commit?.author?.name ?? null,
                email: commit?.commit?.author?.email ?? null,
                date: authorDate,
            },
            committer: {
                name: commit?.commit?.committer?.name ?? commit?.commit?.author?.name ?? null,
                email: commit?.commit?.committer?.email ?? commit?.commit?.author?.email ?? null,
                date: committerDate,
            },
        },
    };
};

const compactPullRequestForReport = (pr = {}) => ({
    id: pr?.id ?? null,
    number: pr?.number ?? null,
    title: pr?.title ?? '',
    state: pr?.state ?? null,
    html_url: pr?.html_url ?? null,
    created_at: pr?.created_at ?? null,
    closed_at: pr?.closed_at ?? null,
    merged_at: pr?.merged_at ?? null,
    user: {
        login: pr?.user?.login ?? null,
        avatar_url: pr?.user?.avatar_url ?? null,
    },
});

export const GitHubDashboard = ({ project, useMock = true, showingDialog = false }) => {
    const validPeriods = ['today', 'lastWeek', 'lastMonth', 'lastSixMonths'];
    const { loading, callEndpoint } = useFetchAndLoad();
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('lastMonth');
    const [getBranchesError, setGetBranchesError] = useState(false);
    const [emptyBranchesError, setEmptyBranchesError] = useState(false);
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const { addChart, removeChart, selectedCharts } = useReport();
    const { scrollbarWidth } = useLayout();
    const navBarWidth = useDrawerClosedWidth();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [chartGoals, setChartGoals] = useState({});
    const theme = useTheme();
    const isLaptop = useMediaQuery(theme.breakpoints.up("md"));
    const integration = integrationsConfig["github"];
    const IntegrationIcon = integration.icon;

    const githubIntegration = project?.integrations?.find(i => i.platform === 'github');
    const selectable = showingDialog;

    if (!githubIntegration) {
        console.warn("No se encontró una integración de GitHub en este proyecto.");
        return null;
    }

    // --- FETCH BRANCHES ---
    const fetchBranches = async () => {
        try {
            // PASAMOS selectedPeriod solo si estamos en modo mock
            let respBranches = useMock
                ? generateMockBranches(undefined, selectedPeriod)
                : await callEndpoint(getGithubBranchesApi(githubIntegration.name));

            if (!respBranches || respBranches.length === 0) {
                setEmptyBranchesError(true);
                return;
            }

            setGetBranchesError(false);
            setEmptyBranchesError(false);

            const branchNames = respBranches.map(b => b.name);
            setBranches(branchNames);
            setSelectedBranch(branchNames[0]);
        } catch (err) {
            console.error(err);
            setGetBranchesError(true);
        }
    };


    useEffect(() => {
        fetchBranches();
    }, []);

    // --- FETCH STATS ---
    const fetchStats = async (branchName, period) => {
        if (useMock) {
            // PASAMOS selectedPeriod al generar stats mock
            const branchData = generateMockBranches(undefined, period).find(b => b.name === branchName);
            return branchData?.stats || generateMockStats(undefined, period);
        }
        return await getGithubStatsApi(githubIntegration.name, period, branchName);
    };

    useEffect(() => {
        if (!selectedBranch || !selectedPeriod) return;

        const fetchStatsForBranch = async () => {
            setLoadingStats(true);
            try {
                const respStats = await fetchStats(selectedBranch, selectedPeriod);
                setStats(respStats);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchStatsForBranch();
    }, [selectedBranch, selectedPeriod]);

    useEffect(() => {
        if (!validPeriods.includes(selectedPeriod)) {
            setSelectedPeriod('lastMonth');
        }
    }, [selectedPeriod]);


    // --- LOADING & ERRORS ---
    if (loading) return <FullScreenProgress text="Obteniendo las ramas del repositorio" />;
    if (loadingStats) return <FullScreenProgress text={`Obteniendo datos de la rama "${selectedBranch}"`} />;
    if (getBranchesError) return <ErrorScreen message="Hubo un error al obtener las ramas" buttonText="Intentar de nuevo" onButtonClick={fetchBranches} sx={{ height: '60vh' }} />;
    if (emptyBranchesError) return <NoResultsScreen message="No hay ramas en este repositorio" sx={{ height: '60vh' }} />;
    if (!stats) return null;

    const periodLabel =
        selectedPeriod === 'today' ? 'Hoy' :
            selectedPeriod === 'lastWeek' ? 'Última semana' :
                selectedPeriod === 'lastMonth' ? 'Último mes' :
                    selectedPeriod === 'lastSixMonths' ? 'Últimos seis meses' :
                        'Último mes';

    const compactCommitsForReport = (stats?.commits || []).map(compactCommitForReport);
    const compactPullRequestsForReport = (stats?.pullRequests || []).map(compactPullRequestForReport);

    const buildChartPayload = (idName, title, data, meta = undefined) => ({
        id_name: idName,
        integration_data: {
            project: {
                id: project?.id,
                name: project?.name,
            },
            integration: githubIntegration,
        },
        period: selectedPeriod,
        periodLabel,
        title,
        data,
        interval: periodLabel,
        meta,
    });

    const isChartSelected = (idName) => selectedCharts.some((chart) => chart.id_name === idName);
    const getGoalForChart = (idName, fallback) => {
        const value = chartGoals[idName];
        if (Number.isFinite(value) && value >= 0) return value;
        return fallback;
    };
    const setGoalForChart = (idName, value) => {
        const normalized = Number.isFinite(value) && value >= 0 ? value : 0;
        setChartGoals((prev) => ({ ...prev, [idName]: normalized }));
    };

    const commitsInPeriodId = CHART_IDS_GITHUB.commitsInThePeriodCard(selectedPeriod);
    const pullRequestsId = CHART_IDS_GITHUB.pullRequestsCard(selectedPeriod);
    const topCollaboratorsId = CHART_IDS_GITHUB.topCollaboratorsCard(selectedPeriod);
    const collaboratorsWithoutPushId = CHART_IDS_GITHUB.collaboratorsWithoutPushCard(selectedPeriod);
    const sessionsChartId = CHART_IDS_GITHUB.sessionsChart(selectedPeriod);
    const commitsByWeekdayHourId = CHART_IDS_GITHUB.commitsByWeekdayHourChart(selectedPeriod);
    const commitGridId = CHART_IDS_GITHUB.commitGrid(selectedPeriod);
    const commitsByAuthorId = CHART_IDS_GITHUB.commitsByAuthorChart(selectedPeriod);

    const commitsGoal = getGoalForChart(commitsInPeriodId, DEFAULT_GOALS.commitsInThePeriodCard);
    const pullRequestsGoal = getGoalForChart(pullRequestsId, DEFAULT_GOALS.pullRequestsCard);

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
                    lg: showingDialog ? '100vw' : isFullscreen ? '100vw' : `calc(100vw - ${navBarWidth} - ${scrollbarWidth}px - 16px)`
                },
                height: isFullscreen ? '100vh' : 'auto',
                bgcolor: (theme) => theme.palette.background.default,
                zIndex: isFullscreen ? 1500 : 'auto',
                overflow: isFullscreen ? 'hidden' : 'visible',
                overflowX: 'hidden',
                p: showingDialog ? 1 : 0,
            }}
        >
            <Box
                sx={{
                    position: isFullscreen ? 'fixed' : 'sticky',
                    top: 0,
                    left: 0,
                    zIndex: isFullscreen ? 1600 : 999,
                    bgcolor: 'background.paper',
                    borderTopLeftRadius: !showingDialog ? 5 : 0,
                    borderTopRightRadius: !showingDialog ? 5 : 0,
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
                                    Github
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
                                        // accion al hacer click, ejemplo abrir url
                                        window.open(githubIntegration?.url, "_blank");
                                    }}
                                >
                                    <Typography fontWeight="bold" variant="subtitle2" noWrap>
                                        {githubIntegration?.name}
                                    </Typography>
                                </Box>
                            </Box>
                            {branches.length > 0 && (
                                <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 150 }, maxWidth: {xs: 120, sm: 150} }}>
                                    <InputLabel id="branches-label">Ramas</InputLabel>
                                    <Select labelId="branches-label" value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} label="Ramas">
                                        {branches.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            )}
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
                </Tabs>

                <Tooltip
                    title={isFullscreen ? "Minimizar" : "Maximizar"}
                    open={tooltipOpen}
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
                overflowX: 'hidden',
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
                <Grid container columns={12} spacing={1} sx={{ mb: 1, minWidth: 0 }}>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ minWidth: 0 }}>
                        <CommitsInThePeriod
                            commits={stats?.commits || []}
                            title="Cantidad de commits"
                            interval={periodLabel}
                            selectable={selectable}
                            selected={isChartSelected(commitsInPeriodId)}
                            selectedPeriod={selectedPeriod}
                            goal={commitsGoal}
                            allowGoalEdit
                            onGoalChange={(value) => {
                                setGoalForChart(commitsInPeriodId, value);
                                if (isChartSelected(commitsInPeriodId)) {
                                    addChart(
                                        buildChartPayload(
                                            commitsInPeriodId,
                                            'Cantidad de commits',
                                            compactCommitsForReport,
                                            { goal: value }
                                        )
                                    );
                                }
                            }}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart(
                                        buildChartPayload(
                                            commitsInPeriodId,
                                            'Cantidad de commits',
                                            compactCommitsForReport,
                                            { goal: commitsGoal }
                                        )
                                    );
                                } else {
                                    removeChart({ id_name: commitsInPeriodId });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ minWidth: 0 }}>
                        <TopCollaboratorsOfThePeriod
                            commits={stats?.commits || []}
                            title="Top Colaboradores del Periodo"
                            interval={periodLabel}
                            selectable={selectable}
                            selected={isChartSelected(topCollaboratorsId)}
                            selectedPeriod={selectedPeriod}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart(buildChartPayload(topCollaboratorsId, 'Top Colaboradores del Periodo', compactCommitsForReport));
                                } else {
                                    removeChart({ id_name: topCollaboratorsId });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ minWidth: 0 }}>
                        <PullRequestsCard
                            prs={stats?.pullRequests || []}
                            title="Pull Requests"
                            interval={periodLabel}
                            selectable={selectable}
                            selected={isChartSelected(pullRequestsId)}
                            selectedPeriod={selectedPeriod}
                            goal={pullRequestsGoal}
                            allowGoalEdit
                            onGoalChange={(value) => {
                                setGoalForChart(pullRequestsId, value);
                                if (isChartSelected(pullRequestsId)) {
                                    addChart(
                                        buildChartPayload(
                                            pullRequestsId,
                                            'Pull Requests',
                                            compactPullRequestsForReport,
                                            { goal: value }
                                        )
                                    );
                                }
                            }}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart(
                                        buildChartPayload(
                                            pullRequestsId,
                                            'Pull Requests',
                                            compactPullRequestsForReport,
                                            { goal: pullRequestsGoal }
                                        )
                                    );
                                } else {
                                    removeChart({ id_name: pullRequestsId });
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ minWidth: 0 }}>
                        <CollaboratorsWithoutPushCard
                            commits={stats?.commits || []}
                            branch={selectedBranch}
                            title="Colaboradores sin push"
                            interval={periodLabel}
                            selectable={selectable}
                            selected={isChartSelected(collaboratorsWithoutPushId)}
                            selectedPeriod={selectedPeriod}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart(buildChartPayload(collaboratorsWithoutPushId, 'Colaboradores sin push', compactCommitsForReport));
                                } else {
                                    removeChart({ id_name: collaboratorsWithoutPushId });
                                }
                            }}
                        />
                    </Grid>
                </Grid>

                <Grid container columns={12} spacing={1} sx={{ mb: 1, minWidth: 0 }}>

                    <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                        <SessionsChart
                            commitsData={stats?.commits || []}
                            title="Historial de commits"
                            interval={periodLabel}
                            selectable={selectable}
                            selected={isChartSelected(sessionsChartId)}
                            selectedPeriod={selectedPeriod}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart(buildChartPayload(sessionsChartId, 'Historial de commits', compactCommitsForReport));
                                } else {
                                    removeChart({ id_name: sessionsChartId });
                                }
                            }}
                        />
                    </Grid>


                    <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0 }}>
                        <CommitsByWeekdayHour
                            commitsData={stats?.commits || []}
                            title="Horas con mas commits"
                            interval={periodLabel}
                            selectable={selectable}
                            selected={isChartSelected(commitsByWeekdayHourId)}
                            selectedPeriod={selectedPeriod}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart(buildChartPayload(commitsByWeekdayHourId, 'Horas con mas commits', compactCommitsForReport));
                                } else {
                                    removeChart({ id_name: commitsByWeekdayHourId });
                                }
                            }}
                        />
                    </Grid>
                </Grid>


                <Grid container spacing={1} columns={12} sx={{ minWidth: 0 }}>
                    <Grid size={{ xs: 12, lg: 9 }} sx={{ minWidth: 0 }}>
                        <CustomizedDataGrid
                            commits={stats?.commits || []}
                            title="Historial de Commits"
                            interval={periodLabel}
                            selectable={selectable}
                            selected={isChartSelected(commitGridId)}
                            selectedPeriod={selectedPeriod}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart(buildChartPayload(commitGridId, 'Historial de Commits', compactCommitsForReport));
                                } else {
                                    removeChart({ id_name: commitGridId });
                                }
                            }}
                        />

                    </Grid>

                    <Grid size={{ xs: 12, lg: 3 }} sx={{ minWidth: 0 }}>
                        <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
                            <ChartCommitsByAuthor
                                commits={stats?.commits || []}
                                title="Porcentaje de Commits"
                                interval={periodLabel}
                                selectable={selectable}
                                selected={isChartSelected(commitsByAuthorId)}
                                selectedPeriod={selectedPeriod}
                                onSelectChange={(checked) => {
                                    if (checked) {
                                        addChart(buildChartPayload(commitsByAuthorId, 'Porcentaje de Commits', compactCommitsForReport));
                                    } else {
                                        removeChart({ id_name: commitsByAuthorId });
                                    }
                                }}
                            />
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

