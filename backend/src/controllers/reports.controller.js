import { AppDataSource } from '../../data-source.js';
import { Report, reportSchema } from '../entities/Report.js';
import { ERROR_CODES, errorResponse, successResponse } from '../utils/apiResponse.js';
import fs from 'fs';
import path from 'path';

export const getAllReports = async (req, res) => {
  try {
    const reportRepo = AppDataSource.getRepository(Report);

    const reports = await reportRepo.find({
      select: ['id', 'title', 'report_version', 'created_at', 'updated_at'],
      order: { id: 'DESC' },
    });

    return successResponse(res, reports, 'Reportes obtenidos correctamente', 200);
  } catch (error) {
    console.error(error);
    return errorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error del servidor', 500);
  }
};

export const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    const reportRepo = AppDataSource.getRepository(Report);

    const report = await reportRepo.findOneBy({ id: Number(reportId) });

    if (!report) {
      return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Reporte no encontrado', 404);
    }

    return successResponse(
      res,
      {
        id: report.id,
        title: report.title,
        data: report.data,
        report_version: report.report_version,
        created_at: report.created_at,
        updated_at: report.updated_at,
      },
      'Reporte recuperado exitosamente',
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error del servidor', 500);
  }
};

export const createReport = async (req, res) => {
  try {
    const parsedReport = JSON.parse(req.body.report);
    const { title, elements, elementsOrder } = parsedReport;

    // Map de imágenes subidas
    const imageMap = {};
    req.files?.forEach(file => {
      imageMap[file.originalname] = file.optimizedPath;
    });

    // Reemplazamos src de imágenes locales, manteniendo la estructura de objetos
    const finalElements = { ...elements };
    elementsOrder.forEach(id => {
      const el = finalElements[id];
      if (el?.type === "image") {
        finalElements[id] = {
          ...el,
          src: imageMap[el.imageKey] ?? el.src ?? "",
        };
      }
    });

    // Validamos con Zod (si tu esquema espera 'data' como objeto en vez de array, ajústalo)
    const validated = reportSchema.parse({
      title,
      elements: finalElements,
      elementsOrder,
    });

    const reportRepo = AppDataSource.getRepository(Report);

    const report = reportRepo.create({
      title: validated.title,
      data: {
        elements: validated.elements,
        elementsOrder: validated.elementsOrder,
      },
      report_version: 1,
    });

    const saved = await reportRepo.save(report);

    return successResponse(
      res,
      {
        id: saved.id,
        title: saved.title,
        data: saved.data,
        report_version: saved.report_version,
        created_at: saved.created_at,
        updated_at: saved.updated_at,
      },
      "Reporte creado correctamente",
      201
    );
  } catch (error) {
    console.log(error);
    if (error.name === "ZodError") {
      return errorResponse(
        res,
        ERROR_CODES.BAD_REQUEST,
        "Datos inválidos",
        400,
        error.errors
      );
    }
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      "Error del servidor",
      500
    );
  }
};

const deleteImageIfExists = (imagePath) => {
  if (!imagePath) return;

  console.log("deleteee", imagePath)

  const cleanPath = imagePath.startsWith('/uploads/')
    ? imagePath.slice(9)
    : imagePath;

  const fullPath = path.join('uploads', cleanPath);

  fs.unlink(fullPath, (err) => {
    if (err) {
      console.error('No se pudo eliminar imagen antigua:', err.message, fullPath);
    }
  });
};


export const updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const parsedReport = JSON.parse(req.body.report);
    const { title, elements, elementsOrder } = parsedReport;

    const reportRepo = AppDataSource.getRepository(Report);

    const report = await reportRepo.findOneBy({ id: Number(reportId) });

    if (!report) {
      return errorResponse(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        'Reporte no encontrado',
        404
      );
    }

    // 🔹 imágenes nuevas subidas
    const imageMap = {};
    req.files?.forEach(file => {
      imageMap[file.originalname] = file.optimizedPath;
    });

    // 🔹 imágenes antiguas (por imageKey)
    const oldImagesMap = {};
    const oldElements = report.data?.elements || {};

    Object.values(oldElements).forEach(el => {
      if (el.type === 'image' && el.imageKey && el.src) {
        oldImagesMap[el.imageKey] = el.src;
      }
    });

    // 🔹 construir elementos finales (MISMA lógica que createReport)
    const finalElements = { ...elements };

    elementsOrder.forEach(id => {
      const el = finalElements[id];

      if (el?.type === 'image') {
        finalElements[id] = {
          ...el,
          src:
            imageMap[el.imageKey] ??      // imagen nueva
            oldImagesMap[el.imageKey] ??  // imagen vieja
            el.src ?? '',
        };
      }
    });

    // 🔹 detectar imágenes eliminadas
    const newImageKeys = new Set(
      Object.values(finalElements)
        .filter(el => el.type === 'image')
        .map(el => el.imageKey)
    );

    Object.entries(oldImagesMap).forEach(([imageKey, src]) => {
      if (!newImageKeys.has(imageKey)) {
        deleteImageIfExists(src);
      }
    });

    // 🔹 validar
    const validated = reportSchema.parse({
      title,
      elements: finalElements,
      elementsOrder,
    });

    // 🔹 guardar
    report.title = validated.title;
    report.data = {
      elements: validated.elements,
      elementsOrder: validated.elementsOrder,
    };
    report.report_version += 1;

    const saved = await reportRepo.save(report);

    return successResponse(
      res,
      {
        id: saved.id,
        title: saved.title,
        data: saved.data,
        report_version: saved.report_version,
        created_at: saved.created_at,
        updated_at: saved.updated_at,
      },
      'Reporte actualizado correctamente',
      200
    );
  } catch (error) {
    console.error(error);

    if (error.name === 'ZodError') {
      return errorResponse(
        res,
        ERROR_CODES.BAD_REQUEST,
        'Datos inválidos',
        400,
        error.errors
      );
    }

    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor',
      500
    );
  }
};



// Eliminar un reporte
export const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const reportRepo = AppDataSource.getRepository(Report);

    const report = await reportRepo.findOneBy({ id: Number(reportId) });

    if (!report) {
      return errorResponse(res, ERROR_CODES.NOT_FOUND, 'Reporte no encontrado', 404);
    }

    await reportRepo.remove(report);

    return successResponse(res, { id: reportId }, 'Reporte eliminado correctamente', 200);
  } catch (error) {
    console.error(error);
    return errorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error del servidor', 500);
  }
};
