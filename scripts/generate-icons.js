import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(2, 9); // color type 2: RGB
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with filter type 0 (None) before each scanline
  const scanlineLength = 1 + width * 3;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter: None

    // Circular gradient or friendly design
    const cy = y - height / 2;
    for (let x = 0; x < width; x++) {
      const cx = x - width / 2;
      const dist = Math.sqrt(cx * cx + cy * cy) / (width * 0.5);

      let pr = r;
      let pg = g;
      let pb = b;

      // Draw a gold sun in center if inside 0.35 radius
      if (dist < 0.4) {
        pr = 250;
        pg = 204;
        pb = 21; // amber-300
      } else if (dist < 0.45) {
        pr = 245;
        pg = 158;
        pb = 11; // amber-500 ring
      } else {
        // slight gradient
        const factor = Math.min(1, Math.max(0, dist - 0.45));
        pr = Math.floor(r * (1 - factor * 0.3));
        pg = Math.floor(g * (1 - factor * 0.3));
        pb = Math.floor(b * (1 - factor * 0.2));
      }

      const pOffset = rowOffset + 1 + x * 3;
      rawData[pOffset] = pr;
      rawData[pOffset + 1] = pg;
      rawData[pOffset + 2] = pb;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = data.length;
  const buffer = Buffer.alloc(8 + length + 4);
  buffer.writeUInt32BE(length, 0);
  buffer.write(type, 4, 4, 'ascii');
  data.copy(buffer, 8);

  const crc = crc32(buffer.subarray(4, 8 + length));
  buffer.writeInt32BE(crc, 8 + length);
  return buffer;
}

// CRC32 table & function
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ -1;
}

// Generate files
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 192x192
const p192 = createPng(192, 192, 37, 99, 235);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), p192);

// 512x512
const p512 = createPng(512, 512, 37, 99, 235);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), p512);

// Maskable 512x512 (with padding safe zone)
const pMask = createPng(512, 512, 29, 78, 216);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pMask);

// Apple touch icon 180x180
const pApple = createPng(180, 180, 37, 99, 235);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pApple);

// Favicon
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), p192);

console.log('Successfully generated all PWA PNG icons!');
