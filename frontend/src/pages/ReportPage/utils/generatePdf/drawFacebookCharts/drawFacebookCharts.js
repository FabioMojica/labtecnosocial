import { rgb, StandardFonts } from "pdf-lib";

const PAGE_BOTTOM_MARGIN = 34;
const PAGE_TOP_MARGIN = 66;

const COLORS = {
  bg: rgb(0.97, 0.985, 1),
  border: rgb(0.84, 0.89, 0.95),
  title: rgb(0.12, 0.16, 0.22),
  text: rgb(0.2, 0.24, 0.3),
  muted: rgb(0.45, 0.5, 0.57),
  primary: rgb(0.14, 0.46, 0.88),
  success: rgb(0.12, 0.6, 0.32),
  danger: rgb(0.8, 0.2, 0.18),
  barTrack: rgb(0.9, 0.93, 0.97),
};

const REACTION_KEYS = ["LIKE", "LOVE", "WOW", "HAHA", "SAD", "ANGRY"];
const REACTION_LABELS = ["Like", "Love", "Wow", "Haha", "Sad", "Angry"];
const REACTION_COLORS = [
  rgb(0.09, 0.47, 0.95),
  rgb(0.95, 0.25, 0.35),
  rgb(0.96, 0.69, 0.12),
  rgb(0.96, 0.69, 0.12),
  rgb(0.96, 0.69, 0.12),
  rgb(0.91, 0.44, 0.06),
];
const REACTION_ICON_SOURCES = [
  "/reactions/facebook/like.png",
  "/reactions/facebook/love.png",
  "/reactions/facebook/wow.png",
  "/reactions/facebook/haha.png",
  "/reactions/facebook/sad.png",
  "/reactions/facebook/angry.png",
];

const COUNTRY_NAME_FALLBACK_ES = {
  AR: "Argentina",
  BO: "Bolivia",
  BR: "Brasil",
  CA: "Canada",
  CL: "Chile",
  CO: "Colombia",
  EC: "Ecuador",
  ES: "Espana",
  FR: "Francia",
  IT: "Italia",
  MX: "Mexico",
  PE: "Peru",
  PY: "Paraguay",
  US: "Estados Unidos",
  UY: "Uruguay",
  VE: "Venezuela",
};

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

function getReactionValueByType(byType = {}, type) {
  const candidatesByType = {
    LIKE: ["LIKE"],
    LOVE: ["LOVE"],
    WOW: ["WOW"],
    HAHA: ["HAHA"],
    SAD: ["SAD", "SORRY"],
    ANGRY: ["ANGRY", "ANGER"],
  };

  const aliases = candidatesByType[type] ?? [type];
  for (const alias of aliases) {
    const value = byType?.[alias];
    if (value !== undefined && value !== null) return toNumber(value);
  }

  return 0;
}

function compactNumber(value) {
  try {
    return Intl.NumberFormat("es-BO", {
      notation: "compact",
      maximumFractionDigits: 1,
      roundingMode: "trunc",
    })
      .format(toNumber(value))
      .replace(/\s+/g, "");
  } catch {
    return String(Math.round(toNumber(value)));
  }
}

function sanitizeWinAnsiText(value) {
  const normalized = String(value ?? "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...");

  let safe = "";
  for (const char of normalized) {
    const code = char.codePointAt(0) ?? 0;
    const isAsciiPrintable = code >= 0x20 && code <= 0x7e;
    const isLatin1Supplement = code >= 0xa0 && code <= 0xff;
    const isWhitespace = code === 0x09 || code === 0x0a || code === 0x0d;

    if (isAsciiPrintable || isLatin1Supplement) {
      safe += char;
    } else if (isWhitespace) {
      safe += " ";
    }
  }

  return safe;
}

function safeWidthOfText(font, text, size) {
  const safeText = sanitizeWinAnsiText(text);
  if (!safeText) return 0;

  try {
    return font.widthOfTextAtSize(safeText, size);
  } catch {
    const fallback = safeText.replace(/[^\x20-\x7E]/g, "?");
    try {
      return font.widthOfTextAtSize(fallback, size);
    } catch {
      return fallback.length * size * 0.52;
    }
  }
}

