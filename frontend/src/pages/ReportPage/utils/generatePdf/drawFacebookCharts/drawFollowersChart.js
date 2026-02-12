import { rgb, StandardFonts } from "pdf-lib";

export const drawFollowersChart = async ({
  pdfDoc,
  page,
  element,
  x,
  y,
  maxWidth,
}) => {
  const { title, interval, data, integration_data } = element;

  const dates = data?.dates ?? [];
  const daily = data?.chartData ?? [];

  if (!dates.length || !daily.length) {
    return { y, page };
  }

  // =========================
  // 1️⃣ Calcular acumulado
  // =========================
  let acc = 0;
  const cumulative = daily.map(v => {
    acc += v;
    return acc;
  });

  const pageWidth = page.getWidth();

  const chartWidth = Math.min(maxWidth, pageWidth * 0.75);
  const chartHeight = 180;

  const centerX = (pageWidth - chartWidth) / 2;
  let currentY = y;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // =========================
  // 2️⃣ Title
  // =========================
  const titleSize = 16;
  const titleWidth = boldFont.widthOfTextAtSize(title, titleSize);

  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y: currentY,
    size: titleSize,
    font: boldFont,
  });

  currentY -= 20;

  // =========================
  // 3️⃣ Interval
  // =========================
  const intervalSize = 11;
  const intervalWidth = font.widthOfTextAtSize(interval, intervalSize);

  page.drawText(interval, {
    x: (pageWidth - intervalWidth) / 2,
    y: currentY,
    size: intervalSize,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  currentY -= 25;

  // =========================
  // 4️⃣ Chart container (1px border)
  // =========================
  const chartY = currentY - chartHeight;

  page.drawRectangle({
    x: centerX,
    y: chartY,
    width: chartWidth,
    height: chartHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  // Padding interno
  const padding = 30;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  const chartInnerX = centerX + padding;
  const chartInnerY = chartY + padding;

  // =========================
  // 5️⃣ Escalado
  // =========================
  const maxValue = Math.max(...cumulative);
  const minValue = Math.min(...cumulative);

  const valueRange = maxValue - minValue || 1;

  const stepX = innerWidth / (cumulative.length - 1);

  const scaleY = value =>
    chartInnerY + ((value - minValue) / valueRange) * innerHeight;

  // =========================
  // 6️⃣ Dibujar ejes
  // =========================
  page.drawLine({
    start: { x: chartInnerX, y: chartInnerY },
    end: { x: chartInnerX, y: chartInnerY + innerHeight },
    thickness: 1,
  });

  page.drawLine({
    start: { x: chartInnerX, y: chartInnerY },
    end: { x: chartInnerX + innerWidth, y: chartInnerY },
    thickness: 1,
  });

  // =========================
  // 7️⃣ Dibujar línea
  // =========================
  for (let i = 0; i < cumulative.length - 1; i++) {
    const x1 = chartInnerX + i * stepX;
    const y1 = scaleY(cumulative[i]);

    const x2 = chartInnerX + (i + 1) * stepX;
    const y2 = scaleY(cumulative[i + 1]);

    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 1.5,
      color: rgb(0.2, 0.4, 0.8),
    });
  }

  currentY = chartY - 25;

  // =========================
  // 8️⃣ Fuente centrada
  // =========================
  const platform = integration_data?.integration?.platform;
  const name = integration_data?.integration?.name;

  const sourceText = `Fuente: ${platform} - ${name}`;

  const sourceSize = 10;
  const sourceWidth = font.widthOfTextAtSize(sourceText, sourceSize);

  page.drawText(sourceText, {
    x: (pageWidth - sourceWidth) / 2,
    y: currentY,
    size: sourceSize,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return { y: currentY - 20, page };
};
