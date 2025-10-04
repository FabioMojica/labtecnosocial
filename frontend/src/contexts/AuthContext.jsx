import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const setAuth = (user, authenticated) => {
    setUser(user);
    setIsAuthenticated(authenticated);
    setLoading(false); 
  };


  return (
    <AuthContext.Provider value={{ loading, isAuthenticated, user, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
