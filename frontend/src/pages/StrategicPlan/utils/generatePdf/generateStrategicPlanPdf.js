import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import logoLight from "../../../../assets/labTecnoSocialLogoLight.png";
import { drawHeader } from "../../../ReportPage/utils/generatePdf/drawHeader.js";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const PAGE_MARGIN_TOP = 50;
const PAGE_MARGIN_BOTTOM = 36;
const SIDE_MARGIN = 50;
const HEADER_SPACING = 30;

const COLORS = {
  title: rgb(0.11, 0.44, 0.3),
  subtitle: rgb(0.2, 0.2, 0.2),
  text: rgb(0.12, 0.12, 0.12),
  divider: rgb(0.84, 0.84, 0.84),
};

const toText = (value, fallback = "Sin datos") => {
  if (value === null || value === undefined) return fallback;
  const normalized = String(value).replace(/\s+/g, " ").trim();
  return normalized || fallback;
};

const wrapText = (text, font, fontSize, maxWidth) => {
  const words = toText(text, "").split(" ");
  if (words.length === 0) return [];

  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const candidateWidth = font.widthOfTextAtSize(candidate, fontSize);

    if (candidateWidth <= maxWidth || current.length === 0) {
      current = candidate;
      continue;
    }

    lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
};

const drawLine = (page, { text, x, y, font, fontSize, color, maxWidth, justify = false }) => {
  const line = toText(text, "");
  if (!line) return;

  if (!justify || !maxWidth) {
    page.drawText(line, { x, y, size: fontSize, font, color });
    return;
  }

  const words = line.split(" ").filter(Boolean);
  if (words.length <= 1) {
    page.drawText(line, { x, y, size: fontSize, font, color });
    return;
  }

  const wordsWidth = words.reduce((sum, word) => sum + font.widthOfTextAtSize(word, fontSize), 0);
  const gaps = words.length - 1;
  const spacing = (maxWidth - wordsWidth) / gaps;
  const defaultSpacing = font.widthOfTextAtSize(" ", fontSize);

  if (!Number.isFinite(spacing) || spacing <= defaultSpacing * 0.5) {
    page.drawText(line, { x, y, size: fontSize, font, color });
    return;
  }

  let cursorX = x;
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    page.drawText(word, {
      x: cursorX,
      y,
      size: fontSize,
      font,
      color,
    });
    cursorX += font.widthOfTextAtSize(word, fontSize);
    if (i < words.length - 1) cursorX += spacing;
  }
};

const ensureSpace = (ctx, requiredHeight = 18) => {
  if (ctx.cursor.y - requiredHeight >= PAGE_MARGIN_BOTTOM) return;

  const newPage = ctx.pdfDoc.addPage();
  ctx.pageRef.current = newPage;
  ctx.cursor.y = newPage.getSize().height - PAGE_MARGIN_TOP;
};

const drawSectionTitle = (ctx, text, { indent = 0, fontSize = 15 } = {}) => {
  ensureSpace(ctx, 28);

  const page = ctx.pageRef.current;
  const { width } = page.getSize();
  const x = SIDE_MARGIN + indent;

  page.drawText(toText(text), {
    x,
    y: ctx.cursor.y,
    size: fontSize,
    font: ctx.fonts.bold,
    color: COLORS.title,
  });

  ctx.cursor.y -= 8;

  page.drawLine({
    start: { x, y: ctx.cursor.y },
    end: { x: width - SIDE_MARGIN, y: ctx.cursor.y },
    thickness: 1,
    color: COLORS.divider,
  });

  ctx.cursor.y -= 14;
};

const drawWrappedText = (
  ctx,
  text,
  {
    indent = 0,
    font = ctx.fonts.regular,
    fontSize = 11,
    lineHeight = 14,
    color = COLORS.text,
    maxWidth = null,
    justify = true,
  } = {}
) => {
  const page = ctx.pageRef.current;
  const { width } = page.getSize();
  const effectiveMaxWidth = maxWidth || width - SIDE_MARGIN * 2 - indent;
  const lines = wrapText(toText(text), font, fontSize, effectiveMaxWidth);

  if (lines.length === 0) return;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    ensureSpace(ctx, lineHeight + 2);
    const shouldJustify = justify && lines.length > 1 && lineIndex < lines.length - 1;
    drawLine(ctx.pageRef.current, {
      text: line,
      x: SIDE_MARGIN + indent,
      y: ctx.cursor.y,
      fontSize,
      font,
      color,
      maxWidth: effectiveMaxWidth,
      justify: shouldJustify,
    });
    ctx.cursor.y -= lineHeight;
  }
};

