import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { data, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Stack,
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

import "react-quill-new/dist/quill.snow.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import html2pdf from "html2pdf.js";
import { createReportApi, getReportByIdApi, deleteReportApi, updateReportApi } from "../../api";
import { ButtonWithLoader, ErrorScreen, FullScreenProgress } from "../../generalComponents";
import { useConfirm } from "material-ui-confirm";
import { useLayout, useNotification, useReport } from "../../contexts";
import { formatDateParts, generateUUID, integrationsConfig } from "../../utils";

import { v4 as uuidv4, validate as validateUUID } from 'uuid';

import {
  InsertBlockDivider,
  ChartSelectorDialog,
  DeleteReportDialog,
  ReportElementItem,
  ReportTitle
} from "./components";
import { getElementLabel, formatElementsForDb, formatElementsForFrontend } from "./utils";


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
  const [zoomAnchorEl, setZoomAnchorEl] = useState(null);
  const openZoomMenu = Boolean(zoomAnchorEl);
  const { right } = useLayout();
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
  const [errorFetchReport, setErrorFecthReport] = useState(false);

  const initialReportId = location.state?.id ? Number(location.state.id) : null;
  const [currentReportId, setCurrentReportId] = useState(initialReportId);

  const [isCreateNewReport, setIsCreateNewReport] = useState(initialReportId === null);

  const { selectedCharts, addChart, removeChart, clearCharts } = useReport();
  const [reportMetadata, setReportMetadata] = useState(null);

  const originalReportRef = useRef({
    title: "Reporte sin título",
    elements: {},
    elementsOrder: [],
  });

  const [editedReport, setEditedReport] = useState({
    title: "Reporte sin título",
    elements: {},
    elementsOrder: [],
  });

  const [title, setTitle] = useState(null)

  const normalizeReportForCompare = (report) => {
    return {
      title: report.title?.trim() || "",
      elementsOrder: report.elementsOrder,
      elements: Object.values(report.elements)
        .map(el => {
          const { file, __local, ...rest } = el;
          return rest;
        })
        .sort((a, b) => a.id.localeCompare(b.id)),
    };
  };

  const isDirty = useMemo(() => {
    const current = normalizeReportForCompare(editedReport);
    const original = normalizeReportForCompare(originalReportRef.current);
    return JSON.stringify(current) !== JSON.stringify(original);
  }, [editedReport]);


  const fetchReportById = async () => {
    try {
      setErrorFecthReport(false);
      setFetchReport(true);
      const res = await getReportByIdApi(currentReportId);
      const { created_at, updated_at, report_version } = res;
      const { title, elements, elementsOrder } = formatElementsForFrontend(res);

      setTitle(title)
      setEditedReport({
        title: title || "Reporte sin título",
        elements: elements,
        elementsOrder
      });
      setReportMetadata({
        created_at,
        updated_at,
        report_version
      });

      const snapshot = structuredClone({ title, elements, elementsOrder });
      originalReportRef.current = snapshot;
      setHistory([snapshot]);
      setHistoryIndex(0);
    } catch (error) {
      setErrorFecthReport(true);
      notify(error.message, "error");
    } finally {
      setFetchReport(false);
    }
  };

  useEffect(() => {
    if (isCreateNewReport) return;
    fetchReportById();
  }, [currentReportId]);

  const handleElementChange = (id, newElement) => {
    setEditedReport(prev => ({
      ...prev,
      elements: {
        ...prev.elements,
        [id]: newElement,
      }
    }));
  };

  const handleOpenExportMenu = (event) => {
    if (event.currentTarget) {
      setExportAnchorEl(event.currentTarget);
    }
  };
  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
  };

  const insertElementAfter = (afterId, newElement) => {
    setEditedReport(prev => {
      const newElements = { ...prev.elements, [newElement.id]: newElement };

      if (afterId === null) {
        return {
          ...prev,
          elements: newElements,
          elementsOrder: [newElement.id, ...prev.elementsOrder],
        };
      }

      const index = prev.elementsOrder.indexOf(afterId);
      const newOrder = [
        ...prev.elementsOrder.slice(0, index + 1),
        newElement.id,
        ...prev.elementsOrder.slice(index + 1),
      ];

      return { ...prev, elements: newElements, elementsOrder: newOrder };
    });
  };

  const onDragEnd = (result) => {
    setIsDragging(false);
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    const newOrder = Array.from(editedReport.elementsOrder);
    const [movedId] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(destinationIndex, 0, movedId);

    setEditedReport(prev => ({
      ...prev,
      elementsOrder: newOrder,
    }));

    pushToHistory({
      title: editedReport.title,
      elements: editedReport.elements,
      elementsOrder: newOrder,
    });
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
      const { [id]: _, ...rest } = prev.elements;

      return {
        ...prev,
        elements: rest,
        elementsOrder: prev.elementsOrder.filter(eid => eid !== id),
      };
    });
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
    const chartsToAdd = normalizeCharts(selectedCharts);

    let lastAfterId = chartInsertIndex;

    chartsToAdd.forEach(chart => {
      const newChart = {
        ...chart,
        id: generateUUID(),
        type: 'chart',
        content: chart.title || 'Gráfico sin título',
      };

      insertElementAfter(lastAfterId, newChart);

      lastAfterId = newChart.id;
    });

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
          notify("Cambios descartados correctamente", "info");
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

  const isReportEmpty = !editedReport || Object.keys(editedReport.elements || {}).length === 0;
  const orderedElements = useMemo(() => {
    return editedReport.elementsOrder
      .map(id => editedReport.elements[id])
      .filter(Boolean);
  }, [editedReport.elementsOrder, editedReport.elements]);

  const handleSave = async () => {
    if (isReportEmpty) {
      notify("No puedes guardar un reporte vacío.", "warning");
      return;
    }

    try {
      setSaveReport(true);

      const normalizedTitle =
        editedReport?.title?.trim() === "" ? "Reporte sin título" : editedReport?.title.trim();

      const payload = formatElementsForDb(editedReport);

      const response = isCreateNewReport
        ? await createReportApi(payload)
        : await updateReportApi(currentReportId, payload);

      const { title, elements, elementsOrder } = formatElementsForFrontend(response);

      const snapshot = structuredClone({ title, elements, elementsOrder });

      setEditedReport(snapshot);
      originalReportRef.current = snapshot;
      setHistory([snapshot]);
      setHistoryIndex(0);
      setCurrentReportId(response.id);

      notify(
        isCreateNewReport
          ? "Reporte creado exitosamente."
          : "Reporte actualizado exitosamente.",
        "success"
      );

      navigate(`/reportes/editor/${encodeURIComponent(normalizedTitle)}`, {
        state: { id: response.id },
        replace: true,
      });

      setIsCreateNewReport(false);
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setSaveReport(false);
    }
  };


  if (fetchReport) return (
    <FullScreenProgress text={'Obteniendo el reporte...'} />
  )

  if (errorFetchReport) return (
    <ErrorScreen message="Ocurrió un error al obtener el reporte" buttonText='Volver a intentar' onButtonClick={() => { fetchReportById() }} />
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

            {!fetchReport &&
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
                {!isCreateNewReport && [
                  <Divider key="divider-1" sx={{ mt: 2 }} />,
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

                  <Divider key="divider-2" sx={{ mt: 2 }} />,

                  <MenuItem
                    key={'meta-data'}
                    sx={{
                      p: 0,
                      pointerEvents: "none",
                    }}>
                    {reportMetadata && (
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        backgroundColor: 'background.paper',
                        p: 1
                      }}>
                        <Typography fontWeight="bold" variant='caption' sx={{
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          Creado:{" "}
                          <Typography
                            component="span"
                            variant="body1"
                            color="textSecondary"
                            sx={{
                              fontStyle: 'italic',
                              fontSize: '0.9rem',
                            }}
                          >
                            {formatDateParts(reportMetadata?.created_at).date} {formatDateParts(reportMetadata?.created_at).time}
                          </Typography>
                        </Typography>
                        <Typography fontWeight="bold" variant='caption' sx={{
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          Actualizado:{" "}
                          <Typography
                            component="span"
                            variant="body1"
                            color="textSecondary"
                            sx={{
                              fontStyle: 'italic',
                              fontSize: '0.9rem',
                            }}
                          >
                            {formatDateParts(reportMetadata?.updated_at).date} {formatDateParts(reportMetadata?.updated_at).time}
                          </Typography>
                        </Typography>

                        <Typography fontWeight="bold" variant='caption'>
                          Versión del reporte:{" "}
                          <Typography
                            component="span"
                            variant="body1"
                            color="textSecondary"
                            sx={{
                              fontStyle: 'italic',
                              fontSize: '0.9rem',
                            }}
                          >
                            {reportMetadata?.report_version}
                          </Typography>
                        </Typography>
                      </Box>
                    )}
                  </MenuItem>
                ]}
              </Menu>
            }

            <ReportTitle
              value={editedReport.title}
              onSave={(title) =>
                setEditedReport(prev => ({ ...prev, title }))
              }
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

            <Tooltip title="Mostrar índice del reporte">
              <span>
                <IconButton onClick={() => setOpenOutline(o => !o)}>
                  <ListAltIcon />
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
                  onClick={() => setShowCharts(prev => !prev)}
                >
                  {showCharts ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </span>
            </Tooltip>

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
              disabled={!isDirty || saveReport}
            >
              Descartar cambios
            </Button>
            <ButtonWithLoader
              loading={saveReport}
              onClick={() => handleSave()}
              disabled={!isDirty || isReportEmpty}
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
        flex: 1,
        minHeight: 0,
        borderTop: "1px solid #ccc",
        overflowY: 'auto',
        "&::-webkit-scrollbar": { width: { xs: '2px', lg: '6px' } },
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
              overflow: 'hidden',
              right: `${right}px`,
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
                    {orderedElements.map((el, index) => {
                      const numberOfPreviousSameType =
                        orderedElements
                          .slice(0, index)
                          .filter(e => e.type === el.type)
                          .length + 1;
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
            width: { lg: '80%', xs: '100%' },
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
                          insertElementAfter(null, {
                            id: generateUUID(),
                            type: 'text',
                            content: '<p>Nuevo texto...</p>',
                          })
                        }
                        onAddImage={() => {
                          setPendingInsertIndex(null);
                          imageInputRef.current.click();
                        }}
                        onAddChart={() => {
                          setChartInsertIndex(null);
                          setOpenChartSelector(true);
                        }}
                      />
                    </Box>
                  )}
                  {orderedElements.map((el, index) => {
                    const numberOfPreviousSameType =
                      orderedElements
                        .slice(0, index)
                        .filter(e => e.type === el.type)
                        .length + 1;

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
                              <ReportElementItem
                                key={el.id}
                                element={el}
                                showCharts={showCharts}
                                numberOfPreviousSameType={numberOfPreviousSameType}
                                onChange={handleElementChange}
                                removeElement={removeElement}
                              />
                            </Box>
                          )}
                        </Draggable>

                        {
                          showCharts &&
                          <InsertBlockDivider
                            onAddText={() =>
                              insertElementAfter(el.id, {
                                id: generateUUID(),
                                type: 'text',
                                content: '<p>Nuevo texto...</p>',
                              })
                            }

                            onAddImage={() => {
                              setPendingInsertIndex(el.id);
                              imageInputRef.current.click();
                            }}

                            onAddChart={() => {
                              setChartInsertIndex(el.id);
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
