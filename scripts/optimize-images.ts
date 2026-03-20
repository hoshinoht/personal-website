import sharp from 'sharp';
import { join } from 'path';

const imagesDir = join(import.meta.dir, '..', 'public', 'images');
const source = join(imagesDir, 'profile.png');

console.log('Optimising profile images...\n');

// 560x560 WebP for Hero (2x retina at 280px) and AsteroidsGame
const webp = sharp(source)
  .resize(560, 560)
  .webp({ quality: 80 })
  .toFile(join(imagesDir, 'profile.webp'));

// 800x800 optimised PNG for OG/Twitter meta tags (palette mode for smaller size)
const tmpPng = join(imagesDir, 'profile-opt.png');
const png = sharp(source)
  .resize(800, 800)
  .png({ compressionLevel: 9, palette: true, colours: 256, dither: 1.0 })
  .toFile(tmpPng);

const [webpInfo, pngInfo] = await Promise.all([webp, png]);

// Overwrite original with optimised version
const { rename } = await import('fs/promises');
await rename(tmpPng, source);

console.log(`profile.webp  → ${(webpInfo.size / 1024).toFixed(1)} KB  (${webpInfo.width}x${webpInfo.height})`);
console.log(`profile.png   → ${(pngInfo.size / 1024).toFixed(1)} KB  (${pngInfo.width}x${pngInfo.height})`);
console.log('\nDone.');
