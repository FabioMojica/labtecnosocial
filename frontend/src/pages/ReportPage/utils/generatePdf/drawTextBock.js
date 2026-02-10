import { rgb, StandardFonts } from 'pdf-lib';
import { parseDocument } from "htmlparser2";
import { DomUtils } from "htmlparser2";
import { PdfRenderError } from '../pdfWorker';
import { decode } from "entities";
import { ensurePageSpace } from './generatePdf';

const MAX_LIST_DEPTH = 10;

const BLOCK_STYLES = {
    p: {
        fontSize: 11,
        lineHeight: 14,
        marginBottom: 6,
        font: "regular",
    },
    h1: {
        fontSize: 24,
        lineHeight: 30,
        marginBottom: 4,
        marginTop: 4,
        font: "bold",
    },
    h2: {
        fontSize: 20,
        lineHeight: 26,
        marginBottom: 4,
        marginTop: 4,
        font: "bold",
    },
    h3: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 4,
        marginTop: 4,
        font: "bold",
    },
};

const safeDrawText = (page, text, options) => {
    if (!page) {
        throw new PdfRenderError("PDF_NO_PAGE", "Página PDF inexistente");
    }

    if (typeof text !== "string") {
        throw new PdfRenderError("PDF_TEXT_NOT_STRING", "Texto inválido", { text });
    }

    try {
        page.drawText(text, options);
    } catch (err) {
        throw new PdfRenderError(
            "PDF_DRAW_TEXT_LIB_ERROR",
            "pdf-lib falló al dibujar texto",
            {
                text,
                options,
                originalError: err?.message,
            }
        );
    }
};


const safeDrawLine = (page, line) => {
    try {
        page.drawLine(line);
    } catch (err) {
        throw new PdfRenderError(
            "PDF_DRAW_LINE_ERROR",
            "Error dibujando línea",
            {
                line,
                originalError: err?.message,
            }
        );
    }
};


const safeTextWidth = (font, text, size) => {
    try {
        return font.widthOfTextAtSize(text, size);
    } catch {
        throw new PdfRenderError(
            "PDF_TEXT_WIDTH_ERROR",
            "Error midiendo ancho de texto",
            { text }
        );
    }
};

const sanitizeText = (text) => {
    if (!text) return "";
    return text
        .replace(/\t/g, "    ")
        .replace(/\u00A0/g, " ")
        .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u00FF]/g, "?");
};

const decodeHtmlEntities = (text) => {
    if (!text) return "";
    return decode(text);
};

const safeForPdf = (text) => {
    try {
        const decoded = decodeHtmlEntities(text);
        return sanitizeText(decoded);
    } catch (err) {
        throw new PdfRenderError(
            "PDF_SANITIZE_FAILED",
            "No se pudo sanitizar el texto para PDF",
            { text }
        );
    }
};


