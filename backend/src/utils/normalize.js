export const normalizeRegulation = (val = "") =>
  val.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
