'use strict';
const input = document.getElementById('userInput');
const output = document.getElementById('result');
const feedback = document.getElementById('feedback');
const copyButton = document.getElementById('copy-button');
const mode = document.body.dataset.mode;
const locale = document.body.dataset.lang === 'ko' ? 'ko' : 'en';
const koreanMessages = {
  "Please use text smaller than 5 MB.": "5MB보다 작은 텍스트를 입력하세요.",
  "Paste a Base64 string to get started.": "Base64 문자열을 입력하거나 붙여넣으세요.",
  "Please use Base64 representing less than 5 MB.": "디코딩 결과가 5MB보다 작은 Base64를 입력하세요.",
  "This is not valid Base64. Check the characters and padding, then try again.": "올바른 Base64 형식이 아닙니다. 문자와 패딩(=)을 확인하세요.",
  "This Base64 contains binary data or invalid UTF-8. This tool decodes text only.": "바이너리 데이터이거나 올바른 UTF-8 텍스트가 아닙니다. 이 도구는 텍스트만 디코딩합니다.",
  "Enter some text to get started.": "변환할 텍스트를 입력하세요.",
  "Encoded successfully. Your result is ready to copy.": "인코딩이 완료됐습니다. 결과를 복사할 수 있습니다.",
  "Decoded successfully. Your result is ready to copy.": "디코딩이 완료됐습니다. 결과를 복사할 수 있습니다.",
  "Converts automatically as you type or paste. Turn off to convert manually.": "입력하거나 붙여넣으면 자동으로 변환합니다. 끄면 버튼으로 직접 변환할 수 있습니다.",
  "Auto convert is off. Click the conversion button below to convert your input.": "자동 변환이 꺼져 있습니다. 아래 변환 버튼을 눌러 변환하세요.",
  "Copied to clipboard.": "클립보드에 복사했습니다.",
  "Automatic copying is unavailable. The result is selected; press Ctrl+C or ⌘C to copy.": "자동 복사를 사용할 수 없습니다. 선택된 결과를 Ctrl+C 또는 ⌘C로 복사하세요."
};
function t(text) { return locale === 'ko' ? koreanMessages[text] || text : text; }

const MAX_BYTES = 5 * 1024 * 1024;
let copyVersion = 0;
const autoConvertButton = document.getElementById('auto-convert-button');
let autoConvert = Boolean(autoConvertButton);
let autoConvertTimer;
let composing = false;
let analyticsTimer;

