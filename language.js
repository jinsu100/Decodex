'use strict';
(() => {
  const storageKey = 'decodex-language';
  let selected;
  try { selected = localStorage.getItem(storageKey); } catch {}
  const requested = new URLSearchParams(window.location.search).get('language');
  if (requested === 'ko' || requested === 'en') selected = requested;
  const browserLanguage = navigator.languages?.[0] || navigator.language || 'en';
  const preferred = selected === 'ko' || selected === 'en'
    ? selected
    : /^ko(?:-|$)/i.test(browserLanguage) ? 'ko' : 'en';
  const path = window.location.pathname;
  const koreanPage = path.startsWith('/ko/');
  // Keep directly linked translated URLs available to readers and search engines.
  // The English entry pages choose Korean automatically; explicit choices work both ways.
  const shouldChange = koreanPage ? selected === 'en' : preferred === 'ko';
  if (shouldChange) {
    const encoder = path.endsWith('/encode.html');
    const destination = koreanPage
      ? encoder ? '/encode.html' : '/'
      : encoder ? '/ko/encode.html' : '/ko/';
    window.location.replace(destination + window.location.search + window.location.hash);
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.language-switch a[lang]').forEach(link => {
      link.addEventListener('click', () => {
        try { localStorage.setItem(storageKey, link.lang); } catch {
          // A one-navigation override also works when storage is unavailable.
          const destination = new URL(link.href);
          destination.searchParams.set('language', link.lang);
          link.href = destination.href;
        }
      });
    });
  });
})();
