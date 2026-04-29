import { jest } from "@jest/globals";
import { AppDataSource } from "../../data-source.js";
import {
  createReport,
  deleteReport,
  getAllReports,
  getReportById,
  updateReport,
} from "../../src/controllers/reports.controller.js";

const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const TEXT_ID = "11111111-1111-4111-8111-111111111111";
const IMAGE_ID = "22222222-2222-4222-8222-222222222222";

describe("reports.controller (unit)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("getAllReports responde 200 con lista ordenada", async () => {
    const res = buildRes();
    const find = jest.fn().mockResolvedValue([{ id: 2 }, { id: 1 }]);
    jest.spyOn(AppDataSource, "getRepository").mockReturnValue({ find });

    await getAllReports({}, res);

    expect(find).toHaveBeenCalledWith({
      select: ["id", "title", "report_version", "created_at", "updated_at"],
      order: { id: "DESC" },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: [{ id: 2 }, { id: 1 }],
      }),
    );
  });

  test("getReportById responde 404 cuando no existe", async () => {
    const req = { params: { reportId: "999" } };
    const res = buildRes();
    jest.spyOn(AppDataSource, "getRepository").mockReturnValue({
      findOneBy: jest.fn().mockResolvedValue(null),
    });

    await getReportById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: "RESOURCE_NOT_FOUND" }),
      }),
    );
  });

  test("createReport responde 201 y reemplaza src de imagen subida", async () => {
    const req = {
      body: {
        report: JSON.stringify({
          title: "Reporte QA",
          elements: {
            [IMAGE_ID]: {
              id: IMAGE_ID,
              type: "image",
              imageKey: IMAGE_ID,
              src: "",
              alt: "img",
              width: 300,
              height: 200,
            },
          },
          elementsOrder: [IMAGE_ID],
        }),
      },
      files: [{ originalname: IMAGE_ID, optimizedPath: "/uploads/reports/r1.webp" }],
    };
    const res = buildRes();
    const create = jest.fn().mockImplementation((payload) => payload);
    const save = jest.fn().mockResolvedValue({
      id: 10,
      title: "Reporte QA",
      data: {
        elements: {
          [IMAGE_ID]: {
            id: IMAGE_ID,
            type: "image",
            imageKey: IMAGE_ID,
            src: "/uploads/reports/r1.webp",
            alt: "img",
            width: 300,
            height: 200,
          },
        },
        elementsOrder: [IMAGE_ID],
      },
      report_version: 1,
      created_at: "2026-04-20T00:00:00.000Z",
      updated_at: "2026-04-20T00:00:00.000Z",
    });

    jest.spyOn(AppDataSource, "getRepository").mockReturnValue({ create, save });

    await createReport(req, res);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Reporte QA",
        data: expect.objectContaining({
          elements: expect.objectContaining({
            [IMAGE_ID]: expect.objectContaining({
              src: "/uploads/reports/r1.webp",
            }),
          }),
          elementsOrder: [IMAGE_ID],
        }),
        report_version: 1,
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Reporte creado correctamente",
        data: expect.objectContaining({ id: 10, report_version: 1 }),
      }),
    );
  });

  test("createReport responde 400 si payload no cumple esquema", async () => {
    const req = {
      body: {
        report: JSON.stringify({
          title: "",
          elements: {
            [TEXT_ID]: { id: TEXT_ID, type: "text", content: "<p>x</p>" },
          },
          elementsOrder: [TEXT_ID],
        }),
      },
      files: [],
    };
    const res = buildRes();
    jest.spyOn(AppDataSource, "getRepository").mockReturnValue({
      create: jest.fn(),
      save: jest.fn(),
    });

    await createReport(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: "VALIDATION_ERROR" }),
      }),
    );
  });

  test("updateReport responde 400 cuando falta report_version", async () => {
    const req = {
      params: { reportId: "7" },
      body: {
        report: JSON.stringify({
          title: "Reporte editado",
          elements: {
            [TEXT_ID]: { id: TEXT_ID, type: "text", content: "<p>x</p>" },
          },
          elementsOrder: [TEXT_ID],
        }),
      },
      files: [],
    };
    const res = buildRes();
    jest.spyOn(AppDataSource, "getRepository").mockReturnValue({
      findOneBy: jest.fn().mockResolvedValue({
        id: 7,
        report_version: 2,
        data: { elements: {}, elementsOrder: [] },
      }),
      save: jest.fn(),
    });

    await updateReport(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: "VALIDATION_ERROR" }),
      }),
    );
  });

  test("updateReport responde 409 cuando llega version stale", async () => {
    const req = {
      params: { reportId: "7" },
      body: {
        report: JSON.stringify({
          title: "Reporte editado",
          report_version: 1,
          elements: {
            [TEXT_ID]: { id: TEXT_ID, type: "text", content: "<p>x</p>" },
          },
          elementsOrder: [TEXT_ID],
        }),
      },
      files: [],
    };
    const res = buildRes();
    jest.spyOn(AppDataSource, "getRepository").mockReturnValue({
      findOneBy: jest.fn().mockResolvedValue({
        id: 7,
        report_version: 2,
        data: { elements: {}, elementsOrder: [] },
      }),
      save: jest.fn(),
    });

    await updateReport(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: "VERSION_ERROR" }),
      }),
    );
  });

  test("updateReport responde 200 y aumenta report_version", async () => {
    const req = {
      params: { reportId: "7" },
      body: {
        report: JSON.stringify({
          title: "Reporte actualizado",
          report_version: 2,
          elements: {
            [TEXT_ID]: { id: TEXT_ID, type: "text", content: "<p>ok</p>" },
          },
          elementsOrder: [TEXT_ID],
        }),
      },
      files: [],
    };
    const res = buildRes();
    const report = {
      id: 7,
      title: "Reporte inicial",
      report_version: 2,
      created_at: "2026-04-19T00:00:00.000Z",
      updated_at: "2026-04-19T00:00:00.000Z",
      data: {
        elements: {
          [TEXT_ID]: { id: TEXT_ID, type: "text", content: "<p>viejo</p>" },
        },
        elementsOrder: [TEXT_ID],
      },
    };
    const save = jest.fn().mockResolvedValue({
      ...report,
      title: "Reporte actualizado",
      report_version: 3,
      data: {
        elements: {
          [TEXT_ID]: { id: TEXT_ID, type: "text", content: "<p>ok</p>" },
        },
        elementsOrder: [TEXT_ID],
      },
      updated_at: "2026-04-20T00:00:00.000Z",
    });

    jest.spyOn(AppDataSource, "getRepository").mockReturnValue({
      findOneBy: jest.fn().mockResolvedValue(report),
      save,
    });

    await updateReport(req, res);

    expect(report.report_version).toBe(3);
    expect(save).toHaveBeenCalledWith(report);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ report_version: 3 }),
      }),
    );
  });

  test("deleteReport responde 404 cuando no existe", async () => {
    const req = { params: { reportId: "15" } };
    const res = buildRes();
    jest.spyOn(AppDataSource, "getRepository").mockReturnValue({
      findOneBy: jest.fn().mockResolvedValue(null),
      remove: jest.fn(),
    });

    await deleteReport(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: "RESOURCE_NOT_FOUND" }),
      }),
    );
  });

  test("deleteReport responde 200 cuando elimina correctamente", async () => {
    const req = { params: { reportId: "15" } };
    const res = buildRes();
    const remove = jest.fn().mockResolvedValue({});
    jest.spyOn(AppDataSource, "getRepository").mockReturnValue({
      findOneBy: jest.fn().mockResolvedValue({ id: 15 }),
      remove,
    });

    await deleteReport(req, res);

    expect(remove).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: { id: "15" },
      }),
    );
  });
});