const wrapText = (text, font, fontSize, maxWidth) => {
    if (!text) return [];

    const safeText = safeForPdf(text);

    const lines = [];
    let currentLine = "";
    let currentWidth = 0;

    for (const char of safeText) {
        let charWidth;
        try {
            charWidth = safeTextWidth(font, char, fontSize);
        } catch (err) {
            throw new PdfRenderError(
                "PDF_FONT_MEASURE_ERROR",
                `No se pudo medir carácter "${char}"`,
                { char }
            );
        }

        if (currentWidth + charWidth > maxWidth) {
            if (currentLine) lines.push(currentLine);
            currentLine = char;
            currentWidth = charWidth;
        } else {
            currentLine += char;
            currentWidth += charWidth;
        }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
};

const getNumberedBullet = (counters, level) => {
    const numbers = counters.slice(0, level + 1);
    return numbers.join(".") + ".";
};


const getIndentLevel = (node) => {
    const cls = node.attribs?.class || "";
    return parseInt((cls.match(/ql-indent-(\d)/) || [0, 0])[1]);
};

const getTextAlign = (node) => {
    const cls = node.attribs?.class || "";
    if (cls.includes("ql-align-center")) return "center";
    if (cls.includes("ql-align-right")) return "right";
    if (cls.includes("ql-align-justify")) {
        return "justify"
    };
    return "left";
};

const renderList = async ({
    pdfDoc,
    node,
    cursor,
    fonts,
    maxWidth,
    parentCounters = [],
    baseIndent = 0,
    style = BLOCK_STYLES.p,
}) => {
    if (!node.children) return cursor;

    if (parentCounters.length > MAX_LIST_DEPTH) {
        throw new PdfRenderError(
            "PDF_MAX_LIST_DEPTH",
            "La lista excede la profundidad máxima permitida",
            { depth: parentCounters.length }
        );
    }

    let counters = [...parentCounters];

    for (const liNode of node.children) {
        if (liNode.type !== "tag" || liNode.name !== "li") continue;
        const level = getIndentLevel(liNode);
        const indent = baseIndent + 15 * (level + 1);
        if (counters[level] == null) counters[level] = 0;
        counters[level]++;
        for (let i = level + 1; i < counters.length; i++) {
            counters[i] = 0;
        }
        counters.length = level + 1;

        const isOrdered = liNode.attribs?.["data-list"] === "ordered";
        const bullet = isOrdered ? getNumberedBullet(counters, level) : "•";
        const bulletSpacing = 5;
        const bulletSize = style.fontSize ?? BLOCK_STYLES.p.fontSize;
        const bulletWidth = safeTextWidth(fonts.regular, bullet, bulletSize);

        const align = getTextAlign(liNode);

        // --- recoger fragments del LI ---
        const fragments = [];
        const collectFragments = (n, underline = false, italic = false, link = false, bold = false) => {
            n = cleanNode(n);
            if (!n) return;
            if (n.type === "text") {
                fragments.push({
                    text: safeForPdf(n.data),
                    isUnderline:
                        underline,
                    isItalic: italic,
                    isLink: link,
                    isBold:
                        bold
                });
            } else if (n.type === "tag") {
                let u = underline || n.name === "u";
                let i = italic || n.name === "i" || n.name === "em";
                let l = link || n.name === "a";
                const b = bold || n.name === "strong" || n.name === "b";
                for (const child of n.children || []) collectFragments(child, u, i, l, b);
            }
        };
        for (const child of liNode.children || []) {
            if (child.name !== "ul" && child.name !== "ol") collectFragments(child);
        }

        // --- renderizar fragments como bloque ---
        let fullText = fragments.map(f => f.text).join("");
        const font = fonts[style.font] || fonts.regular;
        const fontSize = style.fontSize;
        const lineHeight = style.lineHeight;

        if (!fullText.trim()) {
            fragments.push({ text: " ", isUnderline: false, isItalic: false, isLink: false, isBold: false });
            fullText = " ";
        }

        // --- wrap text ---
        const lines = wrapText(fullText, font, fontSize, maxWidth - indent - bulletWidth - bulletSpacing);

        let charIndex = 0;
        for (const line of lines) {
            ensurePageSpace({ pdfDoc, cursor });
            let lineRemaining = line;

            const lineTextWidth = safeTextWidth(font, bullet, bulletSize);
            const totalLineWidth = bulletWidth + bulletSpacing + lineTextWidth;

            // 2️⃣ Ajustamos posición inicial según align
            let lineX = cursor.x + indent;
            if (align === "center") lineX += (maxWidth - indent - totalLineWidth) / 2;
            if (align === "right") lineX += (maxWidth - indent - totalLineWidth);

            // 3️⃣ Dibujar bullet
            safeDrawText(
                cursor.page,
                bullet,
                { x: lineX, y: cursor.y, size: bulletSize, font: fonts.regular }
            );


            lineX += bulletWidth + bulletSpacing;

            // 4️⃣ Dibujar texto
            while (lineRemaining.length > 0 && charIndex < fragments.length) {
                const frag = fragments[charIndex];
                const fragText = frag.text.slice(0, lineRemaining.length);
                const fragFont = frag.isBold
                    ? frag.isItalic ? fonts.boldItalic : fonts.bold
                    : frag.isItalic ? fonts.italic : font;

                drawTextFragment({
                    cursor,
                    text: fragText,
                    x: lineX,
                    y: cursor.y,
                    font: fragFont,
                    fontSize,
                    align: "left",
                    isUnderline: frag.isUnderline,
                    isLink: frag.isLink,
                    isBold: frag.isBold,
                    maxWidth: maxWidth - indent - bulletWidth - bulletSpacing
                });

                const effectiveFont = frag.isItalic ? fonts.italic : fonts.regular;
                const fragWidth = safeTextWidth(effectiveFont, fragText, fontSize);
                lineX += fragWidth;

                lineRemaining = lineRemaining.slice(fragText.length);
                frag.text = frag.text.slice(fragText.length);
                if (frag.text.length === 0) charIndex++;
            }

            cursor.y -= lineHeight;
        }

        cursor.y -= style.marginBottom;

        // --- sublistas ---
        const sublist = liNode.children?.find(n => n.name === "ul" || n.name === "ol");
        if (sublist) {
            cursor = await renderList({
                pdfDoc,
                node: sublist,
                cursor,
                fonts,
                maxWidth,
                parentCounters: [...counters],
                baseIndent: indent,
                style,
            });
        }
    }

    return cursor;
};



const cleanNode = (node) => {
    if (!node) return null;
    if (node.type === "tag" && node.name === "span" && node.attribs?.class === "ql-ui") return null;
    return node;
};

const drawAlignedText = ({
    cursor,
    text,
    x,
    y,
    maxWidth,
    font,
    fontSize = 11,
    align = "left",
    color = rgb(0, 0, 0)
}) => {
    const safeText = safeForPdf(text);
    if (!safeText) return;

    // ---------- JUSTIFY ----------
    if (align === "justify") {
        const words = safeText.split(" ");
        if (words.length <= 1) {
            safeDrawText(
                cursor.page,
                safeText,
                { x, y, size: fontSize, font, color: color ?? rgb(0, 0, 0) }
            );
            return;
        }

        // ancho total sin espacios
        let wordsWidth = 0;
        for (const w of words) {
            wordsWidth += safeTextWidth(font, w, fontSize);
        }
        const spaceCount = words.length - 1;
        const extraSpace = maxWidth - wordsWidth;
        if (extraSpace <= 0) {
            safeDrawText(
                cursor.page,
                safeText,
                { x, y, size: fontSize, color: color ?? rgb(0, 0, 0) }
            );

            return;
        }

        const spaceWidth = extraSpace / spaceCount;

        let cursorX = x;

        for (const word of words) {
            safeDrawText(
                cursor.page,
                word,
                {
                    x: cursorX,
                    y,
                    size: fontSize,
                    font,
                    color: color ?? rgb(0, 0, 0),
                }
            );

            cursorX += safeTextWidth(font, word, fontSize); + spaceWidth;
        }

        return;
    }

    let textWidth;

    textWidth = safeTextWidth(font, safeText, fontSize);


    let drawX = x;

    if (align === "center") {
        drawX = x + (maxWidth - textWidth) / 2;
    }

    if (align === "right") {
        drawX = x + maxWidth - textWidth;
    }

    safeDrawText(
        cursor.page,
        safeText,
        {
            x: drawX,
            y,
            size: fontSize,
            font,
            color,
        }
    );
};


const drawTextFragment = ({ cursor, text, x, y, font, fontSize, align, isUnderline, isLink, maxWidth }) => {
    const safeText = safeForPdf(text);
    if (!safeText) return;

    const color = isLink ? rgb(0, 0, 1) : rgb(0, 0, 0);

    try {
        drawAlignedText({ cursor, text: safeText, x, y, maxWidth, font, fontSize, align, color });
    } catch (e) {
        throw new PdfRenderError(
            "PDF_DRAW_TEXT_ERROR",
            "Error al dibujar fragmento de texto",
            { text: safeText }
        );
    }

    const textWidth = font.widthOfTextAtSize(safeText, fontSize);
    let drawX = x;

    if (align === "center") drawX += (maxWidth - textWidth) / 2;
    if (align === "right") drawX += maxWidth - textWidth;

    if (isUnderline) {
        safeDrawLine(
            cursor.page,
            {
                start: { x: drawX, y: cursor.y - 2 },
                end: { x: drawX + textWidth, y: cursor.y - 2 },
                thickness: 0.5,
                color: rgb(0, 0, 0),
            }
        );

    }

    if (isLink) {
        safeDrawLine(
            cursor.page,
            {
                start: { x: drawX, y: cursor.y - 2 },
                end: { x: drawX + textWidth, y: cursor.y - 2 },
                thickness: 0.5,
                color: rgb(0, 0, 1),
            }
        );
    }
};


const renderNode = async ({
    pdfDoc,
    node,
    cursor,
    fonts,
    maxWidth,
    indent = 0,
    style = BLOCK_STYLES.p,
    align = "left",
    isUnderline = false,
    isItalic = false,
    isLink = false
}) => {
    node = cleanNode(node);
    if (!node) return cursor;
    if (node.type === "text") {
        const font = isItalic ? fonts.italic : fonts[style.font] || fonts.regular;
        const fontSize = style.fontSize;
        const lineHeight = style.lineHeight;

        drawTextFragment({
            cursor,
            text: node.data,
            x: cursor.x + indent,
            y: cursor.y,
            font: font,
            fontSize,
            align,
            isUnderline,
            isLink,
            maxWidth: maxWidth - indent
        });
        return cursor;
    }

    if (node.type !== "tag") return cursor;

    switch (node.name) {
        case "ul":
        case "ol":
            return await renderList({
                pdfDoc,
                node,
                cursor,
                fonts,
                maxWidth,
                parentCounters: [],
                baseIndent: indent,
                style,
                isUnderline,
                isItalic,
                isLink,
            });

        case "li":
            for (const child of node.children || []) {
                cursor = await renderNode({
                    pdfDoc,
                    node: child,
                    cursor,
                    fonts,
                    maxWidth,
                    indent,
                    align,
                    isUnderline,
                    isItalic,
                    isLink,
                });
            }
            return cursor;

        case "a":
            for (const child of node.children || []) {
                cursor = await renderNode({
                    pdfDoc,
                    node: child,
                    cursor,
                    fonts,
                    maxWidth,
                    indent,
                    align: getTextAlign(node),
                    isUnderline,
                    isItalic,
                    isLink: true,
                });
            }
            return cursor;

        case "u":
            for (const child of node.children || []) {
                cursor = await renderNode({
                    pdfDoc,
                    node: child,
                    cursor,
                    fonts,
                    maxWidth,
                    indent,
                    style,
                    align,
                    isUnderline: true,
                    isItalic,
                    isLink
                });
            }
            return cursor;

        case "em":
        case "i":
            for (const child of node.children || []) {
                cursor = await renderNode({
                    pdfDoc,
                    node: child,
                    cursor,
                    fonts,
                    maxWidth,
                    indent,
                    style,
                    align,
                    isItalic: true,
                    isUnderline,
                    isLink
                });
            }
            return cursor;

        case "p":
        case "h1":
        case "h2":
        case "h3": {
            const blockStyle = BLOCK_STYLES[node.name];
            const blockAlign = getTextAlign(node);

            const fragments = [];
            const collectFragments = (n, underline = false, italic = false, link = false, bold = false) => {
                n = cleanNode(n);
                if (!n) return;

                if (n.type === "text") {
                    fragments.push({
                        text: safeForPdf(n.data),
                        isUnderline: underline,
                        isItalic: italic,
                        isLink: link,
                        isBold: bold,
                    });
                } else if (n.type === "tag") {
                    let u = underline || n.name === "u";
                    let i = italic || n.name === "i" || n.name === "em";
                    let l = link || n.name === "a";
                    const b = bold || n.name === "strong" || n.name === "b";
                    for (const child of n.children || []) {
                        collectFragments(child, u, i, l, b);
                    }
                }
            };

            for (const child of node.children || []) {
                collectFragments(child);
            }

            // 2️⃣ Concatenar todo el texto para wrapText
            const fullText = fragments.map(f => f.text).join("");

            const font = fonts[blockStyle.font] || fonts.regular;
            const fontSize = blockStyle.fontSize;
            const lineHeight = blockStyle.lineHeight;

            const lines = wrapText(fullText, font, fontSize, maxWidth - indent);

            // 3️⃣ Dibujar cada línea real
            let charIndex = 0;
            for (const line of lines) {
                ensurePageSpace({ pdfDoc, cursor });
                let lineRemaining = line;
                let lineX = cursor.x + indent;
                while (lineRemaining.length > 0 && charIndex < fragments.length) {
                    const frag = fragments[charIndex];
                    const fragText = frag.text.slice(0, lineRemaining.length);
                    const fragFont = frag.isBold
                        ? frag.isItalic ? fonts.boldItalic : fonts.bold
                        : frag.isItalic ? fonts.italic : font;

                    drawTextFragment({
                        cursor,
                        text: fragText,
                        x: lineX,
                        y: cursor.y,
                        font: fragFont,
                        fontSize,
                        align: blockAlign,
                        isUnderline: frag.isUnderline,
                        isLink: frag.isLink,
                        isBold: frag.isBold,
                        maxWidth: maxWidth - indent
                    });

                    const effectiveFont = frag.isBold
                        ? frag.isItalic ? fonts.boldItalic : fonts.bold
                        : frag.isItalic ? fonts.italic : font;

                    const fragWidth = safeTextWidth(effectiveFont, fragText, fontSize);
                    lineX += fragWidth;

                    lineRemaining = lineRemaining.slice(fragText.length);
                    frag.text = frag.text.slice(fragText.length);
                    if (frag.text.length === 0) charIndex++;
                }


                cursor.y -= lineHeight; // ✅ solo al final de línea real
            }

            cursor.y -= blockStyle.marginBottom;
            return cursor;
        }


        default:
            cursor.y -= 12
            return cursor;

    }
};

export const renderQuillHTML = async ({
    pdfDoc,
    page,
    html,
    x,
    y,
    maxWidth,
}) => {
    let doc;
    try {
        doc = parseDocument(html || "");
    } catch {
        throw new PdfRenderError(
            "PDF_HTML_PARSE_ERROR",
            "El HTML del documento es inválido",
            { html }
        );
    }

    let fonts;
    try {
        fonts = {
            regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
            bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
            italic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
            boldItalic: await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique),
        };
    } catch {
        throw new PdfRenderError(
            "PDF_FONT_EMBED_ERROR",
            "No se pudieron cargar las fuentes del PDF"
        );
    }

    const cursor = {
        x,
        y,
        page,
    };

    for (const node of doc.children) {
        try {
            await renderNode({
                pdfDoc,
                node,
                cursor,
                fonts,
                maxWidth,
            });
        } catch (error) {
            console.error("REAL ERROR:", error);
            throw new PdfRenderError(
                "PDF_RENDER_NODE_ERROR",
                "Error renderizando nodo HTML",
                { nodeType: node?.type, nodeName: node?.name, data: node?.data }
            );
        }
    }
    return { y: cursor.y, page: cursor.page };
};

export const drawTextBlock = async ({
    pdfDoc,
    page,
    content_html,
    x,
    y,
    maxWidth,
}) => {
    const finalY = await renderQuillHTML({
        pdfDoc,
        page,
        html: content_html,
        x,
        y,
        maxWidth,
    });

    return finalY;
};


