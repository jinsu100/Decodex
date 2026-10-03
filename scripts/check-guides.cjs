const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const context={TextEncoder,TextDecoder,Uint8Array,atob,btoa,console:{log(){}}};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'content/unicode-example.js'),'utf8'),context);
for(const value of ['','f','fo','foo','안녕하세요 😀','Olá नमस्ते 你好 Привет 日本語','a'.repeat(100000)]){
 context.value=value;
 assert.equal(vm.runInContext('utf8ToBase64(value)',context),Buffer.from(value).toString('base64'));
 assert.equal(vm.runInContext('base64ToUtf8(utf8ToBase64(value))',context),value);
}
for(const [value,expected] of [['Zg','f'],['Zg==','f'],['8J-YgA','😀'],['SGVs bG8\n','Hello']]){context.value=value;assert.equal(vm.runInContext('base64ToUtf8(value)',context),expected);}
for(const value of ['A','Zg=','A=AA','Zg===','!','/w==']){context.value=value;assert.throws(()=>vm.runInContext('base64ToUtf8(value)',context));}
const langs=['en','ko','es','pt-BR','de','ja','zh-CN','fr','it','nl','hi','ru'];
for(const lang of langs)for(const key of ['base64url','base64-padding','javascript-base64']){
 const folder=lang==='en'?'':lang.toLowerCase()+'/';
 const html=fs.readFileSync(path.join(root,folder,key+'.html'),'utf8');
 const article=JSON.parse(fs.readFileSync(path.join(root,'content',`guides-${lang}.json`),'utf8'))[key];
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
 assert.ok(html.includes(`https://decodex.fyi/${folder}${key}.html`));
 const schemas=JSON.parse(html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)[1]);
 assert.equal(schemas[0].headline,article.title);assert.equal(schemas[0].inLanguage,lang);
 assert.equal(schemas[1].itemListElement.length,3);
 assert.ok(html.includes('?example='));
 assert.equal((html.match(/data-new-guides/g)||[]).length,1);
}
for(const [mode,preset,result] of [['decode','base64url','😀'],['decode','padding','f'],['decode','unicode','안녕하세요 😀'],['encode','unicode','7JWI64WV7ZWY7IS47JqUIPCfmIA='],['decode','unknown','']]){
 const nodes={};const node=id=>nodes[id]??={value:'',textContent:'',classList:{toggle(){}},addEventListener(){},setAttribute(){},removeAttribute(){}};
 const tasks=[];
 const ctx={window:{location:{search:'?example='+preset}},URLSearchParams,TextEncoder,TextDecoder,Uint8Array,atob,btoa,setTimeout(fn){tasks.push(fn);return tasks.length},clearTimeout(){},document:{body:{dataset:{lang:'ko',mode}},getElementById:node},navigator:{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'function.js'),'utf8'),ctx);
 tasks.shift()?.();
 assert.equal(node('result').value,result);
}
const help=JSON.parse(fs.readFileSync(path.join(root,'content/converter-help.json'),'utf8'));
const codecContext={window:{},TextEncoder,TextDecoder,Uint8Array,ArrayBuffer};
vm.createContext(codecContext);
vm.runInContext(fs.readFileSync(path.join(root,'charsets.js'),'utf8'),codecContext);
for(const lang of langs)for(const mode of ['decode','encode']){
 const folder=lang==='en'?'':lang.toLowerCase()+'/';
 const html=fs.readFileSync(path.join(root,folder,mode==='decode'?'index.html':'encode.html'),'utf8');
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
 assert.equal((html.match(/data-converter-help=/g)||[]).length,1);
 assert.ok(!/class="guide-resources/.test(html),'Converter explanations must stay inline');
 for(const section of help[lang][mode].sections){
  assert.ok(html.includes(section.heading));
  for(const paragraph of section.paragraphs)assert.ok(html.includes(paragraph.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')));
 }
 const rows=help[lang][mode].sections[0].table.rows;
 for(const [encoding,text,base64] of rows){
  const key=encoding==='EUC-KR / CP949'?'euc-kr':encoding.toLowerCase();
  const bytes=Uint8Array.from(Buffer.from(base64,'base64'));
  assert.equal(codecContext.window.decodexCharsets.decode(bytes,key),text);
 }
}
context.value='U0dWc2JHOD0=';assert.equal(vm.runInContext('base64ToUtf8(base64ToUtf8(value))',context),'Hello');
for(const [text,value] of [['Hello','SGVsbG8='],['Hello ','SGVsbG8g'],['Hello\n','SGVsbG8K']])assert.equal(Buffer.from(text).toString('base64'),value);
console.log('PASS 36 guide metadata; 24 inline converter explanations and native encoding examples; UTF-8 round-trips, malformed input, large text and preset links');
