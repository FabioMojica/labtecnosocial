// import { createContext, useContext, useState } from "react";
// import { useNotification } from "./ToastContext";
// import { useNavigate } from "react-router-dom";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const { notify } = useNotification();
//   const navigate = useNavigate();

//   const setAuth = (user, authenticated) => {
//     setUser(user);
//     setIsAuthenticated(authenticated);
//     setLoading(false);
//   };

//   const updateUserInContext = (newUserData) => {
//     setUser((prev) => ({ ...prev, ...newUserData }));
//   };

//   const login = (token, user) => {
//   authService.login(token, user);
//   setAuth(user, true);

//   const decoded = jwtDecode(token);
//   const expTime = decoded.exp * 1000;
//   scheduleTokenWarning(expTime);

//   notify("Sesión iniciada", "info");
//   navigate("/inicio", { replace: true });
// };


//   const logout = () => {
//     setUser(null);
//     setIsAuthenticated(false);
//     setLoading(false);
//   };

//   return (
//     <AuthContext.Provider 
//       value={{ 
//         loading, 
//         isAuthenticated, 
//         user, 
//         setAuth, 
//         updateUserInContext,
//         login,
//         logout 
//       }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
//   return ctx;
// };

import { useContext, createContext, useState, useEffect } from "react";
import { authService } from "../services";
import { useFetchAndLoad } from "../hooks";
import { loginUserApi, logoutUserApi } from "../api";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const { loading, callEndpoint } = useFetchAndLoad();

  useEffect(() => {
    const validate = async () => {
      setLoadingContext(true);
      try {
        const session = await authService.validateSession();
        if (session?.user) {
          setAuth(session.user, true);
        } else {
          setAuth(null, false);
        }
      } catch (err) {
        setAuth(null, false);
      }
    };

    validate();
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
    } catch (error) {
      console.log("login error", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const resp = await callEndpoint(logoutUserApi());
      console.log("......", resp)
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setLoadingContext(false);
    } catch (error) {
      console.log("logout error", error);
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setLoadingContext(false);
      throw error;
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
        login,
        logout
      }}
    >{children}
    </AuthContext.Provider>);
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};