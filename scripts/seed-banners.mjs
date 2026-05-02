import { post, runSeed } from './_common.mjs';
import items from './data/banners.mjs';

await runSeed('Banners', items, (item) => post('/dev/v1/banner/create', item));
