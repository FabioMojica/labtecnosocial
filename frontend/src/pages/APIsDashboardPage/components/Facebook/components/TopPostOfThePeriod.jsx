import { Box, Card, CardContent, Stack, Typography, Chip, LinearProgress, Button, useTheme, Divider } from "@mui/material";
import { DashboardCard } from './DashboardCard';
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { REACTIONS_CONFIG, REACTION_ORDER } from '../utils/cards/reactionsConfig.js'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import { formatDateParts } from "../../../../../utils/formatDate.js";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState } from "react";

const REACTION_ALIASES = {
    SAD: ["SAD", "SORRY"],
    ANGRY: ["ANGRY", "ANGER"],
};

const getReactionValue = (byType = {}, type) => {
    const aliases = REACTION_ALIASES[type] ?? [type];
    for (const alias of aliases) {
        const rawValue = byType?.[alias];
        if (rawValue !== undefined && rawValue !== null) {
            return Number(rawValue) || 0;
        }
    }
    return 0;
};

const ReactionBadge = ({ type, size = 18 }) => {
    const config = REACTIONS_CONFIG[type];

    if (!config?.iconSrc) return null;

    return (
        <Box
            component="img"
            src={config.iconSrc}
            alt={config.label}
            sx={{
                width: size,
                height: size,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
            }}
        />
    );
};

