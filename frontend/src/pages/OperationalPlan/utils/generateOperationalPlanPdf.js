import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoLight from "../../../assets/labTecnoSocialLogoLight.png";
import { formatDate, formatDateParts } from "../../../utils/formatDate.js";

const HEADER_HEIGHT = 60;
const HEADER_BACKGROUND = [31, 125, 83];
const DIVIDER_COLOR = [255, 255, 255];
const DATE_TEXT_COLOR = [241, 234, 234];
const GROUP_ROW_FILL = [232, 232, 232];
const SEPARATOR_ROW_FILL = [255, 255, 255];
const JUSTIFY_COLUMN_INDEXES = new Set([0, 2, 8]);

const clampProgress = (value) => Math.max(1, Math.min(100, Math.round(Number(value) || 0)));

const reportProgress = (onProgress, percentage, stage) => {
  if (typeof onProgress !== "function") return;
  onProgress({
    percentage: clampProgress(percentage),
    stage,
  });
};

const toSafeText = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  const normalized = String(value).trim();
  return normalized || fallback;
};

const blobToDataUrl = async (blob) => {
  if (!blob) return null;

  if (typeof FileReaderSync !== "undefined") {
    const reader = new FileReaderSync();
    return reader.readAsDataURL(blob);
  }

  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  const mimeType = blob.type || "image/png";
  return `data:${mimeType};base64,${btoa(binary)}`;
};

const fetchAssetDataUrl = async (assetUrl) => {
  try {
    const response = await fetch(assetUrl);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
};

const fitTitleFontSize = (doc, text, maxWidth) => {
  let fontSize = 25;
  const minFontSize = 20;

  while (fontSize > minFontSize) {
    doc.setFontSize(fontSize);
    const width = doc.getTextWidth(text);
    if (width <= maxWidth) return fontSize;
    fontSize -= 1;
  }

  return minFontSize;
};

const wrapTitle = (doc, text, maxWidth) => {
  const words = String(text || "").split(" ").filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const width = doc.getTextWidth(candidate);

    if (width <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  if (lines.length <= 2) return lines;
  return [lines[0], `${lines[1]}...`];
};

const drawDefaultHeader = ({ doc, title, logoDataUrl, dateParts }) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoX = 10;
  const logoY = 10;
  const logoWidth = 100;
  const logoHeight = 40;
  const logoEndX = logoX + logoWidth + 10;

  const metadataWidth = 120;
  const metadataX = pageWidth - metadataWidth - 10;
  const metadataStartX = metadataX - 10;

  const titleAreaStartX = logoEndX + 10;
  const titleAreaEndX = metadataStartX - 10;
  const titleAreaWidth = titleAreaEndX - titleAreaStartX;

  doc.setFillColor(...HEADER_BACKGROUND);
  doc.rect(0, 0, pageWidth, HEADER_HEIGHT, "F");

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", logoX, logoY, logoWidth, logoHeight, "", "FAST");
    } catch {
      // If logo rendering fails, keep header without logo.
    }
  }

  doc.setDrawColor(...DIVIDER_COLOR);
  doc.setLineWidth(1);
  doc.line(logoEndX, 5, logoEndX, HEADER_HEIGHT - 5);
  doc.line(metadataStartX, 5, metadataStartX, HEADER_HEIGHT - 5);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  const safeTitle = toSafeText(title, "Planificacion Operativa");
  const titleFontSize = fitTitleFontSize(doc, safeTitle, titleAreaWidth);
  doc.setFontSize(titleFontSize);
  const lines = wrapTitle(doc, safeTitle, titleAreaWidth);
  const totalHeight = lines.length * titleFontSize;
  let titleY = HEADER_HEIGHT / 2 - totalHeight / 2 + titleFontSize * 0.85;

  for (const line of lines) {
    const lineWidth = doc.getTextWidth(line);
    const x = titleAreaStartX + (titleAreaWidth - lineWidth) / 2;
    doc.text(line, x, titleY);
    titleY += titleFontSize;
  }

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Datos de generacion:", metadataX, 18);

  doc.setFontSize(8);
  doc.setTextColor(...DATE_TEXT_COLOR);
  doc.text(`Fecha: ${toSafeText(dateParts?.date, "-")}`, metadataX, 32);
  doc.text(`Hora: ${toSafeText(dateParts?.time, "-")}`, metadataX, 44);

  return HEADER_HEIGHT + 20;
};

const formatDateSafe = (value) => {
  const formatted = formatDate(value);
  return formatted || "-";
};

