import { generateOperationalPlanPdfBytes } from "./generateOperationalPlanPdf.js";

self.onmessage = async (event) => {
  const { rows, project, title } = event.data || {};

  try {
    const pdfBytes = await generateOperationalPlanPdfBytes({
      rows,
      project,
      title,
      onProgress: (progressPayload) => {
        self.postMessage({ progress: progressPayload });
      },
    });

    self.postMessage({ done: true, pdfBytes }, [pdfBytes]);
  } catch (error) {
    console.error("Error generating operational plan PDF in worker:", error);

    self.postMessage({
      error: true,
      code: error?.code || "PDF_UNKNOWN_ERROR",
      message: error?.message || "Error desconocido al generar PDF",
      meta: error?.meta || null,
    });
  }
};
