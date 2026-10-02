'use strict';
const input = document.getElementById('userInput');
const output = document.getElementById('result');
const feedback = document.getElementById('feedback');
const copyButton = document.getElementById('copy-button');
const mode = document.body.dataset.mode;
const MAX_BYTES = 5 * 1024 * 1024;
let copyVersion = 0;
const autoConvertButton = document.getElementById('auto-convert-button');
let autoConvert = Boolean(autoConvertButton);
let autoConvertTimer;
let composing = false;
function cancelAutoConvert() {
  clearTimeout(autoConvertTimer);
}
function scheduleAutoConvert() {
  cancelAutoConvert();
  resetResult();
  if (autoConvert && !composing && (mode === 'encode' ? input.value.length : input.value.trim().length)) {
    autoConvertTimer = setTimeout(() => convert(), 250);
  }
}
function counts() {
  document.getElementById('input-count').textContent = `${Array.from(input.value).length.toLocaleString()} characters`;
  document.getElementById('output-count').textContent = `${Array.from(output.value).length.toLocaleString()} characters`;
  copyButton.disabled = !output.value;
}
function message(text, error = false) {
  feedback.textContent = text;
  feedback.classList.toggle('error', error);
}
function resetResult() {
  copyVersion++;
  output.value = '';
  input.removeAttribute('aria-invalid');
  message('');
  counts();
}
function encodeText(text) {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > MAX_BYTES) throw new Error('Please use text smaller than 5 MB.');
  const chunks = [];
  for (let i = 0; i < bytes.length; i += 8192) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
  }
  return btoa(chunks.join(''));
}
function decodeText(text) {
  let normalized = text.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!normalized) throw new Error('Paste a Base64 string to get started.');
  if (normalized.length > Math.ceil(MAX_BYTES / 3) * 4) throw new Error('Please use Base64 representing less than 5 MB.');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 === 1 || (normalized.includes('=') && normalized.length % 4 !== 0)) {
    throw new Error('This is not valid Base64. Check the characters and padding, then try again.');
  }
  normalized += '='.repeat((4 - normalized.length % 4) % 4);
  let binary;
  try { binary = atob(normalized); }
  catch { throw new Error('This is not valid Base64. Check the characters and padding, then try again.'); }
  if (binary.length > MAX_BYTES) throw new Error('Please use Base64 representing less than 5 MB.');
  try { return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, c => c.charCodeAt(0))); }
  catch { throw new Error('This Base64 contains binary data or invalid UTF-8. This tool decodes text only.'); }
}
function convert() {
  cancelAutoConvert();
  resetResult();
  if (!input.value) { message(mode === 'encode' ? 'Enter some text to get started.' : 'Paste a Base64 string to get started.', true); input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
  try {
    output.value = mode === 'encode' ? encodeText(input.value) : decodeText(input.value);
    counts();
    message(mode === 'encode' ? 'Encoded successfully. Your result is ready to copy.' : 'Decoded successfully. Your result is ready to copy.');
  } catch (error) {
    message(error.message, true);
    input.setAttribute('aria-invalid', 'true');
  }
}
document.getElementById('converter').addEventListener('submit', event => { event.preventDefault(); convert(); });
input.addEventListener('input', scheduleAutoConvert);
input.addEventListener('compositionstart', () => { composing = true; cancelAutoConvert(); });
input.addEventListener('compositionend', () => { composing = false; scheduleAutoConvert(); });
if (autoConvertButton) {
  autoConvertButton.addEventListener('click', () => {
    autoConvert = !autoConvert;
    autoConvertButton.setAttribute('aria-pressed', String(autoConvert));
    autoConvertButton.textContent = `Auto convert: ${autoConvert ? 'ON' : 'OFF'}`;
    document.getElementById('auto-convert-hint').textContent = autoConvert
      ? 'Converts automatically as you type or paste. Turn off to convert manually.'
      : 'Auto convert is off. Click the conversion button below to convert your input.';
    cancelAutoConvert();
    if (autoConvert) scheduleAutoConvert();
  });
}
input.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); convert(); } });
document.getElementById('clear-button').addEventListener('click', () => { input.value = ''; cancelAutoConvert(); resetResult(); input.focus(); });
document.getElementById('example-button').addEventListener('click', () => {
  const example = 'Hello, Decodex! 안녕하세요 👋';
  input.value = mode === 'encode' ? example : encodeText(example);
  scheduleAutoConvert(); input.focus();
});
copyButton.addEventListener('click', async () => {
  const version = copyVersion;
  const text = output.value;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    if (version === copyVersion) message('Copied to clipboard.');
  } catch {
    if (version !== copyVersion) return;
    output.focus(); output.select();
    message('Automatic copying is unavailable. The result is selected; press Ctrl+C or ⌘C to copy.');
  }
});
counts();
