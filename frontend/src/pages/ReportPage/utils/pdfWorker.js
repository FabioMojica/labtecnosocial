import { generatePDF } from './generatePdf/generatePdf'

export class PdfRenderError extends Error {
  constructor(code, message, meta = {}) {
    super(message);
    this.name = "PdfRenderError";
    this.code = code;
    this.meta = meta;
  }
}

self.onmessage = async (e) => {
  const { elements, title } = e.data;

  try {
    const pdfBytes = await generatePDF(elements, title, (progress) => {
      self.postMessage({ progress });
    });

    self.postMessage({ done: true, pdfBytes });
  } catch (err) {
    console.error("Error generating PDF in worker:", err);
    self.postMessage({
      error: true,
      code: err.code || "PDF_UNKNOWN_ERROR",
      message: err.message || "Error desconocido al generar PDF",
      meta: err.meta || null,
    });
  }
};
