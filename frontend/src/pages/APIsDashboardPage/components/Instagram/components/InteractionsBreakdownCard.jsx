import { Box, LinearProgress, Stack, Tooltip, Typography, linearProgressClasses } from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded";
import { useTheme } from "@mui/material/styles";
import { DashboardCard } from "../../Facebook/components/DashboardCard";
import { formatNumber } from "../../Facebook/utils/cards";

const METRIC_COLORS = {
    likes: "#E1306C",
    comments: "#8E44AD",
    shares: "#1D9BF0",
    saves: "#F39C12",
    replies: "#2ECC71",
    reposts: "#95A5A6",
};

const METRIC_ICONS = {
    likes: <FavoriteBorderRoundedIcon sx={{ fontSize: 14, color: METRIC_COLORS.likes }} />,
    comments: <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 14, color: METRIC_COLORS.comments }} />,
    shares: <ShareOutlinedIcon sx={{ fontSize: 14, color: METRIC_COLORS.shares }} />,
    saves: <BookmarkBorderOutlinedIcon sx={{ fontSize: 14, color: METRIC_COLORS.saves }} />,
    replies: <ReplyOutlinedIcon sx={{ fontSize: 14, color: METRIC_COLORS.replies }} />,
    reposts: <RepeatRoundedIcon sx={{ fontSize: 14, color: METRIC_COLORS.reposts }} />,
};

function InteractionsBreakdownCard({
    loading,
    error,
    title = "Desglose de interacciones",
    interval = "Hoy",
    selected = true,
    selectable = true,
    onSelectChange,
    data = {},
}) {
    const theme = useTheme();
    const rows = Array.isArray(data?.chartData) ? data.chartData : [];
    const total = Number(data?.total ?? 0);
    const hasRows = rows.length > 0;

    return (
        <DashboardCard
            title={title}
            titleSpinner={"Obteniendo desglose de interacciones..."}
            titleError={"Ocurrio un error al obtener desglose de interacciones"}
            sxSpinner={{
                fontSize: "0.9rem",
                pt: 3.5,
            }}
            smallCard
            height={{ xs: "auto", sm: "auto", md: 235 }}
            interval={interval}
            loading={loading}
            error={error}
            isEmpty={!hasRows}
            selectable={selectable}
            selected={selected}
            onSelectChange={onSelectChange}
        >
            <Box sx={{ mt: 6, minHeight: 145, display: "flex", flexDirection: "column", gap: 0.65 }}>
                <Stack direction="row" justifyContent="center" alignItems="baseline" spacing={0.5}>
                    <Tooltip title={total.toLocaleString("es-BO")} arrow>
                        <Typography variant="h4" fontWeight={500} lineHeight={1}>
                            {formatNumber(total)}
                        </Typography>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary">
                        interacciones
                    </Typography>
                </Stack>

                <Box
                    sx={{
                        mt: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.2,
                        maxHeight: { xs: "none", md: 112 },
                        overflowY: { xs: "visible", md: "auto" },
                        pr: { xs: 0, md: 0.5 },
                        "&::-webkit-scrollbar": { width: "2px" },
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
                    {rows.map((item) => {
                        const value = Number(item?.value ?? 0);
                        const percentageRaw = total > 0 ? (value / total) * 100 : 0;
                        const percentage = Math.max(0, Math.min(100, percentageRaw));
                        const color = METRIC_COLORS[item?.key] || "#9E9E9E";
                        const icon = METRIC_ICONS[item?.key] || null;

                        return (
                            <Stack key={item?.key} spacing={0.2}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        {icon}
                                        <Typography variant="caption">
                                            {item?.name ?? "Tipo"}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatNumber(value)} ({Math.round(percentage)}%)
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={percentage}
                                    sx={{
                                        height: 4,
                                        borderRadius: 999,
                                        [`& .${linearProgressClasses.bar}`]: {
                                            backgroundColor: color,
                                        },
                                    }}
                                />
                            </Stack>
                        );
                    })}
                </Box>
            </Box>
        </DashboardCard>
    );
}

export default InteractionsBreakdownCard;
