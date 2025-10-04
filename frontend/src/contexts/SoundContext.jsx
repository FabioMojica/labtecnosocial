import { createContext, useContext, useState } from "react";

const SoundContext = createContext({
  settings: { enabled: true, volume: 1 },
  setSettings: () => {},
});

export const useSound = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
  const [settings, setSettingsState] = useState(() => {
    const saved = localStorage.getItem("soundSettings");
    return saved ? JSON.parse(saved) : { enabled: true, volume: 1 };
  });

  const setSettings = (newSettings) => {
    setSettingsState(newSettings);
    localStorage.setItem("soundSettings", JSON.stringify(newSettings));
  };

  return (
    <SoundContext.Provider value={{ settings, setSettings }}>
      {children}
    </SoundContext.Provider>
  );
};

