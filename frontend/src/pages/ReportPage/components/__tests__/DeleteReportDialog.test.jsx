import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteReportDialog } from "../DeleteReportDialog";

const callEndpointMock = vi.fn(async (value) => value);

vi.mock("../../../../hooks", () => ({
  useFetchAndLoad: () => ({
    loading: false,
    callEndpoint: callEndpointMock,
  }),
}));

describe("DeleteReportDialog", () => {
  beforeEach(() => {
    callEndpointMock.mockClear();
  });

  test("bloquea eliminar hasta confirmar titulo exacto", async () => {
    render(
      <DeleteReportDialog
        open
        onClose={vi.fn()}
        report={{ id: 9, title: "Reporte Abril" }}
        onDeleteReport={vi.fn(async () => {})}
      />,
    );

    const deleteButton = screen.getByRole("button", { name: "Eliminar" });
    expect(deleteButton).toBeDisabled();

    await userEvent.type(screen.getByPlaceholderText("Nombre del proyecto"), "Reporte Abril");

    expect(deleteButton).toBeEnabled();
  });

  test("ejecuta onDeleteReport cuando confirmacion es valida", async () => {
    const onDeleteReport = vi.fn(async () => ({ ok: true }));
    render(
      <DeleteReportDialog
        open
        onClose={vi.fn()}
        report={{ id: 10, title: "Reporte QA" }}
        onDeleteReport={onDeleteReport}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText("Nombre del proyecto"), "Reporte QA");
    await userEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(onDeleteReport).toHaveBeenCalledTimes(1);
    expect(callEndpointMock).toHaveBeenCalledTimes(1);
  });
});

