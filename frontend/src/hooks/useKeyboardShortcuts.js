import { useEffect } from "react";

const useKeyboardShortcuts = ({ enabled, onEnter, onEscape }) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onEnter?.();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onEscape?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onEnter, onEscape]);
};

export default useKeyboardShortcuts;
