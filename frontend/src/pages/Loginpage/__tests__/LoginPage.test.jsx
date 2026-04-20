import { ThemeProvider, createTheme } from "@mui/material/styles";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "../LoginPage";

vi.mock("../../../contexts", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
    useNotification: vi.fn(),
    useThemeContext: vi.fn(() => ({
      isDarkMode: true,
      toggleTheme: vi.fn(),
    })),
  };
});

import { useAuth, useNotification } from "../../../contexts";

const renderPage = () => {
  const theme = createTheme({ palette: { mode: "dark" } });
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe("LoginPage", () => {
  const notifyMock = vi.fn();
  const loginMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      login: loginMock,
      loading: false,
    });
    useNotification.mockReturnValue({
      notify: notifyMock,
    });
  });

  test("deshabilita botón de login con formulario incompleto", () => {
    renderPage();
    const submit = screen.getByRole("button", { name: /iniciar sesión/i });
    expect(submit).toBeDisabled();
  });

  test("mantiene botón deshabilitado cuando email es inválido", async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "correo-invalido" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "Ab1$xy78" },
    });

    const submit = screen.getByRole("button", { name: /iniciar sesión/i });
    expect(submit).toBeDisabled();
    expect(loginMock).not.toHaveBeenCalled();
  });

  test("ejecuta login cuando datos son válidos", async () => {
    loginMock.mockResolvedValueOnce({ ok: true });
    renderPage();

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "Ab1$xy78" },
    });

    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("admin@test.com", "Ab1$xy78");
    });
  });
});
