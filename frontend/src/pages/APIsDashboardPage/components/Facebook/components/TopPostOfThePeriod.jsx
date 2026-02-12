import { Box, Card, CardContent, Stack, Typography, Chip, LinearProgress, Button, useTheme, Divider } from "@mui/material";
import { DashboardCard } from './DashboardCard';
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { REACTIONS_CONFIG } from '../utils/cards/reactionsConfig.js'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import { formatDateParts } from "../../../../../utils/formatDate.js";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Tooltip from "@mui/material/Tooltip";

const TopPostCard = ({ post, index }) => {
    const isTop = index === 0;

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
            <Box sx={{
                position: 'absolute',
                top: 55,
                right: 15,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5
            }}>
                <Box>
                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        mb: 0.2
                    }}>
                        <CalendarMonthIcon fontSize="small" />
                        <Typography
                            variant="caption"
                            lineHeight={1}
                        >
                            Publicado
                        </Typography>
                    </Box>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            lineHeight={1}
                            fontSize={10}
                        >
                            {formatDateParts(post?.created_time).date}
                        </Typography>
                    </Box>
                </Box>
                {post?.updated_time &&
                    <Box>
                        <Box sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                            mb: 0.2
                        }}>
                            <EditCalendarIcon fontSize="small" />
                            <Typography
                                variant="caption"
                                lineHeight={1}
                            >
                                Editado
                            </Typography>
                        </Box>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                lineHeight={1}
                                fontSize={10}
                            >
                                {formatDateParts(post?.updated_time).date}
                            </Typography>
                        </Box>
                    </Box>
                }
            </Box>
            <CardContent>
                <Stack spacing={2}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Chip
                            label={`#${index + 1} Top Post`}
                            color={isTop ? "primary" : "default"}
                            size="small"
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
                                    <Box>
                                        <Typography variant="caption" fontWeight="bold">
                                            Cómo se calcula la popularidad
                                        </Typography>

                                        <Divider sx={{ my: 0.5 }} />

                                        <Typography variant="caption" display="block">
                                            👍 {post.reactions.total}
                                        </Typography>

                                        <Typography variant="caption" display="block">
                                            💬 {post.comments} × 2 = {post.comments * 2}
                                        </Typography>

                                        <Typography variant="caption" display="block">
                                            🔁 {post.shares} × 3 = {post.shares * 3}
                                        </Typography>

                                        <Divider sx={{ my: 0.5 }} />

                                        <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                            display="block"
                                        >
                                            Total: {post.popularityScore}
                                        </Typography>
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

                    {post.full_picture && (
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
                                    src={post.full_picture}
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
                            {Object.entries(post.reactions.byType)
                                .map(([type, value]) => {
                                    const config = REACTIONS_CONFIG[type];
                                    if (!config) return null;

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
                                            <Typography fontSize={16}>
                                                {config.emoji}
                                            </Typography>
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
    period,
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