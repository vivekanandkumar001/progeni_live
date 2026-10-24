const fs = require('fs');
const path = 'C:/Users/vivekanand/Desktop/Progeni/progeni.live/src/registry/products.json';
const p = JSON.parse(fs.readFileSync(path, 'utf8'));

// Progeni Bench: the product really ships 120 tools now (30 legacy + 42 image + 48 audio).
p[0].shortDescription =
  '120 private browser tools including images, audio, files, data, media, crafts and productivity — running locally with no server uploads.';
p[0].description =
  'Progeni Bench is a private, client-side toolkit of 120 utilities: 30 legacy file, craft and data tools plus 42 image tools and 48 audio tools. ' +
  'It includes Avery label makers, sticker sheets, image resize/convert/compress, audio conversion, trimming, loudness analysis and recording, ' +
  'subtitle timing repair, CSV and vCard cleaning, QR and barcode generators, SVG optimisation and more. ' +
  'Every tool processes files in browser memory using Web Workers, Canvas, Web Audio and FFmpeg.wasm, so files are never uploaded to a server.';
p[0].capabilities = [
  '30 legacy utilities for labels, stickers, cross-stitch and diamond painting, subtitles, CSV and vCard cleanup, bookmarks, SVG and photos',
  '42 image utilities for resizing, cropping, compressing, converting, watermarking, stripping metadata and optimising SVG',
  '48 audio utilities for converting, trimming, joining, normalising, loudness (LUFS) analysis, recording and applying effects',
  'All processing happens locally in the browser; there is no upload endpoint and no account',
];
p[0].tags = [
  'bench',
  'image tools',
  'audio tools',
  'labels',
  'avery 5160',
  'sticker sheet',
  'subtitle timing',
  'csv',
  'vcard',
  'cropper',
  'audio converter',
  'loudness',
  'zero-upload',
  'client-side',
];
p[0].updatedAt = '2026-10-24T00:00:00Z';

// WaKit: naming, scope and the 16 MB limit stated accurately.
p[1].name = 'WaKit';
p[1].shortDescription =
  'Free client-side WhatsApp utilities: split 30-second status videos, open a chat without saving a number, generate QR and link codes, and compress audio to fit the 16 MB limit.';
p[1].description =
  'WaKit is a set of WhatsApp productivity tools that run entirely in the browser with WebAssembly. ' +
  'Split a long video into exact 30-second status clips with lossless FFmpeg stream copy, open a wa.me chat without adding a contact, ' +
  'generate WhatsApp chat links and QR codes, and transcode audio so it fits the 16 MB document limit. ' +
  'There is no upload endpoint: media is read from the file picker into browser memory and released when you clear the tool.';
p[1].capabilities = [
  'Split videos into exact 30-second WhatsApp status clips with lossless stream copy',
  'Open a WhatsApp chat from a phone number without saving it to contacts',
  'Generate wa.me links and QR codes, including Wi-Fi and payment payloads',
  'Compress audio to the 16 MB WhatsApp document limit with local FFmpeg transcoding',
];
p[1].seo.title = 'WaKit — Private WhatsApp Status Splitter, Direct Chat, QR and Audio Tools';
p[1].seo.description =
  'Split WhatsApp status videos, message without saving numbers, generate QR codes and compress audio to 16 MB — in your browser, no uploads.';
p[1].updatedAt = '2026-10-24T00:00:00Z';

fs.writeFileSync(path, JSON.stringify(p, null, 2) + '\n');
console.log('products.json updated:', p.length, 'products');
