import { jest } from "@jest/globals";
import { assignResponsibles } from "../../src/utils/assignResponsibles.js";

describe("assignResponsibles (proyectos operativos)", () => {
  test("no hace nada si responsibles no es array", async () => {
    const userRepository = { findBy: jest.fn() };
    const responsibleRepository = { create: jest.fn(), save: jest.fn() };

    const result = await assignResponsibles(null, 10, userRepository, responsibleRepository);

    expect(result).toBeUndefined();
    expect(userRepository.findBy).not.toHaveBeenCalled();
    expect(responsibleRepository.create).not.toHaveBeenCalled();
    expect(responsibleRepository.save).not.toHaveBeenCalled();
  });

  test("no hace nada si responsibles esta vacio", async () => {
    const userRepository = { findBy: jest.fn() };
    const responsibleRepository = { create: jest.fn(), save: jest.fn() };

    const result = await assignResponsibles([], 10, userRepository, responsibleRepository);

    expect(result).toBeUndefined();
    expect(userRepository.findBy).not.toHaveBeenCalled();
    expect(responsibleRepository.create).not.toHaveBeenCalled();
    expect(responsibleRepository.save).not.toHaveBeenCalled();
  });

  test("lanza error si hay usuarios faltantes", async () => {
    const userRepository = { findBy: jest.fn() };
    const responsibleRepository = { create: jest.fn(), save: jest.fn() };

    userRepository.findBy.mockResolvedValue([{ id: 1 }]);

    await expect(
      assignResponsibles([1, 2], 99, userRepository, responsibleRepository)
    ).rejects.toThrow(/usuarios no encontrados/i);

    expect(userRepository.findBy).toHaveBeenCalledTimes(1);
    expect(responsibleRepository.create).not.toHaveBeenCalled();
    expect(responsibleRepository.save).not.toHaveBeenCalled();
  });

  test("crea y guarda responsables", async () => {
    const userRepository = { findBy: jest.fn() };
    const responsibleRepository = { create: jest.fn(), save: jest.fn() };

    userRepository.findBy.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    responsibleRepository.create.mockImplementation((data) => data);

    const result = await assignResponsibles([1, 2], 77, userRepository, responsibleRepository);

    expect(result).toBeUndefined();
    expect(userRepository.findBy).toHaveBeenCalledTimes(1);
    expect(responsibleRepository.create).toHaveBeenCalledTimes(2);
    expect(responsibleRepository.create).toHaveBeenNthCalledWith(1, {
      user: { id: 1 },
      operationalProject: { id: 77 },
    });
    expect(responsibleRepository.create).toHaveBeenNthCalledWith(2, {
      user: { id: 2 },
      operationalProject: { id: 77 },
    });
    expect(responsibleRepository.save).toHaveBeenCalledTimes(1);
    expect(responsibleRepository.save).toHaveBeenCalledWith([
      { user: { id: 1 }, operationalProject: { id: 77 } },
      { user: { id: 2 }, operationalProject: { id: 77 } },
    ]);
  });
});
