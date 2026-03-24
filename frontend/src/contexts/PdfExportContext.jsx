import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNotification } from "./ToastContext";

const INITIAL_PDF_STATE = {
  active: false,
  percentage: 0,
  stage: "",
  fileName: "",
};

const PdfExportContext = createContext(null);

const clampProgress = (value) => Math.max(1, Math.min(100, Math.round(Number(value) || 0)));

const PDF_WORKER_URLS = {
  report: new URL("../pages/ReportPage/utils/pdfWorker.js", import.meta.url),
  strategic: new URL("../pages/StrategicPlan/utils/strategicPdfWorker.js", import.meta.url),
  operational: new URL("../pages/OperationalPlan/utils/operationalPdfWorker.js", import.meta.url),
};

export const PdfExportProvider = ({ children }) => {
  const workerRef = useRef(null);
  const { notify } = useNotification();
  const [pdfState, setPdfState] = useState(INITIAL_PDF_STATE);

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  const startPdfExport = useCallback(
    ({
      elements = [],
      title = "Reporte sin titulo",
      payload = null,
      workerType = "report",
      fileName = "",
    } = {}) => {
      if (pdfState.active) {
        return { started: false, reason: "in_progress" };
      }

      const safeBaseTitle = String(title || "Reporte sin titulo").trim() || "Reporte sin titulo";
      const normalizedFileName = String(fileName || `${safeBaseTitle}.pdf`).trim() || `${safeBaseTitle}.pdf`;
      const downloadFileName = normalizedFileName.toLowerCase().endsWith(".pdf")
        ? normalizedFileName
        : `${normalizedFileName}.pdf`;
      const selectedWorkerUrl = PDF_WORKER_URLS[workerType] || PDF_WORKER_URLS.report;

      terminateWorker();
      setPdfState({
        active: true,
        percentage: 1,
        stage: "Inicializando generacion...",
        fileName: downloadFileName,
      });

      const worker = new Worker(selectedWorkerUrl, {
        type: "module",
      });
      workerRef.current = worker;

      worker.postMessage(
        payload || {
          title: safeBaseTitle,
          elements,
        }
      );

      worker.onmessage = (e) => {
        const data = e.data;

        if (data.progress !== undefined) {
          if (typeof data.progress === "number") {
            setPdfState((prev) => ({
              ...prev,
              active: true,
              percentage: clampProgress(data.progress),
              stage: "Generando PDF...",
            }));
          } else {
            setPdfState((prev) => ({
              ...prev,
              active: true,
              percentage: clampProgress(data.progress?.percentage),
              stage: data.progress?.stage || "Generando PDF...",
            }));
          }
        }

        if (data.done) {
          const blob = new Blob([data.pdfBytes], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = downloadFileName;
          anchor.click();
          URL.revokeObjectURL(url);

          terminateWorker();
          setPdfState({
            active: false,
            percentage: 100,
            stage: "PDF generado",
            fileName: downloadFileName,
          });

          notify(`PDF generado: ${downloadFileName}`, "success");
        }

        if (data.error) {
          console.error("PDF Error:", data.code, data.meta);

          const userMessage =
            data.code === "PDF_FONT_MEASURE_ERROR"
              ? "El documento contiene caracteres no compatibles con PDF."
              : data.message || "Error desconocido al generar PDF.";

          terminateWorker();
          setPdfState(INITIAL_PDF_STATE);
          notify(`Ocurrio un error al generar PDF: ${userMessage}`, "error");
        }
      };

      worker.onerror = (err) => {
        console.error("Fatal worker error:", err);
        terminateWorker();
        setPdfState(INITIAL_PDF_STATE);
        notify("Ocurrio un error al generar PDF", "error");
      };

      return { started: true };
    },
    [notify, pdfState.active, terminateWorker]
  );

  const clearPdfState = useCallback(() => {
    setPdfState((prev) => (prev.active ? prev : INITIAL_PDF_STATE));
  }, []);

  useEffect(() => {
    if (pdfState.active || pdfState.percentage < 100) return undefined;

    const timeoutId = setTimeout(() => {
      clearPdfState();
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [clearPdfState, pdfState.active, pdfState.percentage]);

  useEffect(() => {
    return () => terminateWorker();
  }, [terminateWorker]);

  const value = useMemo(
    () => ({
      pdfState,
      isPdfGenerating: pdfState.active,
      startPdfExport,
    }),
    [pdfState, startPdfExport]
  );

  return <PdfExportContext.Provider value={value}>{children}</PdfExportContext.Provider>;
};

export const usePdfExport = () => {
  const context = useContext(PdfExportContext);
  if (!context) {
    throw new Error("usePdfExport debe usarse dentro de PdfExportProvider");
  }
  return context;
};
