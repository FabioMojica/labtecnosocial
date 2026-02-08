import { rgb, StandardFonts } from 'pdf-lib';
import { formatDateParts } from '../../../../utils';

const HEADER_HEIGHT = 60;
const MARGIN_X = 10;
const DIVIDER_COLOR = rgb(1, 1, 1);
const DIVIDER_WIDTH = 1;
const DIVIDER_PADDING_Y = 5;
const TITLE_PADDING_X = 10;

const headerConfig = {
    backgroundColor: rgb(31 / 255, 125 / 255, 83 / 255),
    height: HEADER_HEIGHT,
    padding: 10,
    logo: {
        width: 100,
        height: 40,
        x: MARGIN_X,
        yOffset: 10
    },
    title: {
        fontSize: 25,
        color: rgb(1, 1, 1),
        xOffset: 0
    },
    metadata: {
        x: 400,
        width: 120,
        fontSizeTitle: 10,
        fontSizeDates: 8,
        lineHeight: 12,
        colorTitle: rgb(1, 1, 1),
        colorDates: rgb(241 / 255, 234 / 255, 234 / 255)
    }
};

const fitTitleFontSize = (text, font, maxWidth) => {
    let size = 25;
    const MIN_SIZE = 20;

    while (size > MIN_SIZE) {
        const w = font.widthOfTextAtSize(text, size);
        if (w <= maxWidth) return size;
        size -= 1;
    }

    return MIN_SIZE;
};

const wrapTitle = (text, font, fontSize, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        const w = font.widthOfTextAtSize(test, fontSize);

        if (w <= maxWidth) {
            current = test;
        } else {
            lines.push(current);
            current = word;
        }
    }

    if (current) lines.push(current);
    return lines;
};

const normalizeTitleLines = (lines) => {
    if (lines.length <= 2) return lines;
    return [lines[0], lines[1] + '…'];
};



export const drawHeader = async (pdfDoc, page, title, logoBytes) => {
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const metadataX = width - headerConfig.metadata.width - MARGIN_X;
    const metadataStartX = metadataX - 10;
    const logoEndX =
        headerConfig.logo.x + headerConfig.logo.width + 10;
    const titleAreaStartX = logoEndX + TITLE_PADDING_X;
    const titleAreaEndX = metadataStartX - TITLE_PADDING_X;
    const titleAreaWidth = titleAreaEndX - titleAreaStartX;
    const titleFontSize = fitTitleFontSize(title, font, titleAreaWidth);
    let lines = wrapTitle(title, font, titleFontSize, titleAreaWidth);
    lines = normalizeTitleLines(lines);
    const totalHeight = lines.length * titleFontSize;
    // let y =
    //     height - HEADER_HEIGHT / 2 + totalHeight / 2 - titleFontSize;
    let y =
        height - HEADER_HEIGHT / 2
        + totalHeight / 2
        - titleFontSize
        + 6;

    const date = new Date();
    let metaY = height - HEADER_HEIGHT + HEADER_HEIGHT / 2;

    const dateStr = `${formatDateParts(date).date}`;
    const timeStr = `${formatDateParts(date).time}`;

    page.drawRectangle({
        x: 0,
        y: height - HEADER_HEIGHT,
        width,
        height: HEADER_HEIGHT,
        color: headerConfig.backgroundColor
    });

    if (logoBytes) {
        const logoImage = await pdfDoc.embedPng(logoBytes);
        page.drawImage(logoImage, {
            x: headerConfig.logo.x,
            y: height - HEADER_HEIGHT + headerConfig.logo.yOffset,
            width: headerConfig.logo.width,
            height: headerConfig.logo.height
        });
    }

    page.drawLine({
        start: {
            x: logoEndX,
            y: height - HEADER_HEIGHT + DIVIDER_PADDING_Y,
        },
        end: {
            x: logoEndX,
            y: height - DIVIDER_PADDING_Y,
        },
        thickness: DIVIDER_WIDTH,
        color: DIVIDER_COLOR,
    });


    lines.forEach(line => {
        const lineWidth = font.widthOfTextAtSize(line, titleFontSize);
        const x =
            titleAreaStartX +
            (titleAreaWidth - lineWidth) / 2;

        page.drawText(line, {
            x,
            y,
            size: titleFontSize,
            font,
            color: rgb(1, 1, 1),
        });

        y -= titleFontSize;
    });

    page.drawLine({
        start: {
            x: metadataStartX,
            y: height - HEADER_HEIGHT + DIVIDER_PADDING_Y,
        },
        end: {
            x: metadataStartX,
            y: height - DIVIDER_PADDING_Y,
        },
        thickness: DIVIDER_WIDTH,
        color: DIVIDER_COLOR,
    });

    page.drawText("Datos de generación:", {
        x: metadataX,
        y: metaY + 15,
        size: headerConfig.metadata.fontSizeTitle,
        font,
        color: headerConfig.metadata.colorTitle
    });

    page.drawText(`Fecha: ${dateStr}`, {
        x: metadataX,
        y: metaY,
        size: headerConfig.metadata.fontSizeDates,
        font,
        color: headerConfig.metadata.colorDates
    });

    page.drawText(`Hora: ${timeStr}`, {
        x: metadataX,
        y: metaY - 12,
        size: headerConfig.metadata.fontSizeDates,
        font,
        color: headerConfig.metadata.colorDates
    });

    return height - HEADER_HEIGHT - 20;
};
