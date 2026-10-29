"""UI setup for HA Screen Studio; no YAML, credentials or HA address required."""

from homeassistant import config_entries

from .const import DOMAIN, TITLE


class ScreenStudioConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Create a single local Studio instance."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Confirm installation and create the sidebar panel."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        if user_input is not None:
            return self.async_create_entry(title=TITLE, data={})
        return self.async_show_form(step_id="user")
