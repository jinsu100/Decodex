// Browser JavaScript: text → UTF-8 bytes → Base64.
function utf8ToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(binary);
}

// Accept standard Base64 or Base64URL, with complete or omitted padding.
function base64ToUtf8(value) {
  let normalized = value.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) ||
      normalized.length % 4 === 1 ||
      (normalized.includes('=') && normalized.length % 4 !== 0)) {
    throw new Error('Invalid Base64 characters, length or padding');
  }
  normalized += '='.repeat((4 - normalized.length % 4) % 4);
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

const text = '안녕하세요 😀';
const encoded = utf8ToBase64(text);
console.log(encoded); // 7JWI64WV7ZWY7IS47JqUIPCfmIA=
console.log(base64ToUtf8(encoded)); // 안녕하세요 😀
