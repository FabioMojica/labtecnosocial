export const AUTH_CONFIG = {
  TOKEN_WARNING_MINUTES: Number(
    import.meta.env.VITE_TOKEN_WARNING_MINUTES ?? 10
  ),
};
