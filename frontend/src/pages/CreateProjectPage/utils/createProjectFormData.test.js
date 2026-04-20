import { describe, expect, test } from "vitest";
import { createProjectFormData } from "./createProjectFormData";

describe("createProjectFormData", () => {
  test("construye FormData con campos obligatorios y opcionales", () => {
    const file = new File(["img"], "logo.png", { type: "image/png" });
    const formData = createProjectFormData({
      name: "Proyecto QA",
      description: "Descripcion QA",
      image_file: file,
      responsibles: [1, 2],
      integrations: [{ platform: "github", id: "1" }],
    });

    const entries = Array.from(formData.entries());
    const map = Object.fromEntries(entries);

    expect(map.name).toBe("Proyecto QA");
    expect(map.description).toBe("Descripcion QA");
    expect(map.file).toBeInstanceOf(File);
    expect(map.responsibles).toBe(JSON.stringify([1, 2]));
    expect(map.integrations).toBe(JSON.stringify([{ platform: "github", id: "1" }]));
  });

  test("omite campos vacios", () => {
    const formData = createProjectFormData({ name: "Solo nombre" });
    const entries = Array.from(formData.entries());
    const map = Object.fromEntries(entries);

    expect(map.name).toBe("Solo nombre");
    expect(map.description).toBeUndefined();
    expect(map.responsibles).toBeUndefined();
    expect(map.integrations).toBeUndefined();
  });
});
