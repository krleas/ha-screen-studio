# Screen Studio reference and troubleshooting

[Back to the quick installation guide](https://github.com/krleas/ha-screen-studio#installation)

### Release and beta updates

The first regular release is **v0.2.0**. HACS can track regular releases without enabling Pre-release. Existing beta.2/beta.3 installations can update to v0.2.0 normally and restart HA once; there is no need to re-add the integration.

Only enable the repository's **Pre-release** switch if you want future beta versions as well. The switch is provided by HACS; see [HACS documentation](https://www.hacs.dev/docs/use/entities/switch/). Earlier betas could show a short default-branch commit ID when beta tracking was off and no regular release existed. Install tagged releases rather than `main` for normal use.

### kiosk-mode detection

After a dashboard loads, Studio checks that dashboard's `window.KioskMode` runtime, as exposed by kiosk-mode v14/v15. It waits up to 20 seconds for startup. A script URL alone is not treated as proof that the add-on started successfully.

A missing or failed runtime displays a setup link and **Check again**. A dashboard that has not loaded or cannot be inspected displays an unable-to-verify notice instead. The warning does not install anything or modify kiosk-mode settings. Detection confirms the runtime is present; user/dashboard kiosk rules can still affect menu visibility.

### Upgrading from 0.1 Dashboard/Plugin beta

Version 0.1 was a dashboard card; version 0.2 is an integration. Updating the old Dashboard entry alone does not install the integration.

1. Back up your HA configuration. Keep the old working Studio dashboard until the new panel is verified.
2. In HACS, remove the old Screen Studio **Dashboard** repository entry, then search for **HA Screen Studio** in the **Integration** category and follow the [installation instructions](../README.md#installation). HACS may remove the old downloaded card file when uninstalling, so that old card can be temporarily unavailable.
3. Verify the new **Screen Studio** sidebar entry at `/ha-screen-studio` before optionally removing your old manually created Studio dashboard/resource.

The integration does not delete or rewrite existing dashboards, resources or kiosk settings. Browser preferences use the same storage keys, so they remain available on the same HA origin and browser profile.

### Manual installation

Install and load kiosk-mode first, as described above. Copy the entire `custom_components/ha_screen_studio` folder from this repository to `/config/custom_components/ha_screen_studio`. Restart HA, then open **Settings → Devices & services → Add integration → HA Screen Studio**, confirm, and choose your dashboard in the new sidebar panel. All runtime files, including `www/ha-screen-studio.js`, must be copied together.

The legacy `dist/ha-screen-studio.js` card remains available for existing manual setups as `custom:ha-screen-studio`; it is not needed for the integration installation.

### Troubleshooting installation

- Integration missing from Add integration: confirm the folder exists under `custom_components`, restart HA after downloading, then refresh the browser.
- Studio not in the sidebar: use an administrator account and confirm the integration was added, not just downloaded.
- URL conflict: an existing panel uses `/ha-screen-studio`. Give that existing panel a different URL, then retry setup. Studio never overwrites it.
- Old layout after update: refresh the browser cache. Python integration updates require an HA restart.
- Menu hiding does not work: install and register [kiosk-mode](https://github.com/NemesisRE/kiosk-mode). It is optional for preview itself.

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
python -m unittest discover -s tests -p "test_*.py" -v
```

Edit `src/studio.html` and `src/card.js`, rebuild, and commit both generated modules (`dist/ha-screen-studio.js` and `custom_components/ha_screen_studio/www/ha-screen-studio.js`). Python tests use mocked HA APIs; they do not replace a real-instance installation test. The integration is local only and creates no entities.

