import { CheckBox } from "@mui/icons-material";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { SparkLineChart } from "@mui/x-charts";
import { useState } from "react";
import { integrationsConfig } from "../../../../../utils"; 

function FollowersCard({
    title = "Seguidores de la página",
    interval = "Hoy",
    selected = true,
    selectable = true,
    onSelectChange,
}) {

    const [showHighlight, setShowHighlight] = useState(true);
    const [showTooltip, setShowTooltip] = useState(true);

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

                <Box display={'flex'} gap={0.5} justifyContent={'center'} alignItems={'flex-end'}>

                    <Typography variant='h3'>100K</Typography>

                    <svg width="0" height="0">
                        <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={integrationsConfig.facebook.color} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={integrationsConfig.facebook.color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                    </svg>

                    <SparkLineChart 
                        data={[1, 4, 2, 5, 7, 2, 4, 6, 10]}
                        height={70}
                        area
                        showHighlight={showHighlight}
                        showTooltip={showTooltip}
                        color={integrationsConfig.facebook.color}
                        sx={{
                            '& .MuiAreaElement-root': {
                                fill: 'url(#gradient)',
                            },
                        }}
                    />
                </Box>


            </CardContent>
        </Card>
    )
}

export default FollowersCard;