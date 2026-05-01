/** Para birimi formatlayıcı. Backend currency kodu (TRY/USD/EUR) bekler. */
export function formatPrice(amount: number | null | undefined, currency: string | null | undefined = "TRY"): string {
  if (amount == null || isNaN(amount)) return "";
  const cur = (currency || "TRY").toUpperCase();
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: cur,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${cur}`;
  }
}
