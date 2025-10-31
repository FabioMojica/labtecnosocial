// utils/exportStrategicPlanPDF.js
import jsPDF from "jspdf";
import "jspdf-autotable";
const baseUrl = import.meta.env.VITE_BASE_URL;

/**
 * Genera un PDF jerárquico y visualmente atractivo del plan estratégico.
 * Incluye misión, objetivos, indicadores, programas y proyectos (con imágenes).
 */
export const exportStrategicPlanPDF = async (data, year) => {
    if (!data) {
        console.error("No hay datos para exportar.");
        return;
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    let y = 70;

    const checkPageSpace = (extraHeight = 0) => {
        if (y + extraHeight > pageHeight - 80) {
            doc.addPage();
            y = 70;
        }
    };

    // === ENCABEZADO ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Plan Estratégico del año ${year ? `(${year})` : ""}`, pageWidth / 2, y, {
        align: "center",
    });
    y += 25;
    doc.setDrawColor(60, 120, 216);
    doc.line(margin, y, pageWidth - margin, y);
    y += 30;

    // === MISIÓN ===
    if (data.mission) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Misión:", margin, y);
        y += 20;

        doc.setFont("times", "normal");
        doc.setFontSize(12);
        const missionText = doc.splitTextToSize(data.mission, pageWidth - margin * 2);
        checkPageSpace(missionText.length * 14);
        doc.text(missionText, margin, y, { align: "justify", maxWidth: pageWidth - margin * 2 });
        y += missionText.length * 14 + 20;
    }

    // === OBJETIVOS ===
    if (data.objectives?.length) {
        for (let i = 0; i < data.objectives.length; i++) {
            const obj = data.objectives[i];

            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            checkPageSpace(40);
            doc.text(`Objetivo ${i + 1}:`, margin, y);
            y += 16;

            doc.setFont("times", "normal");
            doc.setFontSize(12);
            const objText = doc.splitTextToSize(obj.objectiveTitle, pageWidth - margin * 2);
            doc.text(objText, margin, y, { align: "justify", maxWidth: pageWidth - margin * 2 });
            y += objText.length * 14 + 10;

            // === INDICADORES ===
            if (obj.indicators?.length) {
                checkPageSpace(60);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text("Indicadores:", margin + 20, y);
                y += 14;

                const tableData = obj.indicators.map((ind, j) => [
                    `${j + 1}`,
                    ind.concept || "Sin concepto",
                    ind.amount != null ? ind.amount : "N/A",
                ]);

                checkPageSpace(obj.indicators.length * 20 + 30);

                doc.autoTable({
                    startY: y,
                    head: [["#", "Concepto", "Cantidad"]],
                    body: tableData,
                    styles: {
                        fontSize: 10,
                        cellPadding: 4,
                        halign: "left",
                        valign: "middle",
                        lineWidth: 0.5,
                        lineColor: [0, 0, 0], // bordes negros
                    },
                    headStyles: {
                        fontStyle: "bold",
                        textColor: [0, 0, 0],
                        halign: "center",
                        fillColor: [255, 255, 255], // sin color de fondo
                        lineWidth: 0.8,
                        lineColor: [0, 0, 0],
                    },
                    margin: { left: margin + 30 },
                    tableWidth: pageWidth - margin * 2 - 30,
                });

                y = doc.lastAutoTable.finalY + 15;
            }

            // === PROGRAMAS ===
            if (obj.programs?.length) {
                checkPageSpace(60);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text("Programas:", margin + 20, y);
                y += 16;

                for (let k = 0; k < obj.programs.length; k++) {
                    const prog = obj.programs[k];
                    checkPageSpace(40);

                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(11);
                    doc.text(`• Programa ${k + 1}:`, margin + 30, y);
                    y += 14;

                    doc.setFont("times", "normal");
                    doc.setFontSize(11);
                    const progDesc = doc.splitTextToSize(
                        prog.programDescription || "Sin descripción",
                        pageWidth - margin * 2 - 40
                    );

                    checkPageSpace(progDesc.length * 14 + 20);
                    doc.text(progDesc, margin + 40, y, { align: "justify", maxWidth: pageWidth - margin * 3 });
                    y += progDesc.length * 18 + 8;

                    // === PROYECTOS ===
                    if (prog.operationalProjects?.length) {
                        checkPageSpace(30);
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(12);
                        doc.text("Proyectos:", margin + 50, y);
                        y += 14;

                        for (let l = 0; l < prog.operationalProjects.length; l++) {
                            const proj = prog.operationalProjects[l];
                            const projName = proj.name || "Proyecto sin nombre";

                            const imagePath = proj.image_url || proj.imageUrl;
                            console.log(imagePath)
                            console.log("base url", baseUrl)
                            if (imagePath) {
                                try {

                                    const fullImageUrl = imagePath.startsWith("http")
                                        ? imagePath
                                        : `${baseUrl}${imagePath}`;

                                    console.log("image url fll ", fullImageUrl)

                                    const img = await getBase64FromUrl(fullImageUrl);
                                    checkPageSpace(80);
                                    doc.addImage(img, "JPEG", margin + 60, y, 30, 30);
                                    doc.text(`${projName}`, margin + 120, y + 15);
                                    y += 60;
                                } catch (err) {
                                    console.error("No se pudo cargar la imagen:", err);
                                    checkPageSpace(20);
                                    doc.text(`${projName}`, margin + 60, y);
                                    y += 14;
                                }
                            } else {

                                // Avatar con inicial
                                drawProjectAvatar(doc, projName, margin + 60, y, 30);
                                doc.setTextColor(0, 0, 0);
                                doc.setFontSize(12);
                                doc.text(`${projName}`, margin + 120, y + 15);
                                y += 60;
                            }
                        }
                    }
                }
            }
        }
    }

    // === PIE DE PÁGINA ===
const pageCount = doc.internal.getNumberOfPages();
const now = new Date();
const formattedDate = now.toLocaleString("es-BO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Texto pequeño a la izquierda: fecha de generación
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8); // letra pequeña pero legible
    doc.setTextColor(100);
    doc.text(`Generado el ${formattedDate}`, margin, pageHeight - 30, { align: "left" });

    // Texto a la derecha: número de página
    doc.setFontSize(10);
    doc.setTextColor(130);
    doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - margin,
        pageHeight - 30,
        { align: "right" }
    );
}


    doc.save(`Plan_Estrategico_${year || "sin_año"}.pdf`);
};

// Helper para convertir imagen URL a base64
async function getBase64FromUrl(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function drawProjectAvatar(doc, name, x, y, size) {
    const initial = name ? name[0].toUpperCase() : "?";

    // Dibujar cuadrado con bordes redondeados
    doc.setFillColor(100, 100, 100); // color gris
    doc.roundedRect(x, y, size, size, 6, 6, "F"); // 6pt de radio en las esquinas

    // Inicial centrada
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size / 2); // tamaño de letra
    doc.setTextColor(255, 255, 255); // blanco
    const textWidth = doc.getTextWidth(initial);
    const textHeight = size / 2; // aproximado
    doc.text(
        initial,
        x + size / 2 - textWidth / 2,
        y + size / 2 + textHeight / 4 // centrar vertical aproximado
    );
}
