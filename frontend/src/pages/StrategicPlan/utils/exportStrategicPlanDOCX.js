import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import { saveAs } from "file-saver";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const exportStrategicPlanDOCX = async (data, year) => {
    const res = await fetch("/templates/plantilla.docx");
    const arrayBuffer = await res.arrayBuffer();
    const zip = new PizZip(arrayBuffer);

    const imageOpts = {
        centered: false,
        getImage: async (tagValue) => {
            const response = await fetch(tagValue);
            const blob = await response.blob();
            return await blob.arrayBuffer();
        },
        getSize: () => [30, 30],
    };

    const imageModule = new ImageModule(imageOpts);
    const doc = new Docxtemplater(zip, {
        modules: [imageModule],
        paragraphLoop: true,
        linebreaks: true,
    });

    const now = new Date();
    const formattedDate = now.toLocaleString("es-BO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    const preparedData = {
        year,
        generationDate: formattedDate,
        mission: data.mission || "",

        // Flag principal para mostrar "Objetivos:"
        objectives_exist: data.objectives?.length > 0,

        objectives: data.objectives?.map((obj, i) => ({
            objectiveIndex: i + 1,
            objectiveTitle: obj.objectiveTitle,

            // Flag para indicadores
            indicators_exist: obj.indicators?.length > 0,
            indicators: obj.indicators?.map((ind, j) => ({
                indicatorIndex: j + 1,
                concept: ind.concept,
                amount: ind.amount,
            })),

            // Flag para programas
            programs_exist: obj.programs?.length > 0,
            programs: obj.programs?.map((prog, k) => ({
                programIndex: k + 1,
                programDescription: prog.programDescription,

                // Flag para proyectos
                projects_exist: prog.operationalProjects?.length > 0,
                projects: prog.operationalProjects?.map((proj, l) => ({
                    projectIndex: l + 1,
                    projectName: proj.name,
                }))
            })),
        })),
    };


    doc.render(preparedData);

    const out = doc.getZip().generate({ type: "blob" });
    saveAs(out, `Plan_Estrategico_${year || "sin_año"}.docx`);
};
