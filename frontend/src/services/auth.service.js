// src/services/authService.ts
import { jwtDecode } from "jwt-decode";
import { saveSession, clearSession } from "../utils";

import { meApi, refreshApi } from "../api";

export const authService = {
  async validateSession() {
    const token = sessionStorage.getItem("token");
    if (!token) {
      const refreshed = await refreshApi();
      if (refreshed?.token) {
        saveSession(refreshed.token, refreshed.user);
        return refreshed;
      }
      clearSession();
      return null;
    }
    const decoded = jwtDecode(token); 
    if (decoded.exp * 1000 < Date.now()) {

      const refreshed = await refreshApi();
      if (refreshed?.token) {

        saveSession(refreshed.token, refreshed.user);
        return refreshed;
      }
      clearSession();
      return null;
    }

    try {
      const me = await meApi();
      if (me.user) {
        if (me.token) saveSession(me.token, me.user);
        return me;
      }

      const stored = sessionStorage.getItem("user");

      if (stored) return { user: JSON.parse(stored) };
      return null;
    } catch {
      clearSession();
      return null;
    }
  },

  login(token, user) {
    saveSession(token, user);
    return { token, user };
  },

  logout() {
    clearSession();
  },
};

