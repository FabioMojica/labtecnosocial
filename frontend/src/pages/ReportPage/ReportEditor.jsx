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
import { ButtonWithLoader, ErrorScreen, FullScreenProgress } from "../../generalComponents";
import { useLayout, useNotification, useReport } from "../../contexts";
import { formatDateParts, generateUUID, integrationsConfig } from "../../utils";

import { PDFDownloadLink, pdf } from "@react-pdf/renderer";

import {
  InsertBlockDivider,
  ChartSelectorDialog,
  DeleteReportDialog,
  ReportElementItem,
  ReportTitle
} from "./components";
import { getElementLabel, formatElementsForDb, formatElementsForFrontend } from "./utils";
import { useReportEditor } from "./hooks/useReportEditor";
import { ReportPDF } from "./components/ReportPdf";


export const ReportEditor = () => {
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const openExportMenu = Boolean(exportAnchorEl);
  const [openDeleteReportDialog, setOpenDeleteReportDialog] = useState(false);
  const theme = useTheme();
  const { right } = useLayout();
  const [openOutline, setOpenOutline] = useState(false);
  const headerRef = useRef(null);
  const [showCharts, setShowCharts] = useState(true);
  const [openChartSelector, setOpenChartSelector] = useState(false);
  const imageInputRef = useRef(null);
  const { notify } = useNotification();

  const {
    isCreateNewReport,
    editedReport,
    setEditedReport,
    currentReportId,
    title,
    setTitle,
    isReportEmpty,
    orderedElements,
    isDirty,
    canUndo,
    canRedo,
    isFullscreen,
    setIsFullscreen,
    isDragging,
    setIsDragging,
    fetchReport,
    saveReport,
    deletedReport,
    errorFetchReport,
    reportMetadata,
    undo,
    redo,
    insertElementAfter,
    removeElement,
    handleElementChange,
    onDragEnd,
    handleImageSelected,
    pendingInsertIndex,
    setPendingInsertIndex,
    chartInsertIndex,
    setChartInsertIndex,
    handleAddCharts,
    fetchReportById,
    handleSave,
    handleCancel,
    handleDeleteReport,
    exportToXLS
  } = useReportEditor();

  const handleOpenExportMenu = (event) => {
    if (event.currentTarget) {
      setExportAnchorEl(event.currentTarget);
    }
  };

  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
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

  const exportToPDF = async () => {
    const blob = await pdf(
      <ReportPDF
        title={editedReport.title}
        elements={orderedElements}
      />).toBlob();

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${editedReport.title}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
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
                                      {el?.content?.content_html.replace(/<[^>]+>/g, '').slice(0, 50)}
                                      {el?.content?.content_html.replace(/<[^>]+>/g, '').length > 50 ? '...' : ''}
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
            maxWidth: 1000,
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
                            content: {
                              content_html: '<p>Nuevo texto...</p>',
                              content_delta: {
                                ops: [{ insert: 'Nuevo texto...\n' }]
                              }
                            }
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
                                content: {
                                  content_html: '<p>Nuevo texto...</p>',
                                  content_delta: {
                                    ops: [{ insert: 'Nuevo texto...\n' }]
                                  }
                                }
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
        onDeleteReport={() => {
          handleDeleteReport();
          setOpenDeleteReportDialog(false);
        }}
      />

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleImageSelected(e.target.files[0])}
      />
    </Box >
  );
};
