import { ThemeProvider, createTheme } from "@mui/material/styles";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SessionExpirationModal } from "../SessionExpirationModal";

vi.mock("../../contexts", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

import { useAuth } from "../../contexts";

const renderModal = (override = {}) => {
  const theme = createTheme({ palette: { mode: "dark" } });
  return render(
    <ThemeProvider theme={theme}>
      <SessionExpirationModal />
    </ThemeProvider>
  );
};

describe("SessionExpirationModal", () => {
  const refreshSession = vi.fn();
  const setShowSessionModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      showSessionModal: true,
      expiresAt: Date.now() + 60_000,
      refreshSession,
      setShowSessionModal,
    });
  });

  test("muestra el modal cuando la sesiÃ³n estÃ¡ por expirar", () => {
    renderModal();
    expect(screen.getByText(/Tu sesion expirara en/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refrescar/i })).toBeInTheDocument();
  });

  test("permite cerrar el modal con el botÃ³n de cierre", () => {
    renderModal();
    fireEvent.click(screen.getByLabelText(/cerrar modal/i));
    expect(setShowSessionModal).toHaveBeenCalledWith(false);
  });

  test("ejecuta refreshSession al presionar refrescar", async () => {
    refreshSession.mockResolvedValueOnce({});
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: /refrescar/i }));

    await waitFor(() => {
      expect(refreshSession).toHaveBeenCalledWith(true);
    });
  });
});
