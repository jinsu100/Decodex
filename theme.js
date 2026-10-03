'use strict';
(() => {
  const root = document.documentElement;
  const storageKey = 'decodex-theme';
  const system = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  let preference;
  try { preference = localStorage.getItem(storageKey); } catch {}
  if (preference !== 'dark' && preference !== 'light') preference = null;
  let button;
  function apply() {
    const theme = preference || (system?.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    if (!button) return;
    const dark = theme === 'dark';
    const korean = root.lang === 'ko';
    button.setAttribute('aria-pressed', String(dark));
    button.title = window.decodexLocale
      ? `${window.decodexLocale.dark}: ${dark ? window.decodexLocale.on : window.decodexLocale.off}`
      : korean
      ? dark ? '다크 모드 끄기' : '다크 모드 켜기'
      : dark ? 'Turn dark mode off' : 'Turn dark mode on';
    button.querySelector('.theme-icon').textContent = dark ? '☾' : '☀';
  }
  // Run in the head so the saved theme is applied before the page is painted.
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    button = document.getElementById('theme-toggle');
    if (!button) return;
    button.hidden = false;
    apply();
    button.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(storageKey, preference); } catch {}
      apply();
    });
  });
  system?.addEventListener?.('change', () => { if (!preference) apply(); });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = event.key === storageKey && ['dark', 'light'].includes(event.newValue)
      ? event.newValue : null;
    apply();
  });
})();
