import { generateStrategicPlanPdfBytes } from "./generatePdf/generateStrategicPlanPdf.js";

self.onmessage = async (event) => {
  const { data, year, title } = event.data || {};

  try {
    const pdfBytes = await generateStrategicPlanPdfBytes({
      data,
      year,
      title,
      onProgress: (progressPayload) => {
        self.postMessage({ progress: progressPayload });
      },
    });

    self.postMessage({ done: true, pdfBytes });
  } catch (error) {
    console.error("Error generating strategic plan PDF in worker:", error);

    self.postMessage({
      error: true,
      code: error?.code || "PDF_UNKNOWN_ERROR",
      message: error?.message || "Error desconocido al generar PDF",
      meta: error?.meta || null,
    });
  }
};
