/**
 * URL'in sonuna querystring ekler. Boş/undefined/null değerleri eler.
 * Array'ler virgülle birleştirilir ya da axios `paramsSerializer` gibi
 * istenirse repeat edilebilir; burada en yaygın kullanım için virgül.
 *
 * @example
 * buildUrl('/api/v1/product', { page: 0, q: 'laptop' })
 * // → '/api/v1/product?page=0&q=laptop'
 */
export function buildUrl(baseUrl: string, params?: Record<string, unknown>): string {
  if (!params) return baseUrl;
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length > 0) searchParams.set(key, value.join(','));
      continue;
    }
    searchParams.set(key, String(value));
  }
  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
