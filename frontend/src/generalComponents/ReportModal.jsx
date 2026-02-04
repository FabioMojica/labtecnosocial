import { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  Stack,
  Checkbox,
  TextField,
  Button,
  useTheme,
  Divider,
  Tooltip, 
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useReport } from '../contexts';
import { useNavigate } from "react-router-dom";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useConfirm } from 'material-ui-confirm';
import { integrationsConfig } from '../utils';

export const ReportModal = ({ open, onClose, reports = [] }) => {
  const { selectedCharts, removeChart, clearCharts } = useReport();
  const theme = useTheme();
  const navigate = useNavigate();
  const confirm = useConfirm();

  // estados para los sub-modales
  const [newReportModal, setNewReportModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newReportName, setNewReportName] = useState('');

  const handleOpenNewReport = () => setNewReportModal(true);
  const handleCloseNewReport = () => {
    setNewReportModal(false);
    setNewReportName('');
  };

  const handleOpenConfirmModal = (report) => {
    setSelectedReport(report);
    setConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setConfirmModal(false);
    setSelectedReport(null);
  };

  const parseChartId = (id) => {
    const parts = id.split('-');

    return {
      platform: parts.find(p => p.startsWith('platform:'))?.replace('platform:', ''),
      period: parts.at(-1),
    };
  };

  const groupedCharts = selectedCharts.reduce((acc, chart) => {
    const { platform } = parseChartId(chart.id);

    if (!acc[platform]) acc[platform] = {};
    if (!acc[platform][chart.interval]) acc[platform][chart.interval] = [];

    acc[platform][chart.interval].push(chart);
    return acc;
  }, {});

  const handleClearAllCharts = () => {
    confirm({
      title: "Eliminar todas las gráficas seleccionadas",
      description: "¿Está seguro que desea borrar toda la selección de gráficas?",
      confirmationText: "Sí, borrar",
      cancellationText: "No",
    })
      .then((result) => {
        if (result.confirmed === true) {
          clearCharts();
        }
      })
      .catch(() => {
      });
  }

  const totalCharts = Object.values(groupedCharts)
    .flatMap(periods => Object.values(periods))
    .flat()
    .length;


  return (
    <>
      {/* MODAL PRINCIPAL */}
      <Modal
        open={open}
        onClose={onClose}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            width: '90vw',
            maxWidth: 900,
            height: '90vh',
            bgcolor: 'background.paper',
            p: {
              xs: 1,
              lg: 3
            },
            position: 'relative',
            borderRadius: 2,
            boxShadow: 24,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Botón X */}
          <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" fontWeight={'bold'} sx={{ mb: 2 }}>
            Reportes
          </Typography>

          <Box
            sx={{
              display: 'flex',
              width: '100%',
              flexDirection: {
                xs: 'column',
                lg: 'row',
              },
              gap: 1,
              flexGrow: 1,
              overflowY: {
                xs: 'auto',
                "&::-webkit-scrollbar": { width: "2px" },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "4px",
                },
                lg: 'hidden'
              },
            }}
          >
            {/* Panel Izquierdo: Gráficas seleccionadas */}
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                <Box display={'flex'} gap={1} mx={1}>
                  <Typography variant="subtitle1" fontWeight={'bold'} lineHeight={1} textAlign="left">
                    Gráficas seleccionadas
                  </Typography>
                  <Typography
                    component="span"
                    color="text.secondary"
                    fontWeight="normal"
                    fontSize={'0.7rem'}
                  >
                    ({totalCharts})
                  </Typography>
                </Box>

                <Tooltip title={'Eliminar todas las gráficas seleccionadas'}
                  PopperProps={{
                    sx: {
                      zIndex: 99999,
                    }
                  }}
                >
                  <span>
                    <IconButton
                      size='medium'
                      onClick={handleClearAllCharts}
                      disabled={totalCharts === 0}
                    >
                      <HighlightOffIcon fontSize='small' />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              <Box
                sx={{
                  width: '100%',
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  p: 2,
                  overflowY: 'auto',
                  "&::-webkit-scrollbar": { width: "2px" },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: "4px",
                  },
                  height: {
                    xs: 'auto',
                    lg: '100%'
                  },
                  maxHeight: {
                    xs: 400,
                    lg: '100%'
                  },
                }}
              >
                {totalCharts === 0 ? (
                  <Box sx={{
                    width: '100%',
                    height: '90%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Typography variant="body2" fontStyle="italic" textAlign="center">
                      No hay gráficos seleccionados
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {Object.entries(groupedCharts).map(([platform, periods]) => {
                      const PlatformIcon = integrationsConfig[platform]?.icon;

                      return (
                        <Box key={platform}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Avatar
                              sx={{
                                bgcolor: integrationsConfig[platform].color,
                                width: 20,
                                height: 20,
                                borderRadius: 2,
                                boxShadow: (theme) =>
                                  theme.palette.mode === 'light'
                                    ? '0 0 0 1px rgba(0,0,0,0.3)'
                                    : '0 0 0 1px rgba(255,255,255,0.3)',
                              }}
                            >
                              <PlatformIcon sx={{ color: "#fff", fontSize: 15 }} />
                            </Avatar>

                            <Typography fontWeight="bold" variant="subtitle1">
                              {integrationsConfig[platform]?.label || platform}
                            </Typography>
                          </Box>

                          {Object.entries(periods).map(([interval, charts]) => (
                            <Box key={interval} sx={{ pl: 2, mb: 1 }}>
                              <Divider />
                              <Typography variant="body2" fontStyle="italic" sx={{ my: 0.5 }}>
                                {interval}
                              </Typography>
                              <Stack spacing={1}>
                                {charts.map(chart => (

                                  <Paper
                                    key={chart.id}
                                    variant="outlined"
                                    sx={{
                                      py: 1,
                                      pl: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      borderRadius: 1,
                                      bgcolor: 'background.paper',
                                      '&:hover': {
                                        bgcolor: 'action.hover',
                                      },
                                    }}
                                  >
                                    <Typography variant="body2">{chart.title}</Typography>
                                    <Checkbox
                                      onChange={() => removeChart({id: chart?.id})}
                                      checked
                                    />
                                  </Paper>
                                ))}
                              </Stack>
                            </Box>
                          ))}
                        </Box>)
                    })}
                  </Stack>
                )}
              </Box>
            </Box>

            <Divider orientation='vertical' sx={{
              display: {
                xs: 'none',
                lg: 'block'
              }
            }} />

            {/* Panel Derecho: Reportes */}
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography fontWeight={'bold'} variant="subtitle1" textAlign="left" sx={{ mb: 1, ml: 1 }}>
                Tus Reportes
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  p: 2,
                  overflowY: 'auto',
                  "&::-webkit-scrollbar": { width: "2px" },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: "4px",
                  },
                  height: {
                    xs: 'auto',
                    lg: '100%'
                  },
                  maxHeight: {
                    xs: 'auto',
                    lg: '100%'
                  },
                }}
              >
                <Grid container spacing={3}>
                  <Grid item>
                    <Paper
                      elevation={3}
                      sx={{
                        width: { xs: 100, lg: 120 },
                        height: { xs: 140, lg: 160 },
                        display: 'flex',
                        px: 2,
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: selectedCharts.length === 0 ? 'default' : 'pointer',
                        borderRadius: 2,
                        bgcolor: selectedCharts.length === 0 ? 'action.disabledBackground' : 'background.default',
                        '&:hover': {
                          boxShadow: selectedCharts.length === 0 ? 'none' : 6,
                          transform: selectedCharts.length === 0 ? 'none' : 'scale(1.05)',
                          transition: '0.2s',
                        },
                      }}
                      onClick={selectedCharts.length === 0 ? undefined : handleOpenNewReport}
                    >
                      <AddIcon fontSize="large" color={selectedCharts.length === 0 ? 'disabled' : 'action'} />
                      {selectedCharts.length === 0 ?
                        <Typography variant="body2" color='textDisabled' fontStyle="italic" textAlign="center" sx={{ fontSize: { xs: '0.5rem', sm: '0.7rem' } }}>
                          No hay gráficos seleccionados
                        </Typography> :
                        <Typography variant="body2" color='textDisabled' fontStyle="italic" textAlign="center" sx={{ fontSize: { xs: '0.5rem', sm: '0.7rem' } }}>
                          Crear nuevo reporte
                        </Typography>
                      }
                    </Paper>
                  </Grid>

                  {/* Reportes existentes */}
                  {reports?.map((report) => (
                    <Grid item key={report.id}>
                      <Paper
                        elevation={3}
                        sx={{
                          width: 120,
                          height: 160,
                          borderRadius: 2,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          p: 1,
                          bgcolor: 'background.paper',
                          '&:hover': {
                            boxShadow: 6,
                            transform: 'scale(1.05)',
                            transition: '0.2s',
                          },
                        }}
                        onClick={() => handleOpenConfirmModal(report)}
                      >
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography
                          variant="body2"
                          sx={{
                            textAlign: 'center',
                            wordWrap: 'break-word',
                            fontWeight: 500,
                          }}
                        >
                          {report.title}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* SUBMODAL 1: Crear nuevo reporte */}
      <Modal
        open={newReportModal}
        onClose={handleCloseNewReport}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            width: 500,
            bgcolor: 'background.paper',
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="h6">Crear nuevo reporte</Typography>

          <TextField
            label="Nombre del reporte"
            value={newReportName}
            onChange={(e) => setNewReportName(e.target.value)}
            fullWidth
          />

          <Box display={'flex'} flexDirection={'row'} gap={0.5}>
            <Typography variant="subtitle2">
              Gráficas que se añadirán
            </Typography>
            <Typography
              component="span"
              color="text.secondary"
              fontWeight="normal"
              fontSize={'0.7rem'}
              mt={0.5}
            >
              ({totalCharts}):
            </Typography>
          </Box>

          <Box
            sx={{
              maxHeight: 300,
              overflowY: 'auto',
              "&::-webkit-scrollbar": { width: "2px" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: theme.palette.primary.main,
                borderRadius: "4px",
              },
              p: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            {totalCharts === 0 ? (
              <Typography variant="body2" fontStyle="italic" textAlign="center">
                No hay gráficas seleccionadas
              </Typography>
            ) : (
              <Stack spacing={2}>
                {Object.entries(groupedCharts).map(([platform, periods]) => {
                  const PlatformIcon = integrationsConfig[platform]?.icon;

                  return (
                    <Box key={platform}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: integrationsConfig[platform].color,
                            width: 20,
                            height: 20,
                            borderRadius: 2,
                            boxShadow: (theme) =>
                              theme.palette.mode === 'light'
                                ? '0 0 0 1px rgba(0,0,0,0.3)'
                                : '0 0 0 1px rgba(255,255,255,0.3)',
                          }}
                        >
                          <PlatformIcon sx={{ color: "#fff", fontSize: 15 }} />
                        </Avatar>

                        <Typography fontWeight="bold" variant="subtitle2">
                          {integrationsConfig[platform]?.label || platform}
                        </Typography>
                      </Box>

                      {Object.entries(periods).map(([interval, charts]) => (
                        <Box key={interval} sx={{ pl: 2, mb: 1 }}>
                          <Divider />
                          <Typography variant="body2" fontStyle="italic" sx={{ my: 0.5 }}>
                            {interval}
                          </Typography>
                          <Stack spacing={1}>
                            {charts.map((chart) => (
                              <Paper
                                key={chart.id}
                                variant="outlined"
                                sx={{
                                  py: 1,
                                  pl: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  borderRadius: 1,
                                  bgcolor: 'background.paper',
                                  '&:hover': { bgcolor: 'action.hover' },
                                }}
                              >
                                <Typography variant="body2">{chart.title}</Typography>
                                <Checkbox
                                  checked
                                  onChange={() =>
                                    removeChart({id: chart?.id})
                                  }
                                />
                              </Paper>
                            ))}
                          </Stack>
                        </Box>
                      ))}
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>

          <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
            <Button onClick={handleCloseNewReport}>Cancelar</Button>
            <Button
              variant="contained"
              disabled={!newReportName.trim() || selectedCharts.length === 0}
              onClick={() => {
                handleCloseNewReport();
                onClose();
                navigate(`/reportes/editor/${encodeURIComponent(newReportName)}`, {
                  state: { charts: selectedCharts }
                });

              }}
            >
              Guardar
            </Button>
          </Stack>
        </Box>
      </Modal>

    </>
  );
};
