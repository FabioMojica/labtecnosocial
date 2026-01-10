const KEY = "SESSION_WARNING_ACTIVE";

export const setSessionWarningActive = () => {
  sessionStorage.setItem(KEY, "true");
};

export const clearSessionWarningActive = () => {
  sessionStorage.removeItem(KEY);
};

export const isSessionWarningActive = () => {
  return sessionStorage.getItem(KEY) === "true";
};
