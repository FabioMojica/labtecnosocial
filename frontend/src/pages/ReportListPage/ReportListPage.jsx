import { useTheme } from '@mui/material/styles';
import { Box, CssBaseline, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Stack, TextField, Toolbar, Typography, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import { useFetchAndLoad } from '../../hooks';
import { useAuth, useNotification } from '../../contexts';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';
import {
    SearchBar,
    ButtonWithLoader,
    ErrorScreen,
    FullScreenProgress,
    NoResultsScreen
} from '../../generalComponents';

import { useNavigate } from 'react-router-dom';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import AddIcon from '@mui/icons-material/Add';
import { useLayout } from '../../contexts/LayoutContext';
import { getAllReportsApi } from '../../api/reports';
import { formatDateParts } from '../../utils/formatDate';


const sortOptions = [
    { label: "Nombre A → Z", value: "name_asc" },
    { label: "Nombre Z → A", value: "name_desc" },
    { label: "Más antiguos", value: "created_asc" },
    { label: "Menos antiguos", value: "created_desc" },
];


export function ReportsListPage() {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const { loading, callEndpoint } = useFetchAndLoad();
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const isLaptop = useMediaQuery(theme.breakpoints.up('md'));
    const [selectedReport, setSelectedReport] = useState(null);
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [sortBy, setSortBy] = useState("name_asc");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [searchedReports, setSearchedReports] = useState([]);
    const { user, isAdmin, isSuperAdmin } = useAuth();

    useEffect(() => {
        setSearchedReports(reports);
    }, [reports]);

    const fetchAllReports = async () => {
        try {
            const response = await callEndpoint(getAllReportsApi());
            setReports(response);
            setFilteredReports(response);
            setError(false);
        } catch (err) {
            setError(true);
        }
    }

    useEffect(() => {
        fetchAllReports();
    }, [])

    if (loading) return <FullScreenProgress text="Obteniendo los reportes" />

    if (error) {
        return (
            <ErrorScreen
                message={"Ocurrió un error al obtener los reportes"}
                buttonText="Volver a intentar"
                onButtonClick={() => fetchAllReports()}
            />
        );
    }

    const handleCreateReport = () => {
        navigate('/reportes/editor')
    }

    if (!loading && reports.length === 0) {
        return (
            <NoResultsScreen
                message='Aún no tienes reportes registrados'
                buttonText="Crear uno"
                triggerOnEnter
                onButtonClick={() => navigate("/reportes/editor")}
            />
        );
    }

    const filterReports = (reportsArray) => {
        return reportsArray;
    };

    const sortReports = (reportsArray) => {
        const sorted = [...reportsArray];

        switch (sortBy) {
            // 1️⃣ Alfabético
            case "name_asc":
                sorted.sort((a, b) =>
                    `${a.title}`.localeCompare(
                        `${b.title}`
                    )
                );
                break;

            case "name_desc":
                sorted.sort((a, b) =>
                    `${b.title}`.localeCompare(
                        `${a.title}`
                    )
                );
                break;

            // 3️⃣ Más antiguos / menos antiguos
            case "created_asc":
                sorted.sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at)
                );
                break;

            case "created_desc":
                sorted.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                break;

            default:
                break;
        }

        return sorted;
    };

    const displayedReports = sortReports(
        filterReports(searchedReports)
    );

    return (

        <Box sx={{ display: 'flex', px: 1, py: { xs: 1, lg: 0 }, maxWidth: {xs: '100vw'} }}>
            <CssBaseline />

            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mb: 1 }}>
                <Box sx={{
                    display: 'flex',
                    gap: 1,
                    flexDirection: 'column',
                    width: '100%',
                    mb: 1.5
                }}>
                    <Box display={'flex'} flexDirection={{ xs: 'column', sm: 'row' }} justifyContent={'space-between'} gap={1}>
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{
                                fontSize: {
                                    xs: '1.5rem',
                                    sm: '2rem'
                                },
                                width: { xs: '100%', sm: 'auto' },
                                textAlign: 'center',
                            }}
                        >
                            Lista de reportes{" "}
                            <Typography
                                component="span"
                                color="text.secondary"
                                fontWeight="normal"
                            >
                                ({reports.length})
                            </Typography>
                        </Typography>


                        <ButtonWithLoader onClick={handleCreateReport} sx={{
                            gap: 1,
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            width: {
                                xs: "100%",
                                sm: 250,
                            },
                            minHeight: 40,
                            backgroundColor: "primary.main",
                            color: "primary.contrastText",
                            "&:hover": {
                                backgroundColor: "primary.dark",
                            },
                            "&.Mui-disabled": {
                                backgroundColor: "action.disabledBackground",
                                color: "action.disabled",
                            },
                        }}>
                            <Typography>Crear reporte</Typography>
                            <AddCircleOutlineRoundedIcon fontSize='small' />
                        </ButtonWithLoader>

                    </Box>

                    <Divider
                        sx={{
                            my: 0.5,
                        }}
                    />

                    <Box display={'flex'} flexDirection={{ xs: 'column-reverse', lg: 'row' }} gap={{ xs: 2 }}>
                        <SearchBar
                            data={reports}
                            fields={["title"]}
                            placeholder="Buscar reportes por nombre..."
                            onResults={setSearchedReports}
                        />
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Ordenar reportes por</InputLabel>
                            <Select
                                value={sortBy}
                                label="Ordenar reportes por"
                                onChange={(e) => setSortBy(e.target.value)}
                                size="small"
                            >
                                {sortOptions.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Divider sx={{ mt: 0.5 }} />
                </Box>

                <Grid container 
                columns={12}
                spacing={{
                    xs: 1,
                    lg: 2
                }} sx={{
                    display: 'flex',
                    px: 1,
                }}>
                    {displayedReports.length > 0 ? (
                        displayedReports?.map((report) => (
                            <Grid size={{
                                xs: 6,
                                sm: 4,
                                lg: 2,
                            }} key={report.id}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        width: { xs: 'auto', lg: 'auto' },
                                        height: { xs: 230, lg: 230 },
                                        borderRadius: 2,
                                        boxShadow: 5,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'flex-end',
                                        '&:hover': {
                                            boxShadow: 8,
                                            transform: 'scale(1.05)',
                                            transition: '0.2s',
                                        },
                                    }} 
                                    onClick={() => { 
                                        navigate(`/reportes/editor/${report?.title}`,{
                                            state: {
                                                id: Number(report?.id)
                                            }
                                        });
                                    }}
                                >
                                    <Box sx={{
                                        bgcolor: 'background.paper',
                                        p: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderTop: 'none',
                                        borderLeft: 'none',
                                        borderRight: 'none',
                                    }}>
                                        <Typography

                                            variant="body2"
                                            fontWeight="bold"
                                            lineHeight={1.2}
                                            sx={{
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                width: '100%',
                                            }}
                                        >
                                            {report?.title}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                                        <SummarizeRoundedIcon sx={{
                                            fontSize: {
                                                xs: 70,
                                                lg: 100
                                            }
                                        }} />
                                    </Box>

                                    <Box
                                        sx={{
                                            bgcolor: 'background.paper',
                                            p: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderLeft: 'none',
                                            borderRight: 'none',
                                            borderBottom: 'none',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1,
                                        }}
                                    >
                                        {/* Creado */}
                                        <Box display={'flex'} flexDirection={'column'} gap={1}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                fontWeight={'bold'}
                                                lineHeight={1}
                                            >
                                                Creado:
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                lineHeight={0.5}
                                                color='textDisabled'
                                                fontStyle={'italic'}
                                                sx={{
                                                    textAlign: 'left',
                                                    wordWrap: 'break-word',
                                                }}
                                            >
                                                {formatDateParts(report?.created_at).date}{' '}
                                                {formatDateParts(report?.created_at).time}
                                            </Typography>
                                        </Box>

                                        {/* Actualizado */}
                                        <Box display={'flex'} flexDirection={'column'} gap={1}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                fontWeight={'bold'}
                                                lineHeight={1}
                                            >
                                                Actualizado:
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color='textDisabled'
                                                lineHeight={0.5}
                                                fontStyle={'italic'}
                                                sx={{
                                                    textAlign: 'left',
                                                    wordWrap: 'break-word',
                                                }}
                                            >
                                                {formatDateParts(report?.updated_at).date}{' '}
                                                {formatDateParts(report?.updated_at).time}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1, mt: 0.1 }}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                lineHeight={1}
                                                fontWeight={'bold'}
                                            >
                                                Versión:
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                fontStyle={'italic'}
                                                lineHeight={1}
                                                sx={{
                                                    textAlign: 'left',
                                                    wordWrap: 'break-word',
                                                }}
                                            >
                                                {report?.report_version}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))) : (
                        <Box sx={{ width: '100%' }}>
                            <NoResultsScreen
                                sx={{ height: '50vh' }}
                                message="No se encontraron resultados"
                            />
                        </Box>
                    )}
                </Grid>
            </Box>
        </Box >
    );
}
