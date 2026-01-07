let logoutCallback = null;
let pendingLogout = null; 
let logoutInProgress = false;

export const authManager = {
  setLogoutCallback(fn) {
    logoutCallback = fn;

    if (pendingLogout !== null && !logoutInProgress) {
      logoutInProgress = true;
      logoutCallback(pendingLogout); 
      pendingLogout = null;
      logoutInProgress = false;
    }
  },

  logout(fromInterceptor = false) {
    if (logoutInProgress) return; 

    if (logoutCallback) {
      logoutInProgress = true;
      logoutCallback(fromInterceptor);
      logoutInProgress = false;
    } else {
      console.warn("Logout callback no registrado todavía, se marcará como pendiente");
      pendingLogout = fromInterceptor;
    }
  },
};
