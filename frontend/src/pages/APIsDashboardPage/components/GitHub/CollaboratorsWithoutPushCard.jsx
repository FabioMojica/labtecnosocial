import React, { useMemo } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Avatar,
    Stack,
    Divider,
    Checkbox,
    Box,
    useTheme,
} from '@mui/material';
import { NoResultsScreen } from '../../../../generalComponents';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

export default function CollaboratorsWithoutPushCard({
    commits = [],
    title = "Colaboradores sin push",
    interval = "",
    selectable = false,
    selected = false,
    selectedPeriod,
    onSelectChange = () => { },
}) {
    const theme = useTheme();
    const allAuthors = useMemo(() => {
        const authors = commits
            .map(c => ({
                login: c.author?.login,
                avatar: c.author?.avatar_url,
                email: c.commit?.author?.email,
            }))
            .filter(a => a.login);
        const unique = new Map();
        authors.forEach(a => {
            if (!unique.has(a.login)) unique.set(a.login, a);
        });
        return Array.from(unique.values());
    }, [commits]);

    const collaboratorsWithoutPush = useMemo(() => {
        if (!commits?.length) return [];

        const now = new Date();
        let periodStart = new Date();

        switch (selectedPeriod) {
            case 'today':
                periodStart.setHours(0, 0, 0, 0);
                break;
            case 'lastWeek':
                periodStart.setDate(now.getDate() - 7);
                break;
            case 'lastMonth':
                periodStart.setMonth(now.getMonth() - 1);
                break;
            case 'lastSixMonths':
                periodStart.setMonth(now.getMonth() - 6);
                break;
            case 'all':
            default:
                periodStart = new Date(0); // desde el inicio
                break;
        }

        // Autores que hicieron commits en el período
        const activeAuthors = new Set(
            commits
                .filter(c => new Date(c.commit.author.date) >= periodStart)
                .map(c => c.author?.login)
        );

        // Devuelve los que NO hicieron push
        return allAuthors.filter(a => !activeAuthors.has(a.login));
    }, [allAuthors, commits, selectedPeriod]);


    return (
        <Card
            variant="outlined"
            sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', height: 200 }}
        >
            <CardContent sx={{ flexGrow: 1 }}>

                <Typography component="h2" variant="subtitle2" gutterBottom>
                    {title}
                </Typography>
                {selectable && collaboratorsWithoutPush.length !== 0 && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <Checkbox
                            checked={selected}
                            onChange={e => onSelectChange(e.target.checked)}
                            size="medium"
                        />
                    </Box>
                )}

                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {interval}
                </Typography>



                <Divider sx={{ mb: 1 }} />

                {/* Contenido */}
                {collaboratorsWithoutPush.length === 0 ? (
                    <NoResultsScreen
                        message="Todos los colaboradores realizaron al menos un push reciente"
                        sx={{ height: '60%', gap: 0.5 }}
                        textSx={{
                            fontSize: {
                                xs: '0.8rem',
                                sm: '0.9rem'
                            }
                        }}
                        icon={<ErrorOutlineRoundedIcon />}
                        iconSX={{ fontSize: 44, color: 'text.secondary' }}
                    />
                ) : (
                    <Stack spacing={1} sx={{
                        maxHeight: 90,
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { width: "2px" },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: theme.palette.primary.main,
                        },
                    }}>
                        {collaboratorsWithoutPush.map((user, i) => (
                            <React.Fragment key={`${user.login}-${i}`}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                                    <Avatar src={user.avatar} alt={user.login} sx={{ width: 28, height: 28 }} />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                        <Typography
                                            variant="body2"
                                            fontSize={12}
                                            noWrap
                                            sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
                                        >
                                            {user.login}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            fontSize={12}
                                            component="a"
                                            href={`https://github.com/${user.login}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            noWrap
                                            sx={{
                                                textDecoration: 'none',
                                                color: theme.palette.primary.main,
                                                cursor: 'pointer',
                                                minWidth: 0,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                        >
                                            {user.email}
                                        </Typography>

                                    </Box>
                                </Stack>
                            </React.Fragment>
                        ))}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}
