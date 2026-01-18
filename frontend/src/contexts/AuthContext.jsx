import { useContext, createContext, useState, useEffect } from "react";
import { authService } from "../services";
import { useFetchAndLoad } from "../hooks";
import { loginUserApi, logoutUserApi, refreshApi } from "../api";
import { sessionTimer } from "../services/sessionTimmer";
import { useNotification } from "./ToastContext";
import { SESSION_WARNING_RAW } from "../utils/generalConfig/session.config";
import { formatDuration } from "../utils/formatDuration";
import {
  setSessionWarningActive,
  isSessionWarningActive,
  clearSessionWarningActive,
} from "../utils/sessionWarningStorage";
import { jwtDecode } from "jwt-decode";
import { useDirty } from "./DirtyContext";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const { loading, callEndpoint } = useFetchAndLoad();
  const { notify, closeSnackbar } = useNotification();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [sessionSnackbarKeys, setSessionSnackbarKeys] = useState([]);

  const { isDirtyRef, setIsDirtyContext, isDirtyContext, runAutoSave } = useDirty();

  const addSessionSnackbarKey = (key) => {
    setSessionSnackbarKeys((prev) => [...prev, key]);
  };

  const clearAllSessionSnackbars = () => {
    sessionSnackbarKeys.forEach((key) => closeSnackbar(key));
    setSessionSnackbarKeys([]);
  };


  useEffect(() => {
    const validate = async () => {
      clearAllSessionSnackbars();
      setLoadingContext(true);
      try {
        const session = await authService.validateSession();

        if (session?.user) {
          setAuth(session.user, true);
          if (isSessionWarningActive()) {
            setShowSessionModal(true);
            const key = notify("Tu sesión expirará pronto.", "warning", { persist: true });
            addSessionSnackbarKey(key);
          }

          const token = sessionStorage.getItem("token");
          if (token) {
            const decoded = jwtDecode(token);
            const expMs = decoded.exp * 1000;

            setExpiresAt(expMs);
            sessionTimer.start(token, {
              onWarn: () => {
                setSessionWarningActive();
                setShowSessionModal(true);
                const key = notify("Tu sesión expirará pronto.", "warning", { persist: true });
                addSessionSnackbarKey(key);
                console.log("⚠️ Sesión por expirar");
              },
              onExpire: () => {
                setSessionWarningActive();

                const key = notify("Tu sesión ha expirado.", "info", { persist: true });
                addSessionSnackbarKey(key);
                logout();
              },
            });
          }
        } else {
          setAuth(null, false);
        }
      } catch {
        setAuth(null, false);
      }
    };

    validate();

    return () => sessionTimer.clear();
  }, []);

  const setAuth = (user, authenticated) => {
    setUser(user);
    setIsAuthenticated(authenticated);
    setLoadingContext(false);
  };

  const updateUserInContext = (newUserData) => {
    setUser((prev) => ({ ...prev, ...newUserData }));
  };

  const login = async (email, password) => {
    try {
      const resp = await callEndpoint(loginUserApi({ email, password }));
      console.log("......", resp)
      authService.login(resp.accessToken, resp.user);
      setAuth(resp.user, true);
      const decoded = jwtDecode(resp.accessToken);
      setExpiresAt(decoded.exp * 1000);

      clearAllSessionSnackbars();
      closeSnackbar();

      sessionTimer.start(resp.accessToken, {
        onWarn: () => {
          console.log("⚠️ Sesión por expirar");
          setSessionWarningActive();
          setShowSessionModal(true);
          const key = notify("Tu sesión expirará pronto.", "warning", { persist: true });
          addSessionSnackbarKey(key);
        },
        onExpire: () => {
          console.log("⛔ Sesión expirada");
          setSessionWarningActive();
          const key = notify("Tu sesión ha expirado.", "info", { persist: true });
          addSessionSnackbarKey(key);
          console.log("dirtyContext del login", isDirtyContext)
          logout(); 
        },
      });
      notify("Iniciaste sesión.", "info");
    } catch (error) {
      console.log("login error", error);
      throw error;
    }
  };

  const logout = async (modal = false, showNotify = false) => {
    try {
      console.log("Dirty REAL:", isDirtyRef.current);
       
      if (isDirtyRef.current) {
        const token = sessionStorage.getItem("token");
        const now = Date.now();

        if (token) {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 <= now) {
            console.log("Token expirado, refrescando antes del autosave...");
            await refreshSession();
          }
        }

        await runAutoSave();
   
      } else {
        console.log("No hay cambios pendientes, se omite refresh y autosave.");
      }

      await callEndpoint(logoutUserApi());
    } catch (error) {
      console.log("logout error", error);
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setLoadingContext(false);
      throw error;
    } finally {
      if (showNotify) { notify("Cerraste sesión.", "info") };
      sessionTimer.clear();
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setLoadingContext(false);
      setShowSessionModal(false);
      if (modal) {
        clearAllSessionSnackbars();
      }
      setIsDirtyContext(false);
    }
  };

  const refreshSession = async (showNotify = false) => {
    try {
      const resp = await callEndpoint(refreshApi());

      if (!resp?.token) throw new Error("No token returned");

      const { token, user } = resp; 

      authService.login(token, user);

      clearSessionWarningActive();

      if (sessionSnackbarKeys.length > 0) {
        clearAllSessionSnackbars();
      }

      const decoded = jwtDecode(token);
      setExpiresAt(decoded.exp * 1000);

      sessionTimer.start(token, {
        onWarn: () => {
          setSessionWarningActive();
          setShowSessionModal(true);
          const key = notify("Tu sesión expirará pronto.", "warning", { persist: true });
          addSessionSnackbarKey(key);
        },
        onExpire: () => {
          setSessionWarningActive();
          setShowSessionModal(false);
          const key = notify("Tu sesión ha expirado.", "info", { persist: true });
          console.log("dirtyContext del refresh", isDirtyContext)
          addSessionSnackbarKey(key);
          logout();
        },
      });

      setShowSessionModal(false);

      if(showNotify){
        notify("Sesión refrescada correctamente.", "success");
      }

    } catch (error) {
      console.error("Refresh failed", error);
      
      notify("No se pudo refrescar la sesión y se cerró de emergencia.", "error", { persist: true });
      
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        loading: loading,
        loadingContext,
        isAuthenticated,
        user,
        setAuth,
        updateUserInContext,
        showSessionModal,
        setShowSessionModal,
        login,
        logout,
        refreshSession,
        expiresAt
      }}
    >{children}
    </AuthContext.Provider>);
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};