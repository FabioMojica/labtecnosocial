import { Box, Card, CardContent, Stack, Typography, Chip, LinearProgress, Button, useTheme } from "@mui/material";
import DashboardCard from "./DashboardCard";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { REACTIONS_CONFIG } from '../utils/cards/reactionsConfig.js'


const TopPostCard = ({ post, index }) => {
    const isTop = index === 0;

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 2,
                borderColor: isTop ? "primary.main" : "divider",
                boxShadow: isTop ? 3 : 0,
            }}
        >
            <CardContent>
                <Stack spacing={2}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Chip
                            label={`#${index + 1} Top Post`}
                            color={isTop ? "primary" : "default"}
                            size="small"
                        />

                        <Stack direction="row" spacing={1} alignItems="center">
                            <TrendingUpIcon fontSize="small" />
                            <Typography fontWeight="bold">
                                {post.popularityScore}
                            </Typography>
                        </Stack>
                    </Stack>

                    {/* Imagen */}
                    {/* Imagen */}
                    {post.full_picture && (
                        <Box
                            component="img"
                            src={post.full_picture}
                            sx={{
                                width: "100%",
                                height: {
                                    xs: 180, // móvil
                                    sm: 220,
                                    md: 280,
                                    lg: 'auto', // en lg deja que la altura se ajuste
                                },
                                maxHeight: {
                                    lg: 400 // opcional, para que no explote demasiado
                                },
                                objectFit: "contain", // mantiene la proporción sin cortar
                                borderRadius: 1,
                            }}
                        />
                    )}


                    {/* Texto */}
                    <Typography
                        variant="body2"
                        sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {post.message || "Publicación sin texto"}
                    </Typography>

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

                        {/* {post.meta.is_eligible_for_promotion && (
                            <Button size="small" variant="contained">
                                Promocionar
                            </Button>
                        )} */}
                    </Stack>

                </Stack>
            </CardContent>
        </Card>
    );
};

const TopPostOfThePeriod = ({
    error = false,
    title = "Top 5 posts populares",
    loading,
    interval, 
    period,
    topPostsData,
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
            isEmpty={topPostsData?.length === 0}
            selectable={selectable}
            selected={selected}
            onSelectChange={onSelectChange}
            sxCard={{
                height: {
                    xs: 'auto',
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
                    xs: 'auto',
                    sm: 500,
                    lg: 500
                },
                mt: 4.5,
                pb: 4.5,
            }}>
                <Stack spacing={2}>
                    {topPostsData.map((post, index) => (
                        <TopPostCard key={post.id} post={post} index={index} />
                    ))}

                    {/* Mensaje si hay menos de 5 posts */}
                    {topPostsData.length < 5 && topPostsData.length > 0 && (
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
                    {topPostsData.length === 0 && (
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

export default TopPostOfThePeriod;