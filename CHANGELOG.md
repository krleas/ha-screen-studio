# Changelog

## 0.2.0-beta.3 — 2026-10-30

- Compact toolbar: built-in and custom presets share a row when space allows.
- Status moves left of Preview, without repeating the word Preview.
- Shorter Top bar / Left bar labels and Save current button.
- Custom presets label uses two lines; editor guidance uses two fixed lines, starting the second with Switch.
- Responsive groups keep controls within narrower windows.
- Versioned frontend URL changes to beta.3 so updated installations load the new bundle.

Reviewed on the author's HA installation. Enable HACS Pre-release tracking to receive tagged betas instead of default-branch commit IDs. Updating the integration requires restarting HA; existing preferences and dashboards are preserved.

## 0.2.0-beta.2 — 2026-10-29

Adds an original desktop/mobile icon bundled locally in the integration brand folder (256 and 512 px). Includes clearer beta tracking instructions to prevent default-branch commits being mistaken for beta updates. The integration has now been added successfully on the author's HA installation.

## 0.2.0-beta.1 — 2026-10-29

- HACS Integration with a single confirmation step and automatic administrator sidebar panel; no manual dashboard or YAML.
- Bundled assets served locally, single-instance setup, safe unload and existing-panel collision protection.
- Responsive toolbar groups for smaller windows.
- Dashboard selector folds away after selection; Dashboard button moves to the end, keeping Preview first.
- Retains legacy dashboard card and browser preferences. Includes English/Slovenian setup translations, installation/migration instructions and integration contract tests.

The new backend requires real-instance beta testing. Upgrading from the 0.1 Dashboard category requires reinstalling the repository as Integration; see README.

## 0.1.0-beta.1 — 2026-10-29

First public testing package: fixed LCD/mobile viewport preview, per-preset zoom, rotation, fullscreen, named custom presets, top/left HA bar controls and access to HA's normal editor. Adds a same-origin dashboard picker and a single-file HACS dashboard plugin package. Removes private paths and installation-specific defaults from the prototype.
