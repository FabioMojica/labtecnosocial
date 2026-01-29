import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { Box, Avatar, Card, CardContent, Stack, Typography, Tooltip, Checkbox } from '@mui/material';
import { styled } from '@mui/system';
import { NoResultsScreen } from '../../../../generalComponents';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const AvatarWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    position: 'relative',
    gap: theme.spacing(3),
    marginTop: theme.spacing(2),
}));

const TopAvatar = styled(Avatar, {
    shouldForwardProp: (prop) => prop !== '$zIndex' && prop !== 'size' && prop !== 'trend'
})(({ theme, size = 56, $zIndex, trend }) => {
    const trendColors = {
        up: theme.palette.success.main,
        down: theme.palette.error.main,
        neutral: theme.palette.grey[400],
    };
    return {
        width: size,
        height: size,
        border: `3px solid ${trendColors[trend] || theme.palette.background.paper}`,
        cursor: 'pointer',
        zIndex: $zIndex,
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.15)' },
    };
});

export const TopCollaboratorsOfThePeriod = ({
    commits = [],
    title = "Top Colaboradores",
    interval,
    selectable = false,
    selected = false,
    onSelectChange,
    selectedPeriod = 'lastMonth',
}) => {
    const theme = useTheme();

    if (!commits.length) return null;

    // --- FILTRADO CONSISTENTE COMO CommitsInThePeriod ---
    const filteredCommits = useMemo(() => {
        const today = dayjs().startOf('day');
        let startDate, endDate;

        switch (selectedPeriod) {
            case 'today':
                startDate = today;
                endDate = today.endOf('day');
                break;
            case 'lastWeek':
                startDate = today.subtract(7, 'day');
                endDate = today.endOf('day');
                break;
            case 'lastMonth':
                startDate = today.subtract(1, 'month');
                endDate = today.endOf('day');
                break;
            case 'lastSixMonths':
                startDate = today.subtract(6, 'month');
                endDate = today.endOf('day');
                break;
            default:
                startDate = null;
                endDate = null;
        }

        if (!startDate) return commits;

        return commits.filter(c => {
            const commitDate = dayjs(c.commit.author.date);
            return commitDate.isSameOrAfter(startDate, 'day') && commitDate.isSameOrBefore(endDate, 'day');
        });
    }, [commits, selectedPeriod]);

    const commitMap = {};
    filteredCommits.forEach(c => {
        const login = c.author?.login;
        if (!login) return;
        if (!commitMap[login]) commitMap[login] = {
            ...c.author,
            email: c.commit?.author?.email ?? null,
            totalCommits: 0
        };
        commitMap[login].totalCommits += 1;
    });

    const top3 = Object.values(commitMap)
        .sort((a, b) => b.totalCommits - a.totalCommits)
        .slice(0, 3);

    if (!top3.length) {
        return (
            <Card variant="outlined" sx={{ height: '100%', maxHeight: 300, flexGrow: 1 }}>

                <CardContent sx={{ height: '100%', p: 0 }}>
                    <NoResultsScreen
                        message="Sin datos para mostrar"
                        sx={{ height: '100%' }}
                        textSx={{
                            fontSize: {
                                xs: '0.8rem',
                                sm: '1rem'
                            }
                        }}
                        iconSX={{
                            fontSize: 70
                        }}
                    />
                </CardContent>
            </Card>
        );
    }

    const layout = [top3[2] || null, top3[0], top3[1] || null];
    const sizes = [48, 72, 56];
    const zIndexes = [1, 2, 1];

    const avgCommits = filteredCommits.length / Object.keys(commitMap).length;

    return (
        <Card variant="outlined" sx={{ height: '100%', maxHeight: 300, flexGrow: 1, position: 'relative' }}>
            {selectable && (
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Checkbox checked={selected} onChange={(e) => onSelectChange?.(e.target.checked)} />
                </Box>
            )}
            <CardContent>
                <Stack spacing={1}>
                    <Stack direction="column" justifyContent="flex-start" alignItems="flex-start">
                        <Typography component="h2" variant="subtitle2">{title}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{interval}</Typography>
                    </Stack>

                    <AvatarWrapper>
                        {layout.map((user, idx) =>
                            user ? (
                                <Stack key={user.login} direction="column" alignItems="center" spacing={0.5}>
                                    <Tooltip
                                        title={
                                            <Box>
                                                <Typography variant="subtitle2">{user.login}</Typography>
                                                <Typography variant="body2">{user.email}</Typography>
                                                <Typography variant="body2">Commits: {user.totalCommits}</Typography>
                                            </Box>
                                        }
                                        arrow
                                    >
                                        <TopAvatar
                                            src={user.avatar_url}
                                            size={sizes[idx]}
                                            $zIndex={zIndexes[idx]}
                                            trend={
                                                user.totalCommits > avgCommits
                                                    ? 'up'
                                                    : user.totalCommits < avgCommits
                                                        ? 'down'
                                                        : 'neutral'
                                            }
                                        />
                                    </Tooltip>

                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                maxWidth: 80,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                color: 'text.secondary',
                                            }}
                                            noWrap
                                        >
                                            {user.login}
                                        </Typography>

                                        <Typography variant="caption"
                                            sx={{
                                                maxWidth: 70,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                color: 'text.secondary',
                                            }}
                                            noWrap>
                                            {user.totalCommits} commits
                                        </Typography>
                                    </Box>
                                </Stack>
                            ) : (
                                <Box key={idx} width={sizes[idx]} />
                            )
                        )}
                    </AvatarWrapper>
                </Stack>
            </CardContent>
        </Card>
    );
};

TopCollaboratorsOfThePeriod.propTypes = {
    commits: PropTypes.array.isRequired,
    title: PropTypes.string,
    interval: PropTypes.string,
    selectable: PropTypes.bool,
    selected: PropTypes.bool,
    onSelectChange: PropTypes.func,
    selectedPeriod: PropTypes.string,
};

TopCollaboratorsOfThePeriod.defaultProps = {
    title: 'Top Colaboradores',
    interval: 'Periodo',
};
