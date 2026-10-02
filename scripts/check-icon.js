const fs = require('fs');
const buf = fs.readFileSync('assets/images/app-icon.png');
// PNG IHDR chunk: bytes 24 is color type
// 0=Grayscale, 2=RGB, 3=Indexed, 4=Grayscale+Alpha, 6=RGBA
const colorType = buf[25];
const colorTypeNames = { 0: 'Grayscale', 2: 'RGB (no alpha)', 3: 'Indexed', 4: 'Grayscale+Alpha', 6: 'RGBA (has alpha)' };
console.log('PNG color type:', colorType, '-', colorTypeNames[colorType] || 'Unknown');
if (colorType === 2 || colorType === 0 || colorType === 3) {
  console.log('PASS: No alpha channel.');
} else {
  console.log('FAIL: Alpha channel present!');
  process.exit(1);
}
