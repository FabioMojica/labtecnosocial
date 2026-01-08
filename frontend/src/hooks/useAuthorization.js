import { useAuth } from "../contexts";

export const useAuthorization = (allowedRoles) => {
  const { isAuthenticated, user, loadingContext } = useAuth();

  if(loadingContext) return { status: "loading"};

  if (!isAuthenticated) return { status: "unauthenticated" };

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return { status: "unauthorized" };
  }
  
  return { status: "authorized" };
};
