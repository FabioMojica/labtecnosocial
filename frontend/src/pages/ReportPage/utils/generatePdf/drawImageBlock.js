import { rgb } from "pdf-lib";
import { PdfRenderError } from "../pdfWorker";
import { PAGE_MARGIN_BOTTOM, PAGE_MARGIN_TOP } from "./generatePdf";
const MAX_DIM = 400;

export const svgToPngArrayBuffer = async (svgString, width, height) => {
    try {
        const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
        const svgUrl = URL.createObjectURL(svgBlob);

        const img = await new Promise((res, rej) => {
            const image = new Image();
            image.onload = () => res(image);
            image.onerror = (e) => rej(e);
            image.src = svgUrl;
        });

        // --- ajustar dimensiones si superan MAX_DIM ---
        const aspectRatio = img.width / img.height;
        let finalWidth = width;
        let finalHeight = height;

        if (width > MAX_DIM || height > MAX_DIM) {
            if (aspectRatio > 1) {
                finalWidth = MAX_DIM;
                finalHeight = Math.round(MAX_DIM / aspectRatio);
            } else {
                finalHeight = MAX_DIM;
                finalWidth = Math.round(MAX_DIM * aspectRatio);
            }
        }

        const canvas = document.createElement("canvas");
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

        const pngBlob = await new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) reject(new Error("Failed to convert SVG to PNG"));
                else resolve(blob);
            }, "image/png");
        });

        return await pngBlob.arrayBuffer();
    } catch (err) {
        console.error("Error converting SVG to PNG:", err);
        throw new PdfRenderError(
            "SVG_CONVERSION_ERROR",
            "Failed to convert SVG to PNG",
            { originalError: err }
        );
    }
};


/**
 * Obtiene los bytes de una imagen desde URL y lanza error si falla
 */
export const fetchImageBytes = async (url) => {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new PdfRenderError(
                "IMAGE_FETCH_ERROR",
                `Error fetching image: HTTP ${res.status}`,
                { url }
            );
        }
        return await res.arrayBuffer();
    } catch (err) {
        console.log("erorr", err)
        throw new PdfRenderError("IMAGE_FETCH_ERROR", "Failed to fetch image", {
            url,
            originalError: err,
        });
    }
};

/**
 * Embeds any image type in pdf-lib by convirtiendo a PNG si es necesario
 */
export const fetchAndEmbedImage = async (pdfDoc, src) => {
    try {
        const imageBytes = await fetchImageBytes(src);
        console.log("im bytes", imageBytes)

        if (!imageBytes) return null;

        if (src.endsWith(".png")) {
            return await pdfDoc.embedPng(imageBytes);
        } else if (src.endsWith(".jpg") || src.endsWith(".jpeg")) {
            return await pdfDoc.embedJpg(imageBytes);
        } else if (src.endsWith(".svg")) {
            const arrayBuffer = await svgToPngArrayBuffer(await (await fetch(src)).text(), 500, 300);
            return await pdfDoc.embedPng(arrayBuffer);
        } else {
            const blob = new Blob([imageBytes]);
            const bitmap = await createImageBitmap(blob);

            console.log("blob", blob)
            console.log("bitmap", bitmap)

            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            console.log("canvas", canvas)
            const ctx = canvas.getContext("2d");
            ctx.drawImage(bitmap, 0, 0);

            const pngBlob = await canvas.convertToBlob({ type: "image/png" });
            const arrayBuffer = await pngBlob.arrayBuffer();

            console.log("array buffer", arrayBuffer)

            return await pdfDoc.embedPng(arrayBuffer);
        }
    } catch (err) {
        console.error("Error embedding image:", src, err);
        throw new PdfRenderError("IMAGE_EMBED_ERROR", "Failed to embed image", {
            src,
            originalError: err,
        });
    }
};

export const drawImageBlock = async ({ pdfDoc, page, src, width, height, maxWidth, y }) => {
    try {
        const embeddedImage = await fetchAndEmbedImage(pdfDoc, src);
        if (!embeddedImage) throw new PdfRenderError("IMAGE_EMBED_ERROR", `Failed to embed image: ${src}`);

        // --- limitar dimensiones si supera MAX_DIM ---
        const aspectRatio = width / height;
        let displayWidth = width;
        let displayHeight = height;

        if (width > MAX_DIM || height > MAX_DIM) {
            if (aspectRatio > 1) {
                displayWidth = MAX_DIM;
                displayHeight = Math.round(MAX_DIM / aspectRatio);
            } else {
                displayHeight = MAX_DIM;
                displayWidth = Math.round(MAX_DIM * aspectRatio);
            }
        }

        // --- Asegurar espacio en la página ---
        while (y - displayHeight - 20 <= PAGE_MARGIN_BOTTOM) {
            const newPage = pdfDoc.addPage();
            y = newPage.getSize().height - PAGE_MARGIN_TOP;
            page = newPage;
        }

        const drawX = (page.getWidth() - displayWidth) / 2;
        const drawY = y - displayHeight;

        // --- Dibujar borde gris suave de 1px ---
        page.drawRectangle({
            x: drawX - 1,
            y: drawY - 1,
            width: displayWidth + 2,
            height: displayHeight + 2,
            borderColor: rgb(0.7, 0.7, 0.7),
            borderWidth: 1,
        });

        // --- Dibujar la imagen ---
        page.drawImage(embeddedImage, {
            x: drawX,
            y: drawY,
            width: displayWidth,
            height: displayHeight,
        });

        return { y: drawY - 20, page };
    } catch (err) {
        console.error("PDF image error:", src, err);
        throw new PdfRenderError("IMAGE_DRAW_ERROR", `Error drawing image in PDF: ${src}`, {
            originalError: err,
        });
    }
};
