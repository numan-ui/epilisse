import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function checkBucket() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    const env = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
    const match = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
    const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
    url = match?.[1];
    key = keyMatch?.[1];
  }

  if (!url || !key) {
    console.error('Missing env vars');
    return;
  }

  const supabase = createClient(url, key);
  const { data: files, error } = await supabase.storage.from('site-images').list();

  if (error) {
    console.error('Bucket read failed:', error.message);
    return;
  }

  console.log(`\n📦 Bucket: ${files?.length || 0} files\n`);

  const webpFiles = files?.filter(f => f.name.endsWith('.webp')) || [];
  const otherFiles = files?.filter(f => !f.name.endsWith('.webp')) || [];

  if (webpFiles.length > 0) {
    console.log('✅ WebP files:');
    webpFiles.forEach(f => {
      console.log(`   ${f.name} (${(f.metadata?.size / 1024).toFixed(1)} KB)`);
    });
  }

  if (otherFiles.length > 0) {
    console.log('\n⚠️  Non-WebP files:');
    otherFiles.forEach(f => {
      console.log(`   ${f.name} (${(f.metadata?.size / 1024).toFixed(1)} KB)`);
    });
  }

  console.log('\n');
}

checkBucket();
