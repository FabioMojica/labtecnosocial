import { createContext, useContext } from "react";

const LayoutContext = createContext(null);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout debe usarse dentro de LayoutProvider");
  } 
  return context;
};

export const LayoutProvider = LayoutContext.Provider;
