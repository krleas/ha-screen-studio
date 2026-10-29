import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../src/studio.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function launch(memory = new Map()) {
  const makeNode = () => ({ value: '', style: {}, children: [], events: {}, hidden: false, clientWidth: 1400, clientHeight: 1000,
    classList: { toggle() {} }, setAttribute() {}, removeAttribute() {},
    addEventListener(name, handler) { this.events[name] = handler; },
    replaceChildren() { this.children = []; }, append(item) { this.children.push(item); }, blur() { this.events.change?.(); } });
  const nodes = Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m => [m[1], makeNode()]));
  const location = { pathname: 'blank' };
  nodes.dashboard.contentWindow = { location };
  nodes.dashboard.contentDocument = { addEventListener() {} };
  const alerts = [];
  const window = { events: {}, addEventListener(k, f) { this.events[k] = f; }, innerHeight: 1000 };
  window.parent = { postMessage() {} };
  const document = { baseURI: 'https://example.test/', body: { classList: { toggle() {} } },
    documentElement: {}, addEventListener() {}, createElement: makeNode,
    getElementById(id) { assert.ok(nodes[id], `Missing DOM node: ${id}`); return nodes[id]; } };
  vm.runInNewContext(script, { document, window, location: { search: '' }, URL, URLSearchParams,
    localStorage: { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v) },
    confirm: () => true, alert: m => alerts.push(m), prompt: () => 'Kitchen', requestAnimationFrame: f => f(), console });
  return { nodes, alerts, memory, window, location };
}
const click = (n, id) => n[id].events.click();
const zoom = (n, value) => { n.percent.value = value; n.percent.events.change(); };
test('first run requires own dashboard; validates paths; selection survives reload', () => {
  const { nodes: n, memory, alerts } = launch();
  assert.equal(n.dashboard.src, undefined);
  for (const path of ['https://example.com', '//example.com', '/api/states', '/screen-studio/studio', '/local/test', '/%61pi/states', '/lovelace/%2e%2e', '/lovelace%2fhome']) {
    n.dashboardPath.value = path; click(n, 'openDashboard'); assert.equal(n.dashboard.src, undefined, path);
  }
  assert.equal(alerts.length, 8);
  n.dashboardPath.value = '/my-dashboard/home'; click(n, 'openDashboard');
  assert.equal(n.dashboard.src, '/my-dashboard/home?kiosk');
  assert.equal(launch(memory).nodes.dashboard.src, '/my-dashboard/home?kiosk');
});
test('bar combinations and edit mode preserve the selected page', () => {
  const { nodes: n, location } = launch();
  n.dashboardPath.value = '/lovelace/home'; click(n, 'openDashboard');
  location.pathname = '/lovelace/kitchen';
  click(n, 'toggleHaMenu'); assert.equal(n.dashboard.src, '/lovelace/kitchen?hide_sidebar');
  click(n, 'toggleHaSidebar'); assert.equal(n.dashboard.src, '/lovelace/kitchen?disable_km');
  click(n, 'toggleHaMenu'); assert.equal(n.dashboard.src, '/lovelace/kitchen?hide_header');
  click(n, 'toggleHaSidebar'); assert.equal(n.dashboard.src, '/lovelace/kitchen?kiosk');
  click(n, 'edit'); assert.equal(n.dashboard.src, '/lovelace/kitchen?disable_km');
});
test('six presets keep independent zoom, including same-size presets and reload', () => {
  const { nodes: n, memory } = launch();
  const cases = [['preset1080', 1920, 1080, 65], ['preset1200', 1920, 1200, 70], ['presetShelly', 1280, 752, 85], ['presetEmel', 1920, 1200, 72], ['presetSamsung', 412, 915, 90], ['presetIphone', 393, 852, 95]];
  for (const [id, w, h, z] of cases) { click(n, id); assert.equal(n.screen.style.width, w + 'px'); assert.equal(n.screen.style.height, h + 'px'); zoom(n, z); }
  for (const [id, , , z] of cases) { click(n, id); assert.equal(n.screen.style.transform, `scale(${z / 100})`); }
  const reload = launch(memory).nodes;
  assert.equal(reload.screen.style.transform, 'scale(0.95)');
  click(reload, 'presetShelly'); assert.equal(reload.screen.style.transform, 'scale(0.85)');
});
test('rotation and custom preset restore device, size and updated zoom', () => {
  let { nodes: n, memory } = launch();
  click(n, 'presetSamsung'); zoom(n, 87); click(n, 'rotate');
  assert.equal(n.screen.style.width, '915px'); assert.equal(n.screen.style.height, '412px');
  click(n, 'saveCustom'); const id = n.customPreset.value;
  click(n, 'presetShelly'); n.customPreset.value = id; click(n, 'loadCustom');
  assert.equal(n.screen.style.transform, 'scale(0.87)');
  zoom(n, 92); n = launch(memory).nodes;
  assert.equal(n.screen.style.width, '915px'); assert.equal(n.screen.style.transform, 'scale(0.92)');
  n.customPreset.value = id; click(n, 'deleteCustom');
  assert.equal(JSON.parse(memory.get('ha-screen-studio-custom-presets'))[id], undefined);
});
test('dashboard list accepts messages from same-origin parent only', () => {
  const { window, nodes: n } = launch();
  const data = { type: 'ha-screen-studio-dashboards', dashboards: [{ path: '/lovelace', title: '<b>Home</b>' }, { path: '/api', title: 'API' }] };
  window.events.message({ source: window.parent, origin: 'https://evil.test', data });
  assert.equal(n.dashboardSelect.children.length, 0);
  window.events.message({ source: window.parent, origin: 'https://example.test', data });
  assert.equal(n.dashboardSelect.children.length, 2);
  assert.equal(n.dashboardSelect.children[1].textContent, '<b>Home</b>');
});
