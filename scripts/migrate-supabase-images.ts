import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SIZES = {
  mobile: { width: 600, quality: 80 },
  medium: { width: 1000, quality: 82 },
  large: { width: 1600, quality: 85 },
};

async function migrateImages() {
  const env = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
  const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
  const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
  const url = urlMatch?.[1];
  const key = keyMatch?.[1];

  if (!url || !key) {
    console.error('Missing env vars in .env.local');
    return;
  }

  const supabase = createClient(url, key);
  const { data: files, error } = await supabase.storage.from('site-images').list();

  if (error) {
    console.error('Failed to list images:', error.message);
    return;
  }

  console.log(`Found ${files?.length || 0} files in site-images bucket\n`);

  for (const file of files || []) {
    if (file.name.endsWith('.webp') || !file.name.match(/\.(png|jpg|jpeg|gif)$/i)) {
      console.log(`⊘ ${file.name} (already WebP or unsupported)`);
      continue;
    }

    const { data: buffer, error: downloadError } = await supabase.storage
      .from('site-images')
      .download(file.name);

    if (downloadError || !buffer) {
      console.error(`✗ ${file.name}: download failed`);
      continue;
    }

    const id = file.name.split('.')[0];
    const buf = Buffer.from(await buffer.arrayBuffer());

    try {
      for (const [size, { width, quality }] of Object.entries(SIZES)) {
        const webp = await sharp(buf)
          .resize(width, width, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality })
          .toBuffer();

        const path = `${id}-${size}.webp`;
        const { error: uploadError } = await supabase.storage
          .from('site-images')
          .upload(path, webp, { contentType: 'image/webp', cacheControl: '31536000' });

        if (uploadError) throw new Error(uploadError.message);
      }
      console.log(`✓ ${file.name} → 3 WebP variants created`);
    } catch (e) {
      console.error(`✗ ${file.name}: ${(e as Error).message}`);
    }
  }

  console.log('\nMigration complete!');
}

migrateImages();
