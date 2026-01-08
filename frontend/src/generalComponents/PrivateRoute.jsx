import { CircularProgress } from "@mui/material";
import { useAuthorization } from "../hooks";
import { Navigate } from "react-router-dom";
import { FullScreenProgress } from "./FullScreenProgress";


export const PrivateRoute = ({ element, allowedRoles = [] }) => {
  const auth = useAuthorization(allowedRoles);

  if (auth.status === "loading") {
    return <FullScreenProgress text={"Recargando..."}/>;
  }

  if (auth.status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (auth.status === "unauthorized") {
    return <Navigate to="/404" replace />;
  }

  return <>{element}</>;
};
