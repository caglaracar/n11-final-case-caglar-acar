import type { JwtClaims } from "@/types/api";

/** JWT payload decode — imza doğrulamaz, yalnızca claim okumak için. */
export function decodeJwt(token: string | null): JwtClaims | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "===".slice((payload.length + 3) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

/** Token'ın süresi dolmuş mu? `exp` saniyedir. */
export function isExpired(claims: JwtClaims | null, skewMs = 0): boolean {
  if (!claims?.exp) return true;
  return claims.exp * 1000 <= Date.now() + skewMs;
}
