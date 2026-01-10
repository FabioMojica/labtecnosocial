import { createContext, useContext, useState, useRef, useEffect } from "react";

const DirtyContext = createContext();

export const DirtyProvider = ({ children }) => {
  const [isDirtyContext, setIsDirtyContext] = useState(false);
  const isDirtyRef = useRef(false);
  const autoSaveFnRef = useRef(null);

  useEffect(() => {
    isDirtyRef.current = isDirtyContext;
  }, [isDirtyContext]);

  const registerAutoSave = (fn) => {
    autoSaveFnRef.current = fn;
  };

  const runAutoSave = async () => {
    if (autoSaveFnRef.current) {
      await autoSaveFnRef.current();
      setIsDirtyContext(false);
    }
  };

  return (
    <DirtyContext.Provider value={{
      isDirtyContext,
      isDirtyRef,       
      setIsDirtyContext,
      registerAutoSave,
      runAutoSave
    }}>
      {children}
    </DirtyContext.Provider>
  );
};

export const useDirty = () => useContext(DirtyContext);