const drawItemLine = (ctx, text, { indent = 0 } = {}) => {
  drawWrappedText(ctx, text, {
    indent,
    font: ctx.fonts.regular,
    fontSize: 10.5,
    lineHeight: 13.5,
    color: COLORS.text,
  });
};

const drawPrefixedWrappedText = (
  ctx,
  {
    indent = 0,
    prefix = "",
    text = "",
    prefixFont = ctx.fonts.bold,
    textFont = ctx.fonts.regular,
    fontSize = 10.5,
    lineHeight = 13.5,
    color = COLORS.text,
  } = {}
) => {
  const page = ctx.pageRef.current;
  const { width } = page.getSize();
  const baseX = SIDE_MARGIN + indent;
  const maxWidth = width - SIDE_MARGIN * 2 - indent;
  const normalizedText = toText(text, "");
  const words = normalizedText ? normalizedText.split(" ") : [];
  const prefixWidth = prefix ? prefixFont.widthOfTextAtSize(prefix, fontSize) : 0;
  const firstLineMaxWidth = Math.max(12, maxWidth - prefixWidth);

  let firstLine = "";
  let consumedWords = 0;
  for (const word of words) {
    const candidate = firstLine ? `${firstLine} ${word}` : word;
    const candidateWidth = textFont.widthOfTextAtSize(candidate, fontSize);
    if (candidateWidth <= firstLineMaxWidth || firstLine.length === 0) {
      firstLine = candidate;
      consumedWords += 1;
      continue;
    }
    break;
  }

  ensureSpace(ctx, lineHeight + 2);
  const firstPage = ctx.pageRef.current;
  const remainingText = words.slice(consumedWords).join(" ");

  if (prefix) {
    firstPage.drawText(prefix, {
      x: baseX,
      y: ctx.cursor.y,
      size: fontSize,
      font: prefixFont,
      color,
    });
  }

  if (firstLine) {
    drawLine(firstPage, {
      text: firstLine,
      x: baseX + prefixWidth,
      y: ctx.cursor.y,
      fontSize,
      font: textFont,
      color,
      maxWidth: firstLineMaxWidth,
      justify: Boolean(remainingText),
    });
  }

  ctx.cursor.y -= lineHeight;

  if (!remainingText) return;

  const remainingLines = wrapText(remainingText, textFont, fontSize, maxWidth);
  for (let lineIndex = 0; lineIndex < remainingLines.length; lineIndex += 1) {
    const line = remainingLines[lineIndex];
    ensureSpace(ctx, lineHeight + 2);
    drawLine(ctx.pageRef.current, {
      text: line,
      x: baseX,
      y: ctx.cursor.y,
      fontSize,
      font: textFont,
      color,
      maxWidth,
      justify: lineIndex < remainingLines.length - 1,
    });
    ctx.cursor.y -= lineHeight;
  }
};

const countUnits = (data) => {
  const objectives = Array.isArray(data?.objectives) ? data.objectives : [];

  const indicatorsCount = objectives.reduce(
    (acc, objective) => acc + (Array.isArray(objective?.indicators) ? objective.indicators.length : 0),
    0
  );

  const programsCount = objectives.reduce(
    (acc, objective) => acc + (Array.isArray(objective?.programs) ? objective.programs.length : 0),
    0
  );

  const projectsCount = objectives.reduce((acc, objective) => {
    const objectivePrograms = Array.isArray(objective?.programs) ? objective.programs : [];
    return (
      acc +
      objectivePrograms.reduce(
        (sum, program) =>
          sum + (Array.isArray(program?.operationalProjects) ? program.operationalProjects.length : 0),
        0
      )
    );
  }, 0);

  const total =
    (data?.mission ? 1 : 0) +
    objectives.length +
    indicatorsCount +
    programsCount +
    projectsCount;

  return Math.max(1, total);
};

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  const normalized = String(imageUrl).trim();
  if (!normalized) return null;

  if (/^https?:\/\//i.test(normalized)) return normalized;

  if (!BASE_URL) return normalized;

  if (normalized.startsWith("/")) return `${BASE_URL}${normalized}`;
  return `${BASE_URL.replace(/\/$/, "")}/${normalized.replace(/^\//, "")}`;
};

