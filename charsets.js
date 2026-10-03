'use strict';
(() => {
  const common = [
    ['utf-8','UTF-8','utf-8'], ['ascii','ASCII','ascii'],
    ['iso-8859-1','ISO-8859-1','latin1'], ['windows-1252','Windows-1252','windows1252'],
    ['euc-kr','EUC-KR / CP949','cp949'], ['shift_jis','Shift_JIS','shift_jis'],
    ['gb18030','GB18030','gb18030']
  ];
  const other = [
    ['utf-16le','UTF-16LE','utf16le'], ['utf-16be','UTF-16BE','utf16be'],
    ...[2,3,4,5,6,7,8,10,13,14,15].map(n=>[`iso-8859-${n}`,`ISO-8859-${n}`,`iso8859${n}`]),
    ...[1250,1251,1253,1254,1255,1256,1257,1258].map(n=>[`windows-${n}`,`Windows-${n}`,`windows${n}`]),
    ['windows-874','Windows-874','windows874'],['koi8-r','KOI8-R','koi8r'],
    ['koi8-u','KOI8-U','koi8u'],['ibm866','IBM866','cp866'],
    ['macintosh','Macintosh','macintosh'],['euc-jp','EUC-JP','eucjp'],
    ['gbk','GBK','gbk'],['big5','Big5','big5']
  ];
  const entries = new Map([...common,...other].map(entry=>[entry[0],entry]));
  function entry(id) {
    const value = entries.get(id);
    if (!value) throw new Error('Unsupported character encoding');
    return value;
  }
  function decode(bytes,id) {
    entry(id);
    if (id==='ascii' || id==='iso-8859-1') {
      if (id==='ascii' && bytes.some(byte=>byte>127)) throw new Error('Invalid ASCII');
      let text='';
      for(let i=0;i<bytes.length;i+=8192) text+=String.fromCharCode(...bytes.subarray(i,i+8192));
      return text;
    }
    // Explicit endian choices are respected; preserve the BOM for legacy round-trips.
    return new TextDecoder(id,{fatal:true,ignoreBOM:id!=='utf-8'}).decode(bytes);
  }
  let loading;
  function loadEncoder() {
    if (window.decodexLegacyEncoder) return Promise.resolve();
    if (!loading) loading=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='/vendor/legacy-encoder.js?v=20261003o';
      script.onload=()=>window.decodexLegacyEncoder?resolve():reject(new Error('Encoder unavailable'));
      script.onerror=()=>{script.remove();reject(new Error('Encoder unavailable'));};
      document.head.appendChild(script);
    }).catch(error=>{loading=undefined;throw error;});
    return loading;
  }
  function encode(text,id) {
    const selected=entry(id);
    let bytes;
    if(id==='utf-8') return new TextEncoder().encode(text);
    if(id==='ascii'||id==='iso-8859-1'){
      const max=id==='ascii'?127:255;
      if(Array.from(text).some(c=>c.codePointAt(0)>max)) throw new Error('Unrepresentable text');
      bytes=Uint8Array.from(text,c=>c.charCodeAt(0));
    }else{
      if(!window.decodexLegacyEncoder) throw new Error('Encoder unavailable');
      bytes=window.decodexLegacyEncoder(text,selected[2]);
    }
    // Reject silent ? replacements and codec mapping differences.
    if(decode(bytes,id)!==text) throw new Error('Unrepresentable text');
    return bytes;
  }
  window.decodexCharsets={common,other,decode,encode,loadEncoder};
})();
