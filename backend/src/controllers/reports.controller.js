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

const ensureUniquePositions = (elements) => {
  const positions = elements.map(el => el.position);
  const uniquePositions = new Set(positions);
  if (positions.length !== uniquePositions.size) {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Error al guardar por que hay elementos con posiciones duplicadas', 400);
  }
};

export const createReport = async (req, res) => {
  try {
    const parsedReport = JSON.parse(req.body.report);
    const { title, elements } = parsedReport;

    const imageMap = {};
    req.files?.forEach(file => {
      imageMap[file.originalname] = file.optimizedPath;
    });

    const finalElements = elements.map(el => {
      if (el.type === "image") {
        return {
          ...el,
          src: imageMap[el.imageKey] ?? null,
        };
      }
      return el;
    });

    const validated = reportSchema.parse({
      title,
      data: finalElements,
    });

    ensureUniquePositions(validated.data);

    const reportRepo = AppDataSource.getRepository(Report);
    const report = reportRepo.create({
      title: validated.title,
      data: validated.data,
      report_version: 1,
    });

    const saved = await reportRepo.save(report);


    return successResponse(res,
      {
        id: saved.id,
        title: saved.title,
        data: saved.data,
        report_version: saved.report_version,
        created_at: saved.created_at,
        updated_at: saved.updated_at,
      }
      ,
      'Reporte creado correctamente',
      201);

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
    const { title, elements } = parsedReport;

    const reportRepo = AppDataSource.getRepository(Report);

    const report = await reportRepo.findOneBy({ id: Number(reportId) });

    if (!report) {
      return errorResponse(res, ERROR_CODES.RESOURCE_NOT_FOUND, 'Reporte no encontrado', 404);
    }

    const imageMap = {};
    req.files?.forEach(file => {
      imageMap[file.originalname] = file.optimizedPath;
    });

    // 🔹 Mapa de imágenes antiguas (por imageKey)
    const oldImagesMap = {};
    report.data?.forEach(el => {
      console.log("elllll", el)
      if (el.type === 'image' && el.imageKey && el.src) {
        console.log("ahahahahaahah antigua")
        oldImagesMap[el.imageKey] = el.src;
      }
    });

    // 🔹 Construir elementos finales
    const finalElements = elements.map(el => {
      if (el.type === 'image') {
        return {
          ...el,
          src:
            imageMap[el.imageKey] ?? // imagen nueva
            oldImagesMap[el.imageKey] ?? // imagen vieja
            null,
        };
      }
      return el;
    });

    const newImageKeys = new Set(
      finalElements
        .filter(el => el.type === 'image')
        .map(el => el.imageKey)
    );

    Object.entries(oldImagesMap).forEach(([imageKey, src]) => {
      if (!newImageKeys.has(imageKey)) {
        deleteImageIfExists(src);
      }
    });

    const validated = reportSchema.parse({
      title,
      data: finalElements,
    });

    ensureUniquePositions(validated.data);

    report.title = validated.title;
    report.data = validated.data;
    report.report_version += 1;

    const saved = await reportRepo.save(report);

    return successResponse(res, {
      id: saved.id,
      title: saved.title,
      data: saved.data,
      report_version: saved.report_version,
      created_at: saved.created_at,
      updated_at: saved.updated_at,
    }, 'Reporte actualizado correctamente', 200);

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
    return errorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error del servidor', 500);
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
