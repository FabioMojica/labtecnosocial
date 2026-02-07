import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4, validate as validateUUID } from "uuid";
import html2pdf from "html2pdf.js";
import { useConfirm } from "material-ui-confirm";
import { useNotification, useReport } from "../../../contexts";
import {
    createReportApi,
    getReportByIdApi,
    deleteReportApi,
    updateReportApi
} from "../../../api";
import { formatElementsForDb, formatElementsForFrontend } from "../utils";
import { generateUUID } from "../../../utils";

export const useReportEditor = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const confirm = useConfirm();
    const { notify } = useNotification();
    const { selectedCharts, addChart, removeChart, clearCharts } = useReport();

    // --------- Estados básicos del reporte ----------
    const initialReportId = location.state?.id ? Number(location.state.id) : null;
    const [currentReportId, setCurrentReportId] = useState(initialReportId);
    const [isCreateNewReport, setIsCreateNewReport] = useState(initialReportId === null);
    const [reportMetadata, setReportMetadata] = useState(null);
    const originalReportRef = useRef({
        title: "Reporte sin título",
        elements: {},
        elementsOrder: [],
    });
    const [editedReport, setEditedReport] = useState(structuredClone(originalReportRef.current));
    const [title, setTitle] = useState(null);

    // --------- Estados de UI ----------
    const [fetchReport, setFetchReport] = useState(false);
    const [saveReport, setSaveReport] = useState(false);
    const [deletedReport, setDeletedReport] = useState(false);
    const [errorFetchReport, setErrorFecthReport] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [pendingInsertIndex, setPendingInsertIndex] = useState(null);
    const [chartInsertIndex, setChartInsertIndex] = useState(null);

    // --------- Historial para undo/redo ----------
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    // --------- Derived ----------
    const isReportEmpty = !editedReport || Object.keys(editedReport.elements || {}).length === 0;
    const orderedElements = useMemo(() =>
        editedReport.elementsOrder.map(id => editedReport.elements[id]).filter(Boolean),
        [editedReport.elementsOrder, editedReport.elements]
    );

    const normalizeReportForCompare = (report) => {
        return {
            title: report.title?.trim() || "",
            elementsOrder: report.elementsOrder,
            elements: Object.values(report.elements)
                .map(el => {
                    const { file, __local, ...rest } = el;

                    // 🔥 SI ES TEXTO, SOLO COMPARAR HTML
                    if (rest.type === "text" && rest.content) {
                        return {
                            ...rest,
                            content: {
                                content_html: rest.content.content_html ?? "",
                            },
                        };
                    }

                    return rest;
                })
                .sort((a, b) => a.id.localeCompare(b.id)),
        };
    };


    const isDirty = useMemo(() => {
        console.log("cuuren", editedReport);
        console.log("original", originalReportRef.current)
        const current = normalizeReportForCompare(editedReport);
        const original = normalizeReportForCompare(originalReportRef.current);

        return JSON.stringify(current) !== JSON.stringify(original);
    }, [editedReport]);

    // --------- Fetch / Load Report ----------
    const fetchReportById = async () => {
        if (!currentReportId) return;
        try {
            setErrorFecthReport(false);
            setFetchReport(true);
            const res = await getReportByIdApi(currentReportId);
            const { created_at, updated_at, report_version } = res;
            const { title, elements, elementsOrder } = formatElementsForFrontend(res);

            setTitle(title);
            setEditedReport({ title: title || "Reporte sin título", elements, elementsOrder });
            setReportMetadata({ created_at, updated_at, report_version });

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
        if (!isCreateNewReport) fetchReportById();
    }, [currentReportId]);

    // --------- Historial ----------
    const pushToHistory = (snapshot) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(snapshot);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (!canUndo) return;
        const prevIndex = historyIndex - 1;
        const snapshot = structuredClone(history[prevIndex]);
        setEditedReport(snapshot);
        setHistoryIndex(prevIndex);
    };

    const redo = () => {
        if (!canRedo) return;
        const nextIndex = historyIndex + 1;
        const snapshot = structuredClone(history[nextIndex]);
        setEditedReport(snapshot);
        setHistoryIndex(nextIndex);
    };

    // --------- Elementos ----------
    const handleElementChange = (id, newElement) => {
        setEditedReport(prev => ({
            ...prev,
            elements: { ...prev.elements, [id]: newElement }
        }));
    };

    const insertElementAfter = (afterId, newElement) => {
        setEditedReport(prev => {
            const newElements = { ...prev.elements, [newElement.id]: newElement };
            const newOrder = afterId === null
                ? [newElement.id, ...prev.elementsOrder]
                : [
                    ...prev.elementsOrder.slice(0, prev.elementsOrder.indexOf(afterId) + 1),
                    newElement.id,
                    ...prev.elementsOrder.slice(prev.elementsOrder.indexOf(afterId) + 1),
                ];
            return { ...prev, elements: newElements, elementsOrder: newOrder };
        });
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

    const onDragEnd = (result) => {
        setIsDragging(false);
        if (!result.destination) return;

        const newOrder = Array.from(editedReport.elementsOrder);
        const [movedId] = newOrder.splice(result.source.index, 1);
        newOrder.splice(result.destination.index, 0, movedId);

        setEditedReport(prev => ({ ...prev, elementsOrder: newOrder }));
        pushToHistory({ ...editedReport, elementsOrder: newOrder });
    };

    // --------- Images ----------
    const handleImageSelected = (file) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            notify("Solo se permiten archivos de imagen (jpg, png)", "warning");
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        const newImage = {
            id: generateUUID(),
            type: "image",
            src: previewUrl,
            alt: file.name,
            width: 400,
            height: 400,
            file,
            __local: true
        };
        insertElementAfter(pendingInsertIndex, newImage);
        setPendingInsertIndex(null);
    };

    // --------- Charts ----------
    const normalizeCharts = (charts) =>
        charts.map(chart => !chart.id || !validateUUID(chart.id) ? { ...chart, id: uuidv4() } : chart);

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

    // --------- Guardado / Cancelación / Eliminación ----------
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

    const handleSave = async () => {
        if (isReportEmpty) {
            notify("No puedes guardar un reporte vacío.", "warning");
            return;
        }
        try {
            setSaveReport(true);
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
            setIsCreateNewReport(false);

            notify(
                isCreateNewReport
                    ? "Reporte creado exitosamente."
                    : "Reporte actualizado exitosamente.",
                "success"
            );

            navigate(`/reportes/editor/${encodeURIComponent(title)}`, { state: { id: response.id }, replace: true });
        } catch (error) {
            notify(error.message, "error");
        } finally {
            setSaveReport(false);
        }
    };

    const handleDeleteReport = async () => {
        try {
            setDeletedReport(true);
            await deleteReportApi(currentReportId);
            notify("Reporte eliminado correctamente del sistema.", "success");
            navigate('/reportes', { replace: true });
        } catch (error) {
            notify(error.message, "error");
        } finally {
            setDeletedReport(false);
        }
    };

    const exportToXLS = () => {
        handleCloseExportMenu();
        console.log('Exportar XLS');
    };

    return {
        // estados
        isCreateNewReport,
        editedReport,
        setEditedReport,
        currentReportId,
        title,
        setTitle,
        orderedElements,
        isReportEmpty,
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

        // operaciones
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
    };
};
