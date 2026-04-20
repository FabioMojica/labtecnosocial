import { jest } from "@jest/globals";
import { ALLOWED_ROLES } from "../../src/config/allowedStatesAndRoles.js";
import { AppDataSource } from "../../data-source.js";
import { canAccessProject } from "../../src/utils/canAccessProject.js";

const countMock = jest.fn();
let getRepositorySpy;

describe("canAccessProject (proyectos operativos)", () => {
  beforeEach(() => {
    countMock.mockReset();
    getRepositorySpy = jest
      .spyOn(AppDataSource, "getRepository")
      .mockReturnValue({ count: countMock });
  });

  afterEach(() => {
    if (getRepositorySpy) getRepositorySpy.mockRestore();
  });

  test("retorna false si el projectId no es válido", async () => {
    const result = await canAccessProject({
      projectId: "abc",
      userId: 1,
      role: ALLOWED_ROLES.user,
    });
    expect(result).toBe(false);
    expect(countMock).not.toHaveBeenCalled();
  });

  test("retorna true para super admin sin consultar DB", async () => {
    const result = await canAccessProject({
      projectId: 1,
      userId: 1,
      role: ALLOWED_ROLES.superAdmin,
    });
    expect(result).toBe(true);
    expect(countMock).not.toHaveBeenCalled();
  });

  test("retorna true para admin sin consultar DB", async () => {
    const result = await canAccessProject({
      projectId: 1,
      userId: 1,
      role: ALLOWED_ROLES.admin,
    });
    expect(result).toBe(true);
    expect(countMock).not.toHaveBeenCalled();
  });

  test("retorna false para roles desconocidos", async () => {
    const result = await canAccessProject({
      projectId: 1,
      userId: 1,
      role: "guest",
    });
    expect(result).toBe(false);
    expect(countMock).not.toHaveBeenCalled();
  });

  test("retorna false si user no está asignado", async () => {
    countMock.mockResolvedValue(0);
    const result = await canAccessProject({
      projectId: 1,
      userId: 99,
      role: ALLOWED_ROLES.user,
    });
    expect(result).toBe(false);
    expect(countMock).toHaveBeenCalled();
  });

  test("retorna true si user está asignado", async () => {
    countMock.mockResolvedValue(2);
    const result = await canAccessProject({
      projectId: 1,
      userId: 99,
      role: ALLOWED_ROLES.user,
    });
    expect(result).toBe(true);
    expect(countMock).toHaveBeenCalled();
  });
});
