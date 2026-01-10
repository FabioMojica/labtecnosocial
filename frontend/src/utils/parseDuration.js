export const parseDuration = (value) => {
  if (!value || typeof value !== "string") return null;

  const match = value.trim().match(/^(\d+)\s*(s|m|h)$/i);

  if (!match) {
    throw new Error(
      `Duración inválida "${value}". Usa formatos como: 30s, 10m, 1h`
    );
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "s":
      return amount * 1000;
    case "m":
      return amount * 60 * 1000;
    case "h":
      return amount * 60 * 60 * 1000;
    default:
      return null;
  }
};
