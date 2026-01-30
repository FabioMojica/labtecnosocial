import { CheckBox } from "@mui/icons-material";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { SparkLineChart } from "@mui/x-charts";
import { useState } from "react";
import { integrationsConfig } from "../../../../../utils";
import { useEffect } from "react";
import { ErrorScreen, NoResultsScreen, SpinnerLoading } from "../../../../../generalComponents";

function TotalLikesCard({
    loading,
    error,
    title = "Seguidores de la página",
    interval = "Hoy",
    selected = true,
    selectable = true,
    onSelectChange,
    followersData = {}
}) {

    const [showHighlight, setShowHighlight] = useState(true);
    const [showTooltip, setShowTooltip] = useState(true);

    const finalData = [1, 4, 2, 5, 7, 2, 4, 6, 10];
    const [data, setData] = useState([]);


    useEffect(() => {
        let index = 0;
        let cancelled = false;

        setData([]);

        const drawPoint = () => {
            if (cancelled || index >= finalData.length) return;

            const prev = finalData[index - 1] ?? finalData[0];
            const next = finalData[index];
            let step = 0;
            const steps = 10;

            const smooth = setInterval(() => {
                if (cancelled) {
                    clearInterval(smooth);
                    return;
                }

                const value = prev + ((next - prev) * step) / steps;

                setData(d => {
                    const copy = [...d];
                    copy[index] = value;
                    return copy;
                });

                step++;

                if (step > steps) {
                    clearInterval(smooth);
                    index++;
                    setTimeout(drawPoint, 30);
                }
            }, 8); // ~60fps
        };

        drawPoint();

        return () => {
            cancelled = true;
        };
    }, [interval]);


    return (
        <Card variant="outlined" sx={{ height: 150, flexGrow: 1, position: 'relative' }}>
            {loading ?
                <>
                    <SpinnerLoading text={`Obteniendo los seguidores de la página...`} size={30} sx={{ height: "90%" }} />
                </> 
                : error ?  
                <>
                    <ErrorScreen message="Ocurrió un error al obtener los seguidores de la página" sx={{height: "100%", width: "100%", gap: 0, p: 2}} iconSx={{ fontSize: 50}} textSx={{ fontSize: 17}}/>
                </>  
                : (followersData.length === 0 && !error && !loading) ? 
                <>
                    <NoResultsScreen message="No hay datos para mostrar" iconType={'outline'} sx={{height: "100%", width: "100%", gap: 0, p: 2}} iconSX={{ fontSize: 50}} textSx={{ fontSize: 17}}/>
                </> 
                : 
                <>
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
                                key={interval}
                                data={data}
                                height={70}
                                area
                                curve="natural"
                                showHighlight={showHighlight}
                                showTooltip={showTooltip}
                                color={integrationsConfig.facebook.color}
                                sx={{
                                    '& .MuiAreaElement-root': {
                                        fill: 'url(#gradient)',
                                    },
                                    '& .MuiLineElement-root': {
                                        transition: 'none',
                                    },
                                }}
                            />
                        </Box>
                    </CardContent>
                </>
            }
        </Card>
    )
}

export default TotalLikesCard;