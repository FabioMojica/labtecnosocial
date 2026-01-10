import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDirty } from "../contexts/DirtyContext";

export function useNavigationGuard() {
  const { isDirtyContext } = useDirty();
  const navigate = useNavigate();
  const location = useLocation();
  const [nextPath, setNextPath] = useState(null);

  useEffect(() => {
    if (!nextPath || !isDirtyContext) return;

    const confirmLeave = window.confirm("Tienes cambios pendientes, ¿quieres salir sin guardar?");
    if (confirmLeave) {
      navigate(nextPath);
    } 
    setNextPath(null);
  }, [nextPath, isDirtyContext, navigate]);
 
  const handleNavigate = (path) => {
    if (isDirtyContext) {
      console.log("is dirta", isDirtyContext);
      setNextPath(path);
      return false;
    } else {
      navigate(path);
      return true;
    }
  };

  return { handleNavigate };
}

