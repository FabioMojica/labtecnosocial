import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import logoLight from "../../../../assets/labTecnoSocialLogoLight.png";
import { drawHeader } from "./drawHeader";
import { drawTextBlock } from "./drawTextBock";



const fetchLogoBytes = async () => {
  const res = await fetch(logoLight);
  return await res.arrayBuffer();
};


export const generatePDF = async (elements, title, onProgress = () => { }) => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const logoBytes = await fetchLogoBytes();
  const HEADER_SPACING = 30; 
  let y = await drawHeader(pdfDoc, page, title, logoBytes);
  y -= HEADER_SPACING;
  const MARGIN_X = 50;
  const MAX_WIDTH = width - MARGIN_X * 2;


  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];

    if (el.type === "text" && el.content?.content_html) {
      y = await drawTextBlock({
        pdfDoc,
        page,
        content_html: el.content.content_html,
        x: MARGIN_X,
        y,
        maxWidth: MAX_WIDTH,
      });
    }

    y -= 10;
  }
  return await pdfDoc.save();
};
