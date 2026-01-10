import { parseDuration } from "../parseDuration";

export const SESSION_WARNING_RAW =
  import.meta.env.VITE_SESSION_WARNING_TIME ?? "10m";

export const SESSION_WARNING_MS =
  parseDuration(SESSION_WARNING_RAW);
