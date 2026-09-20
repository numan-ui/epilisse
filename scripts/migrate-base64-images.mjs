// One-off: move base64 data-URI images out of the CMS JSONB rows into Supabase Storage.
//   node scripts/migrate-base64-images.mjs            → dry run (backup + report, no writes)
//   node scripts/migrate-base64-images.mjs --apply    → upload + rewrite rows
// Quality: WebP inputs are uploaded byte-for-byte; others re-encoded at q90,
// only downscaled if wider than 2400px. Identical images are deduped by hash.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const TABLES = ['site_categories_content', 'site_page_content', 'site_content'];
const DATA_URI = /^data:image\/([a-z+]+);base64,(.+)$/s;
const backupDir = path.join('scripts', '_backup-' + new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(backupDir, { recursive: true });

const cache = new Map(); // sha256 → public url
const stats = { found: 0, uploaded: 0, before: 0, after: 0 };

async function toUrl(uri) {
  const m = DATA_URI.exec(uri);
  if (!m) return uri;
  const buf = Buffer.from(m[2], 'base64');
  const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 24);
  stats.found++;
  stats.before += uri.length;
  if (cache.has(hash)) return cache.get(hash);
  let out = buf;
  if (m[1] !== 'webp') {
    const meta = await sharp(buf).metadata();
    out = await sharp(buf)
      .resize({ width: 2400, withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();
    console.log(`  ${m[1]} ${meta.width}x${meta.height} ${buf.length}B → webp ${out.length}B`);
  }
  const file = `migrated-${hash}.webp`;
  let url = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-images/${file}`;
  if (APPLY) {
    const { error } = await sb.storage.from('site-images').upload(file, out, {
      contentType: 'image/webp', cacheControl: '31536000', upsert: true,
    });
    if (error) throw new Error(`upload ${file}: ${error.message}`);
    stats.uploaded++;
  }
  stats.after += url.length;
  cache.set(hash, url);
  return url;
}

async function walk(node) {
  if (typeof node === 'string') return node.startsWith('data:image/') ? toUrl(node) : node;
  if (Array.isArray(node)) { for (let i = 0; i < node.length; i++) node[i] = await walk(node[i]); return node; }
  if (node && typeof node === 'object') { for (const k of Object.keys(node)) node[k] = await walk(node[k]); return node; }
  return node;
}

for (const t of TABLES) {
  const { data: rows, error } = await sb.from(t).select('*');
  if (error) throw new Error(`${t}: ${error.message}`);
  fs.writeFileSync(path.join(backupDir, `${t}.json`), JSON.stringify(rows));
  for (const row of rows) {
    const sizeBefore = JSON.stringify(row).length;
    const upd = {};
    for (const col of ['draft', 'published']) {
      if (row[col] == null) continue;
      const copy = JSON.parse(JSON.stringify(row[col]));
      const next = await walk(copy);
      if (JSON.stringify(next) !== JSON.stringify(row[col])) upd[col] = next;
    }
    const cols = Object.keys(upd);
    console.log(`${t} id=${row.id}: ${sizeBefore}B, changed cols: ${cols.join(',') || 'none'}`);
    if (APPLY && cols.length) {
      // Guard: only write if the row wasn't modified since we read it.
      const { data, error: e } = await sb.from(t).update(upd).eq('id', row.id).eq('updated_at', row.updated_at).select('id');
      if (e) throw new Error(`${t} update: ${e.message}`);
      if (!data?.length) console.warn(`  ! ${t} row changed during migration — skipped, rerun`);
    }
  }
}
console.log(APPLY ? 'APPLIED' : 'DRY RUN', stats, 'backup:', backupDir);
