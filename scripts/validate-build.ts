import fs from 'fs';
import path from 'path';

const checks = [
  {
    name: 'No .png files in public/images',
    test: () => {
      const images = fs.readdirSync(path.join(process.cwd(), 'public', 'images'));
      const pngs = images.filter(f => f.endsWith('.png'));
      return { pass: pngs.length === 0, found: pngs };
    },
  },
  {
    name: 'No unoptimized .jpg files',
    test: () => {
      const images = fs.readdirSync(path.join(process.cwd(), 'public', 'images'));
      const jpgs = images.filter(f => f.endsWith('.jpg'));
      return { pass: jpgs.length === 0, found: jpgs };
    },
  },
  {
    name: '.next build directory exists',
    test: () => {
      const exists = fs.existsSync(path.join(process.cwd(), '.next'));
      return { pass: exists, found: exists };
    },
  },
];

console.log('\n📦 Build Validation\n');
let passed = 0;
let failed = 0;

for (const check of checks) {
  const result = check.test();
  const status = result.pass ? '✓' : '✗';
  console.log(`${status} ${check.name}`);
  if (!result.pass) {
    console.log(`  Found: ${JSON.stringify(result.found)}`);
    failed++;
  } else {
    passed++;
  }
}

console.log(`\n${passed}/${checks.length} passed\n`);

if (failed > 0) {
  process.exit(1);
}
