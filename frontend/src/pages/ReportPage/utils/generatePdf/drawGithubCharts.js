import { rgb, StandardFonts } from "pdf-lib";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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

const PIE_COLORS = [
  rgb(0.57, 0.63, 0.75),
  rgb(0.44, 0.51, 0.66),
  rgb(0.35, 0.43, 0.58),
  rgb(0.29, 0.36, 0.5),
  rgb(0.23, 0.29, 0.43),
  rgb(0.18, 0.23, 0.35),
  rgb(0.14, 0.19, 0.3),
  rgb(0.1, 0.15, 0.25),
  rgb(0.08, 0.12, 0.2),
  rgb(0.06, 0.1, 0.17),
  rgb(0.05, 0.08, 0.14),
];

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
  return toLocalDayKey(value);
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
  return commit?.commit?.committer?.date || commit?.commit?.author?.date || null;
}

function getCommitAuthor(commit) {
  return commit?.author?.login || commit?.commit?.author?.name || "Autor desconocido";
}

function getPeriodStart(period) {
  const todayStart = dayjs().startOf("day");
  switch (period) {
    case "today":
      return todayStart;
    case "lastWeek":
      return todayStart.subtract(7, "day");
    case "lastMonth":
      return todayStart.subtract(1, "month");
    case "lastSixMonths":
      return todayStart.subtract(6, "month");
    case "all":
    default:
      return dayjs(new Date(0));
  }
}

