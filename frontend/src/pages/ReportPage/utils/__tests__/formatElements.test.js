import {
  formatElementsForDb,
  formatElementsForFrontend,
  getElementLabel,
} from "../formatElements";

const TEXT_ID = "11111111-1111-4111-8111-111111111111";
const IMAGE_ID = "22222222-2222-4222-8222-222222222222";
const CHART_ID = "33333333-3333-4333-8333-333333333333";

describe("Report formatElements utils", () => {
  test("getElementLabel retorna etiquetas legibles por tipo", () => {
    expect(getElementLabel("text")).toBe("Texto");
    expect(getElementLabel("chart")).toBe("Gráfico");
    expect(getElementLabel("image")).toBe("Imagen");
    expect(getElementLabel("unknown")).toBe("Elemento");
  });

  test("formatElementsForFrontend retorna defaults cuando no hay reporte", () => {
    const result = formatElementsForFrontend(null);
    expect(result).toEqual({
      title: "Reporte sin título",
      elements: {},
      elementsOrder: [],
    });
  });

  test("formatElementsForFrontend normaliza text/image/chart respetando orden", () => {
    const backendReport = {
      title: "Reporte de prueba",
      data: {
        elements: {
          [TEXT_ID]: {
            id: TEXT_ID,
            type: "text",
            content: { content_html: "<p>Hola</p>", content_delta: { ops: [{ insert: "Hola\n" }] } },
          },
          [IMAGE_ID]: {
            id: IMAGE_ID,
            type: "image",
            src: "/uploads/reports/test.webp",
            width: 500,
            height: 260,
            imageKey: IMAGE_ID,
          },
          [CHART_ID]: {
            id: CHART_ID,
            type: "chart",
            id_name: "github/totalCommits",
            title: "Commits",
            content: "Cantidad de commits",
            interval: "Último mes",
            period: "lastMonth",
            data: [1, 2, 3],
          },
        },
        elementsOrder: [TEXT_ID, IMAGE_ID, CHART_ID],
      },
    };

    const result = formatElementsForFrontend(backendReport);
    expect(result.title).toBe("Reporte de prueba");
    expect(result.elementsOrder).toEqual([TEXT_ID, IMAGE_ID, CHART_ID]);
    expect(result.elements[TEXT_ID].content.content_html).toBe("<p>Hola</p>");
    expect(result.elements[IMAGE_ID].src).toBe("/uploads/reports/test.webp");
    expect(result.elements[CHART_ID].id_name).toBe("github/totalCommits");
  });

  test("formatElementsForDb serializa reporte y adjunta imagen local", () => {
    const file = new File(["binary"], "demo.webp", { type: "image/webp" });
    const editedReport = {
      title: "  Reporte final  ",
      elements: {
        [TEXT_ID]: {
          id: TEXT_ID,
          type: "text",
          content: { content_html: "<p>Texto</p>", content_delta: { ops: [{ insert: "Texto\n" }] } },
        },
        [IMAGE_ID]: {
          id: IMAGE_ID,
          type: "image",
          src: "blob:local-preview",
          alt: "demo",
          width: 420,
          height: 300,
          imageKey: IMAGE_ID,
          file,
          __local: true,
        },
        [CHART_ID]: {
          id: CHART_ID,
          type: "chart",
          id_name: "instagram/reachCard",
          title: "Alcance",
          content: "Alcance de cuenta",
          interval: "Última semana",
          period: "lastWeek",
          data: [5, 7],
          meta: { unit: "personas" },
          integration_data: { platform: "instagram" },
        },
      },
      elementsOrder: [TEXT_ID, IMAGE_ID, CHART_ID],
    };

    const formData = formatElementsForDb(editedReport, 3);
    const serialized = JSON.parse(formData.get("report"));

    expect(serialized.title).toBe("Reporte final");
    expect(serialized.report_version).toBe(3);
    expect(serialized.elementsOrder).toHaveLength(3);
    expect(serialized.elements[IMAGE_ID].imageKey).toBe(IMAGE_ID);
    expect(serialized.elements[CHART_ID].id_name).toBe("instagram/reachCard");
    expect(formData.getAll("file")).toHaveLength(1);
  });

  test("formatElementsForDb aplica título por defecto cuando viene vacío", () => {
    const editedReport = {
      title: "   ",
      elements: {
        [TEXT_ID]: {
          id: TEXT_ID,
          type: "text",
          content: { content_html: "<p>Texto</p>", content_delta: { ops: [{ insert: "Texto\n" }] } },
        },
      },
      elementsOrder: [TEXT_ID],
    };

    const formData = formatElementsForDb(editedReport);
    const serialized = JSON.parse(formData.get("report"));

    expect(serialized.title).toBe("Reporte sin título");
    expect(serialized.report_version).toBeUndefined();
    expect(serialized.elementsOrder).toEqual([TEXT_ID]);
  });
});

