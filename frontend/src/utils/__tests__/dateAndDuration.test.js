import { formatDate, formatDateParts, formatDateTime } from "../formatDate";
import { formatDuration } from "../formatDuration";
import { parseDuration } from "../parseDuration";

describe("dateAndDuration utils", () => {
  test("formatDate y formatDateTime retornan texto para fecha válida", () => {
    const input = "2026-04-04T15:30:00.000Z";
    expect(formatDate(input)).toBeTruthy();
    expect(formatDateTime(input)).toBeTruthy();
    expect(formatDate("no-fecha")).toBe("");
  });

  test("formatDateParts separa fecha y hora", () => {
    const parts = formatDateParts("2026-04-04T15:30:00.000Z");
    expect(parts.date).toBeTruthy();
    expect(parts.time).toBeTruthy();
  });

  test("parseDuration y formatDuration mantienen coherencia", () => {
    expect(parseDuration("30s")).toBe(30000);
    expect(parseDuration("10m")).toBe(600000);
    expect(parseDuration("1h")).toBe(3600000);
    expect(() => parseDuration("10x")).toThrow("Duración inválida");

    expect(formatDuration("30s")).toBe("30 segundos");
    expect(formatDuration("1m")).toBe("1 minuto");
    expect(formatDuration("2h")).toBe("2 horas");
    expect(formatDuration("abc")).toBe("");
  });
});
