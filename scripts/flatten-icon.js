const { Jimp, JimpMime, PNGColorType } = require('jimp');
const fs = require('fs');

async function flattenIcon() {
  const img = await Jimp.read('assets/images/app-icon.png');
  const width = img.bitmap.width;
  const height = img.bitmap.height;

  // Create a solid white background and composite the original over it
  const bg = new Jimp({ width, height, color: 0xFFFFFFFF });
  bg.composite(img, 0, 0);

  // After compositing, set every pixel's alpha to 255 in the bitmap buffer
  // (bitmap.data is a Buffer of RGBA bytes)
  const data = bg.bitmap.data;
  for (let i = 3; i < data.length; i += 4) {
    data[i] = 255;
  }

  // Encode as RGB PNG (no alpha channel) using colorType=2, inputHasAlpha=false
  const buf = await bg.getBuffer(JimpMime.png, {
    colorType: PNGColorType.COLOR,
    inputHasAlpha: false,
  });

  fs.writeFileSync('assets/images/app-icon.png', buf);
  console.log(`Done: flattened ${width}x${height} icon, alpha removed.`);
}

flattenIcon().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
