import { pdf } from "@react-pdf/renderer";
import { ReportPDF } from '../src/pages/ReportPage/components/ReportPdf.jsx';

// self.onmessage = async (event) => {

//   const { title, elements } = event.data;
//   console.log("holaaaaaaaaaaaaaaaaaaa")
//   try {
//     console.log("holaaaaaaaaaaaaaaaaaaa")
//     const blob = await pdf(<ReportPDF title={title} elements={elements} />).toBlob();
//     self.postMessage({ success: true, blob });
//   } catch (error) {
//     self.postMessage({ success: false, error: error.message });
//   }
// };

// pdfWorker.js

self.onmessage = (event) => {
  console.log("Worker received message:", event.data);

  const { title, elements } = event.data;

  // Simulación de procesamiento
  const result = `Título: ${title}, elementos: ${elements.length}`;

  // Enviar respuesta al hilo principal
  self.postMessage(result);
};