const fetchAndEmbedProjectImage = async (pdfDoc, imageUrl) => {
  const resolvedUrl = resolveImageUrl(imageUrl);
  if (!resolvedUrl) return null;

  try {
    const response = await fetch(resolvedUrl);
    if (!response.ok) return null;

    const bytes = await response.arrayBuffer();
    const contentType = (response.headers.get("content-type") || "").toLowerCase();

    if (contentType.includes("png")) return await pdfDoc.embedPng(bytes);
    if (contentType.includes("jpg") || contentType.includes("jpeg")) return await pdfDoc.embedJpg(bytes);

    try {
      return await pdfDoc.embedPng(bytes);
    } catch {
      return await pdfDoc.embedJpg(bytes);
    }
  } catch {
    return null;
  }
};

const drawProjectAvatar = (page, name, x, y, size, font) => {
  const initial = toText(name, "?").charAt(0).toUpperCase();

  page.drawRectangle({
    x,
    y,
    width: size,
    height: size,
    color: rgb(0.47, 0.47, 0.47),
  });

  const fontSize = Math.max(9, Math.floor(size / 2));
  const textWidth = font.widthOfTextAtSize(initial, fontSize);

  page.drawText(initial, {
    x: x + (size - textWidth) / 2,
    y: y + size / 2 - fontSize / 3,
    size: fontSize,
    font,
    color: rgb(1, 1, 1),
  });
};

const drawProjectRow = async (ctx, project, index) => {
  const rowHeight = 36;
  const imageSize = 24;
  const rowIndent = 40;
  const numberText = `${index + 1}.`;
  const numberFontSize = 10.5;
  const numberGap = 8;
  const numberWidth = ctx.fonts.bold.widthOfTextAtSize(numberText, numberFontSize);

  ensureSpace(ctx, rowHeight + 4);

  const page = ctx.pageRef.current;
  const rowTop = ctx.cursor.y;
  const rowBottom = rowTop - rowHeight;
  const rowCenterY = rowBottom + rowHeight / 2;
  const numberX = SIDE_MARGIN + rowIndent;
  const numberY = rowCenterY - numberFontSize / 3;
  const imageX = numberX + numberWidth + numberGap;
  const imageY = rowBottom + (rowHeight - imageSize) / 2;
  const textX = imageX + imageSize + 8;

  page.drawText(numberText, {
    x: numberX,
    y: numberY,
    size: numberFontSize,
    font: ctx.fonts.bold,
    color: COLORS.text,
  });

  const embeddedImage = await fetchAndEmbedProjectImage(pdfDocOrThrow(ctx), project?.image_url || project?.imageUrl);

  if (embeddedImage) {
    page.drawImage(embeddedImage, {
      x: imageX,
      y: imageY,
      width: imageSize,
      height: imageSize,
    });
  } else {
    drawProjectAvatar(page, project?.name, imageX, imageY, imageSize, ctx.fonts.bold);
  }

  const textWidth = page.getSize().width - textX - SIDE_MARGIN;
  const projectLabel = toText(project?.name, "Proyecto sin nombre");
  const textFontSize = 10.5;
  const textLineHeight = 12;
  const nameLines = wrapText(projectLabel, ctx.fonts.regular, textFontSize, textWidth).slice(0, 2);
  const centeredStartY = rowCenterY + ((nameLines.length - 1) * textLineHeight) / 2 - textFontSize / 3;

  let textY = centeredStartY;
  for (let lineIndex = 0; lineIndex < nameLines.length; lineIndex += 1) {
    const line = nameLines[lineIndex];
    drawLine(page, {
      text: line,
      x: textX,
      y: textY,
      fontSize: textFontSize,
      font: ctx.fonts.regular,
      color: COLORS.text,
      maxWidth: textWidth,
      justify: lineIndex < nameLines.length - 1,
    });
    textY -= textLineHeight;
  }

  ctx.cursor.y = rowBottom - 6;
};

const pdfDocOrThrow = (ctx) => {
  if (!ctx.pdfDoc) throw new Error("PDF context not initialized");
  return ctx.pdfDoc;
};

const fetchLogoBytes = async () => {
  const response = await fetch(logoLight);
  return await response.arrayBuffer();
};

