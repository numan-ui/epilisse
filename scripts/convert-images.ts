import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagesDir = path.join(process.cwd(), 'public', 'images');

async function convertImages() {
  const files = fs.readdirSync(imagesDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  console.log(`Found ${files.length} images to convert:\n`);

  for (const file of files) {
    const input = path.join(imagesDir, file);
    const output = path.join(imagesDir, `${path.parse(file).name}.webp`);

    try {
      await sharp(input)
        .webp({ quality: 85 })
        .toFile(output);

      fs.unlinkSync(input);
      console.log(`✓ ${file} → ${path.basename(output)}`);
    } catch (e) {
      console.error(`✗ ${file}: ${(e as Error).message}`);
    }
  }
  console.log('\nDone!');
}

convertImages();
