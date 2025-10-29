import { AppDataSource } from '../../data-source.js';
import { OperationalProject } from '../entities/OperationalProject.js';
import { User } from '../entities/User.js';
import { ProjectResponsible } from '../entities/ProjectResponsible.js';
import { ProjectIntegration } from '../entities/ProjectIntegration.js';
import { Program } from '../entities/Program.js';
import { StrategicPlan } from '../entities/StrategicPlan.js';
import { OperationalRow } from '../entities/OperationalRow.js';
import fs from 'fs';
import path from 'path';


export const getOperationalProjectRows = async (req, res) => {
  try {
    const { id } = req.params;

    const rowRepository = AppDataSource.getRepository(OperationalRow);

    const rows = await rowRepository.find({
      where: {
        operationalProject: { id: parseInt(id) }
      },
      order: {
        id: 'ASC'
      }
    });

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener filas operativas del proyecto:', error);
    return res.status(500).json({ message: 'Error al obtener las filas operativas del proyecto' });
  }
};

export const saveOperationalRowsOfProject = async (req, res) => {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    const { id: projectId } = req.params;
    const { create = [], update = [], delete: deleteIds = [] } = req.body;

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const rowRepository = queryRunner.manager.getRepository(OperationalRow);
    const projectRepository = queryRunner.manager.getRepository(OperationalProject);

    const project = await projectRepository.findOneBy({ id: parseInt(projectId) });
    if (!project) {
      await queryRunner.rollbackTransaction();
      return res.status(404).json({ message: 'Proyecto operativo no encontrado' });
    }

    if (deleteIds.length > 0) {
      await rowRepository.delete(deleteIds);
    }

    for (const rowData of update) {
      const existingRow = await rowRepository.findOneBy({ id: rowData.id });
      if (!existingRow) {
        await queryRunner.rollbackTransaction();
        return res.status(404).json({ message: `Fila con id ${rowData.id} no encontrada` });
      }

      existingRow.objective = rowData.objective;
      existingRow.indicator_amount = rowData.indicator_amount;
      existingRow.indicator_concept = rowData.indicator_concept;
      existingRow.team = rowData.team;
      existingRow.resources = rowData.resources;
      existingRow.budget_amount = rowData.budget_amount;
      existingRow.budget_description = rowData.budget_description;
      existingRow.period_start = rowData.period_start;
      existingRow.period_end = rowData.period_end;

      await rowRepository.save(existingRow);
    }

    for (const rowData of create) {
      const newRow = rowRepository.create({
        objective: rowData.objective,
        indicator_amount: rowData.indicator_amount,
        indicator_concept: rowData.indicator_concept,
        team: rowData.team,
        resources: rowData.resources,
        budget_amount: rowData.budget_amount,
        budget_description: rowData.budget_description,
        period_start: rowData.period_start,
        period_end: rowData.period_end,
        operationalProject: project,
      });
      await rowRepository.save(newRow);
    }

    await queryRunner.commitTransaction();

    const savedRows = await rowRepository.find({
      where: { operationalProject: { id: parseInt(projectId) } },
    });

    return res.status(200).json(savedRows);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error al guardar filas operativas:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    await queryRunner.release();
  }
};

export const deleteOperationalPlanning = async (req, res) => {
  const { id } = req.params;
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const projectRepository = queryRunner.manager.getRepository(OperationalProject);
    const rowRepository = queryRunner.manager.getRepository(OperationalRow);

    const project = await projectRepository.findOneBy({ id: parseInt(id) });

    if (!project) {
      await queryRunner.rollbackTransaction();
      return res.status(404).json({ message: 'Proyecto operativo no encontrado' });
    }

    const rowsToDelete = await rowRepository.find({
      where: { operationalProject: { id: parseInt(id) } },
    });

    if (rowsToDelete.length === 0) {
      await queryRunner.rollbackTransaction();
      return res.status(400).json({ message: 'El proyecto no tiene filas operativas registradas' });
    }

    await rowRepository.remove(rowsToDelete);

    await queryRunner.commitTransaction();
    return res.status(200).json({ message: 'Planificación operativa eliminada correctamente' });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error al eliminar planificación operativa:', error);
    return res.status(500).json({ message: 'Error al eliminar la planificación operativa' });
  } finally {
    await queryRunner.release();
  }
};
