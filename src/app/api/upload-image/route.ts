import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { supabaseServer } from '@/lib/supabase/server';
import { dbError } from '@/lib/apiError';
import { getAdminSession } from '@/lib/supabase/authServer';

/**
 * Admin-only image upload → Supabase Storage `site-images` bucket.
 * Auto-converts any image to WebP + creates 3 optimized variants (mobile/medium/large).
 * Returns URL pointing to large variant (admin references this).
 */

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const SIZES = {
  mobile: { width: 600, quality: 80 },
  medium: { width: 1000, quality: 82 },
  large: { width: 1600, quality: 85 },
};

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Keine Datei übermittelt.' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Nicht unterstütztes Bildformat.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Datei ist zu groß (max. 5 MB).' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = crypto.randomUUID();
  const supabase = supabaseServer();
  const urls: Record<string, string> = {};

  try {
    for (const [size, { width, quality }] of Object.entries(SIZES)) {
      const webp = await sharp(buffer)
        .resize(width, width, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();

      const path = `${id}-${size}.webp`;
      const { error } = await supabase.storage.from('site-images').upload(path, webp, {
        contentType: 'image/webp',
        cacheControl: '31536000',
      });
      if (error) throw new Error(error.message);

      const { data } = supabase.storage.from('site-images').getPublicUrl(path);
      urls[size] = data.publicUrl;
    }
  } catch (e) {
    return dbError('upload-image', e instanceof Error ? e : new Error(String(e)), 500);
  }

  return NextResponse.json({ url: urls.large });
}
