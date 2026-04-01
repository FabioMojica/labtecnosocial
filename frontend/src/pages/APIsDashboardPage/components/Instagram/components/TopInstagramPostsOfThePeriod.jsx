import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    LinearProgress,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useEffect, useState } from "react";
import { formatDateParts } from "../../../../../utils/formatDate.js";
import { DashboardCard } from "../../Facebook/components/DashboardCard";

function TopInstagramPostCard({ post, index, maxPopularityScore = 0 }) {
    const [imageSrc, setImageSrc] = useState(post?.full_picture || post?.meta?.thumbnail_url || null);

    useEffect(() => {
        setImageSrc(post?.full_picture || post?.meta?.thumbnail_url || null);
    }, [post?.full_picture, post?.meta?.thumbnail_url]);

    const rank = index + 1;
    const likesCount = Number(post?.reactions?.byType?.LIKE ?? post?.reactions?.total ?? 0);
    const commentsCount = Number(post?.comments ?? 0);
    const sharesCount = Number(post?.shares ?? 0);
    const savesCount = Number(post?.meta?.saves ?? 0);
    const likesScore = likesCount;
    const commentsScore = commentsCount * 2;
    const sharesScore = sharesCount * 3;
    const savesScore = savesCount * 2;
    const computedPopularityScore = likesScore + commentsScore + sharesScore + savesScore;
    const popularityScore = Number(post?.popularityScore ?? computedPopularityScore);
    const popularityPercent = maxPopularityScore > 0
        ? Math.min((popularityScore / maxPopularityScore) * 100, 100)
        : 0;
    const popularityPercentLabel = `${Math.round(popularityPercent)}%`;

    return (
        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "divider" }}>
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Chip label={`Top ${rank} - Post destacado`} size="small" />

                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <TrendingUpIcon fontSize="small" />
                            <Typography fontWeight="bold">{popularityScore}</Typography>
                            <Tooltip
                                arrow
                                placement="top"
                                title={
                                    <Box sx={{ minWidth: 240 }}>
                                        <Typography variant="caption" fontWeight="bold" display="block">
                                            Cómo se calcula la popularidad
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Puntaje = Me gusta + (Comentarios x 2) + (Compartidos x 3) + (Guardados x 2)
                                        </Typography>
                                        <Divider sx={{ my: 0.75 }} />
                                        <Stack spacing={0.5}>
                                            <Typography variant="caption">Me gusta: {likesCount} x 1 = {likesScore}</Typography>
                                            <Typography variant="caption">Comentarios: {commentsCount} x 2 = {commentsScore}</Typography>
                                            <Typography variant="caption">Compartidos: {sharesCount} x 3 = {sharesScore}</Typography>
                                            <Typography variant="caption">Guardados: {savesCount} x 2 = {savesScore}</Typography>
                                        </Stack>
                                        <Divider sx={{ my: 0.75 }} />
                                        <Typography variant="caption" fontWeight="bold" display="block">
                                            Total: {computedPopularityScore}
                                        </Typography>
                                    </Box>
                                }
                            >
                                <InfoOutlinedIcon fontSize="inherit" sx={{ cursor: "help", color: "text.secondary" }} />
                            </Tooltip>
                        </Stack>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="flex-end">
                        <Box>
                            <Box sx={{ display: "flex", gap: 0.8, alignItems: "center", mb: 0.2 }}>
                                <CalendarMonthIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption" lineHeight={1}>Publicado</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" lineHeight={1} fontSize={10}>
                                {formatDateParts(post?.created_time).date}
                            </Typography>
                        </Box>

                        {post?.updated_time && (
                            <Box>
                                <Box sx={{ display: "flex", gap: 0.8, alignItems: "center", mb: 0.2 }}>
                                    <EditCalendarIcon sx={{ fontSize: 14 }} />
                                    <Typography variant="caption" lineHeight={1}>Editado</Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" lineHeight={1} fontSize={10}>
                                    {formatDateParts(post?.updated_time).date}
                                </Typography>
                            </Box>
                        )}
                    </Stack>

                    {imageSrc && (
                        <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Box sx={{ height: "auto", maxHeight: 400, borderRadius: 2, overflow: "hidden" }}>
                                <Box
                                    component="img"
                                    src={imageSrc}
                                    onError={() => setImageSrc(null)}
                                    sx={{
                                        width: "100%",
                                        maxWidth: 500,
                                        height: { xs: 180, sm: 220, md: 280, lg: "auto" },
                                        maxHeight: 400,
                                        objectFit: "contain",
                                        display: "block",
                                    }}
                                />
                            </Box>
                        </Box>
                    )}

                    <Divider />

                    {post?.message ? (
                        <Typography
                            variant="body2"
                            sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {post.message}
                        </Typography>
                    ) : (
                        <Typography
                            variant="body2"
                            color="textDisabled"
                            sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                fontStyle: "italic",
                            }}
                        >
                            Publicación sin texto
                        </Typography>
                    )}

                    <Divider />

                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        justifyContent="space-between"
                    >
                        <Stack direction="row" spacing={1.2}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <FavoriteBorderRoundedIcon fontSize="small" />
                                <Typography variant="caption">{likesCount}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <ChatBubbleOutlineRoundedIcon fontSize="small" />
                                <Typography variant="caption">{commentsCount}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <ShareOutlinedIcon fontSize="small" />
                                <Typography variant="caption">{sharesCount}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <BookmarkBorderOutlinedIcon fontSize="small" />
                                <Typography variant="caption">{savesCount}</Typography>
                            </Stack>
                        </Stack>
                    </Stack>

                    <Box>
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">Nivel de popularidad</Typography>
                            <Typography variant="caption" color="text.secondary">{popularityPercentLabel}</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={popularityPercent} sx={{ height: 6, borderRadius: 1 }} />
                    </Box>

                    <Stack direction="row" spacing={1}>
                        <Button
                            size="small"
                            variant="outlined"
                            href={post?.permalink_url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Ver post
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default function TopInstagramPostsOfThePeriod({
    mode = "dashboard",
    error = false,
    title = "Top publicaciones de Instagram",
    loading,
    interval,
    data,
    selected = true,
    selectable = true,
    onSelectChange,
}) {
    const theme = useTheme();
    const maxPopularityScore = Array.isArray(data)
        ? data.reduce(
            (max, post) => Math.max(max, Number(post?.popularityScore ?? 0)),
            0
        )
        : 0;

    return (
        <DashboardCard
            title={title}
            titleSpinner="Obteniendo top publicaciones de Instagram..."
            titleNoResults="No hay publicaciones para mostrar en el periodo seleccionado"
            titleError="Ocurrió un error al obtener las publicaciones de Instagram"
            interval={interval}
            loading={loading}
            error={error}
            isEmpty={data?.length === 0}
            selectable={selectable}
            selected={selected}
            onSelectChange={onSelectChange}
            sxCard={{
                height: { xs: 540, sm: 540, lg: 540 },
                maxHeight: { xs: "auto", sm: 540, lg: 540 },
            }}
        >
            <Box
                sx={{
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { width: "2px" },
                    "&::-webkit-scrollbar-track": {
                        backgroundColor: theme.palette.background.default,
                        borderRadius: "2px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: "2px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                    maxHeight: { xs: 540, sm: mode === "report" ? "auto" : 540, lg: mode === "report" ? "auto" : 540 },
                    mt: 4.5,
                    pb: 4.5,
                    pr: 1,
                }}
            >
                    <Stack spacing={2} sx={{ mb: 5 }}>
                        {Array.isArray(data) && data.map((post, index) => (
                            <TopInstagramPostCard
                                key={post.id}
                                post={post}
                                index={index}
                                maxPopularityScore={maxPopularityScore}
                            />
                        ))}

                    {Array.isArray(data) && data.length < 5 && data.length > 0 && (
                        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2, fontStyle: "italic", mb: 5 }}>
                            No hay más publicaciones para mostrar en el periodo.
                        </Typography>
                    )}

                    {(!Array.isArray(data) || data.length === 0) && (
                        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2, fontStyle: "italic", mb: 5 }}>
                            No hay publicaciones disponibles en este periodo.
                        </Typography>
                    )}
                </Stack>
            </Box>
        </DashboardCard>
    );
}
