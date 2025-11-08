import { Avatar, Box, Typography } from "@mui/material";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
dayjs.extend(relativeTime);
dayjs.locale("es");

function renderSparklineCell(params) {
    const { value, colDef } = params;

    if (!value || value.length === 0) return null;

    return (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <SparkLineChart
                data={value.map((d) => d.y)}
                width={colDef.computedWidth || 100}
                height={32}
                plotType="bar"
                color="hsl(210, 98%, 42%)"
                showHighlight
                showTooltip
                xAxis={{
                    scaleType: "band",
                    // data: value.map((d) =>
                    //     new Date(d.x).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    // ),
                    data: value.map((d) =>
        dayjs(d.x).format("MMM D") // ya está en local, muestra correctamente
    ),
                }}
            />
        </Box>
    );
}

export const columns = [
    {
        field: "login",
        headerName: "Usuario",
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: '100%' }}>
                <Avatar src={params.row.avatar} alt={params.value} sx={{ width: 20, height: 20 }} />
                <Typography variant="body2" noWrap>
                    {params.value}
                </Typography>
            </Box>
        ),
    },
    { field: "email", headerName: "Email", flex: 1.5, minWidth: 220 },
    { field: "totalCommits", headerName: "Commits", type: "number", flex: 0.6 },
    {
        field: "inactivity",
        headerName: "Inactividad",
        flex: 0.8,
        renderCell: (params) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: '100%' }}>
                <Typography fontSize={'0.9rem'}>{params.value}</Typography>
            </Box>
        ),
    },
    {
        field: "position",
        headerName: "Posición",
        type: "number",
        flex: 0.4,
        align: "center",
    },
    {
        field: "chartData",
        headerName: "Actividad diaria",
        flex: 1,
        minWidth: 160,
        renderCell: renderSparklineCell,
    },
];
