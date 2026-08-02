const sharp = require('sharp');
const path = require('path');

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="#0A0A0A"/>
  <text x="50%" y="46%" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="88" font-weight="700" fill="#FFFFFF">AI Tool Hunter</text>
  <rect x="${WIDTH / 2 - 140}" y="${HEIGHT * 0.46 + 40}" width="280" height="4" fill="#7C3AED"/>
  <text x="50%" y="62%" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="400" fill="#888888">Find the Top 1% of AI Tools</text>
</svg>
`;

const outPath = path.join(__dirname, '..', 'public', 'og-image.png');

sharp(Buffer.from(svg))
  .resize(WIDTH, HEIGHT)
  .png()
  .toFile(outPath)
  .then((info) => {
    console.log('Created og-image.png', info);
  })
  .catch((err) => {
    console.error('Failed to generate og-image.png', err);
    process.exit(1);
  });
