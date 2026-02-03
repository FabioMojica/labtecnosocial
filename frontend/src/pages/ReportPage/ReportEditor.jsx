import { useEffect, useState } from "react";
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
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import html2pdf from "html2pdf.js";
import { TopCollaboratorsOfThePeriod } from "../APIsDashboardPage/components/GitHub/TopCollaboratorsOfThePeriod";
import CommitsInThePeriod from "../APIsDashboardPage/components/GitHub/CommitsInThePeriod";
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

export const ReportEditor = () => {
  const { name } = useParams();
  const location = useLocation();
  const reportId = location.state?.id;
  console.log("reportId", reportId)
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
    { id: "text-1", type: "text", content: "<p>Escribe tu reporte aquí...</p>" },
    ...chartsFromModal.map((chart) => ({
      id: `chart-${chart.id}`,
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

  // 🔹 Confirmar recarga si hay cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "Hay cambios sin guardar. ¿Deseas salir?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(elements);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setElements(items);
    pushToHistory({ title: reportTitle, elements: items });
  };


  // 🔹 Añadir nuevo bloque
  const addText = () => {
    const newElements = [
      ...elements,
      {
        id: `text-${Date.now()}`,
        type: "text",
        content: "<p>Nuevo texto...</p>",
      },
    ];

    setElements(newElements);
    pushToHistory({ title: reportTitle, elements: newElements });
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
        height: isFullscreen ? '100vh' : 'auto',
        bgcolor: "background.default",
        zIndex: isFullscreen ? 1500 : 'auto',
        overflow: isFullscreen ? 'hidden' : 'visible',
      }}
    >
      {/* Encabezado */}
      <Box
        sx={{
          display: "flex",
          flexDirection: 'column',
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          px: {
            xs: 0.5, 
            lg: 1
          }
        }}
      >
        <Box sx={{ display: "flex", flexDirection: { xs: 'column', lg: 'row' }, alignItems: "center", width: "100%", gap: 2, justifyContent: 'space-between' }}>
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
                  setTooltipOpen(false);
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
            mt: {
              xs: 1,
              lg: 0,
            },
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{
            display: 'flex'
          }}>
            <IconButton onClick={addText}>
              <AddIcon />
            </IconButton>

            <IconButton onClick={handleUndo} disabled={!canUndo}>
              <UndoIcon />
            </IconButton>

            <IconButton onClick={handleRedo} disabled={!canRedo}>
              <RedoIcon />
            </IconButton>
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
        p: 1, borderTop: "1px solid #ccc", 
        overflowY: 'auto',
        "&::-webkit-scrollbar": { width: "2px" },
        "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
        "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
        "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
      }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="report">
            {(provided) => (
              <Box
                id="report-content"
                ref={provided.innerRef}
                {...provided.droppableProps}
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
                {elements.map((el, index) => (
                  <Draggable key={el.id} draggableId={el.id} index={index}>
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          mb: 2,
                          position: "relative",
                          border: "1px solid #ddd",
                          borderRadius: 2,
                          p: 2,
                        }}
                      >
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeElement(el.id)}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            zIndex: 400,
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>

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
                            onBlur={() => {
                              pushToHistory({ title: reportTitle, elements });
                            }}
                          />

                        )}

                        {el.type === "chart" && (
                          <Box>
                            {el.id.replace("chart-", "") === "topCollaborators" ? (
                              <TopCollaboratorsOfThePeriod
                                commits={el.data}
                                title="Top Colaboradores"
                                selectable={false}
                              />
                            ) : el.id.replace("chart-", "") === "commitsInPeriod" ? (
                              <CommitsInThePeriod
                                commits={el.data}
                                title="Cantidad de commits"
                                interval={el.interval || "Periodo"}
                                selectable={false}
                                selectedPeriod={el.selectedPeriod || "all"}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Gráfica desconocida
                              </Typography>
                            )}

                          </Box>
                        )}
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

      <DeleteReportDialog
        open={openDeleteReportDialog}
        onClose={() => setOpenDeleteReportDialog(false)}
        report={reportForDelete}
        onDeleteReport={handleDeleteReport}
      />
    </Box >
  );
};
