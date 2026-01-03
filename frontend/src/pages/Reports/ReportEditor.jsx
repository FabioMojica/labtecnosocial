import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Stack,
  TextField,
  IconButton,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import html2pdf from "html2pdf.js";
import { TopCollaboratorsOfThePeriod } from "../APIsDashboardPage/components/GitHub/TopCollaboratorsOfThePeriod";
import CommitsInThePeriod from "../APIsDashboardPage/components/GitHub/CommitsInThePeriod";

export const ReportEditor = () => {
  const { nombre, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const chartsFromModal = location.state?.charts || [];

  const initialTitle = nombre || "Reporte sin título";
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

  // 🔹 Sincronizar título con URL
  useEffect(() => {
    if (!reportTitle) return;
    const sanitizedTitle = reportTitle
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
    navigate(`/reportes/crear/${sanitizedTitle}/${id}`, { replace: true });
  }, [reportTitle, id, navigate]);

  // 🔹 Detectar cambios profundos
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

  // 🔹 Reordenar con drag & drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(elements);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setElements(items);
  };

  // 🔹 Añadir nuevo bloque
  const addText = () => {
    const newElement = {
      id: `text-${Date.now()}`,
      type: "text",
      content: "<p>Nuevo texto...</p>",
    };
    setElements((prev) => [...prev, newElement]);
  };

  const removeElement = (id) => {
    const toDelete = elements.find((el) => el.id === id);
    if (!toDelete) return;
    setDeletedItems((prev) => [...prev, toDelete]);
    setElements((prev) => prev.filter((el) => el.id !== id));
  };

  // 🔹 Restaurar eliminados
  const restoreDeleted = () => {
    if (deletedItems.length === 0) return;
    setElements((prev) => [...prev, ...deletedItems]);
    setDeletedItems([]);
  };

  // 🔹 Guardar (simulado)
  const handleSave = () => {
    setOriginalState({
      title: reportTitle,
      elements: JSON.parse(JSON.stringify(elements)), // deep copy
    });
    setHasChanges(false);
  };

  // 🔹 Cancelar cambios
  const handleCancel = () => {
    if (
      window.confirm("¿Deseas descartar todos los cambios y restaurar el estado original?")
    ) {
      setReportTitle(originalState.title);
      setElements(JSON.parse(JSON.stringify(originalState.elements)));
      setDeletedItems([]);
      setHasChanges(false);
      restoreDeleted();
    }
  };

  // 🔹 Exportar PDF
  const exportToPDF = () => {
    const content = document.getElementById("report-content");
    html2pdf().from(content).save(`${reportTitle}.pdf`);
  };

  return (
    <Box sx={{ p: 1, bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Encabezado */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", width: "60%", gap: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Título del reporte
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="Escribe un título para tu reporte"
            inputProps={{ maxLength: 50 }}
          />
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="contained" onClick={addText}>
            Añadir texto
          </Button>
          <Button variant="outlined" onClick={exportToPDF} disabled={hasChanges}>
            Exportar PDF
          </Button>
        </Stack>
      </Box>

      {/* Botones de guardar/cancelar */}
      {hasChanges && (
        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 2, justifyContent: "center" }}
        >
          <Button variant="contained" color="success" onClick={handleSave}>
            Guardar cambios
          </Button>
          <Button variant="outlined" color="error" onClick={handleCancel}>
            Cancelar cambios
          </Button>
        </Stack>
      )}

      {/* Contenido editable */}
      <Box sx={{ p: 1, borderTop: "1px solid #ccc" }}>
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
                              const updatedElements = elements.map((item, i) =>
                                i === index ? { ...item, content: val } : item
                              );
                              setElements(updatedElements);
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
    </Box>
  );
};
