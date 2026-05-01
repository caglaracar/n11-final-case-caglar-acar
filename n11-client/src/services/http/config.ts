/** Tek noktada API tabanı. Geliştirmede vite proxy "/api → :8080/dev/v1". */
export const API_BASE: string =
  ((import.meta as ImportMeta).env?.VITE_API_BASE as string) || "/api";
