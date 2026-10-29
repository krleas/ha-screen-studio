"""Install and remove the HA Screen Studio sidebar panel."""

from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryError

from .const import DOMAIN, PANEL_NAME, PANEL_PATH, STATIC_URL, TITLE, VERSION


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Serve only bundled assets and register an admin-only sidebar panel."""
    if frontend.async_panel_exists(hass, PANEL_PATH):
        raise ConfigEntryError(
            f"The URL /{PANEL_PATH} is already in use. Rename that existing panel first."
        )

    runtime = hass.data.setdefault(DOMAIN, {})
    if not runtime.get("static_registered"):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL, str(Path(__file__).parent / "www"), True)]
        )
        runtime["static_registered"] = True

    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_PATH,
        webcomponent_name=PANEL_NAME,
        sidebar_title=TITLE,
        sidebar_icon="mdi:monitor-dashboard",
        module_url=f"{STATIC_URL}/ha-screen-studio.js?v={VERSION}",
        embed_iframe=False,
        require_admin=True,
        config_panel_domain=DOMAIN,
        config={"ha_screen_studio_entry_id": entry.entry_id},
    )
    runtime["entry_id"] = entry.entry_id
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Remove only the panel owned by this entry; leave dashboards untouched."""
    runtime = hass.data.get(DOMAIN, {})
    panel = hass.data.get("frontend_panels", {}).get(PANEL_PATH)
    if runtime.get("entry_id") == entry.entry_id:
        if panel and (panel.config or {}).get("ha_screen_studio_entry_id") == entry.entry_id:
            frontend.async_remove_panel(hass, PANEL_PATH)
        runtime.pop("entry_id", None)
    # Static routes live until HA restarts and can safely be reused on reload.
    return True