function filterItemsByPeriod(items = [], period = "all", dateAccessor = () => null) {
  if (!Array.isArray(items) || !items.length) return [];
  if (!period || period === "all") return items;

  const start = getPeriodStart(period);
  const end = dayjs().endOf("day");

  return items.filter((item) => {
    const rawDate = dateAccessor(item);
    const commitDate = rawDate ? dayjs(rawDate) : null;
    if (!commitDate || !commitDate.isValid()) return false;
    return (
      commitDate.isSameOrAfter(start, "day") &&
      commitDate.isSameOrBefore(end, "day")
    );
  });
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function toLocalDayKey(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatInactivityFromDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  const diffMs = Math.max(0, Date.now() - date.getTime());
  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const minuteMs = 60 * 1000;

  const days = Math.floor(diffMs / dayMs);
  if (days >= 60) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? "mes" : "meses"}`;
  }
  if (days >= 1) return `${days} ${days === 1 ? "dia" : "dias"}`;

  const hours = Math.floor(diffMs / hourMs);
  if (hours >= 1) return `${hours} ${hours === 1 ? "hora" : "horas"}`;

  const minutes = Math.max(1, Math.floor(diffMs / minuteMs));
  return `${minutes} ${minutes === 1 ? "min" : "mins"}`;
}

function buildContributorRows(commits = []) {
  const grouped = new Map();

  commits.forEach((commit) => {
    const login = commit?.author?.login || "Desconocido";
    const email = commit?.commit?.author?.email || "-";
    const dateValue = getCommitDate(commit);
    const dayKey = toLocalDayKey(dateValue);

    if (!grouped.has(login)) {
      grouped.set(login, {
        login,
        email,
        totalCommits: 0,
        lastCommit: null,
        byDay: new Map(),
      });
    }

    const row = grouped.get(login);
    row.totalCommits += 1;

    const commitDate = new Date(dateValue);
    if (!Number.isNaN(commitDate.getTime())) {
      if (!row.lastCommit || commitDate > row.lastCommit) {
        row.lastCommit = commitDate;
      }
    }

    if (dayKey) {
      row.byDay.set(dayKey, (row.byDay.get(dayKey) || 0) + 1);
    }
  });

  const rows = Array.from(grouped.values())
    .map((row) => {
      const orderedDays = Array.from(row.byDay.entries()).sort((a, b) => {
        return new Date(a[0]) - new Date(b[0]);
      });
      const activityValues = orderedDays.map(([, count]) => count).slice(-7);

      return {
        login: row.login,
        email: row.email,
        totalCommits: row.totalCommits,
        inactivity: formatInactivityFromDate(row.lastCommit),
        activityValues,
      };
    })
    .sort((a, b) => b.totalCommits - a.totalCommits);

  rows.forEach((row, index) => {
    row.position = index + 1;
  });

  return rows;
}

function drawTinySparkBars({ page, font, x, y, width, height, values = [] }) {
  const safeValues = Array.isArray(values) ? values.slice(-7) : [];
  if (!safeValues.length) {
    page.drawText("-", { x: x + width / 2 - 2, y: y + 2, size: 8, font, color: COLORS.muted });
    return;
  }

  const max = Math.max(...safeValues, 1);
  const gap = 2;
  const barWidth = Math.max(2, (width - gap * (safeValues.length - 1)) / safeValues.length);

  safeValues.forEach((value, index) => {
    const ratio = Math.max(0, Math.min(1, value / max));
    const barX = x + index * (barWidth + gap);
    const barH = Math.max(2, height * ratio);
    page.drawRectangle({
      x: barX,
      y,
      width: barWidth,
      height,
      color: COLORS.barTrack,
    });
    page.drawRectangle({
      x: barX,
      y,
      width: barWidth,
      height: barH,
      color: COLORS.primary,
    });
  });
}

function pointOnCircle(cx, cy, radius, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function drawDonutSlice({ page, cx, cy, innerRadius, outerRadius, startAngle, endAngle, color }) {
  const sweep = Math.max(0, endAngle - startAngle);
  if (sweep <= 0) return;
  const steps = Math.max(24, Math.ceil(sweep * 2));
  const angleStep = sweep / steps;
  const arcStepAtOuter = (Math.PI * outerRadius * angleStep) / 180;
  const thickness = Math.max(1.1, arcStepAtOuter + 0.25);

  for (let i = 0; i <= steps; i += 1) {
    const angle = startAngle + i * angleStep;
    const start = pointOnCircle(cx, cy, innerRadius, angle);
    const end = pointOnCircle(cx, cy, outerRadius, angle);
    page.drawLine({
      start,
      end,
      thickness,
      color,
    });
  }
}

function buildSessionScatter(commits = []) {
  if (!Array.isArray(commits) || !commits.length) {
    return { points: [], uniqueDays: [] };
  }

  const uniqueDays = Array.from(
    new Set(
      commits
        .map((commit) => toLocalDayKey(getCommitDate(commit)))
        .filter(Boolean)
    )
  ).sort();

  const dayIndexMap = {};
  uniqueDays.forEach((day, index) => {
    dayIndexMap[day] = index;
  });

  const commitsByDay = new Map();
  commits.forEach((commit) => {
    const day = toLocalDayKey(getCommitDate(commit));
    if (!day) return;
    if (!commitsByDay.has(day)) commitsByDay.set(day, []);
    commitsByDay.get(day).push(commit);
  });

  const points = [];
  uniqueDays.forEach((day) => {
    const commitsInDay = (commitsByDay.get(day) || []).sort((a, b) => {
      return new Date(getCommitDate(a)) - new Date(getCommitDate(b));
    });

    commitsInDay.forEach((commit, index) => {
      const date = new Date(getCommitDate(commit));
      if (Number.isNaN(date.getTime())) return;
      const secondsSinceMidnight = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
      const x = dayIndexMap[day] + secondsSinceMidnight / 86400;
      points.push({ x, y: index + 1 });
    });
  });

  points.sort((a, b) => a.x - b.x);
  return { points, uniqueDays };
}

async function drawSessionsScatterCard({ pdfDoc, page, element, x, y, maxWidth, commits = [] }) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
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
    title: element?.title || "Historial de commits",
    interval: element?.interval || "Periodo",
    boldFont,
    font,
    totalText: `${compactNumber(commits.length)} eventos`,
  });

  const plotX = x + 14;
  const plotY = cardY + 48;
  const plotW = width - 28;
  const plotH = 116;

  page.drawRectangle({
    x: plotX,
    y: plotY,
    width: plotW,
    height: plotH,
    color: rgb(1, 1, 1),
    borderColor: COLORS.lineGrid,
    borderWidth: 0.8,
  });

  const { points, uniqueDays } = buildSessionScatter(commits);
  if (!points.length) {
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
    const yMax = Math.max(...points.map((point) => point.y), 6);
    const xMin = 0;
    const xMax = Math.max(uniqueDays.length, 1);
    const yMin = 1;

    const scaleX = (value) => plotX + ((value - xMin) / Math.max(1, xMax - xMin)) * plotW;
    const scaleY = (value) => plotY + ((value - yMin) / Math.max(1, yMax - yMin)) * plotH;

    for (let i = 0; i <= 4; i += 1) {
      const gy = plotY + (plotH / 4) * i;
      page.drawLine({
        start: { x: plotX, y: gy },
        end: { x: plotX + plotW, y: gy },
        thickness: 0.5,
        color: COLORS.lineGrid,
      });
    }

    for (let i = 0; i < points.length - 1; i += 1) {
      page.drawLine({
        start: { x: scaleX(points[i].x), y: scaleY(points[i].y) },
        end: { x: scaleX(points[i + 1].x), y: scaleY(points[i + 1].y) },
        thickness: 1,
        color: COLORS.primary,
      });
    }

    points.forEach((point) => {
      page.drawCircle({
        x: scaleX(point.x),
        y: scaleY(point.y),
        size: 1.8,
        color: COLORS.primary,
      });
    });

    const yTicks = [1, Math.ceil(yMax / 2), yMax].filter((tick, index, arr) => {
      return tick >= 1 && arr.indexOf(tick) === index;
    });
    yTicks.forEach((tick) => {
      const label = String(tick);
      const lw = safeWidthOfText(font, label, 7.2);
      page.drawText(label, {
        x: plotX - lw - 6,
        y: scaleY(tick) - 3,
        size: 7.2,
        font,
        color: COLORS.muted,
      });
    });

    const sampleIndexes = [0, Math.floor((uniqueDays.length - 1) / 2), uniqueDays.length - 1].filter(
      (index, pos, arr) => index >= 0 && arr.indexOf(index) === pos
    );
    sampleIndexes.forEach((idx) => {
      const raw = uniqueDays[idx] || "";
      const label = raw ? `${raw.slice(8, 10)}/${raw.slice(5, 7)}/${raw.slice(2, 4)}` : "";
      const lw = safeWidthOfText(font, label, 7.3);
      const anchorX = uniqueDays.length > 1 ? plotX + (idx / (uniqueDays.length - 1)) * plotW : plotX + plotW / 2;
      page.drawText(label, {
        x: Math.max(plotX, Math.min(plotX + plotW - lw, anchorX - lw / 2)),
        y: plotY - 12,
        size: 7.3,
        font,
        color: COLORS.muted,
      });
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
  const totalText = `${compactNumber(items.length)} ${metricLabel}`;
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
  const explicitGoal = toNumber(element?.meta?.goal);
  const fallbackGoal =
    typeof element?.id_name === "string" && element.id_name.includes("commitsInThePeriodCard")
      ? 50
      : typeof element?.id_name === "string" && element.id_name.includes("pullRequestsCard")
        ? 10
        : 0;
  const goal = explicitGoal > 0 ? explicitGoal : fallbackGoal;
  const hasGoal = Number.isFinite(goal) && goal > 0;

  if (hasGoal) {
    const goalText = `Meta: ${compactNumber(goal)}`;
    const goalWidth = safeWidthOfText(font, goalText, 8.6);
    page.drawText(goalText, {
      x: x + width - goalWidth - 14,
      y: y - 36,
      size: 8.6,
      font,
      color: COLORS.muted,
    });
  }

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

  const hourBuckets = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${hour}:00-${hour === 23 ? "24:00" : `${hour + 1}:00`}`,
    value: 0,
  }));

  commits.forEach((commit) => {
    const date = new Date(getCommitDate(commit));
    if (Number.isNaN(date.getTime())) return;
    const hour = date.getHours();
    hourBuckets[hour].value += 1;
  });

  const rankedHours = hourBuckets
    .filter((bucket) => bucket.value > 0)
    .sort((a, b) => {
      if (b.value !== a.value) return b.value - a.value;
      return a.hour - b.hour;
    })
    .slice(0, 8);

  const maxValue = Math.max(...rankedHours.map((bucket) => bucket.value), 1);
  const totalCommits = hourBuckets.reduce((acc, bucket) => acc + bucket.value, 0);
  const width = maxWidth;
  const height = Math.max(220, 128 + Math.max(1, rankedHours.length) * 21);

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

  page.drawText("Top horas con mas commits (hora local)", {
    x: x + 14,
    y: y - 52,
    size: 8.8,
    font,
    color: COLORS.muted,
  });

  if (!rankedHours.length) {
    const empty = "Sin commits suficientes para calcular horas de actividad";
    const emptyW = safeWidthOfText(font, empty, 10);
    page.drawText(empty, {
      x: x + (width - emptyW) / 2,
      y: y - 102,
      size: 10,
      font,
      color: COLORS.muted,
    });
  } else {
    let rowY = y - 76;
    rankedHours.forEach((bucket) => {
      const ratio = Math.max(0, Math.min(1, bucket.value / maxValue));
      const barX = x + 118;
      const barW = width - 208;
      const barY = rowY - 7;
      const fillW = ratio > 0 ? Math.max(2, barW * ratio) : 0;
      const valueText = `${compactNumber(bucket.value)} commits`;
      const valueTextWidth = safeWidthOfText(boldFont, valueText, 8.5);

      page.drawText(bucket.label, {
        x: x + 14,
        y: rowY,
        size: 9.3,
        font: boldFont,
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
        x: x + width - valueTextWidth - 14,
        y: rowY - 0.3,
        size: 8.5,
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
  const rows = countAuthors(commits).slice(0, 3);
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  const width = maxWidth;
  const height = Math.max(150, 106 + rows.length * 18);

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

  const sourceY = rows.length
    ? Math.max(cardY + 10, y - 64 - rows.length * 23 - 4)
    : Math.max(cardY + 10, y - 108);

  drawChartSource({
    page,
    font,
    x,
    width,
    y: sourceY,
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

  const activeAuthors = new Set(
    commits
      .map((commit) => commit?.author?.login)
      .filter(Boolean)
  );

  const inactive = Array.from(allAuthorsMap.values()).filter((author) => !activeAuthors.has(author.login));
  const width = maxWidth;
  const height = Math.max(206, 132 + Math.max(1, inactive.length) * 20);

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

  page.drawText("Base de comparacion: autores detectados en commits analizados.", {
    x: x + 14,
    y: cardY + 24,
    size: 7.6,
    font,
    color: COLORS.muted,
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

async function drawCommitTableCard({ pdfDoc, page, element, x, y, maxWidth, commits = [] }) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const rows = buildContributorRows(commits);
  const width = maxWidth;
  const minCardHeight = 228;
  const baseHeight = 128;
  const blockGap = 24;
  const rowH = 17;
  const rowHeightForCard = 18;
  const tableX = x + 14;
  const tableW = width - 28;
  const colUserW = 96;
  const colEmailW = 146;
  const colCommitsW = 52;
  const colInactivityW = 64;
  const colPositionW = 46;
  const colActivityW = tableW - colUserW - colEmailW - colCommitsW - colInactivityW - colPositionW - 6;
  const baseTitle = element?.title || "Historial de Commits";
  const interval = element?.interval || "Periodo";

  const drawTableHeader = (targetPage, headerY) => {
    targetPage.drawRectangle({
      x: tableX,
      y: headerY - 12,
      width: tableW,
      height: 13,
      color: rgb(0.9, 0.95, 1),
      borderColor: COLORS.border,
      borderWidth: 0.7,
    });

    targetPage.drawText("Usuario", { x: tableX + 4, y: headerY - 8, size: 8, font: boldFont, color: COLORS.text });
    targetPage.drawText("Email", { x: tableX + colUserW + 4, y: headerY - 8, size: 8, font: boldFont, color: COLORS.text });
    targetPage.drawText("Commits", { x: tableX + colUserW + colEmailW + 4, y: headerY - 8, size: 8, font: boldFont, color: COLORS.text });
    targetPage.drawText("Inactividad", {
      x: tableX + colUserW + colEmailW + colCommitsW + 4,
      y: headerY - 8,
      size: 8,
      font: boldFont,
      color: COLORS.text,
    });
    targetPage.drawText("Posicion", {
      x: tableX + colUserW + colEmailW + colCommitsW + colInactivityW + 4,
      y: headerY - 8,
      size: 8,
      font: boldFont,
      color: COLORS.text,
    });
    targetPage.drawText("Actividad diaria", {
      x: tableX + colUserW + colEmailW + colCommitsW + colInactivityW + colPositionW + 4,
      y: headerY - 8,
      size: 8,
      font: boldFont,
      color: COLORS.text,
    });
  };

  const drawTableRows = (targetPage, headerY, chunkRows, globalOffset) => {
    let rowY = headerY - 26;
    chunkRows.forEach((row, idx) => {
      const globalIdx = globalOffset + idx;
      if (globalIdx % 2 === 0) {
        targetPage.drawRectangle({
          x: tableX,
          y: rowY - 3.5,
          width: tableW,
          height: rowH,
          color: rgb(0.985, 0.99, 1),
        });
      }

      const userText = truncateText(row.login, font, 7.7, colUserW - 8);
      const emailText = truncateText(row.email || "-", font, 7.7, colEmailW - 8);
      const commitsText = compactNumber(row.totalCommits);
      const inactivityText = truncateText(row.inactivity || "-", font, 7.7, colInactivityW - 8);
      const positionText = String(row.position || "-");

      const commitsX = tableX + colUserW + colEmailW + 4;
      const inactivityX = tableX + colUserW + colEmailW + colCommitsW + 4;
      const positionX = tableX + colUserW + colEmailW + colCommitsW + colInactivityW + 4;
      const sparkX = tableX + colUserW + colEmailW + colCommitsW + colInactivityW + colPositionW + 4;

      targetPage.drawText(userText, { x: tableX + 4, y: rowY, size: 7.7, font, color: COLORS.text });
      targetPage.drawText(emailText, { x: tableX + colUserW + 4, y: rowY, size: 7.7, font, color: COLORS.text });
      targetPage.drawText(commitsText, { x: commitsX, y: rowY, size: 7.7, font: boldFont, color: COLORS.text });
      targetPage.drawText(inactivityText, { x: inactivityX, y: rowY, size: 7.7, font, color: COLORS.text });
      targetPage.drawText(positionText, { x: positionX, y: rowY, size: 7.7, font: boldFont, color: COLORS.text });

      drawTinySparkBars({
        page: targetPage,
        font,
        x: sparkX,
        y: rowY - 1.5,
        width: Math.max(18, colActivityW - 8),
        height: 8.5,
        values: row.activityValues,
      });

      rowY -= rowH;
    });
  };

  const rowsThatFitInCurrentY = (currentY) => {
    const available = currentY - PAGE_BOTTOM_MARGIN - blockGap - baseHeight;
    return Math.max(1, Math.floor(available / rowHeightForCard));
  };

  let currentPage = page;
  let currentY = y;
  let drawn = 0;
  let section = 0;

  if (!rows.length) {
    const emptyHeight = minCardHeight;
    const emptySpace = ensureSpace(pdfDoc, currentPage, currentY, emptyHeight + blockGap);
    currentPage = emptySpace.page;
    currentY = emptySpace.y;
    const cardY = drawCardFrame(currentPage, x, currentY, width, emptyHeight);

    drawCardHeader({
      page: currentPage,
      x,
      y: currentY,
      width,
      title: baseTitle,
      interval,
      boldFont,
      font,
      totalText: `${compactNumber(commits.length)} commits`,
    });

    const headerY = currentY - 62;
    drawTableHeader(currentPage, headerY);

    const empty = "Sin colaboradores para mostrar";
    const emptyW = safeWidthOfText(font, empty, 10);
    currentPage.drawText(empty, {
      x: tableX + (tableW - emptyW) / 2,
      y: headerY - 42,
      size: 10,
      font,
      color: COLORS.muted,
    });

    drawChartSource({
      page: currentPage,
      font,
      x,
      width,
      y: cardY + 10,
      integrationData: element?.integration_data,
    });

    return { y: cardY - 20, page: currentPage };
  }

  while (drawn < rows.length) {
    const remaining = rows.length - drawn;
    let rowsInChunk = Math.min(remaining, rowsThatFitInCurrentY(currentY));
    let height = Math.max(minCardHeight, baseHeight + Math.max(1, rowsInChunk) * rowHeightForCard);

    while (currentY - (height + blockGap) < PAGE_BOTTOM_MARGIN) {
      currentPage = pdfDoc.addPage();
      currentY = currentPage.getHeight() - PAGE_TOP_MARGIN;
      rowsInChunk = Math.min(remaining, rowsThatFitInCurrentY(currentY));
      height = Math.max(minCardHeight, baseHeight + Math.max(1, rowsInChunk) * rowHeightForCard);
    }

    const cardY = drawCardFrame(currentPage, x, currentY, width, height);
    const title = section === 0 ? baseTitle : `${baseTitle} (continuacion ${section + 1})`;
    drawCardHeader({
      page: currentPage,
      x,
      y: currentY,
      width,
      title,
      interval,
      boldFont,
      font,
      totalText: `${compactNumber(commits.length)} commits`,
    });

    const headerY = currentY - 62;
    drawTableHeader(currentPage, headerY);

    const chunkRows = rows.slice(drawn, drawn + rowsInChunk);
    drawTableRows(currentPage, headerY, chunkRows, drawn);

    drawChartSource({
      page: currentPage,
      font,
      x,
      width,
      y: cardY + 10,
      integrationData: element?.integration_data,
    });

    drawn += chunkRows.length;
    section += 1;
    currentY = cardY - 20;
  }

  return { y: currentY, page: currentPage };
}

async function drawAuthorShareCard({ pdfDoc, page, element, x, y, maxWidth, commits = [] }) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const allRows = countAuthors(commits);
  const rows = allRows.slice(0, 10);
  const otherCount = allRows.slice(10).reduce((acc, row) => acc + row.value, 0);
  const total = allRows.reduce((acc, row) => acc + row.value, 0);
  const displayRows = [
    ...rows.map((row) => ({ name: row.name, value: row.value })),
    ...(otherCount > 0 ? [{ name: "Otros", value: otherCount }] : []),
  ];
  const visibleRows = displayRows.length;
  const width = maxWidth;
  const height = Math.max(250, 192 + Math.max(1, visibleRows) * 20);

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
    const centerX = x + width / 2;
    const centerY = y - 98;
    const outerRadius = 44;
    const innerRadius = 26;
    const separatorAngles = [];

    let angle = 0;
    displayRows.forEach((row, index) => {
      const value = toNumber(row.value);
      if (!total || value <= 0) return;
      const sweep = (value / total) * 360;
      if (sweep <= 0) return;
      drawDonutSlice({
        page,
        cx: centerX,
        cy: centerY,
        innerRadius,
        outerRadius,
        startAngle: angle,
        endAngle: angle + sweep,
        color: PIE_COLORS[index % PIE_COLORS.length],
      });
      angle += sweep;
      separatorAngles.push(angle);
    });

    const normalizedBoundaries = separatorAngles.map((boundaryAngle) => {
      const normalized = ((boundaryAngle % 360) + 360) % 360;
      return normalized;
    });
    if (displayRows.length > 1) normalizedBoundaries.push(0);

    const uniqueBoundaries = normalizedBoundaries
      .sort((a, b) => a - b)
      .filter((angleValue, index, arr) => {
        if (index === 0) return true;
        return Math.abs(angleValue - arr[index - 1]) > 0.15;
      });

    uniqueBoundaries.forEach((boundaryAngle) => {
      const innerPoint = pointOnCircle(centerX, centerY, Math.max(1, innerRadius - 0.8), boundaryAngle);
      const outerPoint = pointOnCircle(centerX, centerY, outerRadius + 0.8, boundaryAngle);
      page.drawLine({
        start: innerPoint,
        end: outerPoint,
        thickness: 2.2,
        color: rgb(1, 1, 1),
      });
    });

    page.drawCircle({
      x: centerX,
      y: centerY,
      size: innerRadius - 0.8,
      color: COLORS.bg,
    });

    let rowY = y - 156;
    displayRows.forEach((row, index) => {
      const pctRaw = total > 0 ? (row.value / total) * 100 : 0;
      const pctLabel = pctRaw < 10
        ? `${pctRaw.toLocaleString("es-BO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
        : `${Math.round(pctRaw)}%`;
      const name = truncateText(row.name, font, 9.1, 250);
      const valueText = `${compactNumber(row.value)} commits`;
      const rightText = `${pctLabel} | ${valueText}`;
      const rightWidth = safeWidthOfText(boldFont, rightText, 8.2);

      page.drawCircle({
        x: x + 18,
        y: rowY + 4,
        size: 3.3,
        color: PIE_COLORS[index % PIE_COLORS.length],
      });
      page.drawText(name, {
        x: x + 28,
        y: rowY,
        size: 9.1,
        font,
        color: COLORS.text,
      });
      page.drawText(rightText, {
        x: x + width - rightWidth - 14,
        y: rowY,
        size: 8.2,
        font: boldFont,
        color: COLORS.primary,
      });

      page.drawLine({
        start: { x: x + 14, y: rowY - 4 },
        end: { x: x + width - 14, y: rowY - 4 },
        thickness: 0.6,
        color: COLORS.lineGrid,
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

async function drawProjectRankingCard({
  pdfDoc,
  page,
  element,
  x,
  y,
  maxWidth,
  rows = [],
  title = "Ranking",
  metricLabel = "registros",
  getValue = () => 0,
  getDetail = null,
}) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const safeRows = (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      name: row?.projectName || row?.name || "Proyecto",
      value: toNumber(getValue(row)),
      detail: typeof getDetail === "function" ? getDetail(row) : "",
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const total = safeRows.reduce((acc, row) => acc + row.value, 0);
  const maxValue = Math.max(...safeRows.map((row) => row.value), 1);
  const width = maxWidth;
  const rowGap = 28;
  const detailOffsetY = 18;
  const height = Math.max(220, 128 + Math.max(1, safeRows.length) * rowGap);

  const space = ensureSpace(pdfDoc, page, y, height + 24);
  page = space.page;
  y = space.y;
  const cardY = drawCardFrame(page, x, y, width, height);

  drawCardHeader({
    page,
    x,
    y,
    width,
    title: element?.title || title,
    interval: element?.interval || "Periodo",
    boldFont,
    font,
    totalText: `${compactNumber(total)} ${metricLabel}`,
  });

  if (!safeRows.length) {
    const empty = "Sin datos para mostrar";
    const emptyW = safeWidthOfText(font, empty, 10);
    page.drawText(empty, {
      x: x + (width - emptyW) / 2,
      y: y - 96,
      size: 10,
      font,
      color: COLORS.muted,
    });
  } else {
    let rowY = y - 62;
    safeRows.forEach((row, index) => {
      const ratio = Math.max(0, Math.min(1, row.value / maxValue));
      const barX = x + 168;
      const barW = width - 186;
      const barY = rowY - 8.2;
      const fillW = ratio > 0 ? Math.max(2, barW * ratio) : 0;

      const rankText = `${index + 1}.`;
      const nameText = truncateText(row.name, font, 9.2, 128);
      const valueText = `${compactNumber(row.value)} ${metricLabel}`;
      const detailText = truncateText(row.detail || "", font, 7.8, barW);
      const valueWidth = safeWidthOfText(boldFont, valueText, 8.2);

      page.drawText(rankText, { x: x + 14, y: rowY, size: 9.2, font: boldFont, color: COLORS.text });
      page.drawText(nameText, { x: x + 30, y: rowY, size: 9.2, font, color: COLORS.text });

      page.drawRectangle({ x: barX, y: barY, width: barW, height: 6, color: COLORS.barTrack });
      page.drawRectangle({ x: barX, y: barY, width: fillW, height: 6, color: COLORS.primary });

      page.drawText(valueText, {
        x: x + width - valueWidth - 14,
        y: rowY,
        size: 8.2,
        font: boldFont,
        color: COLORS.text,
      });

      if (detailText) {
        page.drawText(detailText, {
          x: barX,
          y: rowY - detailOffsetY,
          size: 7.8,
          font,
          color: COLORS.muted,
        });
      }

      rowY -= rowGap;
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
  const rawItems = Array.isArray(element?.data) ? element.data : [];
  const period = element?.period || "all";
  const commits = filterItemsByPeriod(rawItems, period, (commit) => getCommitDate(commit));
  const pullRequests = filterItemsByPeriod(rawItems, period, (pr) => pr?.created_at);

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
        dateAccessor: (commit) => getCommitDate(commit),
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
      return drawSessionsScatterCard({
        pdfDoc,
        page,
        element,
        x,
        y,
        maxWidth,
        commits,
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
    case "overviewSocialReachRanking":
      return drawProjectRankingCard({
        pdfDoc,
        page,
        element,
        x,
        y,
        maxWidth,
        rows: rawItems,
        title: "Alcance en redes",
        metricLabel: "alcance",
        getValue: (row) => toNumber(row?.socialReach ?? 0),
        getDetail: (row) => `Facebook: ${compactNumber(row?.facebookReach ?? 0)} | Instagram: ${compactNumber(row?.instagramReach ?? 0)}`,
      });
    case "overviewCommitRanking":
      return drawProjectRankingCard({
        pdfDoc,
        page,
        element,
        x,
        y,
        maxWidth,
        rows: rawItems,
        title: "Ranking de commits",
        metricLabel: "commits",
        getValue: (row) => toNumber(row?.commits ?? 0),
      });
    default:
      return drawTimeSeriesCard({
        pdfDoc,
        page,
        element,
        x,
        y,
        maxWidth,
        items: commits,
        dateAccessor: (commit) => getCommitDate(commit),
        metricLabel: "registros",
      });
  }
}