export const generateOperationalPlanPdfBytes = async ({
  rows = [],
  project = {},
  title = "",
  onProgress = () => {},
} = {}) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  if (safeRows.length === 0) {
    throw new Error("No hay datos para exportar el plan operativo.");
  }

  reportProgress(onProgress, 2, "Inicializando documento...");
  const doc = new jsPDF("landscape", "pt", "a4");

  const now = new Date();
  const dateParts = formatDateParts(now);

  reportProgress(onProgress, 8, "Cargando recursos...");
  const logoDataUrl = await fetchAssetDataUrl(logoLight);

  reportProgress(onProgress, 14, "Construyendo encabezado...");
  const headerTitle = toSafeText(
    title,
    `Planificacion Operativa - ${toSafeText(project?.name, "Proyecto")}`
  );
  const tableStartY = drawDefaultHeader({
    doc,
    title: headerTitle,
    logoDataUrl,
    dateParts,
  });

  reportProgress(onProgress, 20, "Construyendo tabla...");
  const headers = [
    { content: "Objetivo", colSpan: 1, styles: { halign: "center", fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" } },
    { content: "Indicador", colSpan: 2, styles: { halign: "center", fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" } },
    { content: "Equipo", colSpan: 2, styles: { halign: "center", fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" } },
    { content: "Recursos", colSpan: 2, styles: { halign: "center", fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" } },
    { content: "Presupuesto", colSpan: 2, styles: { halign: "center", fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" } },
    { content: "Periodo", colSpan: 2, styles: { halign: "center", fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" } },
  ];

  const subHeaders = [
    { content: "", styles: { halign: "center", valign: "middle" } },
    { content: "Cantidad", styles: { halign: "center", valign: "middle" } },
    { content: "Concepto", styles: { halign: "center", valign: "middle" } },
    { content: "Num", styles: { halign: "center", valign: "middle" } },
    { content: "Miembro", styles: { halign: "center", valign: "middle" } },
    { content: "Num", styles: { halign: "center", valign: "middle" } },
    { content: "Recurso", styles: { halign: "center", valign: "middle" } },
    { content: "Monto", styles: { halign: "center", valign: "middle" } },
    { content: "Descripcion", styles: { halign: "center", valign: "middle" } },
    { content: "Inicio", styles: { halign: "center", valign: "middle" } },
    { content: "Fin", styles: { halign: "center", valign: "middle" } },
  ];
  const columnCount = subHeaders.length;

  const body = [];
  const totalRows = safeRows.length;

  safeRows.forEach((row, index) => {
    const safeRow = row || {};
    const team = Array.isArray(safeRow.team) ? safeRow.team : [];
    const resources = Array.isArray(safeRow.resources) ? safeRow.resources : [];
    const maxTeam = team.length || 1;
    const maxResources = resources.length || 1;
    const maxSubRows = Math.max(maxTeam, maxResources, 1);

    for (let i = 0; i < maxSubRows; i += 1) {
      const groupRow = [
        i === 0 ? toSafeText(safeRow.objective) : "",
        i === 0 ? toSafeText(safeRow.indicator?.quantity) : "",
        i === 0 ? toSafeText(safeRow.indicator?.concept) : "",
        team[i] ? i + 1 : "",
        toSafeText(team[i]),
        resources[i] ? i + 1 : "",
        toSafeText(resources[i]),
        i === 0 ? toSafeText(safeRow.budget?.amount) : "",
        i === 0 ? toSafeText(safeRow.budget?.description) : "",
        i === 0 ? formatDateSafe(safeRow.period?.start) : "",
        i === 0 ? formatDateSafe(safeRow.period?.end) : "",
      ];
      groupRow.__isSeparator = false;
      body.push(groupRow);
    }

    if (index < safeRows.length - 1) {
      const separatorRow = Array(columnCount).fill("");
      separatorRow.__isSeparator = true;
      body.push(separatorRow);
    }

    const ratio = (index + 1) / totalRows;
    reportProgress(onProgress, 22 + ratio * 48, `Procesando fila ${index + 1} de ${totalRows}...`);
  });

  reportProgress(onProgress, 76, "Renderizando tabla...");
  autoTable(doc, {
    startY: tableStartY,
    head: [headers, subHeaders],
    body,
    showHead: "firstPage",
    styles: {
      fontSize: 10,
      cellPadding: 4,
      overflow: "linebreak",
      lineColor: [170, 170, 170],
      lineWidth: 0.7,
      valign: "top",
    },
    bodyStyles: {
      valign: "top",
      halign: "left",
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      lineColor: [255, 255, 255],
      lineWidth: 0.8,
    },
    theme: "grid",
    tableWidth: "auto",
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const raw = data.row?.raw;
      data.cell.styles.fillColor = raw?.__isSeparator ? SEPARATOR_ROW_FILL : GROUP_ROW_FILL;
      data.cell.styles.valign = "top";
      if (!raw?.__isSeparator && JUSTIFY_COLUMN_INDEXES.has(data.column.index)) {
        data.cell.styles.halign = "justify";
      } else {
        data.cell.styles.halign = "left";
      }
    },
  });

  reportProgress(onProgress, 96, "Finalizando PDF...");
  const pdfBytes = doc.output("arraybuffer");
  reportProgress(onProgress, 100, "PDF generado");
  return pdfBytes;
};
