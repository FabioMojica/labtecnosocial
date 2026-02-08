import { generatePDF } from './generatePdf/generatePdf'

self.onmessage = async (e) => {
  const { elements, title } = e.data;

  try {
    const pdfBytes = await generatePDF(elements, title, (progress) => {
      self.postMessage({ progress });
    });

    self.postMessage({ done: true, pdfBytes });
  } catch (err) {
    console.error("Error generating PDF in worker:", err);
    self.postMessage({ error: true, message: err.message });
  }
};
