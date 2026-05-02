import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const API_BASE = process.env.API_BASE ?? 'http://localhost:8080';
export const TOKEN = process.env.ADMIN_TOKEN;

if (!TOKEN) {
  console.error('✗ ADMIN_TOKEN env değişkeni boş. Önce: export ADMIN_TOKEN="<accessToken>"');
  process.exit(1);
}

export async function loadJson(relativePath) {
  const full = resolve(__dirname, relativePath);
  const raw = await readFile(full, 'utf8');
  return JSON.parse(raw);
}

async function request(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`HTTP ${res.status} — JSON parse error: ${text.slice(0, 200)}`);
  }
  if (!res.ok || (json && json.result === false)) {
    const detail = json?.errorMessage?.message ?? json?.message ?? `HTTP ${res.status}`;
    throw new Error(detail);
  }
  return json?.data ?? null;
}

export const post = (path, body) => request('POST', path, body);
export const get = (path) => request('GET', path);

export async function runSeed(label, items, sendOne) {
  console.log(`\n→ ${label}: ${items.length} kayıt`);
  let ok = 0;
  let fail = 0;
  for (const item of items) {
    const name = item.name ?? item.title ?? item.slug ?? '(adsız)';
    try {
      await sendOne(item);
      console.log(`  ✓ ${name}`);
      ok++;
    } catch (e) {
      console.log(`  ✗ ${name} → ${e.message}`);
      fail++;
    }
  }
  console.log(`\n${label} bitti — ok: ${ok}, fail: ${fail}`);
}
