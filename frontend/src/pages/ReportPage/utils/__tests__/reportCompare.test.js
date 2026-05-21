import { areReportsEquivalent } from "../reportCompare";

const buildImageReport = (height) => ({
  title: "Reporte administrativo",
  elementsOrder: ["img-1"],
  elements: {
    "img-1": {
      id: "img-1",
      type: "image",
      position: 0,
      src: "http://localhost:5000/api/uploads/demo.webp",
      alt: "demo",
      width: 400,
      height,
      imageKey: "img-1",
    },
  },
});

describe("reportCompare", () => {
  test("considera equivalentes imagenes con diferencias minimas de redondeo", () => {
    const original = buildImageReport(156);
    const current = buildImageReport(155);

    expect(areReportsEquivalent(current, original)).toBe(true);
  });

  test("detecta cambios reales cuando la diferencia de tamano es significativa", () => {
    const original = buildImageReport(156);
    const current = buildImageReport(152);

    expect(areReportsEquivalent(current, original)).toBe(false);
  });
});