function pickFirstString(candidates = []) {
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function getPostImageUrl(post) {
  return pickFirstString([
    post?.full_picture,
    post?.meta?.thumbnail_url,
    post?.media_url,
    post?.picture,
    post?.attachments?.data?.[0]?.media?.image?.src,
  ]);
}

function fitImageInsideBox(imageWidth, imageHeight, boxWidth, boxHeight) {
  if (!imageWidth || !imageHeight || !boxWidth || !boxHeight) {
    return {
      width: boxWidth,
      height: boxHeight,
      offsetX: 0,
      offsetY: 0,
    };
  }

  const ratio = Math.min(boxWidth / imageWidth, boxHeight / imageHeight);
  const width = imageWidth * ratio;
  const height = imageHeight * ratio;
  const offsetX = (boxWidth - width) / 2;
  const offsetY = (boxHeight - height) / 2;

  return { width, height, offsetX, offsetY };
}

function getCountryLabel(countryValue) {
  const raw = String(countryValue ?? "").trim();
  if (!raw) return "Sin datos";

  if (!/^[A-Za-z]{2}$/.test(raw)) {
    return raw;
  }

  const code = raw.toUpperCase();
  let countryName = "";

  try {
    const regionDisplay = new Intl.DisplayNames(["es"], { type: "region" });
    countryName = regionDisplay.of(code) ?? "";
  } catch {
    countryName = "";
  }

  if (!countryName || countryName === code) {
    countryName = COUNTRY_NAME_FALLBACK_ES[code] ?? "";
  }

  return countryName ? `${code} (${countryName})` : code;
}

async function fetchAndEmbedPostImage(pdfDoc, src) {
  if (!src) return null;

  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    const bytes = await response.arrayBuffer();
    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    const lowerSrc = src.toLowerCase();

    if (contentType.includes("png") || lowerSrc.includes(".png")) {
      return await pdfDoc.embedPng(bytes);
    }
    if (contentType.includes("jpeg") || contentType.includes("jpg") || lowerSrc.includes(".jpg") || lowerSrc.includes(".jpeg")) {
      return await pdfDoc.embedJpg(bytes);
    }

    try {
      return await pdfDoc.embedPng(bytes);
    } catch {
      return await pdfDoc.embedJpg(bytes);
    }
  } catch {
    return null;
  }
}

function truncateText(text, font, size, maxWidth) {
  const safeText = sanitizeWinAnsiText(text);
  if (!safeText) return "";
  if (safeWidthOfText(font, safeText, size) <= maxWidth) return safeText;

  const ellipsis = "...";
  let low = 0;
  let high = safeText.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const candidate = `${safeText.slice(0, mid)}${ellipsis}`;
    if (safeWidthOfText(font, candidate, size) <= maxWidth) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return `${safeText.slice(0, Math.max(0, low))}${ellipsis}`;
}

function ensureSpace(pdfDoc, page, y, requiredHeight) {
  if (y - requiredHeight >= PAGE_BOTTOM_MARGIN) {
    return { page, y };
  }
  const newPage = pdfDoc.addPage();
  return { page: newPage, y: newPage.getHeight() - PAGE_TOP_MARGIN };
}

function drawCardFrame(page, x, topY, width, height) {
  const cardY = topY - height;
  page.drawRectangle({
    x,
    y: cardY,
    width,
    height,
    color: COLORS.bg,
    borderColor: COLORS.border,
    borderWidth: 1,
  });
  return cardY;
}

function drawChartSource({ page, font, x, width, y, integrationData, align = "center" }) {
  const platform = integrationData?.integration?.platform ?? "facebook";
  const integrationName = integrationData?.integration?.name ?? "Integracion";
  const projectName = integrationData?.project?.name ?? "Proyecto";
  const source = `Fuente: ${platform} - ${integrationName} / proyecto: ${projectName}`;
  const text = truncateText(source, font, 8.5, width - 24);
  const textWidth = safeWidthOfText(font, text, 8.5);
  const textX = align === "center" ? x + (width - textWidth) / 2 : x + 12;
  page.drawText(text, {
    x: textX,
    y,
    size: 8.5,
    font,
    color: COLORS.muted,
  });
}

