import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../contexts";
import { useNotification } from "../contexts";
import { authService } from "../services";


export const useAuthEffects = () => {
  const { setAuth } = useAuth(); 
  const navigate = useNavigate();
  const { notify } = useNotification();

  const warningTimeoutRef = useRef(null);
  const logoutTimeoutRef = useRef(null);
  const isActiveRef = useRef(false);

  const clearTimers = () => {
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
  };

  const scheduleTokenWarning = (expTime) => {
    clearTimers();
    const timeLeft = expTime - Date.now();
    const minutesBefore = 10;
    const WARNING_BEFORE_EXPIRATION = minutesBefore * 60 * 1000; 

    if (timeLeft > WARNING_BEFORE_EXPIRATION) {
      const warningTime = timeLeft - WARNING_BEFORE_EXPIRATION;
      warningTimeoutRef.current = window.setTimeout(() => {
        if (isActiveRef.current) {
          notify(`Tu sesión expirará en ${minutesBefore} minutos`, "warning", { persist: true });
        }
      }, warningTime);
    }

    logoutTimeoutRef.current = window.setTimeout(() => {
      if (isActiveRef.current) {
        handleLogout(true);
      }
    }, timeLeft);
  };

  const handleLogin = (token, user) => {
    authService.login(token, user);
    setAuth(user, true);  
    isActiveRef.current = true;

    const decoded = jwtDecode(token);
    const expTime = decoded.exp * 1000;

    scheduleTokenWarning(expTime);
    navigate("/inicio", { replace: true });
    notify("Iniciaste sesión", "info");
  };

  const handleLogout = (showExpiredMsg = false) => {
    authService.logout();
    clearTimers();
    setAuth(null, false);
    isActiveRef.current = false;

    if (showExpiredMsg) {
      notify("Tu sesión ha expirado", "info", { persist: true });
    } else {
      notify("Cerraste sesión", "info");
    }

    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const init = async () => {
      const session = await authService.validateSession();

      if (session?.user) {
        setAuth(session.user, true);
        isActiveRef.current = true;

        const token = session.token || sessionStorage.getItem("token");
        
        const decoded = jwtDecode(token);
        const expTime = decoded.exp * 1000;

        scheduleTokenWarning(expTime);
      } else {
        setAuth(null, false);
        isActiveRef.current = false;
        navigate("/login", { replace: true });
      }
    };

    init();

    return () => {
      clearTimers();
      isActiveRef.current = false;
    };
  }, []);

  return { handleLogin, handleLogout };
};
