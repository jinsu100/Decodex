'use strict';
(() => {
  const storageKey = 'decodex-language';
  const folders = {en: '', ko: 'ko', es: 'es', 'pt-BR': 'pt-br', de: 'de', ja: 'ja', 'zh-CN': 'zh-cn', fr: 'fr', it: 'it', nl: 'nl', hi: 'hi', ru: 'ru'};
  const supported = value => Object.prototype.hasOwnProperty.call(folders, value);
  function browserLocale(value) {
    const tag = String(value).toLowerCase().replaceAll('_', '-');
    if (/^zh(?:-|$)/.test(tag)) {
      // Traditional Chinese is not offered; do not silently label it as Simplified.
      if (/(?:^|-)hant(?:-|$)|^zh-(?:tw|hk|mo)(?:-|$)/.test(tag)) return 'en';
      return 'zh-CN';
    }
    const base = tag.split('-')[0];
    if (base === 'pt') return 'pt-BR';
    return supported(base) ? base : 'en';
  }
  let selected;
  try { selected = localStorage.getItem(storageKey); } catch {}
  const requested = new URLSearchParams(window.location.search).get('language');
  if (supported(requested)) selected = requested;
  const preferred = supported(selected) ? selected : browserLocale(navigator.languages?.[0] || navigator.language || 'en');
  const path = window.location.pathname;
  const current = Object.keys(folders).find(lang => folders[lang] && path.startsWith('/' + folders[lang] + '/')) || 'en';
  const page = current === 'en' ? path : path.slice(folders[current].length + 1);
  const supportedPage = ['/', '/index.html', '/encode.html', '/about.html', '/privacy.html', '/contact.html', '/guides.html', '/base64-errors.html', '/base64-korean.html'].includes(page);
  // Direct translated links retain their language. Only the default entry or an
  // explicit one-navigation choice selects a different language automatically.
  const target = supported(requested) ? requested : current === 'en' ? preferred : current;
  if (supportedPage && current !== target) {
    window.location.replace((folders[target] ? '/' + folders[target] : '') + page + window.location.search + window.location.hash);
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.language-switch a[lang]').forEach(link => {
      link.addEventListener('click', () => {
        try { localStorage.setItem(storageKey, link.lang); } catch {}
        // Also works when storage is blocked or an older saved choice exists.
        const destination = new URL(link.href);
        destination.searchParams.set('language', link.lang);
        link.href = destination.href;
      });
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('.language-menu[open]').forEach(menu => {
        menu.open = false;
        menu.querySelector('summary').focus();
      });
    });
    document.addEventListener('click', event => {
      document.querySelectorAll('.language-menu[open]').forEach(menu => {
        if (!menu.contains(event.target)) menu.open = false;
      });
    });
  });
})();