function drawLineChart({ page, font, x, y, width, height, values, dates }) {
  if (!Array.isArray(values) || values.length === 0) return;

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const hasRange = maxValue !== minValue;
  const topValue = hasRange ? maxValue : maxValue + 1;
  const bottomValue = hasRange ? minValue : minValue - 1;

  const scaleX = values.length > 1 ? width / (values.length - 1) : 0;
  const scaleY = (v) => y + ((v - bottomValue) / (topValue - bottomValue)) * height;

  const guideSteps = 4;
  for (let i = 0; i <= guideSteps; i++) {
    const gy = y + (height / guideSteps) * i;
    page.drawLine({
      start: { x, y: gy },
      end: { x: x + width, y: gy },
      thickness: 0.5,
      color: rgb(0.88, 0.91, 0.95),
    });
  }

  for (let i = 0; i < values.length - 1; i++) {
    const x1 = x + i * scaleX;
    const y1 = scaleY(values[i]);
    const x2 = x + (i + 1) * scaleX;
    const y2 = scaleY(values[i + 1]);

    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 1.6,
      color: COLORS.primary,
    });
  }

  if (values.length === 1) {
    page.drawCircle({
      x,
      y: scaleY(values[0]),
      size: 2,
      color: COLORS.primary,
    });
  } else {
    const lastIndex = values.length - 1;
    page.drawCircle({
      x: x + lastIndex * scaleX,
      y: scaleY(values[lastIndex]),
      size: 2.2,
      color: COLORS.primary,
    });
  }

  const labels = Array.isArray(dates) ? dates : [];
  if (labels.length > 0) {
    const sampleIndexes = [0, Math.floor((labels.length - 1) / 2), labels.length - 1]
      .filter((idx, pos, arr) => idx >= 0 && arr.indexOf(idx) === pos);

    sampleIndexes.forEach((idx) => {
      const label = truncateText(labels[idx], font, 7.5, 52);
      const labelW = safeWidthOfText(font, label, 7.5);
      const minX = x;
      const maxX = x + width - labelW;
      let lx;

      if (labels.length === 1) {
        lx = x + (width - labelW) / 2;
      } else if (idx === 0) {
        lx = minX;
      } else if (idx === labels.length - 1) {
        lx = maxX;
      } else {
        const anchorX = x + idx * scaleX;
        lx = anchorX - labelW / 2;
      }

      const safeX = Math.max(minX, Math.min(maxX, lx));

      page.drawText(label, {
        x: safeX,
        y: y - 12,
        size: 7.5,
        font,
        color: COLORS.muted,
      });
    });
  }
}

function normalizeSeries(data, useCumulative = true) {
  const rawValues = Array.isArray(data?.chartData) ? data.chartData.map(toNumber) : [];
  const dates = Array.isArray(data?.dates) ? data.dates : [];
  if (!useCumulative) return { values: rawValues, dates };

  let acc = 0;
  const cumulative = rawValues.map((value) => {
    acc += value;
    return acc;
  });
  return { values: cumulative, dates };
}

async function drawTimeSeriesCard({
  pdfDoc,
  page,
  element,
  x,
  y,
  maxWidth,
  metricLabel = "valor",
  useCumulative = true,
}) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const width = maxWidth;
  const height = 228;
  const space = ensureSpace(pdfDoc, page, y, height + 24);
  page = space.page;
  y = space.y;

  const cardY = drawCardFrame(page, x, y, width, height);
  const title = element?.title || "Grafico";
  const interval = element?.interval || "Periodo";
  const total = toNumber(element?.data?.total);
  const delta = toNumber(element?.data?.delta);
  const deltaText = `${delta > 0 ? "+" : ""}${compactNumber(delta)} vs dia anterior`;
  const { values, dates } = normalizeSeries(element?.data, useCumulative);

  page.drawText(truncateText(title, boldFont, 13, width - 32), {
    x: x + 14,
    y: y - 20,
    size: 13,
    font: boldFont,
    color: COLORS.title,
  });
  page.drawText(interval, {
    x: x + 14,
    y: y - 36,
    size: 9,
    font,
    color: COLORS.muted,
  });

  const totalText = compactNumber(total);
  const totalW = safeWidthOfText(boldFont, totalText, 24);
  page.drawText(totalText, {
    x: x + width - totalW - 14,
    y: y - 30,
    size: 24,
    font: boldFont,
    color: COLORS.title,
  });

  page.drawText(deltaText, {
    x: x + width - 165,
    y: y - 48,
    size: 8.7,
    font,
    color: delta >= 0 ? COLORS.success : COLORS.danger,
  });

  const plotX = x + 14;
  const plotY = cardY + 48;
  const plotW = width - 28;
  const plotH = 110;

  page.drawRectangle({
    x: plotX,
    y: plotY,
    width: plotW,
    height: plotH,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.88, 0.91, 0.95),
    borderWidth: 0.8,
  });

  if (!values.length || values.every((v) => v === 0)) {
    const empty = `Sin ${metricLabel} en el periodo seleccionado`;
    const emptyW = safeWidthOfText(font, empty, 10.5);
    page.drawText(empty, {
      x: plotX + (plotW - emptyW) / 2,
      y: plotY + plotH / 2 - 5,
      size: 10.5,
      font,
      color: COLORS.muted,
    });
  } else {
    drawLineChart({
      page,
      font,
      x: plotX + 8,
      y: plotY + 18,
      width: plotW - 16,
      height: plotH - 28,
      values,
      dates,
    });
  }

  drawChartSource({
    page,
    font,
    x,
    width,
    y: cardY + 10,
    integrationData: element?.integration_data,
    align: "center",
  });

  return { y: cardY - 20, page };
}

