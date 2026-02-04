import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import {
    BarChart
} from '@mui/x-charts/BarChart';
import { integrationsConfig } from "../../../../../utils";
import { DashboardCard } from './DashboardCard';

function Gradient(props) {
    return (
        <linearGradient gradientTransform="rotate(90)" {...props}>
            <stop offset="5%" stopColor={integrationsConfig.facebook.color} stopOpacity={1} />
            <stop offset="95%" stopColor={integrationsConfig.facebook.color} stopOpacity={0.3} />
        </linearGradient>
    );
}

export const TotalReactionsCard = ({
    error,
    loading,
    title = "Reacciones totales",
    interval = "Hoy",
    selected = true,
    selectable = true,
    onSelectChange,
    totalReactionsOfPage = []
}) => {
    const reactions = [
        { icon: "👍", label: "Me gusta / me importa" },
        { icon: "❤️", label: "Me encanta" },
        { icon: "😆", label: "Me divierte" },
        { icon: "😮", label: "Me asombra" },
        { icon: "😢", label: "Me entristece" },
        { icon: "😡", label: "Me enoja" },
    ];

    const icons = reactions.map(r => r.icon);

    const data = totalReactionsOfPage || [];

    return (
        <DashboardCard
            title={title}
            titleSpinner={'Obteniendo las reacciones totales de la página...'}
            titleError={'Ocurrió un error al obtener las reacciones totales de la página'}
            sxSpinner={{
                fontSize: '0.9rem',
                pt: 3.5
            }}
            smallCard
            interval={interval}
            loading={loading}
            error={error}
            isEmpty={totalReactionsOfPage.length === 0}
            selectable={selectable}
            selected={selected}
            onSelectChange={onSelectChange}
        >
            <Box mt={4.5}>
            <BarChart
                borderRadius={2}
                xAxis={[
                    {
                        categoryGapRatio: 0.1,
                        barGapRatio: 0.5,
                        scaleType: "band",
                        data: icons,
                        tickLabelPlacement: "middle",
                        disableTicks: true,
                        disableLine: false,
                    },
                ]}
                yAxis={[{
                    width: 0,
                    disableTicks: true,
                    disableLine: true,
                    tickSize: 2000
                }]}
                series={[{
                    data,
                    color: 'url(#bar-gradient)',
                    valueFormatter: (value, context) => {
                        const reaction = reactions[context.dataIndex];
                        return `${reaction.label}: ${value}`;
                    },
                }]}
                height={105}
                grid={{ horizontal: false, vertical: false }}
            >
                <defs>
                    <Gradient id="bar-gradient" />
                </defs>
            </BarChart>
            </Box>
        </DashboardCard>
    )
}


