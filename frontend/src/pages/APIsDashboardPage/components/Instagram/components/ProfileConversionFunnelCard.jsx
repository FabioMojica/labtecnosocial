import { Box, LinearProgress, Stack, Tooltip, Typography, linearProgressClasses } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { DashboardCard } from "../../Facebook/components/DashboardCard";
import { formatNumber } from "../../Facebook/utils/cards";

const SEGMENT_COLORS = {
    no_tap: "hsl(220, 20%, 65%)",
    tap_no_click: "hsl(220, 20%, 42%)",
    website_clicks: "#1D9BF0",
};

const StyledText = styled("text", {
    shouldForwardProp: (prop) => prop !== "variant",
})(({ theme }) => ({
    textAnchor: "middle",
    dominantBaseline: "central",
    fill: (theme.vars || theme).palette.text.secondary,
    variants: [
        {
            props: { variant: "primary" },
            style: {
                fontSize: theme.typography.h5.fontSize,
                fontWeight: theme.typography.h5.fontWeight,
            },
        },
        {
            props: ({ variant }) => variant !== "primary",
            style: {
                fontSize: theme.typography.body2.fontSize,
                fontWeight: theme.typography.body2.fontWeight,
            },
        },
    ],
}));

function PieCenterLabel({ primaryText, secondaryText }) {
    const { width, height, left, top } = useDrawingArea();
    const primaryY = top + height / 2 - 10;
    const secondaryY = primaryY + 24;

    return (
        <>
            <StyledText variant="primary" x={left + width / 2} y={primaryY}>
                {primaryText}
            </StyledText>
            <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
                {secondaryText}
            </StyledText>
        </>
    );
}

function ProfileConversionFunnelCard({
    loading,
    error,
    title = "Embudo de conversion",
    interval = "Hoy",
    selected = true,
    selectable = true,
    onSelectChange,
    data = {},
}) {
    const theme = useTheme();
    const pieData = Array.isArray(data?.pieData) ? data.pieData : [];
    const conversionRates = data?.conversionRates || {};
    const profileViewsTotal = Number(data?.profileViewsTotal ?? 0);
    const hasRows = pieData.length > 0;
    const colors = pieData.map((item) => SEGMENT_COLORS[item?.id] || "hsl(220, 20%, 35%)");

    return (
        <DashboardCard
            title={title}
            titleSpinner={"Obteniendo embudo de conversion..."}
            titleError={"Ocurrio un error al obtener embudo de conversion"}
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
            <Box sx={{ mt: 3, minHeight: 145, display: "flex", flexDirection: "column", gap: 0.65 }}>
                <Box
                    sx={{
                        mt: 0.1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.3,
                        maxHeight: { xs: "none", md: 168 },
                        overflowY: { xs: "visible", md: "auto" },
                        pr: { xs: 0, md: 0.4 },
                        pb: { xs: 0, md: 0.5 },
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
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ pt: 0.6 }}>
                        <Typography variant="caption" color="text.secondary">
                            Conversion total perfil {"->"} web
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                            {conversionRates?.clicksVsViews ?? 0}%
                        </Typography>
                    </Stack>

                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <PieChart
                            colors={colors}
                            margin={{ left: 45, right: 45, top: 45, bottom: 45 }}
                            series={[{
                                data: pieData,
                                innerRadius: 35,
                                outerRadius: 54,
                                paddingAngle: 0,
                                highlightScope: { fade: "global", highlight: "item" },
                            }]}
                            height={120}
                            width={120}
                            hideLegend
                        >
                            {profileViewsTotal > 0 && (
                                <PieCenterLabel primaryText={formatNumber(profileViewsTotal)} secondaryText="Perfil" />
                            )}
                        </PieChart>
                    </Box>

                    {pieData.map((item) => {
                        const value = Number(item?.value ?? 0);
                        const percentage = profileViewsTotal > 0 ? (value / profileViewsTotal) * 100 : 0;
                        const color = SEGMENT_COLORS[item?.id] || "hsl(220, 20%, 35%)";

                        return (
                            <Stack key={item?.id} spacing={0.2}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.8}>
                                    <Typography variant="caption" noWrap sx={{ minWidth: 0 }}>
                                        {item?.name ?? "Etapa"}
                                    </Typography>
                                    <Tooltip title={value.toLocaleString("es-BO")} arrow>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatNumber(value)} ({Math.round(percentage)}%)
                                        </Typography>
                                    </Tooltip>
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
                    <Stack direction="row" justifyContent="space-between" sx={{ pt: 0.1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Perfil {"->"} Link: {conversionRates?.tapsVsViews ?? 0}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Link {"->"} Web: {conversionRates?.clicksVsTaps ?? 0}%
                        </Typography>
                    </Stack>
                </Box>
            </Box>
        </DashboardCard>
    );
}

export default ProfileConversionFunnelCard;
