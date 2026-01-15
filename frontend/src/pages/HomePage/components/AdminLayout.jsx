import { Typography, Grid, useTheme, Box } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';
import { GridItem } from "./GridItem";
import { useAuth, useHeaderHeight } from "../../../contexts";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useEffect, useMemo, useState } from "react";
import { useFetchAndLoad } from "../../../hooks";
import logoLight from "../../../assets/labTecnoSocialLogoLight.png"
import logoDark from "../../../assets/labTecnoSocialLogoDark.png"
import { getSummaryDataApi } from "../../../api";
import { RealTimeClock } from "./RealTimeClock";
import { Carousel } from "./Carousel";
import { ErrorScreen, FullScreenProgress, Image } from "../../../generalComponents";

dayjs.extend(utc);
dayjs.extend(timezone);

export const AdminLayout = () => {
    const { headerHeight } = useHeaderHeight();
    const boliviaNow = useMemo(() => dayjs().tz('America/La_Paz'), []);
    const theme = useTheme();
    const logoToShow = theme.palette.mode === 'dark' ? logoDark : logoLight;
    const { user } = useAuth();
    if (!user) return;
    const { loading, callEndpoint } = useFetchAndLoad();
    const [data, setData] = useState();
    const [error, setError] = useState(false);

    const fetchAllHomeData = async () => {
        try {
            const response = await callEndpoint(getSummaryDataApi(user));

            setData(response);
            return response;
        } catch (err) {
            setError(true);
        }
    };

    useEffect(() => {
        const storedData = sessionStorage.getItem("homeData");

        if (storedData) {
            setData(JSON.parse(storedData));
        } else {
            fetchAllHomeData().then((response) => {
                if (response) {
                    sessionStorage.setItem("homeData", JSON.stringify(response));
                }
            });
        }
    }, []);


    const carouselItems = data?.map((item, index) => (
        <Box
            key={index}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 2,
                p: 2,
            }}
        >
            <Typography variant="subtitle2" color="text.secondary">
                {item.clave}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.5 }}>
                {item.valor}
            </Typography>
        </Box>
    )) ?? [];

    if (error) return <ErrorScreen message="Ocurrió un error al iniciar la página de inicio" onButtonClick={() => fetchAllHomeData()} />
    if (loading) return <FullScreenProgress text="Iniciando el sistema" />

    return (
        <Grid 
            container
            spacing={1}
            sx={{
                height: {
                    xs: 'auto',
                    md: `calc(100vh - ${headerHeight}px)`,
                    lg: 'auto',
                },
                width: '100%',
                p: {xs: 1, sm: 2}
            }}>
            <Grid size={{ xs: 12, md: 8 }} sx={{ height: { md: '100%', xs: 'auto' }, display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                <Typography
                    textAlign="center"
                    fontWeight="bold"
                    sx={{
                        fontSize: { xs: 35, sm: 45 },
                        display: "-webkit-box",
                        WebkitLineClamp: { xs: 2, sm: 1 },
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                    }}
                >
                    Hola! {user?.firstName} {user?.lastName}
                </Typography>


                <Image src={logoToShow} alt="Lab Tecno Social Logo" width={230} height={100} />

                <Grid justifyContent="center" container columns={12} spacing={1.5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <GridItem
                            title="Planificación Estratégica"
                            description="Gestiona todos tus planes estratégicos anuales"
                            icon={<AccountTreeRoundedIcon fontSize="large" />}
                            link={`/planificacion-estrategica/${new Date().getFullYear()}`}
                            
                        />
                    </Grid >
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <GridItem
                            title="Planificación Operativa"
                            description="Crea y edita planes operativos para tus proyectos"
                            icon={<TableChartRoundedIcon fontSize="large" />}
                            link="/planificacion-operativa"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <GridItem
                            title="Gestión de Proyectos"
                            description="Crea proyectos, asignale responsables e integralos con plataformas"
                            icon={<FolderCopyRoundedIcon fontSize="large" />}
                            link="/proyectos"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <GridItem
                            title="Gestión de Usuarios"
                            description="Gestiona usuarios con roles de administrador y coordinador"
                            icon={<PeopleOutlineRoundedIcon fontSize="large" />}
                            link="/usuarios"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <GridItem
                            title="Dashboard de KPIs"
                            description="Visualiza los indicadores más importantes de tus proyectos integrados con plataformas"
                            icon={<AssessmentRoundedIcon fontSize="large" />}
                            link="/dashboard"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <GridItem
                            title="Elaboración de reportes"
                            description="Elabora reportes desde distintos puntos del sistema"
                            icon={<SummarizeRoundedIcon fontSize="large" />}
                            link="/reportes"
                        />
                    </Grid>
                </Grid>
            </Grid>

            <Grid  container size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', with: '100%', gap: 1 }}>
                <RealTimeClock />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box
                        sx={{
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2,
                            width: {
                                xs: '260px',
                                sm: 'auto'
                            },
                            height: 'auto',
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                    >
                        <DateCalendar
                            defaultValue={boliviaNow}
                            shouldDisableDate={() => true}
                        />
                    </Box>
                </LocalizationProvider>
                {data && data.length > 0 && (
                    <Carousel
                        width={260}
                        height={60}
                        speed={30}
                        items={carouselItems}
                    />
                )}
            </Grid>
        </Grid>
    );
}