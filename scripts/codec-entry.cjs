const iconv = require('iconv-lite');
const {Buffer} = require('buffer');
window.decodexLegacyEncoder = (text, encoding) => new Uint8Array(iconv.encode(text, encoding));