// Only fixed categories are sent: never text, results, lengths, or error messages.
function trackUsage(eventName, parameters = {}) {
  if (typeof gtag !== 'function') return;
  try {
    gtag('event', eventName, {
      send_to: 'G-XVJFGV14XL',
      conversion_mode: mode,
      ui_language: locale,
      ...parameters
    });
  } catch { /* Analytics must never interrupt conversion or copying. */ }
}
function cancelAnalytics() {
  clearTimeout(analyticsTimer);
}
function trackConversion(outcome, trigger, errorType) {
  cancelAnalytics();
  if (typeof gtag !== 'function') return;
  const version = copyVersion;
  const report = () => {
    if (version !== copyVersion) return;
    const parameters = { conversion_method: trigger };
    if (errorType) parameters.error_type = errorType;
    trackUsage(`${mode}_${outcome}`, parameters);
  };
  // Automatic conversions settle before being counted; manual attempts count immediately.
  if (trigger === 'auto') analyticsTimer = setTimeout(report, 1500);
  else report();
}
function conversionError(code, text) {
  const error = new Error(t(text));
  error.code = code;
  return error;
}
function cancelAutoConvert() {
  clearTimeout(autoConvertTimer);
}
function scheduleAutoConvert() {
  cancelAutoConvert();
  resetResult();
  if (autoConvert && !composing && (mode === 'encode' ? input.value.length : input.value.trim().length)) {
    autoConvertTimer = setTimeout(() => convert('auto'), 250);
  }
}
function counts() {
  document.getElementById('input-count').textContent = `${Array.from(input.value).length.toLocaleString(locale)}${locale === 'ko' ? '자' : ' characters'}`;
  document.getElementById('output-count').textContent = `${Array.from(output.value).length.toLocaleString(locale)}${locale === 'ko' ? '자' : ' characters'}`;
  copyButton.disabled = !output.value;
}
function message(text, error = false) {
  feedback.textContent = text;
  feedback.classList.toggle('error', error);
}
function resetResult() {
  cancelAnalytics();
  copyVersion++;
  output.value = '';
  input.removeAttribute('aria-invalid');
  message('');
  counts();
}
function encodeText(text) {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > MAX_BYTES) throw conversionError("size_limit", "Please use text smaller than 5 MB.");
  const chunks = [];
  for (let i = 0; i < bytes.length; i += 8192) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)));
  }
  return btoa(chunks.join(''));
}
function decodeText(text) {
  let normalized = text.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!normalized) throw conversionError("empty_input", "Paste a Base64 string to get started.");
  if (normalized.length > Math.ceil(MAX_BYTES / 3) * 4) throw conversionError("size_limit", "Please use Base64 representing less than 5 MB.");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 === 1 || (normalized.includes('=') && normalized.length % 4 !== 0)) {
    throw conversionError("invalid_base64", "This is not valid Base64. Check the characters and padding, then try again.");
  }
  normalized += '='.repeat((4 - normalized.length % 4) % 4);
  let binary;
  try { binary = atob(normalized); }
  catch { throw conversionError("invalid_base64", "This is not valid Base64. Check the characters and padding, then try again."); }
  if (binary.length > MAX_BYTES) throw conversionError("size_limit", "Please use Base64 representing less than 5 MB.");
  try { return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, c => c.charCodeAt(0))); }
  catch { throw conversionError("invalid_utf8", "This Base64 contains binary data or invalid UTF-8. This tool decodes text only."); }
}
function convert(trigger = 'manual') {
  cancelAutoConvert();
  resetResult();
  if (!input.value) { message(mode === 'encode' ? t("Enter some text to get started.") : t("Paste a Base64 string to get started."), true); input.setAttribute('aria-invalid', 'true'); input.focus(); trackConversion('error', trigger, 'empty_input'); return; }
  try {
    output.value = mode === 'encode' ? encodeText(input.value) : decodeText(input.value);
    counts();
    message(mode === 'encode' ? t("Encoded successfully. Your result is ready to copy.") : t("Decoded successfully. Your result is ready to copy."));
    trackConversion('success', trigger);
  } catch (error) {
    trackConversion('error', trigger, ['empty_input', 'size_limit', 'invalid_base64', 'invalid_utf8'].includes(error.code) ? error.code : 'conversion_failed');
    message(error.message, true);
    input.setAttribute('aria-invalid', 'true');
  }
}
document.getElementById('converter').addEventListener('submit', event => { event.preventDefault(); convert(); });
input.addEventListener('input', scheduleAutoConvert);
input.addEventListener('compositionstart', () => { composing = true; cancelAutoConvert(); cancelAnalytics(); });
input.addEventListener('compositionend', () => { composing = false; scheduleAutoConvert(); });
if (autoConvertButton) {
  autoConvertButton.addEventListener('click', () => {
    autoConvert = !autoConvert;
    autoConvertButton.setAttribute('aria-pressed', String(autoConvert));
    autoConvertButton.textContent = locale === 'ko'
      ? `자동 변환: ${autoConvert ? '켜짐' : '꺼짐'}`
      : `Auto convert: ${autoConvert ? 'ON' : 'OFF'}`;
    document.getElementById('auto-convert-hint').textContent = autoConvert
      ? t("Converts automatically as you type or paste. Turn off to convert manually.")
      : t("Auto convert is off. Click the conversion button below to convert your input.");
    cancelAutoConvert();
    cancelAnalytics();
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
    trackUsage('result_copy');
    if (version === copyVersion) message(t("Copied to clipboard."));
  } catch {
    if (version !== copyVersion) return;
    output.focus(); output.select();
    message(t("Automatic copying is unavailable. The result is selected; press Ctrl+C or \u2318C to copy."));
  }
});
counts();
