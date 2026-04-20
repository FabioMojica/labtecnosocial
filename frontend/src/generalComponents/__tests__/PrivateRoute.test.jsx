import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PrivateRoute } from "../PrivateRoute";

vi.mock("../../hooks", () => ({
  useAuthorization: vi.fn(),
}));

import { useAuthorization } from "../../hooks";

const renderWithRouter = (authStatus) => {
  useAuthorization.mockReturnValue({ status: authStatus });

  return render(
    <MemoryRouter initialEntries={["/secure"]}>
      <Routes>
        <Route
          path="/secure"
          element={<PrivateRoute allowedRoles={["admin"]} element={<div>Contenido privado</div>} />}
        />
        <Route path="/login" element={<div>Pantalla Login</div>} />
        <Route path="/404" element={<div>Pantalla 404</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe("PrivateRoute", () => {
  test("muestra loading cuando status=loading", () => {
    renderWithRouter("loading");
    expect(screen.getByText("Recargando...")).toBeInTheDocument();
  });

  test("redirige a login cuando status=unauthenticated", async () => {
    renderWithRouter("unauthenticated");
    expect(await screen.findByText("Pantalla Login")).toBeInTheDocument();
  });

  test("redirige a 404 cuando status=unauthorized", async () => {
    renderWithRouter("unauthorized");
    expect(await screen.findByText("Pantalla 404")).toBeInTheDocument();
  });

  test("renderiza elemento cuando status=authorized", async () => {
    renderWithRouter("authorized");
    expect(await screen.findByText("Contenido privado")).toBeInTheDocument();
  });
});