async function drawOrganicPaidCard({ pdfDoc, page, element, x, y, maxWidth }) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const width = maxWidth;
  const height = 222;
  const space = ensureSpace(pdfDoc, page, y, height + 24);
  page = space.page;
  y = space.y;

  const cardY = drawCardFrame(page, x, y, width, height);
  const title = element?.title || "Distribucion de impresiones";
  const interval = element?.interval || "Periodo";
  const rows = Array.isArray(element?.data?.chartData) ? element.data.chartData : [];
  const total = toNumber(element?.data?.total) || rows.reduce((acc, row) => acc + toNumber(row?.value), 0);

  page.drawText(truncateText(title, boldFont, 13, width - 30), {
    x: x + 14,
    y: y - 20,
    size: 13,
    font: boldFont,
    color: COLORS.title,
  });
  page.drawText(interval, {
    x: x + 14,
    y: y - 36,
    size: 9,
    font,
    color: COLORS.muted,
  });

  page.drawText(`Total: ${compactNumber(total)}`, {
    x: x + 14,
    y: y - 56,
    size: 12,
    font: boldFont,
    color: COLORS.text,
  });

  const safeRows = rows.length > 0 ? rows : [{ name: "Sin datos", value: 0 }];
  let rowY = y - 84;
  safeRows.slice(0, 5).forEach((row, index) => {
    const value = toNumber(row?.value);
    const pct = total > 0 ? (value / total) * 100 : 0;
    const color = index === 0 ? rgb(0.36, 0.48, 0.72) : rgb(0.56, 0.64, 0.79);

    const name = String(row?.name ?? `Segmento ${index + 1}`);
    page.drawText(truncateText(name, font, 10, width - 190), {
      x: x + 14,
      y: rowY,
      size: 10,
      font,
      color: COLORS.text,
    });
    const valueText = `${compactNumber(value)} (${Math.round(pct)}%)`;
    const valueTextWidth = safeWidthOfText(boldFont, valueText, 9.5);
    const valueTextX = Math.max(x + 14, x + width - 14 - valueTextWidth);
    page.drawText(valueText, {
      x: valueTextX,
      y: rowY,
      size: 9.5,
      font: boldFont,
      color: COLORS.text,
    });

    const barX = x + 14;
    const barY = rowY - 10;
    const barW = width - 28;
    page.drawRectangle({
      x: barX,
      y: barY,
      width: barW,
      height: 5.5,
      color: COLORS.barTrack,
    });
    page.drawRectangle({
      x: barX,
      y: barY,
      width: barW * Math.max(0, Math.min(1, pct / 100)),
      height: 5.5,
      color,
    });

    rowY -= 28;
  });

  drawChartSource({
    page,
    font,
    x,
    width,
    y: cardY + 10,
    integrationData: element?.integration_data,
    align: "center",
  });

  return { y: cardY - 20, page };
}

