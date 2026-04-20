import { renderHook } from "@testing-library/react";
import { useAuthorization } from "../useAuthorization";

vi.mock("../../contexts", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../contexts";

describe("useAuthorization", () => {
  test("retorna loading cuando loadingContext=true", () => {
    useAuth.mockReturnValue({
      loadingContext: true,
      isAuthenticated: false,
      user: null,
    });

    const { result } = renderHook(() => useAuthorization(["admin"]));
    expect(result.current).toEqual({ status: "loading" });
  });

  test("retorna unauthenticated cuando no hay sesión", () => {
    useAuth.mockReturnValue({
      loadingContext: false,
      isAuthenticated: false,
      user: null,
    });

    const { result } = renderHook(() => useAuthorization(["admin"]));
    expect(result.current).toEqual({ status: "unauthenticated" });
  });

  test("retorna unauthorized cuando el rol no está permitido", () => {
    useAuth.mockReturnValue({
      loadingContext: false,
      isAuthenticated: true,
      user: { role: "user" },
    });

    const { result } = renderHook(() => useAuthorization(["admin"]));
    expect(result.current).toEqual({ status: "unauthorized" });
  });

  test("retorna authorized cuando el rol está permitido", () => {
    useAuth.mockReturnValue({
      loadingContext: false,
      isAuthenticated: true,
      user: { role: "admin" },
    });

    const { result } = renderHook(() => useAuthorization(["admin"]));
    expect(result.current).toEqual({ status: "authorized" });
  });
});
