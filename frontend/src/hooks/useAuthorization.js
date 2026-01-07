import { useAuth } from "../contexts";

export const useAuthorization = (allowedRoles) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return { status: "unauthenticated" };
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return { status: "unauthorized" };
  }
  
  return { status: "authorized" };
};
