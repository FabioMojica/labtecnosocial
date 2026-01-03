import { Box, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useFetchAndLoad } from '../../../../hooks';
import { generateMockBranches, generateMockStats } from './mock/mockStats';
import { useEffect, useState } from 'react';
import { ErrorScreen, FullScreenProgress, NoResultsScreen } from '../../../../generalComponents';
import { getGithubBranchesApi, getGithubStatsApi } from '../../../../api';
import { GitHub } from "@mui/icons-material";
import { SessionsChart } from './SessionsChart';
import { CommitsByWeekdayHour } from './CommitsByWeekdayHour';
import { CustomizedDataGrid } from './CustomizedDataGrid';
import { TopCollaboratorsOfThePeriod } from './TopCollaboratorsOfThePeriod';
import { useReport } from '../../../../contexts/ReportContext';
import CommitsInThePeriod from './CommitsInThePeriod';
import ChartCommitsByAuthor from './ChartCommitsByAuthor';
import PullRequestsCard from './PullRequestCard';
import CollaboratorsWithoutPushCard from './CollaboratorsWithoutPushCard';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);


export const GitHubDashboard = ({ project, useMock = true }) => {
    const { loading, callEndpoint } = useFetchAndLoad();
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('lastMonth');
    const [getBranchesError, setGetBranchesError] = useState(false);
    const [emptyBranchesError, setEmptyBranchesError] = useState(false);
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const { addChart, removeChart, selectedCharts } = useReport();

    const githubIntegration = project?.integrations?.find(i => i.platform === 'github');

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


    // --- LOADING & ERRORS ---
    if (loading) return <FullScreenProgress text="Obteniendo las ramas del repositorio" />;
    if (loadingStats) return <FullScreenProgress text={`Obteniendo datos de la rama "${selectedBranch}"`} />;
    if (getBranchesError) return <ErrorScreen message="Hubo un error al obtener las ramas" buttonText="Intentar de nuevo" onButtonClick={fetchBranches} sx={{ height: '60vh' }} />;
    if (emptyBranchesError) return <NoResultsScreen message="No hay ramas en este repositorio" sx={{ height: '60vh' }} />;
    if (!stats) return null;

    // --- STATS CALCULATION ---
    const totalCommits = stats?.commitsCount || 0;
    const uniqueAuthors = stats?.commits ? new Set(stats.commits.map(c => c.author?.login)).size : 0;

    const commitsByDate = {};
    stats?.commits?.forEach(c => {
        const day = new Date(c.commit.author.date).toISOString().split('T')[0];
        commitsByDate[day] = (commitsByDate[day] || 0) + 1;
    });

    const verifiedByDate = {};
    stats?.commits?.forEach(c => {
        if (c.commit.verification?.verified) {
            const day = new Date(c.commit.author.date).toISOString().split('T')[0];
            verifiedByDate[day] = (verifiedByDate[day] || 0) + 1;
        }
    });

    const authorsByDate = {};
    stats?.commits?.forEach(c => {
        const day = new Date(c.commit.author.date).toISOString().split('T')[0];
        authorsByDate[day] = authorsByDate[day] || new Set();
        authorsByDate[day].add(c.author?.login);
    });


    const periodLabel =
        selectedPeriod === 'today' ? 'Hoy' :
            selectedPeriod === 'lastWeek' ? 'Última semana' :
                selectedPeriod === 'lastMonth' ? 'Último mes' :
                    selectedPeriod === 'lastSixMonths' ? 'Últimos seis meses' :
                        'Todo';



    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <GitHub fontSize="large" />
                    <Typography variant="h6">{`Repositorio: ${githubIntegration.name}`}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 0.5 }}>
                    {branches.length > 0 && (
                        <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 150 } }}>
                            <InputLabel id="branches-label">Ramas</InputLabel>
                            <Select labelId="branches-label" value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} label="Ramas">
                                {branches.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                            </Select>
                        </FormControl>
                    )}

                    <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 150 } }}>
                        <InputLabel id="period-label">Periodo</InputLabel>
                        <Select labelId="period-label" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} label="Periodo">
                            <MenuItem value="today">Hoy</MenuItem>
                            <MenuItem value="lastWeek">Última semana</MenuItem>
                            <MenuItem value="lastMonth">Último mes</MenuItem>
                            <MenuItem value="lastSixMonths">Últimos seis meses</MenuItem>
                            <MenuItem value="all">Todo</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
                <Grid container columns={12} spacing={2} size={{ xs: 12, sm: 12, lg: 6 }} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <CommitsInThePeriod
                            commits={stats?.commits || []}
                            title="Cantidad de commits"
                            interval={periodLabel}
                            selectable
                            selected={selectedCharts.some(c => c.id === 'commitsInPeriod')}
                            selectedPeriod={selectedPeriod}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart({
                                        id: 'commitsInPeriod',
                                        title: 'Cantidad de commits',
                                        data: stats?.commits,
                                        interval: periodLabel,
                                        selectedPeriod: selectedPeriod,
                                    });
                                } else {
                                    removeChart('commitsInPeriod');
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <TopCollaboratorsOfThePeriod
                            commits={stats?.commits || []}
                            title="Top Colaboradores del Periodo"
                            interval={periodLabel}
                            selectable
                            selected={selectedCharts.some(c => c.id === 'topCollaborators')}
                            selectedPeriod={selectedPeriod}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart({ id: 'topCollaborators', title: 'Top Colaboradores', data: stats?.commits });
                                } else {
                                    removeChart('topCollaborators');
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <PullRequestsCard
                            prs={stats?.pullRequests || []}
                            title="Pull Requests"
                            interval={periodLabel}
                            selectable
                            selected={selectedCharts.some(c => c.id === 'pullRequests')}
                            selectedPeriod={selectedPeriod}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart({
                                        id: 'pullRequests',
                                        title: 'Pull Requests',
                                        data: stats?.pullRequests,
                                        interval: periodLabel,
                                        selectedPeriod: selectedPeriod,
                                    });
                                } else {
                                    removeChart('pullRequests');
                                }
                            }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <CollaboratorsWithoutPushCard
                            commits={stats?.commits || []}
                            branch={selectedBranch}
                            title="Colaboradores sin push"
                            interval={periodLabel}
                            selectable
                            selected={selectedCharts.some(c => c.id === 'collaboratorsWithoutPush')}
                            selectedPeriod={selectedPeriod}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart({
                                        id: 'collaboratorsWithoutPush',
                                        title: 'Colaboradores sin push',
                                        data: stats?.commits,
                                        interval: periodLabel,
                                        selectedPeriod,
                                    });
                                } else {
                                    removeChart('collaboratorsWithoutPush');
                                }
                            }}
                        />
                    </Grid>
                </Grid>

                <Grid container columns={12} spacing={2} sx={{ mb: 2 }}>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <SessionsChart
                            commitsData={stats?.commits || []}
                            title="Historial de commits"
                            interval={periodLabel}
                            selectable
                            selected={selectedCharts.some(c => c.id === 'topCollaborators')}
                            selectedPeriod={selectedPeriod}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart({ id: 'topCollaborators', title: 'Top Colaboradores', data: stats?.commits });
                                } else {
                                    removeChart('topCollaborators');
                                }
                            }}
                        />
                    </Grid>


                    <Grid size={{ xs: 12, md: 6 }}>
                        <CommitsByWeekdayHour
                            commitsData={stats?.commits || []}
                            title="Horas con más commits"
                            interval={periodLabel}
                            selectable
                            selected={selectedCharts.some(c => c.id === 'topCollaborators')}
                            selectedPeriod={selectedPeriod}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart({ id: 'topCollaborators', title: 'Top Colaboradores', data: stats?.commits });
                                } else {
                                    removeChart('topCollaborators');
                                }
                            }}
                        />
                    </Grid>
                </Grid>


                <Grid container spacing={2} columns={12}>
                    <Grid size={{ xs: 12, lg: 9 }}>
                        <CustomizedDataGrid
                            commits={stats?.commits || []}
                            title="Historial de Commits"
                            interval={periodLabel}
                            selectable
                            selected={selectedCharts.some(c => c.id === 'commitGrid')}
                            selectedPeriod={selectedPeriod}
                            onSelectChange={(checked) => {
                                if (checked) {
                                    addChart({
                                        id: 'commitGrid',
                                        title: 'Historial de Commits',
                                        data: stats?.commits,
                                        interval: periodLabel,
                                        selectedPeriod,
                                    });
                                } else {
                                    removeChart('commitGrid');
                                }
                            }}
                        />

                    </Grid>

                    <Grid size={{ xs: 12, lg: 3 }}>
                        <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
                            <ChartCommitsByAuthor
                                commits={stats?.commits || []}
                                title="Porcentaje de Commits"
                                interval={periodLabel}
                                selectable
                                selected={selectedCharts.some(c => c.id === 'commitGrid')}
                                selectedPeriod={selectedPeriod}
                                onSelectChange={(checked) => {
                                    if (checked) {
                                        addChart({
                                            id: 'commitGrid',
                                            title: 'Historial de Commits',
                                            data: stats?.commits,
                                            interval: periodLabel,
                                            selectedPeriod,
                                        });
                                    } else {
                                        removeChart('commitGrid');
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
