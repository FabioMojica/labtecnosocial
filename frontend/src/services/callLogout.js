let logoutCallback = null;

export const setLogoutCallback = (cb) => {
  logoutCallback = cb;
};

export const triggerLogout = () => {
    console.log(logoutCallback)
  if (logoutCallback) logoutCallback();
};
