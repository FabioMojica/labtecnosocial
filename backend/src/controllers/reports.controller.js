import { AppDataSource } from '../../data-source.js';
import { Report } from '../entities/Report.js';
import { ERROR_CODES, errorResponse, successResponse } from '../utils/apiResponse.js';

// controllers/reports.controller.js

export const getAllReports = async (req, res) => {
  try {
    const reportRepo = AppDataSource.getRepository(Report);

    const reports = await reportRepo.find({
      select: {
        id: true,
        title: true,
        created_at: true,
        updated_at: true,
        report_version: true,
      },
      order: {
        id: 'DESC',
      },
    });

    return successResponse(
      res,
      reports,
      'Reportes obtenidos correctamente',
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor',
      500
    );
  }
};

export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const reportRepo = AppDataSource.getRepository(Report);

    const report = await reportRepo.findOne({
      where: { id: Number(id) },
    });

    if (!report) {
      return errorResponse(
        res,
        ERROR_CODES.NOT_FOUND,
        'Reporte no encontrado',
        404
      );
    }

    return successResponse(
      res,
      {
        id: report.id,
        title: report.title,
        elements: JSON.parse(report.content),
        report_version: report.report_version,
      },
      'Reporte obtenido correctamente',
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor',
      500
    );
  }
};


export const createReport = async (req, res) => {
  try {
    const { title, elements } = req.body;

    const reportRepo = AppDataSource.getRepository(Report);

    const report = reportRepo.create({
      title,
      content: JSON.stringify(elements),
      report_version: 1,
    });

    const saved = await reportRepo.save(report);

    return successResponse(
      res,
      saved,
      'Reporte creado correctamente',
      201
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor',
      500
    );
  }
};


export const updateReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { title, elements } = req.body;

        const reportRepo = AppDataSource.getRepository(Report);

        let report = await reportRepo.findOne({
            where: { id: Number(reportId) },
        });
        

        if (!report) {
            report = reportRepo.create({
                title,
                content: JSON.stringify(elements),
                report_version: 1,
            });
        } else {
            report.title = title;
            report.content = JSON.stringify(elements);
            report.report_version += 1;
        }

        const reportSaved = await reportRepo.save(report);


        return (
            successResponse(
                res,
                reportSaved,
                'Reporte guardado correctamente',
                200
            )
        );

    } catch (error) {
        console.log(error)
        return errorResponse(
            res,
            ERROR_CODES.SERVER_ERROR,
            'Error del servidor',
            500
        );
    }
};


export const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const reportRepo = AppDataSource.getRepository(Report);

    const report = await reportRepo.findOne({
      where: { id: Number(reportId) },
    });

    if (!report) {
      return errorResponse(
        res,
        ERROR_CODES.NOT_FOUND,
        'Reporte no encontrado',
        404
      );
    }

    await reportRepo.remove(report);

    return successResponse(
      res,
      { id: reportId },
      'Reporte eliminado correctamente',
      200
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      ERROR_CODES.SERVER_ERROR,
      'Error del servidor',
      500
    );
  }
};
