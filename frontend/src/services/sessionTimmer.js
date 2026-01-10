import { jwtDecode } from "jwt-decode";
import { SESSION_WARNING_MS } from "../utils/generalConfig/session.config";

let warningTimeout = null;
let logoutTimeout = null;

export const sessionTimer = {
  start(token, { onWarn, onExpire }) {
    this.clear();

    const decoded = jwtDecode(token);
    const expMs = decoded.exp * 1000;
    const now = Date.now();

    const timeUntilExpire = expMs - now;

    if (timeUntilExpire <= 0) {
      onExpire();
      return;
    }

    const warnAt = timeUntilExpire - SESSION_WARNING_MS;

    console.log(
      "⏰ Aviso en:",
      Math.round(warnAt / 1000),
      "segundos"
    );
    console.log(
      "⛔ Expira en:",
      Math.round(timeUntilExpire / 1000),
      "segundos"
    );

    if (warnAt > 0) {
      warningTimeout = setTimeout(() => {
        onWarn();
      }, warnAt);
    }

    logoutTimeout = setTimeout(() => {
      onExpire();
    }, timeUntilExpire);
  },

  clear() {
    if (warningTimeout) clearTimeout(warningTimeout);
    if (logoutTimeout) clearTimeout(logoutTimeout);
    warningTimeout = null;
    logoutTimeout = null;
  },
};
