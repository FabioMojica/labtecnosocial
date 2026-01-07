// import { useAuth, useNotification } from "../../context";
import { useAuth, useNotification } from "../../contexts";
import { FullScreenProgress } from "../../generalComponents";
import { AdminLayout } from "./components/AdminLayout";
import { CoordinatorLayout } from "./components/CoordinatorLayout";


export const HomePage = () => {
  const { user, logout } = useAuth();
  const { notify } = useNotification();

  if (!user) {
    return <FullScreenProgress text="Obteniendo el usuario de la sesión"/>
  } 

  switch (user.role) {
    case "admin":
        return <AdminLayout />;
    case "coordinator":
        return <CoordinatorLayout />;
    default:
        notify("Rol no encontrado, se cerrará la sesión", "error");
        logout();
        return;
  }
};