async function drawFollowersByCountryCard({ pdfDoc, page, element, x, y, maxWidth }) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const latest = Array.isArray(element?.data) && element.data.length > 0 ? element.data[element.data.length - 1] : {};
  const rows = Object.entries(latest)
    .map(([country, value]) => ({ country, value: toNumber(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const total = rows.reduce((acc, row) => acc + row.value, 0);

  const rowCount = Math.max(rows.length, 1);
  const rowStep = 24;
  const height = 138 + rowCount * rowStep;
  const space = ensureSpace(pdfDoc, page, y, height + 24);
  page = space.page;
  y = space.y;

  const width = maxWidth;
  const cardY = drawCardFrame(page, x, y, width, height);
  const title = element?.title || "Seguidores por pais";
  const interval = element?.interval || "Periodo";

  page.drawText(truncateText(title, boldFont, 13, width - 30), {
    x: x + 14,
    y: y - 20,
    size: 13,
    font: boldFont,
    color: COLORS.title,
  });
  page.drawText(interval, {
    x: x + 14,
    y: y - 36,
    size: 9,
    font,
    color: COLORS.muted,
  });
  page.drawText(`Total seguidores: ${compactNumber(total)}`, {
    x: x + 14,
    y: y - 54,
    size: 11,
    font: boldFont,
    color: COLORS.text,
  });

  let rowY = y - 84;
  const safeRows = rows.length ? rows : [{ country: "Sin datos", value: 0 }];
  safeRows.forEach((row, index) => {
    const pct = total > 0 ? (row.value / total) * 100 : 0;
    const barX = x + 120;
    const barW = width - 146;
    const barH = 5;
    const barY = rowY - 6;
    const fillRatio = Math.max(0, Math.min(1, pct / 100));
    const fillW = fillRatio > 0 ? Math.max(2, barW * fillRatio) : 0;
    const valueLabel = `${compactNumber(row.value)} (${pct < 1 && pct > 0 ? "<1" : Math.round(pct)}%)`;
    const valueLabelW = safeWidthOfText(font, valueLabel, 8.8);
    const valueLabelX = Math.max(barX, barX + barW - valueLabelW);
    const valueLabelY = barY + barH + 2;

    const countryLabel = truncateText(getCountryLabel(row.country), boldFont, 10, barX - (x + 14) - 6);
    page.drawText(countryLabel, {
      x: x + 14,
      y: rowY + 1,
      size: 10,
      font: boldFont,
      color: COLORS.text,
    });

    page.drawText(valueLabel, {
      x: valueLabelX,
      y: valueLabelY,
      size: 8.8,
      font: boldFont,
      color: COLORS.text,
    });

    page.drawRectangle({ x: barX, y: barY, width: barW, height: barH, color: COLORS.barTrack });
    page.drawRectangle({
      x: barX,
      y: barY,
      width: fillW,
      height: barH,
      color: rgb(0.45 - index * 0.02, 0.53 - index * 0.02, 0.68 - index * 0.01),
    });
    rowY -= rowStep;
  });

  drawChartSource({
    page,
    font,
    x,
    width,
    y: cardY + 10,
    integrationData: element?.integration_data,
    align: "center",
  });

  return { y: cardY - 20, page };
}

async function drawTotalReactionsCard({ pdfDoc, page, element, x, y, maxWidth }) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const values = Array.isArray(element?.data) ? element.data.map(toNumber) : [];
  const safeValues = values.length ? values : REACTION_LABELS.map(() => 0);
  const total = safeValues.reduce((acc, value) => acc + value, 0);
  const maxValue = Math.max(...safeValues, 1);
  const reactionBadgeText = ["L", "V", "W", "H", "S", "A"];
  const reactionBadgeTextColors = [
    rgb(1, 1, 1),
    rgb(1, 1, 1),
    rgb(0.1, 0.1, 0.1),
    rgb(0.1, 0.1, 0.1),
    rgb(0.1, 0.1, 0.1),
    rgb(1, 1, 1),
  ];

  const height = 258;
  const space = ensureSpace(pdfDoc, page, y, height + 24);
  page = space.page;
  y = space.y;
  const reactionIcons = await Promise.all(
    REACTION_ICON_SOURCES.map((src) => fetchAndEmbedPostImage(pdfDoc, src))
  );

  const width = maxWidth;
  const cardY = drawCardFrame(page, x, y, width, height);
  const title = element?.title || "Reacciones totales";
  const interval = element?.interval || "Periodo";

  page.drawText(truncateText(title, boldFont, 13, width - 30), {
    x: x + 14,
    y: y - 20,
    size: 13,
    font: boldFont,
    color: COLORS.title,
  });
  page.drawText(interval, {
    x: x + 14,
    y: y - 36,
    size: 9,
    font,
    color: COLORS.muted,
  });
  page.drawText(`Total: ${compactNumber(total)}`, {
    x: x + 14,
    y: y - 56,
    size: 12,
    font: boldFont,
    color: COLORS.text,
  });

  const rowStep = 24;
  const barH = 5;
  let rowY = y - 84;
  REACTION_LABELS.forEach((label, index) => {
    const value = safeValues[index] ?? 0;
    const ratio = Math.max(0, Math.min(1, value / maxValue));
    const barX = x + 128;
    const barW = width - 146;
    const barY = rowY - 6;
    const fillW = ratio > 0 ? Math.max(2, barW * ratio) : 0;
    const valueText = compactNumber(value);
    const valueTextW = safeWidthOfText(boldFont, valueText, 8.8);
    const valueTextX = Math.max(barX, barX + barW - valueTextW);
    const valueTextY = barY + barH + 2;
    const badgeX = x + 20;
    const badgeY = rowY + 2;
    const iconSize = 11;
    const embeddedIcon = reactionIcons[index];

    if (embeddedIcon) {
      const fit = fitImageInsideBox(embeddedIcon.width, embeddedIcon.height, iconSize, iconSize);
      page.drawImage(embeddedIcon, {
        x: badgeX - iconSize / 2 + fit.offsetX,
        y: badgeY - iconSize / 2 + fit.offsetY,
        width: fit.width,
        height: fit.height,
      });
    } else {
      const badgeGlyph = reactionBadgeText[index] ?? "?";
      const badgeGlyphW = safeWidthOfText(boldFont, badgeGlyph, 5.8);
      page.drawCircle({
        x: badgeX,
        y: badgeY,
        size: 5.2,
        color: REACTION_COLORS[index] ?? COLORS.primary,
      });
      page.drawText(badgeGlyph, {
        x: badgeX - badgeGlyphW / 2,
        y: badgeY - 2.6,
        size: 5.8,
        font: boldFont,
        color: reactionBadgeTextColors[index] ?? rgb(1, 1, 1),
      });
    }

    const labelText = truncateText(label, font, 9.5, barX - (x + 30) - 6);
    page.drawText(labelText, {
      x: x + 30,
      y: rowY,
      size: 9.5,
      font,
      color: COLORS.text,
    });
    page.drawText(valueText, {
      x: valueTextX,
      y: valueTextY,
      size: 8.8,
      font: boldFont,
      color: COLORS.text,
    });

    page.drawRectangle({ x: barX, y: barY, width: barW, height: barH, color: COLORS.barTrack });
    page.drawRectangle({
      x: barX,
      y: barY,
      width: fillW,
      height: barH,
      color: REACTION_COLORS[index] ?? COLORS.primary,
    });
    rowY -= rowStep;
  });

  drawChartSource({
    page,
    font,
    x,
    width,
    y: cardY + 10,
    integrationData: element?.integration_data,
    align: "center",
  });

  return { y: cardY - 20, page };
}

async function drawTopPostsCard({ pdfDoc, page, element, x, y, maxWidth }) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const posts = Array.isArray(element?.data) ? element.data : [];
  const topPosts = posts.slice(0, 5);
  const reactionIcons = await Promise.all(
    REACTION_ICON_SOURCES.map((src) => fetchAndEmbedPostImage(pdfDoc, src))
  );
  const rowCount = Math.max(topPosts.length, 1);
  const rowHeight = 96;
  const rowGap = 8;
  const rowsHeight = topPosts.length > 0 ? rowCount * rowHeight + (rowCount - 1) * rowGap : rowHeight;
  const height = 124 + rowsHeight;

  const space = ensureSpace(pdfDoc, page, y, height + 24);
  page = space.page;
  y = space.y;

  const width = maxWidth;
  const cardY = drawCardFrame(page, x, y, width, height);
  const title = element?.title || "Top publicaciones";
  const interval = element?.interval || "Periodo";

  page.drawText(truncateText(title, boldFont, 13, width - 30), {
    x: x + 14,
    y: y - 20,
    size: 13,
    font: boldFont,
    color: COLORS.title,
  });
  page.drawText(interval, {
    x: x + 14,
    y: y - 36,
    size: 9,
    font,
    color: COLORS.muted,
  });

  if (topPosts.length === 0) {
    const msg = "No hay posts para mostrar en el periodo seleccionado";
    const msgW = safeWidthOfText(font, msg, 10.5);
    page.drawText(msg, {
      x: x + (width - msgW) / 2,
      y: y - 96,
      size: 10.5,
      font,
      color: COLORS.muted,
    });
  } else {
    let rowTop = y - 56;
    for (let index = 0; index < topPosts.length; index += 1) {
      const post = topPosts[index];
      const rowBottom = rowTop - rowHeight;
      const score = toNumber(post?.popularityScore);
      const reactions = toNumber(post?.reactions?.total);
      const comments = toNumber(post?.comments);
      const shares = toNumber(post?.shares);
      const reactionsByType = post?.reactions?.byType ?? {};
      const imageUrl = getPostImageUrl(post);

      page.drawRectangle({
        x: x + 12,
        y: rowBottom,
        width: width - 24,
        height: rowHeight,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.9, 0.92, 0.96),
        borderWidth: 0.8,
      });

      page.drawText(`Top ${index + 1}`, {
        x: x + 20,
        y: rowTop - 16,
        size: 10.2,
        font: boldFont,
        color: COLORS.primary,
      });

      const scoreText = `Score: ${compactNumber(score)}`;
      const scoreX = x + width - 16 - safeWidthOfText(boldFont, scoreText, 9.5);
      page.drawText(scoreText, {
        x: scoreX,
        y: rowTop - 16,
        size: 9.5,
        font: boldFont,
        color: COLORS.text,
      });

      const imageBoxX = x + 20;
      const imageBoxY = rowBottom + 9;
      const imageBoxW = 84;
      const imageBoxH = rowHeight - 18;
      page.drawRectangle({
        x: imageBoxX,
        y: imageBoxY,
        width: imageBoxW,
        height: imageBoxH,
        color: rgb(0.96, 0.97, 0.99),
        borderColor: rgb(0.88, 0.91, 0.95),
        borderWidth: 0.7,
      });

      let imageDrawn = false;
      if (imageUrl) {
        const embedded = await fetchAndEmbedPostImage(pdfDoc, imageUrl);
        if (embedded) {
          const fit = fitImageInsideBox(embedded.width, embedded.height, imageBoxW - 4, imageBoxH - 4);
          page.drawImage(embedded, {
            x: imageBoxX + 2 + fit.offsetX,
            y: imageBoxY + 2 + fit.offsetY,
            width: fit.width,
            height: fit.height,
          });
          imageDrawn = true;
        }
      }

      if (!imageDrawn) {
        const placeholder = truncateText("Sin imagen", font, 8.2, imageBoxW - 8);
        const placeholderW = safeWidthOfText(font, placeholder, 8.2);
        page.drawText(placeholder, {
          x: imageBoxX + (imageBoxW - placeholderW) / 2,
          y: imageBoxY + imageBoxH / 2 - 4,
          size: 8.2,
          font,
          color: COLORS.muted,
        });
      }

      const textX = imageBoxX + imageBoxW + 10;
      const msgWidth = Math.max(120, scoreX - textX - 12);
      const msg = truncateText(post?.message || "Publicacion sin texto", font, 9.2, msgWidth);
      page.drawText(msg, {
        x: textX,
        y: rowTop - 34,
        size: 9.2,
        font,
        color: COLORS.text,
      });

      const reactionY = rowTop - 50;
      const iconSize = 9;
      let reactionX = textX;
      REACTION_KEYS.forEach((type, reactionIndex) => {
        const icon = reactionIcons[reactionIndex];
        const value = getReactionValueByType(reactionsByType, type);
        const valueText = compactNumber(value);
        const valueWidth = safeWidthOfText(boldFont, valueText, 8.2);

        if (icon) {
          const fit = fitImageInsideBox(icon.width, icon.height, iconSize, iconSize);
          page.drawImage(icon, {
            x: reactionX + fit.offsetX,
            y: reactionY + fit.offsetY - 1,
            width: fit.width,
            height: fit.height,
          });
        } else {
          page.drawCircle({
            x: reactionX + iconSize / 2,
            y: reactionY + iconSize / 2 - 1,
            size: iconSize / 2,
            color: REACTION_COLORS[reactionIndex] ?? COLORS.primary,
          });
        }

        page.drawText(valueText, {
          x: reactionX + iconSize + 2,
          y: reactionY - 0.5,
          size: 8.2,
          font: boldFont,
          color: COLORS.text,
        });

        reactionX += iconSize + 2 + valueWidth + 8;
      });

      const engagementText = `C:${compactNumber(comments)}  S:${compactNumber(shares)}  R:${compactNumber(reactions)}`;
      const engagementTextW = safeWidthOfText(font, engagementText, 8.2);
      page.drawText(engagementText, {
        x: x + width - 16 - engagementTextW,
        y: reactionY - 0.5,
        size: 8.2,
        font,
        color: COLORS.muted,
      });

      const rawDate = sanitizeWinAnsiText(post?.created_time || "");
      const dateToken = rawDate ? rawDate.slice(0, 10) : "";
      const footerLine = truncateText(
        `${dateToken ? `Publicado: ${dateToken}` : "Publicado: -"}`,
        font,
        8.2,
        msgWidth
      );
      page.drawText(footerLine, {
        x: textX,
        y: rowTop - 66,
        size: 8.2,
        font,
        color: COLORS.muted,
      });

      rowTop -= rowHeight + rowGap;
    }
  }

  drawChartSource({
    page,
    font,
    x,
    width,
    y: cardY + 10,
    integrationData: element?.integration_data,
    align: "center",
  });

  return { y: cardY - 20, page };
}

