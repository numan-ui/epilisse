import crypto from 'node:crypto';
import sharp from 'sharp';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * Safety net for the CMS save routes: any `data:image/...;base64,` string that
 * still reaches a draft (old localStorage state, a paste, a future code path
 * that forgets /api/upload-image) is converted to WebP, stored in the
 * `site-images` bucket and replaced by its public URL. Base64 in these rows is
 * embedded into every SSR page and multiplies Fast Origin Transfer.
 *
 * WebP is re-encoded lossless; anything else is re-encoded at q90 (visually lossless),
 * downscaled only above 2400px wide. Content-hash filenames dedupe repeats.
 */
const DATA_URI = /^data:image\/([a-z+]+);base64,([\s\S]+)$/;
// Same gate as /api/upload-image: raster types only (no svg), 5 MB decoded cap.
const ALLOWED = new Set(['jpeg', 'png', 'webp', 'gif']);
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;

async function toUrl(uri: string): Promise<string> {
  const m = DATA_URI.exec(uri);
  if (!m) return uri;
  if (!ALLOWED.has(m[1])) throw new Error(`externalizeImages: unsupported type ${m[1]}`);
  // base64 length → decoded size, checked before allocating the buffer
  if (m[2].length * 0.75 > MAX_BYTES) throw new Error('externalizeImages: image exceeds 5 MB');
  const buf = Buffer.from(m[2], 'base64');
  const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 24);
  // Always decode through sharp so the stored bytes are a verified image, never
  // an arbitrary payload labelled image/webp. WebP input is re-encoded lossless.
  const img = sharp(buf, { limitInputPixels: MAX_PIXELS });
  const out =
    m[1] === 'webp'
      ? await img.webp({ lossless: true }).toBuffer()
      : await img.resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 90 }).toBuffer();
  const supabase = supabaseServer();
  const file = `migrated-${hash}.webp`;
  const { error } = await supabase.storage.from('site-images').upload(file, out, {
    contentType: 'image/webp',
    cacheControl: '31536000',
    upsert: true,
  });
  if (error) throw new Error(`externalizeImages upload: ${error.message}`);
  return supabase.storage.from('site-images').getPublicUrl(file).data.publicUrl;
}

export async function externalizeDataImages<T>(node: T): Promise<T> {
  if (typeof node === 'string') {
    return (node.startsWith('data:image/') ? await toUrl(node) : node) as T;
  }
  if (Array.isArray(node)) {
    return (await Promise.all(node.map((n) => externalizeDataImages(n)))) as T;
  }
  if (node && typeof node === 'object') {
    const entries = await Promise.all(
      Object.entries(node as Record<string, unknown>).map(async ([k, v]) => [k, await externalizeDataImages(v)] as const),
    );
    return Object.fromEntries(entries) as T;
  }
  return node;
}
