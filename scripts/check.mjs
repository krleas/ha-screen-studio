import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.filter(e => !['.git', 'node_modules', 'artifacts', '__pycache__'].includes(e.name) && !e.name.endsWith('.pyc')).map(e => e.isDirectory() ? files(new URL(e.name + '/', dir)) : new URL(e.name, dir)))).flat();
}
for (const file of await files(root)) {
  const text = await readFile(file, 'utf8');
  assert.ok(!/192\.168\.\d+\.\d+|\/control-4(?:\/|\?)|[A-Za-z0-9._%+-]+@(?:gmail|outlook)\.com|gh[pousr]_[A-Za-z0-9]{20,}|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY/.test(text), `Private data found in ${file.pathname}`);
}
const html = await readFile(new URL('src/studio.html', root), 'utf8');
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
new vm.Script(await readFile(new URL('dist/ha-screen-studio.js', root), 'utf8'));
const hacs = JSON.parse(await readFile(new URL('hacs.json', root), 'utf8'));
assert.equal(hacs.render_readme, true);
const manifest = JSON.parse(await readFile(new URL('custom_components/ha_screen_studio/manifest.json', root), 'utf8'));
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
assert.equal(manifest.domain, 'ha_screen_studio');
assert.equal(manifest.config_flow, true);
assert.equal(manifest.version, pkg.version);
const bundle = await readFile(new URL('dist/ha-screen-studio.js', root), 'utf8');
assert.ok(bundle.includes(JSON.stringify(html)));
assert.equal(bundle, await readFile(new URL('custom_components/ha_screen_studio/www/ha-screen-studio.js', root), 'utf8'));
assert.ok((await readFile(new URL('custom_components/ha_screen_studio/const.py', root), 'utf8')).includes('VERSION = "' + pkg.version + '"'));
console.log('Syntax, bundle, HACS manifest and private-data checks passed.');
