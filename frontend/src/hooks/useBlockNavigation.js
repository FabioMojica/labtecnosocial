import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDirty } from "../contexts/DirtyContext";

export function useNavigationGuard() {
  const { isDirtyContext, setIsDirtyContext } = useDirty();
  const navigate = useNavigate();
  const location = useLocation();
  const [nextNavigation, setNextNavigation] = useState(null);

  useEffect(() => {
    if (!nextNavigation || !isDirtyContext) return;

    const confirmLeave = window.confirm("Tienes cambios pendientes, ¿quieres salir sin guardar?");
    if (confirmLeave) {
      navigate(nextNavigation.path, { state: nextNavigation.state });
      setIsDirtyContext(false);
    }
    setNextNavigation(null);
  }, [nextNavigation, isDirtyContext, navigate]);

  const handleNavigate = (path, state = {}) => {
    if (isDirtyContext) {
      setNextNavigation({ path, state });
      return false;
    } else {
      navigate(path, { state });
      return true;
    }
  };

  return { handleNavigate };
}

