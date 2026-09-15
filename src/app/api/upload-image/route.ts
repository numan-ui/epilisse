import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { dbError } from '@/lib/apiError';
import { getAdminSession } from '@/lib/supabase/authServer';

/**
 * Admin-only image upload → Supabase Storage `site-images` bucket (public
 * read, see supabase/migrations/0027_site_images_bucket.sql). Replaces the
 * old ImageUpload.tsx behavior of embedding images as base64 data URIs
 * directly into site_content JSONB, which bloated every page's SSR HTML.
 */

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
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
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: 'Nicht unterstütztes Bildformat.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Datei ist zu groß (max. 5 MB).' }, { status: 400 });
  }

  const path = `${crypto.randomUUID()}.${ext}`;
  const supabase = supabaseServer();
  const { error } = await supabase.storage
    .from('site-images')
    .upload(path, file, { contentType: file.type, cacheControl: '31536000' });
  if (error) return dbError('upload-image', error, 500);

  const { data } = supabase.storage.from('site-images').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
