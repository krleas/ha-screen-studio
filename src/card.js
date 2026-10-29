// Bundled with STUDIO_HTML by scripts/build.mjs. No runtime dependencies.
class HAScreenStudio extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onResize = () => this._size();
    this._onMessage = event => {
      if (event.source === this._frame?.contentWindow && event.origin === location.origin && event.data?.type === 'ha-screen-studio-ready') this._sendDashboards();
    };
  }
  setConfig(config) { this._config = config; }
  set hass(hass) {
    this._hass = hass;
    if (this._frame) this._sendDashboards();
  }
  connectedCallback() {
    window.addEventListener('resize', this._onResize);
    window.addEventListener('message', this._onMessage);
    if (!this._frame) {
      const style = document.createElement('style');
      style.textContent = ':host { display:block; width:100%; min-height:400px; } iframe { display:block; width:100%; height:100%; border:0; background:#111318; }';
      this._frame = document.createElement('iframe');
      this._frame.title = 'HA Screen Studio by Kopterworx';
      this._frame.allow = 'fullscreen';
      this._frame.setAttribute('allowfullscreen', '');
      // srcdoc inherits the HA origin and its existing login. No token is copied.
      this._frame.srcdoc = STUDIO_HTML.replace('<head>', '<head><base href="' + location.origin + '/">');
      this._frame.addEventListener('load', () => { this._lastDashboards = null; this._sendDashboards(); });
      this.shadowRoot.append(style, this._frame);
    }
    this._observer ||= new ResizeObserver(() => this._size());
    this._observer.observe(this.parentElement || this);
    requestAnimationFrame(() => this._size());
  }
  disconnectedCallback() {
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('message', this._onMessage);
    this._observer?.disconnect();
  }
  _size() {
    const height = Math.max(400, window.innerHeight - Math.max(0, this.getBoundingClientRect().top));
    if (this.style.height !== height + 'px') this.style.height = height + 'px';
  }
  _sendDashboards() {
    if (!this._hass?.panels || !this._frame?.contentWindow) return;
    const dashboards = Object.entries(this._hass.panels)
      .filter(([path, panel]) => panel.component_name === 'lovelace' && path !== this._hass.panelUrl)
      .map(([path, panel]) => ({ path: '/' + path, title: panel.title || path }));
    const signature = JSON.stringify(dashboards);
    if (signature === this._lastDashboards) return;
    this._frame.contentWindow.postMessage({ type: 'ha-screen-studio-dashboards', dashboards }, location.origin);
    this._lastDashboards = signature;
  }
  getCardSize() { return 10; }
  static getStubConfig() { return {}; }
}
if (!customElements.get('ha-screen-studio')) customElements.define('ha-screen-studio', HAScreenStudio);
window.customCards ||= [];
if (!window.customCards.some(card => card.type === 'ha-screen-studio')) window.customCards.push({ type: 'ha-screen-studio', name: 'HA Screen Studio', description: 'Preview and edit dashboards at LCD and mobile viewport sizes.' });
