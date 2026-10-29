import asyncio
import importlib
import sys
import types
import unittest
from unittest.mock import AsyncMock, Mock

# Contract tests without installing HA: isolate imports and verify calls to its APIs.
ha = types.ModuleType('homeassistant')
ha.__path__ = []
components = types.ModuleType('homeassistant.components')
components.__path__ = []
frontend = types.ModuleType('homeassistant.components.frontend')
panel_custom = types.ModuleType('homeassistant.components.panel_custom')
http = types.ModuleType('homeassistant.components.http')
class StaticPathConfig:
    def __init__(self, url_path, path, cache_headers):
        self.url_path, self.path, self.cache_headers = url_path, path, cache_headers
http.StaticPathConfig = StaticPathConfig
entries = types.ModuleType('homeassistant.config_entries')
entries.ConfigEntry = object
class Flow:
    def __init_subclass__(cls, **kwargs): pass
    async def async_set_unique_id(self, value): self.unique_id = value
    def _abort_if_unique_id_configured(self):
        if getattr(self, 'configured', False): raise RuntimeError('already_configured')
    def async_show_form(self, **kwargs): return {'type': 'form', **kwargs}
    def async_create_entry(self, **kwargs): return {'type': 'create_entry', **kwargs}
entries.ConfigFlow = Flow
core = types.ModuleType('homeassistant.core')
core.HomeAssistant = object
exceptions = types.ModuleType('homeassistant.exceptions')
class ConfigEntryError(Exception): pass
exceptions.ConfigEntryError = ConfigEntryError
for module in (ha, components, frontend, panel_custom, http, entries, core, exceptions):
    sys.modules[module.__name__] = module
studio = importlib.import_module('custom_components.ha_screen_studio')
flow_module = importlib.import_module('custom_components.ha_screen_studio.config_flow')

class IntegrationTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.hass = types.SimpleNamespace(data={}, http=types.SimpleNamespace(async_register_static_paths=AsyncMock()))
        self.entry = types.SimpleNamespace(entry_id='test-entry')
        frontend.async_panel_exists = Mock(return_value=False)
        frontend.async_remove_panel = Mock()
        panel_custom.async_register_panel = AsyncMock()

    async def test_setup_admin_panel_and_reload_reuses_static_route(self):
        self.assertTrue(await studio.async_setup_entry(self.hass, self.entry))
        kwargs = panel_custom.async_register_panel.call_args.kwargs
        self.assertTrue(kwargs['require_admin'])
        self.assertEqual(kwargs['frontend_url_path'], 'ha-screen-studio')
        self.assertEqual(kwargs['webcomponent_name'], 'ha-screen-studio-panel')
        self.assertIn('?v=0.2.0-beta.1', kwargs['module_url'])
        self.hass.data['frontend_panels'] = {'ha-screen-studio': types.SimpleNamespace(config=kwargs['config'])}
        await studio.async_unload_entry(self.hass, self.entry)
        frontend.async_remove_panel.assert_called_once_with(self.hass, 'ha-screen-studio')
        await studio.async_setup_entry(self.hass, self.entry)
        self.hass.http.async_register_static_paths.assert_awaited_once()

    async def test_existing_panel_is_never_overwritten(self):
        frontend.async_panel_exists.return_value = True
        with self.assertRaises(ConfigEntryError):
            await studio.async_setup_entry(self.hass, self.entry)
        panel_custom.async_register_panel.assert_not_awaited()
        self.hass.http.async_register_static_paths.assert_not_awaited()

    async def test_unload_leaves_foreign_panel(self):
        self.hass.data = {'ha_screen_studio': {'entry_id': 'test-entry'}, 'frontend_panels': {'ha-screen-studio': types.SimpleNamespace(config={})}}
        await studio.async_unload_entry(self.hass, self.entry)
        frontend.async_remove_panel.assert_not_called()

    async def test_confirmation_and_single_instance(self):
        flow = flow_module.ScreenStudioConfigFlow()
        self.assertEqual((await flow.async_step_user())['type'], 'form')
        self.assertEqual(flow.unique_id, 'ha_screen_studio')
        result = await flow.async_step_user({})
        self.assertEqual(result['data'], {})
        flow.configured = True
        with self.assertRaisesRegex(RuntimeError, 'already_configured'):
            await flow.async_step_user({})
