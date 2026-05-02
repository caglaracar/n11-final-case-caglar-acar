import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { get, post, runSeed } from './_common.mjs';
import items from './data/products.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 1) önce seed-categories tarafından yazılmış mock-id → real-id map'i dene
let idMap = {};
try {
  const raw = await readFile(resolve(__dirname, 'data/.category-id-map.json'), 'utf8');
  idMap = JSON.parse(raw);
} catch {
  // map yoksa devam, slug/name fallback'i kullanılacak
}

// 2) backend'den kategorileri çek — slug ve name üzerinden de resolve etsin
const categories = await get('/dev/v1/product/category/find-all');
const bySlug = new Map();
const byName = new Map();
for (const c of Array.isArray(categories) ? categories : []) {
  if (c.slug) bySlug.set(c.slug.toLowerCase(), c.id);
  if (c.name) byName.set(c.name.toLowerCase(), c.id);
}

function resolveCategoryId(item) {
  const raw = item.categoryId;
  if (raw && idMap[raw]) return idMap[raw];
  if (raw && (bySlug.has(raw.toLowerCase()) || byName.has(raw.toLowerCase()))) {
    return bySlug.get(raw.toLowerCase()) ?? byName.get(raw.toLowerCase());
  }
  if (item.categorySlug && bySlug.has(item.categorySlug.toLowerCase())) {
    return bySlug.get(item.categorySlug.toLowerCase());
  }
  if (item.categoryName && byName.has(item.categoryName.toLowerCase())) {
    return byName.get(item.categoryName.toLowerCase());
  }
  // raw bir UUID/sequence id ise olduğu gibi geç
  if (raw && !raw.startsWith('cat-')) return raw;
  return null;
}

await runSeed('Products', items, async (item) => {
  const categoryId = resolveCategoryId(item);
  if (!categoryId) throw new Error(`categoryId resolve edilemedi (input: ${item.categoryId ?? item.categoryName})`);
  const { categoryName: _n, categorySlug: _s, ...rest } = item;
  await post('/dev/v1/product/create', { ...rest, categoryId });
});