async function drawEngagementRateCard({ pdfDoc, page, element, x, y, maxWidth }) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const width = maxWidth;
  const height = 210;
  const space = ensureSpace(pdfDoc, page, y, height + 24);
  page = space.page;
  y = space.y;

  const cardY = drawCardFrame(page, x, y, width, height);
  const title = element?.title || "KPI";
  const interval = element?.interval || "Periodo";
  const total = toNumber(element?.data?.total);
  const interactionsTotal = toNumber(element?.data?.interactionsTotal);
  const reachTotal = toNumber(element?.data?.reachTotal);
  const postsTotal = toNumber(element?.data?.totalPosts);
  const hasReachBase = reachTotal > 0;

  const mainValue = hasReachBase
    ? `${total.toLocaleString("es-BO", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}%`
    : total.toLocaleString("es-BO", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });

  const subtitle = hasReachBase
    ? "Interacciones / Alcance"
    : "Interacciones promedio por publicación";
  const detail = hasReachBase
    ? `${compactNumber(interactionsTotal)} interacciones sobre ${compactNumber(reachTotal)} de alcance`
    : `${compactNumber(interactionsTotal)} interacciones en ${compactNumber(postsTotal)} publicaciones`;

  page.drawText(truncateText(title, boldFont, 13, width - 30), {
    x: x + 14,
    y: y - 20,
    size: 13,
    font: boldFont,
    color: COLORS.title,
  });
  page.drawText(interval, {
    x: x + 14,
    y: y - 36,
    size: 9,
    font,
    color: COLORS.muted,
  });

  const mainW = safeWidthOfText(boldFont, mainValue, 32);
  page.drawText(mainValue, {
    x: x + (width - mainW) / 2,
    y: y - 94,
    size: 32,
    font: boldFont,
    color: COLORS.title,
  });

  const subtitleW = safeWidthOfText(font, subtitle, 10);
  page.drawText(subtitle, {
    x: x + (width - subtitleW) / 2,
    y: y - 112,
    size: 10,
    font,
    color: COLORS.text,
  });

  const detailText = truncateText(detail, font, 9, width - 28);
  const detailW = safeWidthOfText(font, detailText, 9);
  page.drawText(detailText, {
    x: x + (width - detailW) / 2,
    y: y - 128,
    size: 9,
    font,
    color: COLORS.muted,
  });

  if (hasReachBase) {
    const barX = x + 18;
    const barY = cardY + 42;
    const barW = width - 36;
    const barH = 7;
    const rateClamped = Math.max(0, Math.min(100, total));

    page.drawRectangle({
      x: barX,
      y: barY,
      width: barW,
      height: barH,
      color: COLORS.barTrack,
    });
    page.drawRectangle({
      x: barX,
      y: barY,
      width: barW * (rateClamped / 100),
      height: barH,
      color: COLORS.primary,
    });
  }

  drawChartSource({
    page,
    font,
    x,
    width,
    y: cardY + 10,
    integrationData: element?.integration_data,
    align: "center",
  });

  return { y: cardY - 20, page };
}