const TopPostCard = ({ post, index }) => {
    const [imageSrc, setImageSrc] = useState(post?.full_picture || post?.meta?.thumbnail_url || null);

    useEffect(() => {
        setImageSrc(post?.full_picture || post?.meta?.thumbnail_url || null);
    }, [post?.full_picture, post?.meta?.thumbnail_url]);

    const isTop = index === 0;
    const rank = index + 1;
    const reactionsCount = Number(post?.reactions?.total ?? 0);
    const commentsCount = Number(post?.comments ?? 0);
    const sharesCount = Number(post?.shares ?? 0);
    const reactionsScore = reactionsCount;
    const commentsScore = commentsCount * 2;
    const sharesScore = sharesCount * 3;
    const computedPopularityScore = reactionsScore + commentsScore + sharesScore;
    const rankTheme =
        rank === 1
            ? {
                bg: "linear-gradient(135deg, rgba(255,193,7,0.95) 0%, rgba(255,160,0,0.95) 100%)",
                border: "rgba(255, 213, 79, 0.75)",
                text: "#1C1E21",
                shadow: "0 6px 16px rgba(255, 179, 0, 0.35)",
                label: "Top 1",
            }
            : rank === 2
                ? {
                    bg: "linear-gradient(135deg, rgba(176,190,197,0.95) 0%, rgba(120,144,156,0.95) 100%)",
                    border: "rgba(176, 190, 197, 0.75)",
                    text: "#0f1419",
                    shadow: "0 4px 12px rgba(96, 125, 139, 0.25)",
                    label: "Top 2",
                }
                : rank === 3
                    ? {
                        bg: "linear-gradient(135deg, rgba(205,127,50,0.95) 0%, rgba(141,110,99,0.95) 100%)",
                        border: "rgba(188, 170, 164, 0.7)",
                        text: "#ffffff",
                        shadow: "0 4px 12px rgba(141, 110, 99, 0.3)",
                        label: "Top 3",
                    }
                    : {
                        bg: "linear-gradient(135deg, rgba(120,144,156,0.24) 0%, rgba(84,110,122,0.24) 100%)",
                        border: "rgba(144, 164, 174, 0.35)",
                        text: "text.primary",
                        shadow: "none",
                        label: `Top ${rank}`,
                    };

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 2,
                borderColor: isTop ? "primary.main" : "divider",
                boxShadow: isTop ? 3 : 0,
                position: 'relative'
            }}
        >
            <CardContent>
                <Stack spacing={2}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Chip
                            label={`${rankTheme.label} - Post destacado`}
                            size="small"
                            sx={{
                                height: 30,
                                borderRadius: 999,
                                px: 0.7,
                                fontWeight: 700,
                                letterSpacing: 0.2,
                                bgcolor: "transparent",
                                background: rankTheme.bg,
                                color: rankTheme.text,
                                border: `1px solid ${rankTheme.border}`,
                                boxShadow: rankTheme.shadow,
                                '& .MuiChip-label': {
                                    px: 1,
                                },
                            }}
                        />

                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <TrendingUpIcon fontSize="small" />

                            <Typography fontWeight="bold">
                                {post.popularityScore}
                            </Typography>

                            <Tooltip
                                arrow
                                placement="top"
                                title={
                                    <Box sx={{ minWidth: 230 }}>
                                        <Typography variant="caption" fontWeight="bold" display="block">
                                            Como se calcula la popularidad
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Puntaje = Reacciones + (Comentarios x 2) + (Compartidos x 3)
                                        </Typography>

                                        <Divider sx={{ my: 0.75 }} />

                                        <Stack spacing={0.6}>
                                            <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                                                <Box display="flex" alignItems="center" gap={0.8}>
                                                    <Box display="flex" alignItems="center" sx={{ mr: 0.3 }}>
                                                        <ReactionBadge type="LIKE" size={14} />
                                                        <Box sx={{ ml: -0.4 }}>
                                                            <ReactionBadge type="LOVE" size={14} />
                                                        </Box>
                                                    </Box>
                                                    <Typography variant="caption">
                                                        Reacciones: {reactionsCount} x 1
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" fontWeight="bold">
                                                    {reactionsScore}
                                                </Typography>
                                            </Box>

                                            <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                                                <Box display="flex" alignItems="center" gap={0.8}>
                                                    <CommentOutlinedIcon sx={{ fontSize: 14 }} />
                                                    <Typography variant="caption">
                                                        Comentarios: {commentsCount} x 2
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" fontWeight="bold">
                                                    {commentsScore}
                                                </Typography>
                                            </Box>

                                            <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                                                <Box display="flex" alignItems="center" gap={0.8}>
                                                    <ShareOutlinedIcon sx={{ fontSize: 14 }} />
                                                    <Typography variant="caption">
                                                        Compartidos: {sharesCount} x 3
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" fontWeight="bold">
                                                    {sharesScore}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Divider sx={{ my: 0.75 }} />

                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption" fontWeight="bold">
                                                Total
                                            </Typography>
                                            <Typography variant="caption" fontWeight="bold">
                                                {computedPopularityScore}
                                            </Typography>
                                        </Box>
                                    </Box>
                                }
                            >
                                <InfoOutlinedIcon
                                    fontSize="inherit"
                                    sx={{
                                        cursor: "help",
                                        color: "text.secondary",
                                    }}
                                />
                            </Tooltip>
                        </Stack>
                    </Stack>

                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                        justifyContent="flex-end"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                    >
                        <Box>
                            <Box sx={{
                                display: 'flex',
                                gap: 0.8,
                                alignItems: 'center',
                                mb: 0.2
                            }}>
                                <CalendarMonthIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption" lineHeight={1}>
                                    Publicado
                                </Typography>
                            </Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                lineHeight={1}
                                fontSize={10}
                            >
                                {formatDateParts(post?.created_time).date}
                            </Typography>
                        </Box>

                        {post?.updated_time && (
                            <Box>
                                <Box sx={{
                                    display: 'flex',
                                    gap: 0.8,
                                    alignItems: 'center',
                                    mb: 0.2
                                }}>
                                    <EditCalendarIcon sx={{ fontSize: 14 }} />
                                    <Typography variant="caption" lineHeight={1}>
                                        Editado
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    lineHeight={1}
                                    fontSize={10}
                                >
                                    {formatDateParts(post?.updated_time).date}
                                </Typography>
                            </Box>
                        )}
                    </Stack>

                    {imageSrc && (
                        <Box sx={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Box sx={{
                                height: 'auto',
                                maxHeight: 400,
                                borderRadius: 2,
                                boxShadow: (theme) =>
                                    theme.palette.mode === 'light'
                                        ? '0 0 0 1px rgba(0,0,0,0.3)'
                                        : '0 0 0 1px rgba(255,255,255,0.3)',
                                overflow: 'hidden',
                            }}>
                                <Box
                                    component="img"
                                    src={imageSrc}
                                    onError={() => setImageSrc(null)}
                                    sx={{
                                        width: "100%",
                                        maxWidth: 500,
                                        height: {
                                            xs: 180,
                                            sm: 220,
                                            md: 280,
                                            lg: 'auto',
                                        },
                                        maxHeight: 400,
                                        objectFit: "contain",
                                        display: 'block'
                                    }}
                                />
                            </Box>
                        </Box>
                    )}

                    <Divider />

                    {post?.message ?
                        < Typography
                            variant="body2"
                            sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {post.message || "Publicación sin texto"}
                        </Typography> :
                        <Typography
                            variant="body2"
                            color="textDisabled"
                            sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                fontStyle: 'italic'
                            }}
                        >
                            Publicación sin texto
                        </Typography>
                    }

                    <Divider />

                    {/* Métricas */}
                    <Stack direction={{
                        xs: 'column',
                        lg: 'row'
                    }} spacing={1} justifyContent={'space-between'}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            {REACTION_ORDER.map((type) => {
                                    const config = REACTIONS_CONFIG[type];
                                    if (!config) return null;
                                    const value = getReactionValue(post?.reactions?.byType, type);

                                    return (
                                        <Box
                                            key={type}
                                            display="flex"
                                            alignItems="center"
                                            gap={0.4}
                                            title={`${config.label}: ${value}`}
                                            sx={{
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <ReactionBadge type={type} />
                                            <Typography variant="caption">
                                                {value}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                        </Stack>


                        <Box display={'flex'} gap={1}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <CommentOutlinedIcon fontSize="small" />
                                <Typography variant="caption">{post.comments}</Typography>
                            </Stack>

                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <ShareOutlinedIcon fontSize="small" />
                                <Typography variant="caption">{post.shares}</Typography>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Score visual */}
                    <Box>
                        <Box display={'flex'} justifyContent={'space-between'}>
                            <Typography variant="caption" color="text.secondary">
                                Nivel de popularidad
                            </Typography>

                            <Typography variant="caption" color="text.secondary">
                                {Math.min(post.popularityScore * 10, 100)}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(post.popularityScore * 10, 100)}
                            sx={{ height: 6, borderRadius: 1 }}
                        />
                    </Box>

                    {/* Acciones */}
                    <Stack direction="row" spacing={1}>
                        <Button
                            size="small"
                            variant="outlined"
                            href={post.permalink_url}
                            target="_blank"
                        >
                            Ver post
                        </Button>

                    </Stack>

                </Stack>
            </CardContent>
        </Card >
    );
};

export const TopPostOfThePeriod = ({
    mode = 'dashboard',
    error = false,
    title = "Top 5 posts populares",
    loading,
    interval,
    data,
    selected = true,
    selectable = true,
    onSelectChange,
}) => {
    const theme = useTheme();

    return (
        <DashboardCard
            title={title}
            titleSpinner={'Obteniendo el top 5 post populares de la página...'}
            titleNoResults={'No hay posts para mostrar en el periodo seleccionado'}
            titleError={'Ocurrió un error al obtener los posts populares de la página'}
            interval={interval}
            loading={loading}
            error={error}
            isEmpty={data?.length === 0}
            selectable={selectable}
            selected={selected}
            onSelectChange={onSelectChange}
            sxCard={{
                height: {
                    xs: 540,
                    sm: 540,
                    lg: 540,
                },
                maxHeight: {
                    xs: 'auto',
                    sm: 540,
                    lg: 540
                },
            }}
        >
            <Box sx={{
                overflowY: 'auto',
                "&::-webkit-scrollbar": { width: "2px" },
                "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
                "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
                "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                maxHeight: {
                    xs: 540,
                    sm: mode === 'report' ? 'auto' : 540,
                    lg: mode === 'report' ? 'auto' : 540
                },
                mt: 4.5,
                pb: 4.5,
                pr: 1
            }}>
                <Stack spacing={2} sx={{
                    mb: 5
                }}>
                    {data.map((post, index) => (
                        <TopPostCard key={post.id} post={post} index={index} />
                    ))}

                    {/* Mensaje si hay menos de 5 posts */}
                    {data.length < 5 && data.length > 0 && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                            sx={{ py: 2, fontStyle: 'italic', mb: 5 }}
                        >
                            No hay más posts para mostrar en el periodo.
                        </Typography>
                    )}

                    {/* Mensaje si no hay posts */}
                    {data.length === 0 && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                            sx={{ py: 2, fontStyle: 'italic', mb: 5 }}
                        >
                            No hay posts disponibles en este periodo.
                        </Typography>
                    )}
                </Stack>
            </Box>
        </DashboardCard>
    );
}

