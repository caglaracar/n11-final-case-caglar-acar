import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { post, runSeed } from './_common.mjs';
import items from './data/categories.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const idMap = {};

await runSeed('Categories', items, async (item) => {
  const { id: mockId, ...payload } = item;
  const created = await post('/dev/v1/product/category/create', payload);
  if (mockId && created?.id) idMap[mockId] = created.id;
});

await writeFile(
  resolve(__dirname, 'data/.category-id-map.json'),
  JSON.stringify(idMap, null, 2),
);
console.log(`\n→ category id map yazıldı (${Object.keys(idMap).length} kayıt)`);
