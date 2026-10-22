// Light / dark theme. The preference is 'system' (follow the device), 'light' or 'dark'.
// index.html applies it before the app loads, so the page never flashes the wrong theme.
const KEY = 'theme';
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

export function getThemePreference() {
  try { return localStorage.getItem(KEY) || 'system'; } catch { return 'system'; }
}

export function applyTheme(preference = getThemePreference()) {
  const dark = preference === 'dark' || (preference === 'system' && media().matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0e1418' : '#0e6b5c');
}

export function setThemePreference(preference) {
  try { localStorage.setItem(KEY, preference); } catch { /* applies for this visit only */ }
  applyTheme(preference);
}

// Keep following the device when the preference is 'system'
export function watchSystemTheme() {
  const onChange = () => getThemePreference() === 'system' && applyTheme('system');
  media().addEventListener('change', onChange);
  return () => media().removeEventListener('change', onChange);
}
