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
  barTrack: rgb(0.9, 0.93, 0.97),
  lineGrid: rgb(0.88, 0.91, 0.95),
};

const WEEKDAY_LABELS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") return Number(value) || 0;
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
    if (isAsciiPrintable || isLatin1Supplement) safe += char;
    else if (isWhitespace) safe += " ";
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
    if (safeWidthOfText(font, candidate, size) <= maxWidth) low = mid;
    else high = mid - 1;
  }
  return `${safeText.slice(0, Math.max(0, low))}${ellipsis}`;
}

function ensureSpace(pdfDoc, page, y, requiredHeight) {
  if (y - requiredHeight >= PAGE_BOTTOM_MARGIN) return { page, y };
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

function drawChartSource({ page, font, x, width, y, integrationData }) {
  const platform = integrationData?.integration?.platform ?? "github";
  const integrationName = integrationData?.integration?.name ?? "Integracion";
  const projectName = integrationData?.project?.name ?? "Proyecto";
  const source = `Fuente: ${platform} - ${integrationName} / proyecto: ${projectName}`;
  const text = truncateText(source, font, 8.5, width - 24);
  const textWidth = safeWidthOfText(font, text, 8.5);
  page.drawText(text, {
    x: x + (width - textWidth) / 2,
    y,
    size: 8.5,
    font,
    color: COLORS.muted,
  });
}

function drawCardHeader({ page, x, y, width, title, interval, boldFont, font, totalText = "" }) {
  page.drawText(truncateText(title, boldFont, 13, width - 30), {
    x: x + 14,
    y: y - 20,
    size: 13,
    font: boldFont,
    color: COLORS.title,
  });

  page.drawText(interval || "Periodo", {
    x: x + 14,
    y: y - 36,
    size: 9,
    font,
    color: COLORS.muted,
  });

  if (totalText) {
    const totalW = safeWidthOfText(boldFont, totalText, 13);
    page.drawText(totalText, {
      x: x + width - totalW - 14,
      y: y - 20,
      size: 13,
      font: boldFont,
      color: COLORS.title,
    });
  }
}

function isoDateFromValue(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
}

function buildDailySeries(items = [], dateAccessor = () => null) {
  const map = new Map();
  items.forEach((item) => {
    const day = isoDateFromValue(dateAccessor(item));
    if (!day) return;
    map.set(day, (map.get(day) || 0) + 1);
  });

  const labels = Array.from(map.keys()).sort();
  const values = labels.map((label) => map.get(label) || 0);
  return {
    labels,
    values,
    total: values.reduce((acc, value) => acc + value, 0),
  };
}

function drawLineChart({ page, font, x, y, width, height, labels = [], values = [] }) {
  if (!values.length) return;

  for (let i = 0; i <= 4; i += 1) {
    const gy = y + (height / 4) * i;
    page.drawLine({
      start: { x, y: gy },
      end: { x: x + width, y: gy },
      thickness: 0.5,
      color: COLORS.lineGrid,
    });
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const hasRange = maxValue !== minValue;
  const topValue = hasRange ? maxValue : maxValue + 1;
  const bottomValue = hasRange ? minValue : minValue - 1;
  const scaleY = (value) => y + ((value - bottomValue) / (topValue - bottomValue)) * height;
  const scaleX = values.length > 1 ? width / (values.length - 1) : 0;

  for (let i = 0; i < values.length - 1; i += 1) {
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

  values.forEach((value, index) => {
    page.drawCircle({
      x: x + index * scaleX,
      y: scaleY(value),
      size: 1.8,
      color: COLORS.primary,
    });
  });

  if (labels.length) {
    const sampleIndexes = [0, Math.floor((labels.length - 1) / 2), labels.length - 1].filter(
      (idx, pos, arr) => idx >= 0 && arr.indexOf(idx) === pos
    );

    sampleIndexes.forEach((idx) => {
      const raw = labels[idx] || "";
      const text = raw ? `${raw.slice(8, 10)}/${raw.slice(5, 7)}/${raw.slice(2, 4)}` : "";
      const label = truncateText(text, font, 7.5, 52);
      const labelW = safeWidthOfText(font, label, 7.5);
      const anchorX = values.length > 1 ? x + idx * scaleX : x + width / 2;
      const safeX = Math.max(x, Math.min(x + width - labelW, anchorX - labelW / 2));
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

function getCommitDate(commit) {
  return commit?.commit?.author?.date;
}

function getCommitAuthor(commit) {
  return commit?.author?.login || commit?.commit?.author?.name || "Autor desconocido";
}

function getCommitMessage(commit) {
  return commit?.commit?.message || "Sin mensaje";
}

function getCommitSha(commit) {
  return commit?.sha || "-";
}

function getPeriodStart(period) {
  const now = new Date();
  const start = new Date(now);
  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      return start;
    case "lastWeek":
      start.setDate(now.getDate() - 7);
      return start;
    case "lastMonth":
      start.setMonth(now.getMonth() - 1);
      return start;
    case "lastSixMonths":
      start.setMonth(now.getMonth() - 6);
      return start;
    case "all":
    default:
      return new Date(0);
  }
}

async function drawTimeSeriesCard({ pdfDoc, page, element, x, y, maxWidth, items, dateAccessor, metricLabel }) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const series = buildDailySeries(items, dateAccessor);
  const width = maxWidth;
  const height = 228;

  const space = ensureSpace(pdfDoc, page, y, height + 24);
  page = space.page;
  y = space.y;

  const cardY = drawCardFrame(page, x, y, width, height);
  const totalText = `${compactNumber(series.total)} ${metricLabel}`;
  drawCardHeader({
    page,
    x,
    y,
    width,
    title: element?.title || "Grafico",
    interval: element?.interval || "Periodo",
    boldFont,
    font,
    totalText,
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
    borderColor: COLORS.lineGrid,
    borderWidth: 0.8,
  });

  if (!series.values.length || series.values.every((value) => value === 0)) {
    const empty = "Sin datos para mostrar en el periodo seleccionado";
    const emptyW = safeWidthOfText(font, empty, 10);
    page.drawText(empty, {
      x: plotX + (plotW - emptyW) / 2,
      y: plotY + plotH / 2 - 5,
      size: 10,
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
      labels: series.labels,
      values: series.values,
    });
  }

  drawChartSource({
    page,
    font,
    x,
    width,
    y: cardY + 10,
    integrationData: element?.integration_data,
  });

  return { y: cardY - 20, page };
}

async function drawWeekdayCard({ pdfDoc, page, element, x, y, maxWidth, commits = [] }) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const totals = new Array(7).fill(0);
  commits.forEach((commit) => {
    const date = new Date(getCommitDate(commit));
    if (Number.isNaN(date.getTime())) return;
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
    totals[dayIndex] += 1;
  });

  const maxValue = Math.max(...totals, 1);
  const totalCommits = totals.reduce((acc, value) => acc + value, 0);
  const width = maxWidth;
  const height = 248;

  const space = ensureSpace(pdfDoc, page, y, height + 24);
  page = space.page;
  y = space.y;
  const cardY = drawCardFrame(page, x, y, width, height);

  drawCardHeader({
    page,
    x,
    y,
    width,
    title: element?.title || "Horas con mas commits",
    interval: element?.interval || "Periodo",
    boldFont,
    font,
    totalText: `${compactNumber(totalCommits)} commits`,
  });

  let rowY = y - 64;
  WEEKDAY_LABELS.forEach((label, index) => {
    const value = totals[index];
    const ratio = Math.max(0, Math.min(1, value / maxValue));
    const barX = x + 118;
    const barW = width - 136;
    const barY = rowY - 8;
    const fillW = ratio > 0 ? Math.max(2, barW * ratio) : 0;
    const valueText = compactNumber(value);
    const valueTextWidth = safeWidthOfText(boldFont, valueText, 9.2);

    page.drawText(label, {
      x: x + 14,
      y: rowY,
      size: 9.4,
      font,
      color: COLORS.text,
    });

    page.drawRectangle({
      x: barX,
      y: barY,
      width: barW,
      height: 6,
      color: COLORS.barTrack,
    });

    page.drawRectangle({
      x: barX,
      y: barY,
      width: fillW,
      height: 6,
      color: COLORS.primary,
    });

    page.drawText(valueText, {
      x: barX + barW - valueTextWidth,
      y: rowY - 0.5,
      size: 9.2,
      font: boldFont,
      color: COLORS.text,
    });

    rowY -= 23.5;
  });

  drawChartSource({
    page,
    font,
    x,
    width,
    y: cardY + 10,
    integrationData: element?.integration_data,
  });

  return { y: cardY - 20, page };
}

function countAuthors(commits = []) {
  const counts = new Map();
  commits.forEach((commit) => {
    const author = getCommitAuthor(commit);
    counts.set(author, (counts.get(author) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

async function drawTopAuthorsCard({ pdfDoc, page, element, x, y, maxWidth, commits = [] }) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const rows = countAuthors(commits).slice(0, 8);
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  const width = maxWidth;
  const height = Math.max(184, 112 + rows.length * 23);

  const space = ensureSpace(pdfDoc, page, y, height + 24);
  page = space.page;
  y = space.y;
  const cardY = drawCardFrame(page, x, y, width, height);

  drawCardHeader({
    page,
    x,
    y,
    width,
    title: element?.title || "Top Colaboradores del Periodo",
    interval: element?.interval || "Periodo",
    boldFont,
    font,
    totalText: `${compactNumber(commits.length)} commits`,
  });

  if (!rows.length) {
    const empty = "Sin colaboradores para mostrar";
    const emptyW = safeWidthOfText(font, empty, 10);
    page.drawText(empty, {
      x: x + (width - emptyW) / 2,
      y: y - 96,
      size: 10,
      font,
      color: COLORS.muted,
    });
  } else {
    let rowY = y - 64;
    rows.forEach((row, index) => {
      const ratio = Math.max(0, Math.min(1, row.value / maxValue));
      const barX = x + 182;
      const barW = width - 202;
      const barY = rowY - 8;
      const fillW = ratio > 0 ? Math.max(2, barW * ratio) : 0;
      const rankText = `${index + 1}.`;
      const authorText = truncateText(row.name, font, 9.2, 138);
      const valueText = `${compactNumber(row.value)} commits`;

      page.drawText(rankText, { x: x + 14, y: rowY, size: 9.2, font: boldFont, color: COLORS.text });
      page.drawText(authorText, { x: x + 30, y: rowY, size: 9.2, font, color: COLORS.text });

      page.drawRectangle({ x: barX, y: barY, width: barW, height: 6, color: COLORS.barTrack });
      page.drawRectangle({ x: barX, y: barY, width: fillW, height: 6, color: COLORS.primary });

      const valueWidth = safeWidthOfText(boldFont, valueText, 8.4);
      page.drawText(valueText, {
        x: x + width - 14 - valueWidth,
        y: rowY,
        size: 8.4,
        font: boldFont,
        color: COLORS.text,
      });

      rowY -= 23;
    });
  }

  drawChartSource({
    page,
    font,
    x,
    width,
    y: cardY + 10,
    integrationData: element?.integration_data,
  });

  return { y: cardY - 20, page };
}

async function drawInactiveAuthorsCard({ pdfDoc, page, element, x, y, maxWidth, commits = [] }) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const allAuthorsMap = new Map();
  commits.forEach((commit) => {
    const login = commit?.author?.login;
    if (!login) return;
    if (!allAuthorsMap.has(login)) {
      allAuthorsMap.set(login, {
        login,
        email: commit?.commit?.author?.email || "",
      });
    }
  });

  const periodStart = getPeriodStart(element?.period);
  const activeAuthors = new Set(
    commits
      .filter((commit) => {
        const date = new Date(getCommitDate(commit));
        if (Number.isNaN(date.getTime())) return false;
        return date >= periodStart;
      })
      .map((commit) => commit?.author?.login)
      .filter(Boolean)
  );

  const inactive = Array.from(allAuthorsMap.values()).filter((author) => !activeAuthors.has(author.login));
  const width = maxWidth;
  const height = Math.max(190, 122 + Math.max(1, inactive.length) * 20);

  const space = ensureSpace(pdfDoc, page, y, height + 24);
  page = space.page;
  y = space.y;
  const cardY = drawCardFrame(page, x, y, width, height);

  drawCardHeader({
    page,
    x,
    y,
    width,
    title: element?.title || "Colaboradores sin push",
    interval: element?.interval || "Periodo",
    boldFont,
    font,
    totalText: `${inactive.length} sin push`,
  });

  if (!inactive.length) {
    const text = "Todos los colaboradores realizaron al menos un push reciente";
    const safeText = truncateText(text, font, 9.8, width - 28);
    const safeWidth = safeWidthOfText(font, safeText, 9.8);
    page.drawText(safeText, {
      x: x + (width - safeWidth) / 2,
      y: y - 94,
      size: 9.8,
      font,
      color: COLORS.muted,
    });
  } else {
    let rowY = y - 66;
    inactive.slice(0, 10).forEach((author, index) => {
      const login = truncateText(author.login, font, 9.4, 190);
      const email = truncateText(author.email || "-", font, 8.4, width - 220);
      page.drawText(`${index + 1}.`, {
        x: x + 14,
        y: rowY,
        size: 9.4,
        font: boldFont,
        color: COLORS.text,
      });
      page.drawText(login, {
        x: x + 30,
        y: rowY,
        size: 9.4,
        font,
        color: COLORS.text,
      });
      page.drawText(email, {
        x: x + 210,
        y: rowY,
        size: 8.4,
        font,
        color: COLORS.muted,
      });
      rowY -= 19;
    });
  }

  drawChartSource({
    page,
    font,
    x,
    width,
    y: cardY + 10,
    integrationData: element?.integration_data,
  });

  return { y: cardY - 20, page };
}

async function drawCommitTableCard({ pdfDoc, page, element, x, y, maxWidth, commits = [] }) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const rows = commits.slice(0, 14);
  const width = maxWidth;
  const height = Math.max(215, 125 + rows.length * 18);

  const space = ensureSpace(pdfDoc, page, y, height + 24);
  page = space.page;
  y = space.y;
  const cardY = drawCardFrame(page, x, y, width, height);

  drawCardHeader({
    page,
    x,
    y,
    width,
    title: element?.title || "Historial de Commits",
    interval: element?.interval || "Periodo",
    boldFont,
    font,
    totalText: `${compactNumber(commits.length)} registros`,
  });

  const tableX = x + 14;
  const tableW = width - 28;
  const headerY = y - 62;
  const rowH = 17.5;
  const colDateW = 92;
  const colAuthorW = 124;
  const colShaW = 74;
  const colMsgW = tableW - colDateW - colAuthorW - colShaW - 6;

  page.drawRectangle({
    x: tableX,
    y: headerY - 12,
    width: tableW,
    height: 13,
    color: rgb(0.9, 0.95, 1),
    borderColor: COLORS.border,
    borderWidth: 0.7,
  });

  page.drawText("Fecha", { x: tableX + 4, y: headerY - 8, size: 8.2, font: boldFont, color: COLORS.text });
  page.drawText("Autor", { x: tableX + colDateW + 4, y: headerY - 8, size: 8.2, font: boldFont, color: COLORS.text });
  page.drawText("SHA", { x: tableX + colDateW + colAuthorW + 4, y: headerY - 8, size: 8.2, font: boldFont, color: COLORS.text });
  page.drawText("Mensaje", { x: tableX + colDateW + colAuthorW + colShaW + 4, y: headerY - 8, size: 8.2, font: boldFont, color: COLORS.text });

  if (!rows.length) {
    const empty = "Sin commits para mostrar";
    const emptyW = safeWidthOfText(font, empty, 10);
    page.drawText(empty, {
      x: tableX + (tableW - emptyW) / 2,
      y: headerY - 42,
      size: 10,
      font,
      color: COLORS.muted,
    });
  } else {
    let rowY = headerY - 26;
    rows.forEach((commit, idx) => {
      if (idx % 2 === 0) {
        page.drawRectangle({
          x: tableX,
          y: rowY - 3.5,
          width: tableW,
          height: rowH,
          color: rgb(0.985, 0.99, 1),
        });
      }

      const rawDate = sanitizeWinAnsiText(getCommitDate(commit) || "");
      const dateText = rawDate ? rawDate.replace("T", " ").slice(0, 16) : "-";
      const authorText = truncateText(getCommitAuthor(commit), font, 8.1, colAuthorW - 8);
      const shaText = truncateText(getCommitSha(commit), font, 8.1, colShaW - 8);
      const msgText = truncateText(getCommitMessage(commit), font, 8.1, colMsgW - 8);

      page.drawText(dateText, { x: tableX + 4, y: rowY, size: 8.1, font, color: COLORS.text });
      page.drawText(authorText, { x: tableX + colDateW + 4, y: rowY, size: 8.1, font, color: COLORS.text });
      page.drawText(shaText, { x: tableX + colDateW + colAuthorW + 4, y: rowY, size: 8.1, font, color: COLORS.text });
      page.drawText(msgText, { x: tableX + colDateW + colAuthorW + colShaW + 4, y: rowY, size: 8.1, font, color: COLORS.text });

      rowY -= rowH;
    });
  }

  drawChartSource({
    page,
    font,
    x,
    width,
    y: cardY + 10,
    integrationData: element?.integration_data,
  });

  return { y: cardY - 20, page };
}

async function drawAuthorShareCard({ pdfDoc, page, element, x, y, maxWidth, commits = [] }) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const rows = countAuthors(commits).slice(0, 10);
  const total = rows.reduce((acc, row) => acc + row.value, 0);
  const width = maxWidth;
  const height = Math.max(196, 118 + rows.length * 21);

  const space = ensureSpace(pdfDoc, page, y, height + 24);
  page = space.page;
  y = space.y;
  const cardY = drawCardFrame(page, x, y, width, height);

  drawCardHeader({
    page,
    x,
    y,
    width,
    title: element?.title || "Porcentaje de Commits",
    interval: element?.interval || "Periodo",
    boldFont,
    font,
    totalText: `${compactNumber(total)} total`,
  });

  if (!rows.length) {
    const empty = "Sin datos para mostrar";
    const emptyW = safeWidthOfText(font, empty, 10);
    page.drawText(empty, {
      x: x + (width - emptyW) / 2,
      y: y - 94,
      size: 10,
      font,
      color: COLORS.muted,
    });
  } else {
    let rowY = y - 64;
    rows.forEach((row) => {
      const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
      const name = truncateText(row.name, font, 9.2, 220);
      const pctText = `${pct}%`;
      const valueText = `${compactNumber(row.value)} commits`;
      const valueWidth = safeWidthOfText(boldFont, valueText, 8.3);
      const pctWidth = safeWidthOfText(boldFont, pctText, 8.8);

      page.drawText(name, { x: x + 14, y: rowY, size: 9.2, font, color: COLORS.text });
      page.drawText(pctText, {
        x: x + width - valueWidth - pctWidth - 20,
        y: rowY,
        size: 8.8,
        font: boldFont,
        color: COLORS.primary,
      });
      page.drawText(valueText, {
        x: x + width - valueWidth - 14,
        y: rowY,
        size: 8.3,
        font: boldFont,
        color: COLORS.text,
      });
      rowY -= 21;
    });
  }

  drawChartSource({
    page,
    font,
    x,
    width,
    y: cardY + 10,
    integrationData: element?.integration_data,
  });

  return { y: cardY - 20, page };
}

export async function drawGithubChart({ pdfDoc, page, element, component, x, y, maxWidth }) {
  const commits = Array.isArray(element?.data) ? element.data : [];
  const pullRequests = Array.isArray(element?.data) ? element.data : [];

  switch (component) {
    case "commitsInThePeriodCard":
      return drawTimeSeriesCard({
        pdfDoc,
        page,
        element,
        x,
        y,
        maxWidth,
        items: commits,
        dateAccessor: (commit) => commit?.commit?.author?.date,
        metricLabel: "commits",
      });
    case "pullRequestsCard":
      return drawTimeSeriesCard({
        pdfDoc,
        page,
        element,
        x,
        y,
        maxWidth,
        items: pullRequests,
        dateAccessor: (pr) => pr?.created_at,
        metricLabel: "PRs",
      });
    case "sessionsChart":
      return drawTimeSeriesCard({
        pdfDoc,
        page,
        element,
        x,
        y,
        maxWidth,
        items: commits,
        dateAccessor: (commit) => commit?.commit?.author?.date,
        metricLabel: "eventos",
      });
    case "commitsByWeekdayHourChart":
      return drawWeekdayCard({ pdfDoc, page, element, x, y, maxWidth, commits });
    case "topCollaboratorsCard":
      return drawTopAuthorsCard({ pdfDoc, page, element, x, y, maxWidth, commits });
    case "collaboratorsWithoutPushCard":
      return drawInactiveAuthorsCard({ pdfDoc, page, element, x, y, maxWidth, commits });
    case "commitGrid":
      return drawCommitTableCard({ pdfDoc, page, element, x, y, maxWidth, commits });
    case "commitsByAuthorChart":
      return drawAuthorShareCard({ pdfDoc, page, element, x, y, maxWidth, commits });
    default:
      return drawTimeSeriesCard({
        pdfDoc,
        page,
        element,
        x,
        y,
        maxWidth,
        items: commits,
        dateAccessor: (commit) => commit?.commit?.author?.date,
        metricLabel: "registros",
      });
  }
}

