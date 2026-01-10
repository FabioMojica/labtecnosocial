export const formatDuration = (raw) => {
  if (!raw) return "";

  const match = raw.match(/^(\d+)(s|m|h)$/i);
  if (!match) return "";

  const value = match[1];
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "s":
      return `${value} segundo${value !== "1" ? "s" : ""}`;
    case "m":
      return `${value} minuto${value !== "1" ? "s" : ""}`;
    case "h":
      return `${value} hora${value !== "1" ? "s" : ""}`;
    default:
      return "";
  }
};
