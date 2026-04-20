import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { SelectYear } from "./SelectYear";

describe("SelectYear component", () => {
  test("abre modal y permite seleccionar anio", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<SelectYear selectedYear={2026} onChange={onChange} availableYears={[2025, 2026]} />);

    await user.click(screen.getByRole("button", { name: "2026" }));
    await user.click(screen.getByRole("button", { name: "2025" }));

    expect(onChange).toHaveBeenCalledWith(2025);
  });

  test("respeta estado disabled", () => {
    render(<SelectYear selectedYear={2026} onChange={vi.fn()} disabled />);
    expect(screen.getByRole("button", { name: "2026" })).toBeDisabled();
  });
});

