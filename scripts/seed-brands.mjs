import { post, runSeed } from './_common.mjs';
import items from './data/brands.mjs';

await runSeed('Brands', items, (item) => post('/dev/v1/product/brand/create', item));