export const generateStrategicPlanPdfBytes = async ({
  data,
  year,
  title,
  onProgress = () => {},
}) => {
  const reportProgress = (percentage, stage) => {
    if (typeof onProgress !== "function") return;
    const safePercentage = Math.max(0, Math.min(100, Math.round(Number(percentage) || 0)));
    onProgress({ percentage: safePercentage, stage });
  };

  const planData = data || {};
  const objectives = Array.isArray(planData.objectives) ? planData.objectives : [];
  const totalUnits = countUnits(planData);
  let completedUnits = 0;

  const advanceProgress = (stage) => {
    completedUnits += 1;
    const ratio = Math.min(1, completedUnits / totalUnits);
    reportProgress(18 + ratio * 74, stage);
  };

  reportProgress(2, "Inicializando documento...");
  const pdfDoc = await PDFDocument.create();
  const firstPage = pdfDoc.addPage();
  const pageRef = { current: firstPage };
  const cursor = { y: firstPage.getSize().height - PAGE_MARGIN_TOP };

  reportProgress(8, "Cargando recursos...");
  const logoBytes = await fetchLogoBytes();

  const fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  };

  const ctx = { pdfDoc, pageRef, cursor, fonts };

  reportProgress(14, "Construyendo encabezado...");
  const headerTitle = toText(title || `Plan Estratégico del año ${year ? `(${year})` : ""}`, "Plan Estratégico");
  cursor.y = await drawHeader(pdfDoc, pageRef.current, headerTitle, logoBytes);
  cursor.y -= HEADER_SPACING;

  if (planData.mission) {
    drawSectionTitle(ctx, "Mision");
    drawWrappedText(ctx, planData.mission, {
      indent: 12,
      fontSize: 11.5,
      lineHeight: 15,
      color: COLORS.text,
    });
    cursor.y -= 10;
    advanceProgress("Procesando mision...");
  }

  if (objectives.length > 0) {
    drawSectionTitle(ctx, "Objetivos");

    for (let i = 0; i < objectives.length; i += 1) {
      const objective = objectives[i] || {};
      drawSectionTitle(ctx, `Objetivo ${i + 1}`, { indent: 8, fontSize: 12.5 });
      drawWrappedText(ctx, objective.objectiveTitle || "Sin titulo", {
        indent: 18,
        fontSize: 11,
        lineHeight: 14,
      });
      cursor.y -= 8;
      advanceProgress(`Procesando objetivo ${i + 1} de ${objectives.length}...`);

      const indicators = Array.isArray(objective.indicators) ? objective.indicators : [];
      if (indicators.length > 0) {
        drawSectionTitle(ctx, "Indicadores", { indent: 18, fontSize: 11.5 });
        for (let j = 0; j < indicators.length; j += 1) {
          const indicator = indicators[j] || {};
          drawPrefixedWrappedText(ctx, {
            indent: 28,
            prefix: `${j + 1}. Cantidad: `,
            text: toText(indicator.amount, "N/A"),
          });
          drawPrefixedWrappedText(ctx, {
            indent: 40,
            prefix: "Concepto: ",
            text: toText(indicator.concept),
          });
          cursor.y -= 4;
          advanceProgress(`Procesando indicador ${j + 1} de ${indicators.length}...`);
        }
      }

      const programs = Array.isArray(objective.programs) ? objective.programs : [];
      if (programs.length > 0) {
        drawSectionTitle(ctx, "Programas", { indent: 18, fontSize: 11.5 });
        for (let k = 0; k < programs.length; k += 1) {
          const program = programs[k] || {};
          drawPrefixedWrappedText(ctx, {
            indent: 28,
            prefix: `${k + 1}. `,
            text: toText(program.programDescription, "Programa sin descripcion"),
          });
          advanceProgress(`Procesando programa ${k + 1} de ${programs.length}...`);

          const projects = Array.isArray(program.operationalProjects) ? program.operationalProjects : [];
          if (projects.length > 0) {
            drawWrappedText(ctx, "Proyectos:", {
              indent: 40,
              font: fonts.bold,
              fontSize: 10.5,
              lineHeight: 13,
              color: COLORS.subtitle,
            });

            for (let p = 0; p < projects.length; p += 1) {
              await drawProjectRow(ctx, projects[p], p);
              advanceProgress(`Procesando proyecto ${p + 1} de ${projects.length}...`);
            }
          }

          cursor.y -= 6;
        }
      }

      cursor.y -= 4;
    }
  }

  reportProgress(96, "Finalizando PDF...");
  const pdfBytes = await pdfDoc.save();
  reportProgress(100, "PDF generado");
  return pdfBytes;
};
