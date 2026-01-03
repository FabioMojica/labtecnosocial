let logoutCallback = null;
let pendingLogout = false;

export const authManager = {
  setLogoutCallback(fn) {
    logoutCallback = fn;

    if (pendingLogout) {
      logoutCallback(true);
      pendingLogout = false;
    }
  },

  logout(fromInterceptor = false) {
    if (logoutCallback) {
      logoutCallback(fromInterceptor);
    } else {
      console.warn("Logout callback no registrado todavía, se marcará como pendiente");
      pendingLogout = true;
    }
  },
};