export async function drawFacebookChart({
  pdfDoc,
  page,
  element,
  component,
  x,
  y,
  maxWidth,
}) {
  switch (component) {
    case "followersCard":
      return drawTimeSeriesCard({ pdfDoc, page, element, x, y, maxWidth, metricLabel: "seguidores", useCumulative: true });
    case "pageViewsCard":
      return drawTimeSeriesCard({ pdfDoc, page, element, x, y, maxWidth, metricLabel: "visitas", useCumulative: true });
    case "profileViewsCard":
      return drawTimeSeriesCard({ pdfDoc, page, element, x, y, maxWidth, metricLabel: "visitas", useCumulative: true });
    case "engagedAccountsCard":
      return drawTimeSeriesCard({ pdfDoc, page, element, x, y, maxWidth, metricLabel: "cuentas", useCumulative: true });
    case "pageImpressionsCard":
      return drawTimeSeriesCard({ pdfDoc, page, element, x, y, maxWidth, metricLabel: "impresiones", useCumulative: true });
    case "totalActionsCard":
      return drawTimeSeriesCard({ pdfDoc, page, element, x, y, maxWidth, metricLabel: "acciones", useCumulative: false });
    case "postingFrequencyCard":
      return drawTimeSeriesCard({ pdfDoc, page, element, x, y, maxWidth, metricLabel: "publicaciones", useCumulative: true });
    case "postEngagementsCard":
      return drawTimeSeriesCard({ pdfDoc, page, element, x, y, maxWidth, metricLabel: "interacciones", useCumulative: false });
    case "organicOrPaidViewsCard":
      return drawOrganicPaidCard({ pdfDoc, page, element, x, y, maxWidth });
    case "chartFollowersByCountry":
      return drawFollowersByCountryCard({ pdfDoc, page, element, x, y, maxWidth });
    case "totalReactionsCard":
      return drawTotalReactionsCard({ pdfDoc, page, element, x, y, maxWidth });
    case "topPostOfThePeriod":
      return drawTopPostsCard({ pdfDoc, page, element, x, y, maxWidth });
    case "engagementRateCard":
      return drawEngagementRateCard({ pdfDoc, page, element, x, y, maxWidth });
    default:
      return drawTimeSeriesCard({ pdfDoc, page, element, x, y, maxWidth, metricLabel: "valor", useCumulative: true });
  }
}

export async function drawFollowersChart(args) {
  return drawTimeSeriesCard({
    ...args,
    metricLabel: "seguidores",
    useCumulative: true,
  });
}
