const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const labels=JSON.parse(fs.readFileSync(path.join(root,'content/charset-labels.json'),'utf8'));
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'charsets.js'),'utf8'),ctx);
const config=ctx.window.decodexCharsets;
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const messages={};
for(const [lang,L] of Object.entries(labels)){
 messages[lang]={};
 for(const key of ['loading','unrepresentable','invalid','loadError'])messages[lang][labels.en[key]]=L[key];
 const dir=lang==='en'?'':lang.toLowerCase()+'/';
 for(const mode of ['encode','decode']){
  const file=path.join(root,dir,mode==='encode'?'encode.html':'index.html');let html=fs.readFileSync(file,'utf8');
  html=html.replace(/\s*<script src="\/charset(?:s|-messages)\.js[^<]*<\/script>/g,'');
  html=html.replace('</head>','<script src="/charset-messages.js?v=20261003o" defer></script>\n<script src="/charsets.js?v=20261003o" defer></script>\n</head>');
  // Deferred scripts execute in document order; conversion must run after codecs.
  const functionScript=html.match(/\s*<script src="[^\"]*function.js[^<]*<\/script>/)[0];
  html=html.replace(functionScript,'').replace('</head>',functionScript+'\n</head>');
  const copy=html.match(/<button class="copy-button"[\s\S]*?<\/button>/)[0];
  html=html.replace(copy,'');
  html=html.replace(/<div class="charset-control">[\s\S]*?<\/div>/g,'');
  html=html.replace(/<div class="output-actions">[\s\S]*?<\/div>/g,'');
  const select=`<div class="charset-control"><label class="sr-only" for="charset-select">${escape(mode==='decode'?L.source:L.output)}</label><select id="charset-select" aria-describedby="charset-hint">${[['common',config.common],['other',config.other]].map(([group,items])=>`<optgroup label="${escape(L[group])}">${items.map(([id,name])=>`<option value="${id}"${id==='utf-8'?' selected':''}>${escape(name)}</option>`).join('')}</optgroup>`).join('')}</select></div>`;
  html=html.replace(/(<div class="panel-heading"><label id="output-label"[\s\S]*?<\/label>)/,`$1${select}`);
  html=html.replace(/(<span id="output-count">[\s\S]*?<\/div>)(\s*<\/section>)/,`$1<div class="output-actions">${copy}</div>$2`);
  html=html.replace(/\s*<p id="charset-hint"[\s\S]*?<\/p>/g,'').replace('</form>',`<p id="charset-hint" class="charset-hint">${escape(L[mode+'Hint'])}</p></form>`);
  fs.writeFileSync(file,html.replace(/\n[ \t]*\n+/g,'\n'));
 }
}
fs.writeFileSync(path.join(root,'charset-messages.js'),'window.decodexCharsetMessages = '+JSON.stringify(messages)+';\n');
console.log(`Added ${config.common.length+config.other.length} grouped character encodings and moved copy buttons on 24 pages.`);
