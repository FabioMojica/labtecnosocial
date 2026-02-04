import { Fragment, useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import html2pdf from "html2pdf.js";
import { useFetchAndLoad } from "../../hooks";
import { createReportApi, deleteReportApi, updateReportApi } from "../../api/reports";
import { ButtonWithLoader, FullScreenProgress } from "../../generalComponents";
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import AddIcon from '@mui/icons-material/Add';
import { useConfirm } from "material-ui-confirm";
import DeleteReportDialog from "./components/DeleteReportDialog";
import { useNotification } from "../../contexts";
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import ChartRenderer from "./components/ChartRenderer";
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { integrationsConfig } from "../../utils";
import { useElementSize } from "../../hooks/useElementSize";
import CloseIcon from '@mui/icons-material/Close';

const ZOOM_OPTIONS = [0.5, 0.75, 1];

export const ReportEditor = () => {
  const { name } = useParams();
  const location = useLocation();
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const openExportMenu = Boolean(exportAnchorEl);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
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
  const { height: headerHeight } = useElementSize(headerRef);

  const handleOpenZoomMenu = (e) => setZoomAnchorEl(e.currentTarget);
  const handleCloseZoomMenu = () => setZoomAnchorEl(null);

  const handleSelectZoom = (value) => {
    setZoom(value);
    handleCloseZoomMenu();
  };


  const [currentReportId, setCurrentReportId] = useState(
    location.state?.id ?? null
  );

  const isEditing = Boolean(currentReportId);

  useEffect(() => {
    const initial = {
      title: initialTitle,
      elements: initialElements,
    };
    setHistory([JSON.parse(JSON.stringify(initial))]);
    setHistoryIndex(0);
  }, []);

  const pushToHistory = (newState) => {
    setHistory((prev) => {
      const currentIndex = prev.length - 1;
      const trimmed = prev.slice(0, currentIndex + 1);

      return [...trimmed, JSON.parse(JSON.stringify(newState))];
    });

    setHistoryIndex((prev) => prev + 1);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (!canUndo) return;
    const prevIndex = historyIndex - 1;
    const state = history[prevIndex];
    setReportTitle(state.title);
    setElements(state.elements);
    setHistoryIndex(prevIndex);
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const nextIndex = historyIndex + 1;
    const state = history[nextIndex];
    setReportTitle(state.title);
    setElements(state.elements);
    setHistoryIndex(nextIndex);
  };

  const handleOpenExportMenu = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
  };

  const navigate = useNavigate();
  const { loading, callEndpoint } = useFetchAndLoad();

  const chartsFromModal = location.state?.charts || [];

  const initialTitle = name || "Reporte sin título";
  const initialElements = [
    { id: "text-1", type: "text", content: "<p>Nuevo texto...</p>" },
    ...chartsFromModal.map((chart) => ({
      id: chart?.id,
      selectedPeriod: chart?.selectedPeriod,
      platform: chart?.platform,
      interval: chart?.periodLabel,
      type: "chart",
      content: chart.title,
      data: chart.data || null,
    })),
  ];

  const [reportTitle, setReportTitle] = useState(initialTitle);
  const [elements, setElements] = useState(initialElements);

  const [originalState, setOriginalState] = useState({
    title: initialTitle,
    elements: initialElements,
  });
  const [deletedItems, setDeletedItems] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  const reportForDelete = currentReportId
    ? {
      id: currentReportId,
      title: reportTitle,
    }
    : null;

  useEffect(() => {
    if (!reportTitle) return;

    const encodedTitle = encodeURIComponent(reportTitle);
    const desiredPath = `/reportes/editor/${encodedTitle}`;

    if (location.pathname !== desiredPath) {
      navigate(desiredPath, { replace: true });
    }
  }, [reportTitle]);

  useEffect(() => {
    const original = JSON.stringify(originalState);
    const current = JSON.stringify({ title: reportTitle, elements });
    setHasChanges(original !== current);
  }, [reportTitle, elements, originalState]);

  const insertElementAfter = (index, newElement) => {
    const updated = [...elements];
    updated.splice(index + 1, 0, newElement);

    setElements(updated);
    pushToHistory({ title: reportTitle, elements: updated });
  };

  const onDragEnd = (result) => {
    setIsDragging(false);

    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const items = Array.from(elements);
    const [moved] = items.splice(sourceIndex, 1);
    items.splice(destinationIndex, 0, moved);

    setElements(items);
    pushToHistory({ title: reportTitle, elements: items });
  };


  const InsertBlockDivider = ({ onAddText, onAddChart }) => {
    return (
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
          py: 1,
          mb: 1,
          width: '100%',
        }}
      >
        <Button fullWidth size="small" startIcon={<AddIcon />} onClick={onAddText}>
          Texto
        </Button>
      </Box>
    );
  };

  const removeElement = (id) => {
    setElements((prev) => {
      const newElements = prev.filter(el => el.id !== id);

      pushToHistory({
        title: reportTitle,
        elements: newElements,
      });

      return newElements;
    });
  };

  const normalizeElementsForApi = (elements) => {
    return elements.map((el, index) => ({
      type: el.type,
      content: el.type === 'text' ? el.content : el.content ?? null,
      position: index,
      chartData: el.type === 'chart'
        ? { data: el.data }
        : null,
    }));
  };

  const handleSave = async () => {
    try {
      const normalizedTitle =
        reportTitle?.trim() === "" ? "Reporte sin título" : reportTitle.trim();

      const payload = {
        title: normalizedTitle,
        elements: normalizeElementsForApi(elements),
      };

      if (isEditing) {
        const editedReport = await callEndpoint(
          updateReportApi(currentReportId, payload)
        );

        setCurrentReportId(editedReport.id);
        setReportTitle(normalizedTitle);

        navigate(`/reportes/editor/${encodeURIComponent(normalizedTitle)}`, {
          state: { id: editedReport.id },
          replace: true,
        });

        notify("Reporte actualizado exitosamente.", "success");
      } else {
        const createdReport = await callEndpoint(createReportApi(payload));

        setCurrentReportId(createdReport.id);
        setReportTitle(normalizedTitle);

        notify("Reporte creado exitosamente.", "success");

        navigate(`/reportes/editor/${encodeURIComponent(normalizedTitle)}`, {
          state: { id: createdReport.id },
          replace: true,
        });
      }

      setOriginalState({
        title: normalizedTitle,
        elements: JSON.parse(JSON.stringify(elements)),
      });

      setHasChanges(false);
    } catch (error) {
      notify(error.message, "error");
    }
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
          const resetState = {
            title: originalState.title,
            elements: JSON.parse(JSON.stringify(originalState.elements)),
          };

          // Estado visible
          setReportTitle(resetState.title);
          setElements(resetState.elements);

          // 🔥 RESET TOTAL DEL HISTORIAL
          setHistory([resetState]);
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
    html2pdf().from(content).save(`${reportTitle}.pdf`);
  };

  const exportToXLS = () => {
    handleCloseExportMenu();
    console.log('Exportar XLS');
    // acá después enchufás SheetJS / backend
  };

  const scrollToElement = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    // efecto visual de highlight
    el.classList.remove('flash-highlight');
    void el.offsetWidth;
    el.classList.add('flash-highlight');
  };



  if (loading) return (
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
            >
              <MenuItem onClick={exportToPDF}>
                <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                Exportar PDF
              </MenuItem>

              <MenuItem onClick={exportToXLS}>
                <TableChartIcon fontSize="small" sx={{ mr: 1 }} />
                Exportar Excel (XLS)
              </MenuItem>
              {isEditing &&
                <>
                  <Divider sx={{ mt: 20 }} />

                  <MenuItem onClick={() => {
                    handleCloseExportMenu();
                    setOpenDeleteReportDialog(true);
                  }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
                    Eliminar el reporte
                  </MenuItem>
                </>
              }
            </Menu>

            <TextField
              fullWidth
              variant="outlined"
              value={reportTitle}
              onChange={(e) => {
                const value = e.target.value;
                if (value.trim() === "") {
                  setReportTitle("Reporte sin título");
                } else {
                  setReportTitle(value);
                }
              }}
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
              disabled={loading || !hasChanges}
            >
              Descartar cambios
            </Button>
            <ButtonWithLoader
              loading={loading}
              onClick={() => handleSave()}
              disabled={!hasChanges}
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
        "&::-webkit-scrollbar": { width: {xs: '2px', lg: '8px'} },
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
                    {elements.map((el, index) => (
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
                                  {el.type === 'text' ? 'Texto' : 'Gráfico'} #{index + 1}
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
                                      maxWidth: '100%',
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
                                      color={integrationsConfig[el?.platform].color}
                                      lineHeight={1}
                                      sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {el.platform ?? 'N/A'}
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
                    ))}
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
          {elements.map((el, index) => (
            <Fragment key={el.id}>
              <Box
                id={el.id}
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  px: 2,
                  pb: 2,
                  pt: 1,
                  boxShadow: 3,
                  mb: 1,
                }}
              >
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1
                }}>
                  <Typography variant="subtitle2" fontWeight={'bold'} lineHeight={1}>
                    {el.type === 'text' ? 'Texto' : 'Gráfico'} #{index + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeElement(el.id)}
                    sx={{p: 0, m: 0}}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                {el.type === "text" && (
                  <ReactQuill
                    theme="snow"
                    value={el.content}
                    onChange={(val) => {
                      const updated = elements.map((item, i) =>
                        i === index ? { ...item, content: val } : item
                      );
                      setElements(updated);
                    }}
                    onBlur={() => pushToHistory({ title: reportTitle, elements })}
                  />
                )}

                {el.type === "chart" && (
                  <ChartRenderer element={el} />
                )}
              </Box>

              <InsertBlockDivider
                onAddText={() =>
                  insertElementAfter(index, {
                    id: `text-${Date.now()}`,
                    type: 'text',
                    content: '<p>Nuevo texto...</p>',
                  })
                }
              />
            </Fragment>
          ))}
        </Box>

      </Box>

      <DeleteReportDialog
        open={openDeleteReportDialog}
        onClose={() => setOpenDeleteReportDialog(false)}
        report={reportForDelete}
        onDeleteReport={handleDeleteReport}
      />
    </Box >
  );
};
