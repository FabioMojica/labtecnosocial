import { In } from "typeorm";

export const assignResponsibles = async (responsibles, projectId, userRepository, responsibleRepository) => {

  if (!Array.isArray(responsibles) || responsibles.length === 0) return;

  const users = await userRepository.findBy({ id: In(responsibles) });

  if (users.length !== responsibles.length) {
    throw new Error('Uno o más usuarios no encontrados');
  }

  const newResponsibles = responsibles.map(userId =>
    responsibleRepository.create({
      user: { id: userId },
      operationalProject: { id: projectId },
    })
  );

  await responsibleRepository.save(newResponsibles);
};
