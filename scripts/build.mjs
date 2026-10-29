import { readFile, mkdir, writeFile } from 'node:fs/promises';
const html = await readFile(new URL('../src/studio.html', import.meta.url), 'utf8');
const wrapper = await readFile(new URL('../src/card.js', import.meta.url), 'utf8');
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/ha-screen-studio.js', import.meta.url), '// HA Screen Studio by Kopterworx · 0.1.0-beta.1 · MIT\nconst STUDIO_HTML = ' + JSON.stringify(html) + ';\n' + wrapper);
console.log('Built dist/ha-screen-studio.js');
