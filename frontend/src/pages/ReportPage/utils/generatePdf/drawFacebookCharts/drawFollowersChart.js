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

    const rawDates = data?.dates ?? [];
    const rawValues = data?.chartData ?? [];
    const total = data?.total ?? 0;
    const delta = data?.delta ?? 0;

    if (!rawDates.length || !rawValues.length) {
        return { y, page };
    }

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = page.getWidth();
    const chartWidth = Math.min(maxWidth, pageWidth * 0.75);
    const chartHeight = 200;

    const centerX = (pageWidth - chartWidth) / 2;
    let currentY = y;

    // =========================
    // 1️⃣ Title
    // =========================
    const titleSize = 16;
    const titleWidth = boldFont.widthOfTextAtSize(title, titleSize);

    page.drawText(title, {
        x: (pageWidth - titleWidth) / 2,
        y: currentY,
        size: titleSize,
        font: boldFont,
    });

    currentY -= 15;

    const intervalSize = 11;
    const intervalWidth = font.widthOfTextAtSize(interval, intervalSize);

    page.drawText(interval, {
        x: (pageWidth - intervalWidth) / 2,
        y: currentY,
        size: intervalSize,
        font,
        color: rgb(0.4, 0.4, 0.4),
    });

    currentY -= 8;

    // =========================
    // 2️⃣ Chart container
    // =========================
    const chartY = currentY - chartHeight;

    page.drawRectangle({
        x: centerX,
        y: chartY,
        width: chartWidth,
        height: chartHeight,
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 1,
    });

    // =========================
    // 3️⃣ Total + Delta dentro del chart
    // =========================
    const statsText = `Total: ${total}   |   Delta: ${delta}`;
    const statsSize = 11;
    const statsWidth = boldFont.widthOfTextAtSize(statsText, statsSize);

    page.drawText(statsText, {
        x: centerX + (chartWidth - statsWidth) / 2,
        y: chartY + chartHeight - 20,
        size: statsSize,
        font: boldFont,
    });

    // =========================
    // 3️⃣ Estado vacío
    // =========================
    if (total === 0) {
        const emptyText = "0 seguidores nuevos en este período";
        const size = 12;
        const textWidth = font.widthOfTextAtSize(emptyText, size);

        page.drawText(emptyText, {
            x: centerX + (chartWidth - textWidth) / 2,
            y: chartY + chartHeight / 2,
            size,
            font,
            color: rgb(0.5, 0.5, 0.5),
        });

        // =========================
        // 🔹 Fuente debajo del cuadro
        // =========================
        const platform = integration_data?.integration?.platform ?? "";
        const name = integration_data?.integration?.name ?? "";
        const projectName = integration_data?.project.name ?? "";
        const sourceText = `Fuente: ${platform} - ${name} / proyecto: ${projectName}`;
        const sourceSize = 9;
        const sourceWidth = font.widthOfTextAtSize(sourceText, sourceSize);

        const sourceY = chartY - 15; 

        page.drawText(sourceText, {
            x: (pageWidth - sourceWidth) / 2,
            y: sourceY,
            size: sourceSize,
            font,
            color: rgb(0.5, 0.5, 0.5),
        });

        return { y: sourceY - 20, page };
    }


    // =========================
    // 4️⃣ Agregación automática
    // =========================
    const aggregateData = (dates, values) => {
        if (dates.length <= 31) return { dates, values };

        const map = {};

        dates.forEach((date, i) => {
            const [day, month, year] = date.split("/");
            const key = `${month}/${year}`;

            if (!map[key]) map[key] = 0;
            map[key] += values[i];
        });

        return {
            dates: Object.keys(map),
            values: Object.values(map),
        };
    };

    const { dates, values } = aggregateData(rawDates, rawValues);

    // =========================
    // 5️⃣ Acumulado
    // =========================
    let acc = 0;
    const cumulative = values.map(v => {
        acc += v;
        return acc;
    });

    const padding = 40;
    const innerWidth = chartWidth - padding * 2;
    const innerHeight = chartHeight - padding * 2;

    const chartInnerX = centerX + padding;
    const chartInnerY = chartY + padding;

    const maxValue = Math.max(...cumulative);
    const minValue = 0;
    const valueRange = maxValue - minValue || 1;

    const stepX =
        cumulative.length > 1
            ? innerWidth / (cumulative.length - 1)
            : innerWidth;

    const scaleY = value =>
        chartInnerY + ((value - minValue) / valueRange) * innerHeight;

    // =========================
    // 6️⃣ Líneas guía + eje Y
    // =========================
    const ySteps = 5;

    for (let i = 0; i <= ySteps; i++) {
        const value = (valueRange / ySteps) * i;
        const yPos = chartInnerY + (innerHeight / ySteps) * i;

        page.drawLine({
            start: { x: chartInnerX, y: yPos },
            end: { x: chartInnerX + innerWidth, y: yPos },
            thickness: 0.5,
            color: rgb(0.9, 0.9, 0.9),
        });

        page.drawText(Math.round(value).toString(), {
            x: chartInnerX - 30,
            y: yPos - 4,
            size: 8,
            font,
            color: rgb(0.4, 0.4, 0.4),
        });
    }

    // Ejes principales
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
    // 7️⃣ Eje X (labels inteligentes)
    // =========================
    const maxLabels = 6;
    const labelStep = Math.max(1, Math.floor(dates.length / maxLabels));

    for (let i = 0; i < dates.length; i += labelStep) {
        const xPos = chartInnerX + i * stepX;

        page.drawText(dates[i], {
            x: xPos - 12,
            y: chartInnerY - 18,
            size: 7,
            font,
            color: rgb(0.4, 0.4, 0.4),
        });
    }

    // =========================
    // 8️⃣ Línea + puntos
    // =========================
    for (let i = 0; i < cumulative.length - 1; i++) {
        const x1 = chartInnerX + i * stepX;
        const y1 = scaleY(cumulative[i]);

        const x2 = chartInnerX + (i + 1) * stepX;
        const y2 = scaleY(cumulative[i + 1]);

        page.drawLine({
            start: { x: x1, y: y1 },
            end: { x: x2, y: y2 },
            thickness: 1.8,
            color: rgb(0.2, 0.45, 0.85),
        });

        page.drawCircle({
            x: x1,
            y: y1,
            size: 2,
            color: rgb(0.2, 0.45, 0.85),
        });
    }

    // último punto
    const lastX = chartInnerX + (cumulative.length - 1) * stepX;
    const lastY = scaleY(cumulative[cumulative.length - 1]);

    page.drawCircle({
        x: lastX,
        y: lastY,
        size: 2,
        color: rgb(0.2, 0.45, 0.85),
    });

    currentY = chartY - 15;

    // =========================
    // 9️⃣ Fuente
    // =========================
    const platform = integration_data?.integration?.platform ?? "";
    const name = integration_data?.integration?.name ?? "";
    const projectName = integration_data?.project.name ?? "";
    const sourceText = `Fuente: ${platform} - ${name} / proyecto: ${projectName}`;
    const sourceSize = 9;
    const sourceWidth = font.widthOfTextAtSize(sourceText, sourceSize);

    page.drawText(sourceText, {
        x: (pageWidth - sourceWidth) / 2,
        y: currentY,
        size: sourceSize,
        font,
        color: rgb(0.5, 0.5, 0.5),
    });

    return { y: currentY - 25, page };
};
