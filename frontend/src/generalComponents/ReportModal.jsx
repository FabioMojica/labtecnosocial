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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useReport } from '../contexts/ReportContext';
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export const ReportModal = ({ open, onClose, reports = [] }) => {
  const { selectedCharts, removeChart } = useReport();
  const theme = useTheme();
  const navigate = useNavigate();

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
            p: 3,
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

          <Typography variant="h6" sx={{ mb: 2 }}>
            Reportes
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexGrow: 1,
              overflow: 'hidden',
            }}
          >
            {/* Panel Izquierdo: Gráficas seleccionadas */}
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
              <Typography variant="subtitle1" textAlign="center" sx={{ mb: 1 }}>
                Gráficos seleccionados
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  p: 2,
                  overflowY: 'auto',
                  "&::-webkit-scrollbar": { width: "4px" },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: "4px",
                  },
                  maxHeight: '100%',
                }}
              >
                <Stack spacing={2}>
                  {selectedCharts.map((chart) => (
                    <Stack
                      key={chart.id}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography>{chart.title}</Typography>
                      <Checkbox onChange={() => removeChart(chart.id)} checked />
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Box>

            {/* Panel Derecho: Reportes */}
            <Box sx={{ flexGrow: 1, width: '100%' }}>
              <Typography variant="subtitle1" textAlign="center" sx={{ mb: 1 }}>
                Tus Reportes
              </Typography>
              <Grid container spacing={3}>
                {/* Crear nuevo reporte */}
                <Grid item>
                  <Paper
                    elevation={3}
                    sx={{
                      width: 120,
                      height: 160,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      borderRadius: 2,
                      bgcolor: 'background.default',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'scale(1.05)',
                        transition: '0.2s',
                      },
                    }}
                    onClick={handleOpenNewReport}
                  >
                    <AddIcon fontSize="large" color="action" />
                  </Paper>
                  <Typography align="center" sx={{ mt: 1 }}>
                    Nuevo reporte
                  </Typography>
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

          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Gráficas que se añadirán:
          </Typography>
          <Box
            sx={{
              maxHeight: 200,
              overflowY: 'auto',
              p: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Stack spacing={1}>
              {selectedCharts.map((chart) => (
                <Typography key={chart.id} variant="body2">
                  • {chart.title}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
            <Button onClick={handleCloseNewReport}>Cancelar</Button>
            <Button
              variant="contained"
              disabled={!newReportName.trim()}
              onClick={() => {
                const uniqueId = dayjs().format("YYYYMMDDHHmmssSSS");
                const routeName = `/reportes/crear/${encodeURIComponent(newReportName)}/${uniqueId}`;
                handleCloseNewReport();
                onClose();
    navigate(routeName, { state: { charts: selectedCharts } });
              }}
            >
              Guardar
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* SUBMODAL 2: Confirmar añadir a reporte existente */}
      <Modal
        open={confirmModal}
        onClose={handleCloseConfirmModal}
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
          <Typography variant="h6">
            ¿Añadir gráficas al reporte "{selectedReport?.title}"?
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Gráficas seleccionadas:
          </Typography>
          <Box
            sx={{
              maxHeight: 200,
              overflowY: 'auto',
              p: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Stack spacing={1}>
              {selectedCharts.map((chart) => (
                <Typography key={chart.id} variant="body2">
                  • {chart.title}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
            <Button onClick={handleCloseConfirmModal}>Cancelar</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleCloseConfirmModal();
                onClose();
              }}
            >
              Confirmar
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};
