import { PDFDocument } from "pdf-lib";
import logoLight from "../../../../assets/labTecnoSocialLogoLight.png";
import { drawHeader } from "./drawHeader";
import { drawTextBlock } from "./drawTextBock";
import { PdfRenderError } from "../pdfWorker";
import { drawImageBlock } from "./drawImageBlock";
import { drawChartBlock } from "./drawChartBlock";

export const PAGE_MARGIN_TOP = 50;
export const PAGE_MARGIN_BOTTOM = 30;

export const ensurePageSpace = ({ pdfDoc, cursor }) => {
  if (cursor.y <= PAGE_MARGIN_BOTTOM) {
    try {
      const newPage = pdfDoc.addPage();
      cursor.page = newPage;
      cursor.y = newPage.getSize().height - PAGE_MARGIN_TOP;
    } catch {
      throw new PdfRenderError(
        "PDF_ADD_PAGE_ERROR",
        "No se pudo crear una nueva página",
        { y: cursor.y }
      );
    }
  }
};

const fetchLogoBytes = async () => {
  const res = await fetch(logoLight);
  return await res.arrayBuffer();
};


const drawElement = async (pdfDoc, page, el, x, y, maxWidth) => {

  if (el.type === "text" && el.content?.content_html) {
    const result = await drawTextBlock({
      pdfDoc,
      page,
      content_html: el.content.content_html,
      x,
      y,
      maxWidth,
    });
    return result;
  }

  if (el.type === "image" && el.src) {
    const result = await drawImageBlock({
      pdfDoc,
      page,
      src: el.src,
      width: el.width,
      height: el.height,
      maxWidth,
      y,
    });
    return result;
  }

  if (el.type === "chart") {
    const result = await drawChartBlock({
      pdfDoc,
      page,
      element: el,
      x,
      y,
      maxWidth
    })
    return result;
  }

  return { y, page };
};


export const generatePDF = async (elements, title, onProgress = () => { }) => {
  const reportProgress = (percentage, stage) => {
    const safePercentage = Math.max(0, Math.min(100, Math.round(Number(percentage) || 0)));
    if (typeof onProgress === "function") {
      onProgress({ percentage: safePercentage, stage });
    }
  };

  reportProgress(2, "Inicializando documento...");
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  const { width } = page.getSize();
  const MARGIN_X = 50;
  const MAX_WIDTH = width - MARGIN_X * 2;

  reportProgress(8, "Cargando recursos...");
  const logoBytes = await fetchLogoBytes();
  const HEADER_SPACING = 30;
  reportProgress(14, "Construyendo encabezado...");
  let y = await drawHeader(pdfDoc, page, title, logoBytes);
  y -= HEADER_SPACING;


  for (let i = 0; i < elements.length; i++) {
    const doneRatio = elements.length > 0 ? i / elements.length : 1;
    reportProgress(16 + doneRatio * 74, `Procesando elemento ${i + 1} de ${elements.length}...`);
    const result = await drawElement(pdfDoc, page, elements[i], MARGIN_X, y, MAX_WIDTH);
    y = result.y;
    page = result.page;

  }

  reportProgress(94, "Finalizando PDF...");
  const pdfBytes = await pdfDoc.save();
  reportProgress(100, "PDF generado");
  return pdfBytes;
};
