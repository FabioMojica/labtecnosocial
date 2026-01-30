import { CheckBox } from "@mui/icons-material";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import {
    BarChart
} from '@mui/x-charts/BarChart';
import { integrationsConfig } from "../../../../../utils";


function Gradient(props) {
    return (
        <linearGradient gradientTransform="rotate(90)" {...props}>
            <stop offset="5%" stopColor={integrationsConfig.facebook.color} stopOpacity={1} />
            <stop offset="95%" stopColor={integrationsConfig.facebook.color} stopOpacity={0.3} />
        </linearGradient>
    );
}

function TotalReactionsCard({
    title = "Reacciones totales",
    interval = "Hoy",
    selected = true,
    selectable = true,
    onSelectChange,
}) {

    const reactions = [
        { icon: "👍", label: "Me gusta" },
        { icon: "❤️", label: "Me encanta" },
        { icon: "🤗", label: "Me importa" },
        { icon: "😆", label: "Me divierte" },
        { icon: "😮", label: "Me asombra" },
        { icon: "😢", label: "Me entristece" },
        { icon: "😡", label: "Me enoja" },
    ];
    const icons = reactions.map(r => r.icon);


    const data = [120, 85, 46, 69, 34, 29, 29];

    return (
        <Card variant="outlined" sx={{ height: 150, flexGrow: 1, position: 'relative' }}>
            {selectable && (
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <CheckBox checked={selected} onChange={(e) => onSelectChange?.(e.target.checked)} />
                </Box>
            )}
            <CardContent>
                <Stack direction="column" justifyContent="flex-start" alignItems="flex-start">
                    <Typography component="h2" variant="subtitle2">{title}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{interval}</Typography>
                </Stack>


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
                            disableLine: true,
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


            </CardContent>
        </Card>
    )
}

export default TotalReactionsCard;