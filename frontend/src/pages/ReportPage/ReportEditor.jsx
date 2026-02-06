import React, { Fragment, useEffect, useRef, useState } from "react";
import { data, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Stack,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  useTheme,
  Drawer,
  Toolbar,
  Avatar,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CloseIcon from '@mui/icons-material/Close';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';

import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import html2pdf from "html2pdf.js";
import { createReportApi, getReportByIdApi, deleteReportApi, updateReportApi } from "../../api";
import { ButtonWithLoader, FullScreenProgress } from "../../generalComponents";
import { useConfirm } from "material-ui-confirm";
import { useNotification, useReport } from "../../contexts";
import { generateUUID, integrationsConfig } from "../../utils";
import isEqual from "lodash/isEqual";


import { v4 as uuidv4, validate as validateUUID } from 'uuid';

import {
  InsertBlockDivider,
  ChartSelectorDialog,
  ResizableImage,
  ChartRenderer,
  DeleteReportDialog
} from "./components";
import { formatElementsForDb, formatElementsForFrontend } from "./utils/formatElements";

const ZOOM_OPTIONS = [0.5, 0.75, 1];

export const ReportEditor = () => {
  const location = useLocation();
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const openExportMenu = Boolean(exportAnchorEl);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const confirm = useConfirm();
  const [openDeleteReportDialog, setOpenDeleteReportDialog] = useState(false);
  const [deletedReport, setDeletedReport] = useState(false);
  const { notify } = useNotification();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [zoomAnchorEl, setZoomAnchorEl] = useState(null);
  const openZoomMenu = Boolean(zoomAnchorEl);
  const [openOutline, setOpenOutline] = useState(false);
  const headerRef = useRef(null);
  const [showCharts, setShowCharts] = useState(true);
  const [openChartSelector, setOpenChartSelector] = useState(false);
  const handleOpenZoomMenu = (e) => setZoomAnchorEl(e.currentTarget);
  const handleCloseZoomMenu = () => setZoomAnchorEl(null);
  const imageInputRef = useRef(null);
  const [pendingInsertIndex, setPendingInsertIndex] = useState(null);
  const [chartInsertIndex, setChartInsertIndex] = useState(null);
  const navigate = useNavigate();
  const [fetchReport, setFetchReport] = useState(false);
  const [saveReport, setSaveReport] = useState(false);
  const [currentReportId, setCurrentReportId] = useState(
    Number(location.state?.id) ?? null
  );
  const isEditing = Boolean(currentReportId);
  const isInitializing = useRef(true);
  const { selectedCharts, addChart, removeChart, clearCharts } = useReport();

  const originalReportRef = useRef({
    title: "Reporte sin título",
    elements: [],
  });

  const [editedReport, setEditedReport] = useState({
    title: "Reporte sin título",
    elements: [],
  });


  const [deletedItems, setDeletedItems] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);


  useEffect(() => {
    if (!currentReportId) return;

    const fetchReport = async () => {
      try {
        setFetchReport(true);
        const res = await getReportByIdApi(currentReportId);
        console.log("editoooooooooooo", res)
        const { title, elements } = formatElementsForFrontend(res);

        const editorReport = {
          title: title || "Reporte sin título",
          elements: elements || [],
        };

        const snapshot = structuredClone(editorReport);

        originalReportRef.current = snapshot;
        setEditedReport(snapshot);

        setHistory([structuredClone(snapshot)]);
        setHistoryIndex(0);
        setHasChanges(false);
      } catch (error) {
        notify(error.message, "error");
      } finally {
        setFetchReport(false);
        isInitializing.current = false;
      }
    };

    fetchReport();
  }, [currentReportId]);

  // useEffect(() => {
  //   const original = originalReportRef.current;

  //   const hasDiff = !isEqual(
  //     {
  //       title: original.title,
  //       elements: original.elements,
  //     },
  //     {
  //       title: editedReport.title,
  //       elements: editedReport.elements,
  //     }
  //   );

  //   setHasChanges(hasDiff);
  // }, [editedReport]);


  const handleSelectZoom = (value) => {
    setZoom(value);
    handleCloseZoomMenu();
  };


  const pushToHistory = (newState) => {
    if (saveReport || isInitializing.current) return;

    setHistory((prev) => {
      const currentIndex = prev.length - 1;
      const trimmed = prev.slice(0, currentIndex + 1);

      return [...trimmed, JSON.parse(JSON.stringify(newState))];
    });

    setHistoryIndex((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (!canUndo) return;
    const prevIndex = historyIndex - 1;
    const state = history[prevIndex];
    setEditedReport({
      title: state.title,
      elements: state.elements,
    });
    setHistoryIndex(prevIndex);
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const nextIndex = historyIndex + 1;
    const state = history[nextIndex];
    setEditedReport({
      title: state.title,
      elements: state.elements,
    });
    setHistoryIndex(nextIndex);
  };

  const handleOpenExportMenu = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
  };

  const insertElementAfter = (index, newElement) => {
    setEditedReport(prev => {
      const updated = [...prev.elements];
      updated.splice(index + 1, 0, newElement);

      pushToHistory({
        title: prev.title,
        elements: updated,
      });

      return {
        ...prev,
        elements: updated,
      };
    });
  };


  const onDragEnd = (result) => {
    setIsDragging(false);

    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const items = Array.from(editedReport.elements);
    const [moved] = items.splice(sourceIndex, 1);
    items.splice(destinationIndex, 0, moved);

    setEditedReport(prev => ({
      ...prev,
      elements: items,
    }));

    pushToHistory({ title: editedReport?.title, elements: items });
  };

  const handleImageSelected = (event) => {
    const file = event.target.files?.[0];
    if (!file || pendingInsertIndex === null) return;

    if (!file.type.startsWith("image/")) {
      notify("Solo se permiten imágenes", "warning");
      return;
    }

    const MAX_SIZE_MB = 2;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      notify(`La imagen es demasiado pesada. Máximo permitido: ${MAX_SIZE_MB}MB`, "warning");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    const newImage = {
      id: generateUUID(),
      type: 'image',
      src: previewUrl,
      alt: file.name,
      width: 400,
      height: 400,
      file,
      __local: true
    };

    insertElementAfter(pendingInsertIndex, newImage);

    setPendingInsertIndex(null);
    event.target.value = '';
  };


  const removeElement = (id) => {
    setEditedReport(prev => {
      const newElements = prev.elements.filter(el => el.id !== id);

      pushToHistory({
        title: prev.title,
        elements: newElements,
      });

      return {
        ...prev,
        elements: newElements,
      };
    });
  };


  const handleSave = async () => {
    if (editedReport?.elements.length === 0) {
      notify("No puedes guardar un reporte vacío.", "warning");
      return;
    }
    try {
      setSaveReport(true);

      const normalizedTitle =
        editedReport?.title?.trim() === "" ? "Reporte sin título" : editedReport?.title.trim();

      const payload = formatElementsForDb(
        editedReport.elements,
        normalizedTitle
      );

      if (isEditing) {
        const updatedReport = await updateReportApi(currentReportId, payload);

        const { title, elements } = formatElementsForFrontend(updatedReport);

        const cleanSnapshot = structuredClone({
          title: title?.trim() === "" ? "Reporte sin título" : title,
          elements: elements,
        });

        originalReportRef.current = cleanSnapshot;
        setEditedReport(cleanSnapshot);
        setHistory([structuredClone(cleanSnapshot)]);
        setHistoryIndex(0);
        setHasChanges(false);
        setDeletedItems([]);

        setCurrentReportId(updatedReport.id);

        navigate(`/reportes/editor/${encodeURIComponent(normalizedTitle)}`, {
          state: { id: updatedReport.id },
          replace: true,
        });

        notify("Reporte actualizado exitosamente.", "success");
      } else {

        const createdReport = await createReportApi(payload);
        const { title, elements } = formatElementsForFrontend(createdReport);

        setCurrentReportId(createdReport.id);

        const cleanSnapshot = structuredClone({
          title: title?.trim() === "" ? "Reporte sin título" : title,
          elements: elements,
        });

        originalReportRef.current = cleanSnapshot;
        setEditedReport(cleanSnapshot);
        setHistory([structuredClone(cleanSnapshot)]);
        setHistoryIndex(0);
        setHasChanges(false);
        setDeletedItems([]);

        notify("Reporte creado exitosamente.", "success");
        navigate(`/reportes/editor/${encodeURIComponent(normalizedTitle)}`, {
          state: { id: createdReport.id },
          replace: true,
        });
      }

      setHasChanges(false);
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setSaveReport(false);
    }
  };

  const getElementLabel = (type) => {
    switch (type) {
      case 'text':
        return 'Texto';
      case 'chart':
        return 'Gráfico';
      case 'image':
        return 'Imagen';
      default:
        return 'Elemento';
    }
  };

  const normalizeCharts = (charts) => {
    return charts.map(chart => {
      if (!chart.id || !validateUUID(chart.id)) {
        return {
          ...chart,
          id: uuidv4(),
        };
      }
      return chart;
    });
  };

  const handleAddCharts = () => {
    // Normalizamos los gráficos seleccionados
    const chartsToAdd = normalizeCharts(selectedCharts);

    if (chartInsertIndex === null) {
      // Si no hay índice, los agregamos al final
      chartsToAdd.forEach(chart => {
        insertElementAfter(editedReport.elements.length - 1, {
          ...chart,
          type: 'chart',
          content: chart.title || 'Gráfico sin título'
        });
      });
    } else {
      // Insertamos los gráficos en el índice seleccionado
      chartsToAdd.forEach((chart, idx) => {
        insertElementAfter(chartInsertIndex + idx, {
          ...chart,
          type: 'chart',
          content: chart.title || 'Gráfico sin título'
        });
      });
    }

    // Limpiamos selección
    clearCharts();
    setChartInsertIndex(null);
  };


  const handleCancel = () => {
    confirm({
      title: "Descartar cambios",
      description: "¿Deseas descartar todos los cambios no guardados?",
      confirmationText: "Sí, descartar",
      cancellationText: "Cancelar",
    })
      .then((result) => {
        if (result.confirmed === true) {
          const resetState = structuredClone(originalReportRef.current);
          setEditedReport(resetState);

          setHistory([structuredClone(resetState)]);
          setHistoryIndex(0);

          setDeletedItems([]);
          setHasChanges(false);
        }
      })
      .catch(() => { });
  };

  const handleDeleteReport = async () => {
    try {
      setDeletedReport(true);
      const deletedReport = await deleteReportApi(currentReportId);
      notify("Reporte eliminado correctamente del sistema.", "success");
      navigate('/reportes', { replace: true });
      setOpenDeleteReportDialog(false);
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setDeletedReport(false);
    }
  }

  const exportToPDF = () => {
    handleCloseExportMenu();
    const content = document.getElementById("report-content");
    html2pdf().from(content).save(`${editedReport?.title}.pdf`);
  };

  const exportToXLS = () => {
    handleCloseExportMenu();
    console.log('Exportar XLS');
  };

  const scrollToElement = (id) => {
    console.log(id)
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    el.classList.remove('flash-highlight');
    void el.offsetWidth;
    el.classList.add('flash-highlight');
  };

  // Contadores por tipo
  const typeCounters = {
    text: 0,
    chart: 0,
    image: 0
  };

  const isReportEmpty = editedReport?.elements?.length === 0;

  if (fetchReport) return (
    <FullScreenProgress text={'Obteniendo el reporte...'} />
  )

  if (saveReport) return (
    <FullScreenProgress text={'Guardando el reporte...'} />
  )

  if (deletedReport) return (
    <FullScreenProgress text={'Eliminando el reporte...'} />
  )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        maxWidth: {
          xs: '100vw',
          lg: isFullscreen ? '100vw' : 'auto'
        },
        height: isFullscreen ? '100vh' : `calc(100vh - 74px)`,
        bgcolor: "background.default",
        zIndex: isFullscreen ? 1500 : 'auto',
        overflow: 'hidden'
      }}
    >
      {/* Encabezado */}
      <Box
        ref={headerRef}
        sx={{
          display: "flex",
          flexDirection: 'column',
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
          px: 0.5
        }}
      >
        <Box sx={{ display: "flex", height: 48, flexDirection: { xs: 'column', lg: 'row' }, alignItems: "center", width: "100%", gap: 2, justifyContent: 'space-between' }}>
          <Box display={'flex'} gap={1} width={'100%'} height={'100%'} alignItems={'center'}>
            <IconButton
              onClick={handleOpenExportMenu}
              size="large"
              color="primary"
            >
              <SummarizeRoundedIcon fontSize="large" />
            </IconButton>

            <Menu
              anchorEl={exportAnchorEl}
              open={openExportMenu}
              onClose={handleCloseExportMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              slotProps={{
                list: {
                  sx: {
                    pb: 0,
                  }
                }
              }}
            >
              <MenuItem onClick={exportToPDF}>
                <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                Exportar PDF
              </MenuItem>

              <MenuItem onClick={exportToXLS}>
                <TableChartIcon fontSize="small" sx={{ mr: 1 }} />
                Exportar Excel (XLS)
              </MenuItem>
              {isEditing && [
                <Divider key="divider" sx={{ mt: 2 }} />,
                <MenuItem
                  key="delete"
                  onClick={() => {
                    handleCloseExportMenu();
                    setOpenDeleteReportDialog(true);
                  }}
                >
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
                  Eliminar el reporte
                </MenuItem>,
                <Divider key="divider" sx={{ mt: 2 }} />,
                // <MenuItem
                //   sx={{
                //     p: 0,
                //     pointerEvents: "none",
                //   }}>
                //   {
                //     <Box sx={{
                //       display: 'flex',
                //       flexDirection: 'column',
                //       width: '100%',
                //       backgroundColor: 'background.paper',
                //       p: 1
                //     }}>
                //       <Typography fontWeight="bold" variant='caption' sx={{
                //         display: 'flex',
                //         flexDirection: 'column'
                //       }}>
                //         Creado:{" "}
                //         <Typography
                //           component="span"
                //           variant="body1"
                //           color="textSecondary"
                //           sx={{
                //             fontStyle: 'italic',
                //             fontSize: '0.9rem',
                //           }}
                //         >
                //           {formatDateParts(report?.created_at).date} {formatDateParts(report?.created_at).time}
                //         </Typography>
                //       </Typography>
                //       <Typography fontWeight="bold" variant='caption' sx={{
                //         display: 'flex',
                //         flexDirection: 'column'
                //       }}>
                //         Actualizado:{" "}
                //         <Typography
                //           component="span"
                //           variant="body1"
                //           color="textSecondary"
                //           sx={{
                //             fontStyle: 'italic',
                //             fontSize: '0.9rem',
                //           }}
                //         >
                //           {formatDateParts(report?.updated_at).date} {formatDateParts(report?.updated_at).time}
                //         </Typography>
                //       </Typography>

                //       <Typography fontWeight="bold" variant='caption'>
                //         Versión del reporte:{" "}
                //         <Typography
                //           component="span"
                //           variant="body1"
                //           color="textSecondary"
                //           sx={{
                //             fontStyle: 'italic',
                //             fontSize: '0.9rem',
                //           }}
                //         >
                //           {report?.report_version}
                //         </Typography>
                //       </Typography>
                //     </Box>
                //   }
                // </MenuItem>
              ]}
            </Menu>

            <TextField
              fullWidth
              type="text"
              variant="outlined"
              value={editedReport?.title}
              onChange={(e) =>
                setEditedReport(prev => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder="Escribe un título para tu reporte"
              slotProps={{
                htmlInput: {
                  maxLength: 100
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: {
                    xs: 35,
                    sm: 35
                  },
                  maxHeight: {
                    xs: 35,
                    sm: 35
                  },
                  width: '100%',
                },
                '& .MuiOutlinedInput-input': {
                  padding: '0px 12px',
                  fontSize: '0.95rem',
                  lineHeight: '1',
                },
              }}
            />
            <Tooltip
              title={isFullscreen ? "Minimizar" : "Maximizar"}
            >
              <IconButton
                size="small"
                onClick={() => {
                  setIsFullscreen(!isFullscreen);
                }}
                sx={{
                  transition: 'transform 0.3s ease',
                  transform: isFullscreen ? 'rotate(180deg)' : 'rotate(0deg)',
                  mr: 1
                }}
              >
                {isFullscreen ? <CloseFullscreenIcon fontSize="small" /> : <FullscreenIcon fontSize="medium" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Stack
          direction={{
            xs: 'column-reverse',
            sm: 'row'
          }}
          spacing={1}
          alignItems="center"
          justifyContent={'space-between'}
          sx={{
            width: '100%',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{
            display: 'flex',
            width: '100%'
          }}>

            <Button variant='outlined' sx={{ px: 0.5 }} onClick={handleOpenZoomMenu}>
              <ZoomInIcon />
              <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>
                {Math.round(zoom * 100)}%
              </Typography>
            </Button>

            <Tooltip title="Mostrar índice del reporte">
              <span>
                <IconButton onClick={() => setOpenOutline(o => !o)}>
                  <ListAltIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Deshacer">
              <span>
                <IconButton onClick={handleUndo} disabled={!canUndo}>
                  <UndoIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Rehacer">
              <span>
                <IconButton onClick={handleRedo} disabled={!canRedo}>
                  <RedoIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip
              title={
                showCharts
                  ? "Modo orden"
                  : "Modo edición"
              }
            >
              <span>
                <IconButton
                  disabled={isReportEmpty}
                  color={showCharts ? "primary" : "default"}
                  onClick={() => setShowCharts(prev => !prev)}
                >
                  {showCharts ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </span>
            </Tooltip>


            <Menu
              anchorEl={zoomAnchorEl}
              open={openZoomMenu}
              onClose={handleCloseZoomMenu}
            >
              {ZOOM_OPTIONS.map(z => (
                <MenuItem
                  key={z}
                  selected={zoom === z}
                  onClick={() => handleSelectZoom(z)}
                >
                  {Math.round(z * 100)}%
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            height: '48px',
          }}>
            <Button
              variant="contained"
              color="error"
              sx={{ width: '165px', height: '100%' }}
              onClick={() => handleCancel()}
              disabled={saveReport || !hasChanges}
            >
              Descartar cambios
            </Button>
            <ButtonWithLoader
              loading={saveReport}
              onClick={() => handleSave()}
              disabled={!hasChanges || isReportEmpty}
              variant="contained"
              backgroundButton={theme => theme.palette.success.main}
              sx={{ color: 'white', px: 2, width: '170px' }}
            >
              Guardar reporte
            </ButtonWithLoader>
          </Box>
        </Stack>
      </Box>

      {/* Contenido editable */}
      <Box sx={{
        p: 1,
        zoom: zoom,
        flex: 1,
        minHeight: 0,
        borderTop: "1px solid #ccc",
        overflowY: 'auto',
        "&::-webkit-scrollbar": { width: { xs: '2px', lg: '8px' } },
        "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
        "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
        "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
      }}>
        <Drawer
          anchor="right"
          open={openOutline}
          onClose={() => setOpenOutline(false)}
          variant="temporary"
          sx={{
            zIndex: isFullscreen && 2000,
            width: 270,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 260,
              boxSizing: 'border-box',
              overflow: 'hidden'
            },
          }}
        >
          {!isFullscreen &&
            <Toolbar />
          }

          <Box height={50} display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} p={1}>
            <Typography lineHeight={1} variant="subtitle1" fontWeight={'bold'}>
              Índice del reporte
            </Typography>
            <IconButton
              size="large"
              sx={{
                p: 0,
                m: 0
              }}
              onClick={() => setOpenOutline(false)}
            >
              <CloseIcon fontSize="medium" />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 0.5 }} />

          <Box sx={{
            width: '100%',
            height: '100%',
            p: 1,
            overflowY: 'auto',
            "&::-webkit-scrollbar": { width: "2px" },
            "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
            "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
          }}>
            <DragDropContext
              onDragEnd={onDragEnd}
            >
              <Droppable droppableId="outline">
                {(provided) => (
                  <Box ref={provided.innerRef} {...provided.droppableProps}>
                    {editedReport?.elements?.map((el, index) => {
                      const numberOfPreviousSameType = editedReport.elements
                        .slice(0, index)
                        .filter(e => e.type === el.type).length + 1;

                      return (
                        <Draggable
                          draggableId={`outline-${el.id}`}
                          index={index}
                          key={el.id}>
                          {(provided, snapshot) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1,
                                mb: 1,
                                borderRadius: 1,
                                bgcolor: 'background.paper',
                                boxShadow: 4,
                                gap: 1,
                                transition: 'background-color 0.2s, box-shadow 0.2s',
                                cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                                '&:hover': { bgcolor: snapshot.isDragging ? 'action.hover' : 'action.hover' },
                              }}
                            >
                              <Box display={'flex'} height={'100%'} alignItems={'center'} gap={1}>
                                <DragIndicatorIcon fontSize="small" />

                                <Box display={'flex'} flexDirection={'column'} alignContent={'start'}>
                                  <Typography variant="caption" fontWeight={'bold'} lineHeight={1} sx={{ flexGrow: 1 }}>
                                    {getElementLabel(el.type)} #{numberOfPreviousSameType}
                                  </Typography>

                                  {el.type === 'text' && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        display: 'block',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: 100,
                                      }}
                                    >
                                      {/* extraemos un snippet del texto sin tags HTML */}
                                      {el.content.replace(/<[^>]+>/g, '').slice(0, 50)}
                                      {el.content.replace(/<[^>]+>/g, '').length > 50 ? '...' : ''}
                                    </Typography>
                                  )}

                                  {el.type === 'chart' && (
                                    <Box
                                      sx={{
                                        mt: 0.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.5,
                                        overflow: 'hidden',
                                        maxWidth: '100%',
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        fontWeight={'bold'}
                                        color={integrationsConfig[el?.integration_data?.integration?.platform].color}
                                        lineHeight={1}
                                        sx={{
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {`${el?.integration_data?.integration?.platform}` ?? 'N/A'}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="textSecondary"
                                        fontWeight={'semiBold'}
                                        lineHeight={1}
                                        sx={{
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          fontSize: 10
                                        }}
                                      >
                                        {el.interval ?? 'N/A'}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'wrap',
                                        }}
                                      >
                                        {el.content ?? 'Sin título'}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Box>

                              <Button
                                size="small"
                                variant="outlined"
                                disabled={isDragging}
                                onClick={() => {
                                  scrollToElement(el.id);
                                  setOpenOutline(false);
                                }}
                              >
                                Ir
                              </Button>
                            </Box>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        </Drawer>

        <Box
          id="report-content"
          sx={{
            width: { lg: 900, xs: '100%' },
            margin: "auto",
            p: { xs: 1, lg: 4 },
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
            minHeight: "80vh",
          }}
        >
          <DragDropContext
            onDragStart={() => setIsDragging(true)}
            onDragEnd={onDragEnd}
          >
            <Droppable droppableId="report">
              {(provided) => (
                <Box ref={provided.innerRef} {...provided.droppableProps}>
                  {(isReportEmpty) && (
                    <Box mb={1}>
                      <InsertBlockDivider
                        onAddText={() =>
                          insertElementAfter(-1, {
                            id: generateUUID(),
                            type: 'text',
                            content: '<p>Nuevo texto...</p>',
                          })
                        }
                        onAddImage={() => {
                          setPendingInsertIndex(-1);
                          imageInputRef.current.click();
                        }}
                        onAddChart={() => {
                          setChartInsertIndex(-1);
                          setOpenChartSelector(true);
                        }}
                      />
                    </Box>
                  )}
                  {editedReport?.elements.map((el, index) => {
                    const numberOfPreviousSameType = editedReport.elements
                      .slice(0, index)
                      .filter(e => e.type === el.type).length + 1;

                    return (
                      <Fragment key={el.id}>
                        <Draggable
                          draggableId={`report-dragable-${el.id}`}
                          isDragDisabled={showCharts}
                          index={index}
                          key={el.id}>
                          {(provided, snapshot) => (
                            <Box
                              id={el.id}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                p: 1,
                                mb: 1,
                                borderRadius: 1,
                                bgcolor: 'background.paper',
                                boxShadow: 4,
                                gap: 1,
                                transition: 'background-color 0.2s, box-shadow 0.2s',
                                cursor: showCharts
                                  ? 'default'
                                  : snapshot.isDragging
                                    ? 'grabbing'
                                    : 'grab',
                                '&:hover': { bgcolor: snapshot.isDragging ? 'action.hover' : 'action.hover' },
                              }}
                            >
                              <Box display={'flex'} width={'100%'} height={'100%'} alignItems={'center'} alignContent={'center'} justifyContent={'space-between'} gap={1}>
                                {!showCharts &&
                                  <Box width={'auto'} height={'100%'} display={'flex'} alignItems={'center'} gap={1} mr={1}>
                                    <DragIndicatorIcon fontSize="medium" />
                                    <Divider orientation="vertical" flexItem />
                                  </Box>
                                }
                                <Box display={'flex'} flexDirection={'row'} alignContent={'start'} sx={{
                                  width: '100%',
                                  height: '100%',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}>
                                  <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} gap={1}>
                                    <Typography variant="caption" fontWeight={'bold'} lineHeight={1} sx={{ flexGrow: 1 }}>
                                      {getElementLabel(el.type)} #{numberOfPreviousSameType}
                                    </Typography>

                                    {el.type === 'text' && !showCharts && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                          display: 'block',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          maxWidth: '100%',
                                        }}
                                      >
                                        {el.content.replace(/<[^>]+>/g, '').slice(0, 50)}
                                        {el.content.replace(/<[^>]+>/g, '').length > 50 ? '...' : ''}
                                      </Typography>
                                    )}

                                    {el.type === 'chart' && (
                                      <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.5
                                      }}>
                                        <Typography
                                          variant="caption"
                                          color="textSecondary"
                                          lineHeight={1}
                                          sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            fontSize: 11
                                          }}
                                        >
                                          Proyecto: {el?.integration_data?.project?.name ?? 'N/A'}
                                        </Typography>

                                        <Box sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1
                                        }}>
                                          <Avatar
                                            sx={{
                                              bgcolor: integrationsConfig[el?.integration_data?.integration?.platform]?.color,
                                              width: 20,
                                              height: 20,
                                              borderRadius: 1,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              boxShadow: (theme) =>
                                                theme.palette.mode === 'light'
                                                  ? '0 0 0 1px rgba(0,0,0,0.3)'
                                                  : '0 0 0 1px rgba(255,255,255,0.3)',
                                            }}
                                          >
                                            {React.createElement(
                                              integrationsConfig[el?.integration_data?.integration?.platform]?.icon,
                                              { fontSize: "small", htmlColor: "#fff" }
                                            )}
                                          </Avatar>
                                          <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                          }}>
                                            <Typography
                                              variant="caption"
                                              fontWeight={'bold'}
                                              color={integrationsConfig[el?.integration_data?.integration?.platform]?.color}
                                              lineHeight={1}
                                              sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                              }}
                                            >
                                              {el?.integration_data?.integration?.platform ?? 'N/A'}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              color="textSecondary"
                                              lineHeight={1}
                                              sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontSize: 11
                                              }}
                                            >
                                              {el?.integration_data?.integration?.name ?? 'N/A'}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Box>
                                    )}
                                  </Box>

                                  {el.type === 'chart' && (
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        overflow: 'hidden',
                                        maxWidth: '100%',
                                      }}
                                    >
                                      {!showCharts &&
                                        <Box sx={{
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'end',
                                        }}>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'wrap',
                                            }}
                                          >
                                            {el.content ?? 'Sin título'}
                                          </Typography>

                                          <Typography
                                            variant="caption"
                                            color="textSecondary"
                                            fontWeight={'semiBold'}
                                            lineHeight={1}
                                            sx={{
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                              fontSize: 10
                                            }}
                                          >
                                            {el.interval ?? 'N/A'}
                                          </Typography>

                                        </Box>
                                      }
                                    </Box>
                                  )}
                                </Box>

                                {
                                  showCharts &&
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => removeElement(el.id)}
                                    sx={{ p: 0, m: 0 }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                }
                              </Box>

                              {
                                showCharts &&
                                <Divider />
                              }

                              {
                                showCharts &&
                                <>
                                  {el.type === "text" && (
                                    <ReactQuill
                                      theme="snow"
                                      className="quill-dark"
                                      value={el.content}
                                      onChange={(val) => {
                                        const updated = editedReport.elements.map((item, i) =>
                                          i === index ? { ...item, content: val } : item
                                        );

                                        setEditedReport(prev => ({
                                          ...prev,
                                          elements: updated,
                                        }));
                                      }}
                                      onBlur={() => pushToHistory({ title: editedReport?.title, elements: editedReport?.elements })}
                                    />
                                  )}

                                  {el.type === "chart" && (
                                    <ChartRenderer element={el} />
                                  )}

                                  {el.type === 'image' && showCharts && (
                                    <ResizableImage
                                      element={el}
                                      onResize={(newWidth, newHeight, alt) => {
                                        const updated = editedReport?.elements?.map((item, i) =>
                                          i === index
                                            ? { ...item, width: newWidth, height: newHeight, alt }
                                            : item
                                        );
                                        setEditedReport(prev => ({
                                          ...prev,
                                          elements: updated,
                                        }));
                                      }}
                                      onResizeStop={(newWidth, newHeight, alt) => {
                                        const updated = editedReport?.elements?.map((item, i) =>
                                          i === index
                                            ? { ...item, width: newWidth, height: newHeight, alt }
                                            : item
                                        );

                                        setEditedReport(prev => ({
                                          ...prev,
                                          elements: updated,
                                        }));

                                        pushToHistory({
                                          title: editedReport?.title,
                                          elements: updated,
                                        });
                                      }}
                                    />
                                  )}
                                </>
                              }
                            </Box>
                          )}
                        </Draggable>

                        {
                          showCharts &&
                          <InsertBlockDivider
                            onAddText={() =>
                              insertElementAfter(index, {
                                id: generateUUID(),
                                type: 'text',
                                content: '<p>Nuevo texto...</p>',
                              })
                            }

                            onAddImage={() => {
                              setPendingInsertIndex(index);
                              imageInputRef.current.click();
                            }}

                            onAddChart={() => {
                              setChartInsertIndex(index);
                              setOpenChartSelector(true);
                            }}
                          />
                        }
                      </Fragment>
                    )
                  })}

                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        </Box>
      </Box>

      <ChartSelectorDialog
        open={openChartSelector}
        onClose={() => setOpenChartSelector(false)}
        onAcept={() => handleAddCharts()}
      />

      <DeleteReportDialog
        open={openDeleteReportDialog}
        onClose={() => setOpenDeleteReportDialog(false)}
        report={{
          id: currentReportId,
          title: editedReport?.title,
        }}
        onDeleteReport={handleDeleteReport}
      />

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleImageSelected(e)}
      />
    </Box >
  );
};
