# HA Screen Studio by Kopterworx

Preview and edit your Home Assistant dashboards at fixed LCD and mobile viewport sizes, directly inside Home Assistant.

![LCD preview with fictional demo data](docs/images/lcd-demo.jpg)

![Mobile preview with fictional demo data](docs/images/mobile-demo.jpg)

Screenshots use a fictional demonstration page; no private installation data is shown.

**Early beta: v0.1.0-beta.1.** The original standalone editor has been tested on the author's installation. The HACS wrapper and dashboard picker are new; feedback from other installations is welcome. This is a custom HACS repository, not an entry in the default HACS catalog.

## What it does

- Preview a dashboard in a fixed-size viewport, scaled to your computer screen.
- Switch between LCD and mobile profiles, or enter a custom size.
- Use 1920 × 1080, 1920 × 1200, Shelly XL, EMEL S10, Samsung and iPhone presets.
- Remember zoom or Fit to window separately for every preset.
- Rotate the viewport, enter fullscreen, and save named custom presets.
- Show or hide the HA top and left bars independently.
- Return to the normal Home Assistant dashboard editor with **Edit cards**.
- Choose your own dashboard. No author's dashboard paths or HA address are included.

Studio uses the normal HA editor; it does not provide a separate card editor. Changes saved while editing are real changes to the selected dashboard.

## Requirements

- A working Home Assistant installation and an existing dashboard.
- An up-to-date desktop browser. This beta is intended for desktop dashboard authoring.
- HACS for the recommended installation method.
- [kiosk-mode](https://github.com/NemesisRE/kiosk-mode) installed and registered as a dashboard resource for top/left-bar controls. Without it, viewport preview works but the bar buttons cannot hide HA menus.

## Install with HACS

1. In HACS, open the menu → **Custom repositories**.
2. Add `https://github.com/krleas/ha-screen-studio` as category **Dashboard** (called **Plugin** in older HACS versions).
3. Find **HA Screen Studio by Kopterworx** and download it. Enable beta releases if HACS does not offer the prerelease; the default branch can also be used for testing.
4. Confirm a JavaScript module resource exists at `/hacsfiles/ha-screen-studio/ha-screen-studio.js`. HACS normally registers it. If missing, add it under Settings → Dashboards → Resources as **JavaScript Module**.
5. Create an empty dashboard called **Screen Studio** with URL path `screen-studio` and show it in the sidebar. Take control if Home Assistant initially creates a generated dashboard.
6. In its raw configuration editor, paste:

```yaml
kiosk_mode:
  hide_header: true
views:
  - title: Screen Studio
    path: studio
    type: panel
    cards:
      - type: custom:ha-screen-studio
```

The `kiosk_mode` block hides only the outer Studio dashboard's top bar. The HA sidebar remains available. Omit that block if you want the outer bar visible.

7. Reload the browser and open Screen Studio from the sidebar.
8. Choose **your dashboard** in the Dashboard selector. You can also enter a local path such as `/lovelace/home` and click **Open**. No HA IP address, API token or separate login is needed.

The dashboard list comes from panels accessible to your current HA user. The Studio host dashboard is excluded to avoid opening Studio inside itself. If a dashboard does not appear, enter its local path directly.

## Manual installation

Copy `dist/ha-screen-studio.js` into `/config/www/ha-screen-studio.js`, then register `/local/ha-screen-studio.js?v=0.1.0-beta.1` as a JavaScript Module resource. Follow steps 5–8 above. Change the version query when updating a manually installed file to avoid stale browser caches.

## Presets and pixels

| Preset | Width × height | Purpose |
| --- | --- | --- |
| Full HD | 1920 × 1080 | Landscape LCD |
| WUXGA / EMEL S10 | 1920 × 1200 | Landscape LCD; EMEL profile follows the original tested setup |
| Shelly Wall Display XL | 1280 × 752 | LCD starting point ([manufacturer specification](https://www.shelly.com/de/blogs/documentation/shelly-wall-display-xl)) |
| Samsung | 412 × 915 | Approximate mobile layout starting point |
| iPhone | 393 × 852 | Approximate mobile layout starting point |

Dimensions are **CSS pixels**, not necessarily the panel's physical pixel count. Mobile presets are approximate and are not exact emulations of every model. Browser zoom, Android display scaling, status/navigation bars and safe areas affect the actual available viewport. Validate the final layout on the real device.

Rotation keeps the current zoom and becomes a manually sized profile; it does not overwrite a built-in preset's dimensions. Save a custom preset if you want a named landscape/portrait variant.

## Privacy and behavior

Studio runs on your Home Assistant origin using your existing HA login. It does not request or store an access token. It has no analytics, telemetry, CDN dependencies or external runtime services. Settings, preset names and the selected local dashboard path are stored in this browser's local storage, shared by Studio instances on the same HA origin. They are not synced between browsers or users sharing that browser profile. Clearing site data removes these settings.

Preview is interactive: dashboard buttons can still control your real devices. Use a demo dashboard when recording public videos or screenshots.

## Known beta limitations

- This is viewport resizing, not device/user-agent or touchscreen emulation.
- kiosk-mode dashboard, per-user or cached rules can override URL flags. If a bar toggle has no effect, check those rules. Studio does not rewrite other dashboards' kiosk settings.
- **Edit cards** displays the HA menus; start editing through HA's normal dashboard menu. Save before switching modes, bars or dashboards.
- Fullscreen availability depends on browser and embedding permissions. When browser fullscreen is unavailable, Studio hides its controls and provides an **Exit fullscreen** button.
- Only same-origin dashboard paths are supported. Settings, API paths and the standard Studio host paths are rejected. Do not point Studio at another Studio wrapper under a different custom URL.
- Public distribution and broader HA/browser compatibility are still being tested.

## Report a problem

Open a [GitHub issue](https://github.com/krleas/ha-screen-studio/issues) with the Studio, HA, kiosk-mode and browser versions, reproduction steps, chosen preset and zoom. Remove private details from screenshots and console output.

## Development

Node.js 20 or later; no npm dependencies:

```sh
npm run build
npm test
npm run check
```

Edit `src/studio.html` and `src/card.js`, rebuild, and commit `dist/ha-screen-studio.js` with the sources. The standalone HTML prototype is not shipped as a second installation dependency: the distribution is a single bundled module.

## Support

Free and open source under the MIT license. If it helps you, star the repository, test a release or report a useful issue. GitHub Sponsors setup for [krleas](https://github.com/krleas) is being prepared; a funding declaration does not mean payouts are activated.

Created by **Kopterworx**. This community project is not affiliated with Home Assistant, HACS, Shelly, Samsung or Apple.
