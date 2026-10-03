// Run with: node scripts/build-locales.cjs
// Locale JSON is the editable source; translated HTML and runtime bundles are generated.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const version = '20261003n';
const names = {en:'English',ko:'한국어',es:'Español','pt-BR':'Português (Brasil)',de:'Deutsch',ja:'日本語','zh-CN':'简体中文',fr:'Français',it:'Italiano',nl:'Nederlands',hi:'हिन्दी',ru:'Русский'};
// English and Korean are pinned; others follow OBDILCI V6 (July 2025)
// estimated connected L1+L2 speakers, using Chinese/Portuguese as locale proxies.
const menuOrder = ["en", "ko", "zh-CN", "es", "hi", "ru", "fr", "pt-BR", "de", "ja", "it", "nl"];
const dirs = Object.fromEntries(Object.keys(names).map(k=>[k,k==='en'?'':k.toLowerCase()+'/']));
const pages = ['index.html','encode.html','about.html','privacy.html','contact.html','guides.html','base64-errors.html','base64-korean.html'];
const url = (lang,page)=>'/'+dirs[lang]+(page==='index.html'?'':page);
const escape = s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function alternates(page) {return [...Object.keys(names).map(lang=>`<link rel="alternate" hreflang="${lang}" href="https://decodex.fyi${url(lang,page)}">`),`<link rel="alternate" hreflang="x-default" href="https://decodex.fyi${url('en',page)}">`].join('\n');}
function menu(lang,page,label) {return `<nav class="language-switch" aria-label="${escape(label)}"><details class="language-menu"><summary>🌐 ${names[lang]}</summary><div class="language-options">${menuOrder.map(l=>`<a href="${url(l,page)}" lang="${l}" hreflang="${l}"${l===lang?' aria-current="page"':''}>${names[l]}</a>`).join('')}</div></details></nav>`;}
const baseHead=fs.readFileSync(path.join(root,'index.html'),'utf8').match(/<head>([\s\S]*?)<\/head>/)[1];
for (const lang of Object.keys(names).filter(l=>!['en','ko'].includes(l))) {
 const d=JSON.parse(fs.readFileSync(path.join(root,'locales',lang+'.json'),'utf8'));
 const e=k=>escape(d[k]);
 const dir=path.join(root,dirs[lang]);fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(root,'locales',lang+'.js'),'window.decodexLocale = '+JSON.stringify({messages:d.messages,auto:d.auto,on:d.on,off:d.off,chars:d.chars,dark:d.dark,example:({es:'¡Hola, Decodex! 👋', 'pt-BR':'Olá, Decodex! 👋',de:'Hallo, Decodex! Grüße 👋',ja:'こんにちは、Decodex！ 👋','zh-CN':'你好，Decodex！ 👋',fr:'Bonjour, Decodex ! 👋',it:'Ciao, Decodex! 👋',nl:'Hallo, Decodex! 👋',hi:'नमस्ते, Decodex! 👋',ru:'Привет, Decodex! 👋'})[lang]})+';\n');
 const footer=`<footer><span>© Decodex</span><nav class="footer-links">${['guides','about','privacy','contact'].map(k=>`<a href="${k}.html">${e(k)}</a>`).join('')}</nav></footer>`;
 const help=`<section class="guide-resources"><h2>${e('guides')}</h2><div class="guide-grid"><a class="guide-card" href="base64-errors.html"><h3>${e('errors')}</h3></a><a class="guide-card" href="base64-korean.html"><h3>${e('utf8')}</h3></a></div></section>`;
 for (const page of pages) {
  const converter=['index.html','encode.html'].includes(page), enc=page==='encode.html';
  const key=converter?(enc?'encodeTitle':'decodeTitle'):({'about.html':'about','privacy.html':'privacy','contact.html':'contact','guides.html':'guides','base64-errors.html':'errors','base64-korean.html':'utf8'})[page];
  const title=d[key],desc=converter?d[enc?'encodeDesc':'decodeDesc']:({'about.html':d.aboutText,'privacy.html':d.privacy,'contact.html':d.contactText,'guides.html':d.decodeDesc,'base64-errors.html':d.errorsText,'base64-korean.html':d.utf8Text})[page].slice(0,170);
  let head=baseHead.replace(/\s*<link rel="alternate"[^>]+>/g,'').replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(title)} | Decodex</title>`).replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*(">)/g,`$1${escape(desc)}$2`).replace(/(<meta property="og:title" content=")[^"]*(">)/,`$1${escape(title)} | Decodex$2`).replace(/(<link rel="canonical" href=")[^"]*(">)/,`$1https://decodex.fyi${url(lang,page)}$2`).replace(/(<meta property="og:url" content=")[^"]*(">)/,`$1https://decodex.fyi${url(lang,page)}$2`);
  head=head.replace(/(src|href)="(theme.js|language.js|function.js|style.css)\?[^\"]+"/g,`$1="/$2?v=${version}"`);
  if(!converter)head=head.replace(/\s*<script src="\/function.js[^<]+<\/script>/,'');
  head=head.replace('<script src="/theme.js',`<script src="/locales/${lang}.js?v=${version}"></script>\n<script src="/theme.js`)+alternates(page);
  const header=`<header class="header"><a class="brand" href="./" aria-label="Decodex"><img src="/decodexLogo.png" alt="Decodex" width="2172" height="724"></a><div class="header-tools"><button id="theme-toggle" class="theme-toggle" type="button" aria-label="${e('dark')}" aria-pressed="false" hidden><span class="theme-icon" aria-hidden="true">☀</span><span class="theme-label">${e('dark')}</span></button>${menu(lang,page,d.language)}</div></header>`;
  let main;
  if(converter){
   const action=e(enc?'encode':'decode');
   main=`<main><section class="intro"><p class="eyebrow">DECODEX · BASE64 · UTF-8</p><h1 id="page-title">${escape(title)}</h1><p class="description">${escape(desc)}</p></section>
<form id="converter" novalidate><div class="converter-toolbar"><button type="button" id="auto-convert-button" class="auto-convert-button" aria-pressed="true" aria-describedby="auto-convert-hint">${e('auto')}: ${e('on')}</button><nav class="mode-switch" aria-label="Base64"><a href="./"${!enc?' aria-current="page"':''}>${e('decode')}</a><a href="encode.html"${enc?' aria-current="page"':''}>${e('encode')}</a></nav></div><p id="auto-convert-hint" class="auto-convert-hint">${escape(d.messages['Converts automatically as you type or paste. Turn off to convert manually.'])}</p>
<div class="workspace"><section class="panel input-panel" aria-labelledby="input-label"><div class="panel-heading"><label id="input-label" for="userInput">${e('input')}${enc?'':' · Base64'}</label></div><textarea id="userInput" placeholder="${e(enc?'inputText':'input64')}" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="input-hint feedback"></textarea><div class="panel-footer"><span id="input-count">0 ${e('chars')}</span><div class="small-actions"><button type="button" id="example-button">${e('example')}</button><button type="button" id="clear-button">${e('clear')}</button></div></div><div class="conversion-bar panel-action"><p id="input-hint">${e(enc?'hintEncode':'hintDecode')}</p><button class="primary-button" type="submit">${action} <span aria-hidden="true">→</span></button></div></section>
<section class="panel output-panel" aria-labelledby="output-label"><div class="panel-heading"><label id="output-label" for="result">${e('output')}${enc?' · Base64':''}</label><button class="copy-button" type="button" id="copy-button" disabled><span aria-hidden="true">⧉</span> ${e('copy')}</button></div><textarea id="result" readonly placeholder="${e('result')}" spellcheck="false"></textarea><div class="panel-footer"><span id="output-count">0 ${e('chars')}</span></div></section></div><p id="feedback" class="feedback" role="status" aria-live="polite" aria-atomic="true"></p></form>
<section class="guide"><h2>${e('how')}</h2><ol>${['step1','step2','step3'].map(k=>`<li>${e(k)}</li>`).join('')}</ol><p>${e('local')}</p><p>${e('security')}</p></section>${help}</main>`;
  } else {
   let content='';
   if(page==='about.html') content=`<p>${e('aboutText')}</p><p>${e('local')}</p><p>${e('security')}</p><p><a href="https://github.com/jinsu100/Decodex">GitHub · Decodex</a></p>`;
   if(page==='privacy.html') content=`<p>2026-10-03</p>${d.privacyText.split(/(?<=。)|(?<=[.!])\s+/u).filter(Boolean).reduce((a,s,i)=>{if(i%3===0)a.push([]);a.at(-1).push(s);return a;},[]).map(a=>`<p>${escape(a.join(' '))}</p>`).join('')}<p><a href="https://policies.google.com/privacy">Google · ${e('privacy')}</a> · <a href="https://policies.google.com/technologies/partner-sites">Google Analytics</a> · <a href="https://tools.google.com/dlpage/gaoptout">Google Analytics Opt-out</a> · <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub · ${e('privacy')}</a> · <a href="contact.html">${e('contact')}</a></p>`;
   if(page==='contact.html') content=`<p>${e('contactText')}</p><p><a class="primary-button" href="https://github.com/jinsu100/Decodex/issues/new/choose">GitHub Issues →</a></p>`;
   if(page==='guides.html') content=`<p>${e('decodeDesc')}</p>${help}`;
   if(page==='base64-errors.html') content=`<p>${e('errorsText')}</p><pre><code>SGVsbG8= → Hello\nSGVsbG8 → Hello\nSGVs bG8= → Hello</code></pre><p>${e('security')}</p>${help}`;
   if(page==='base64-korean.html') content=`<p>${e('utf8Text')}</p><pre><code>안녕하세요 😀\n↕\n7JWI64WV7ZWY7IS47JqUIPCfmIA=</code></pre><p><a href="encode.html">${e('encode')}</a> · <a href="./">${e('decode')}</a></p>${help}`;
   main=`<main class="info-page"><a class="back-link" href="./">← ${e('back')}</a><section class="intro"><p class="eyebrow">DECODEX</p><h1>${escape(title)}</h1></section><article class="info-content">${content}</article></main>`;
  }
  fs.writeFileSync(path.join(dir,page),`<!DOCTYPE html>\n<html lang="${lang}"><head>${head}</head><body data-lang="${lang}"${converter?` data-mode="${enc?'encode':'decode'}"`:''}>${header}${main}${footer}</body></html>\n`);
 }
}
// Keep the original English and Korean content; update shared navigation and discovery.
for(const lang of ['en','ko'])for(const page of pages){
 const file=path.join(root,dirs[lang],page);let html=fs.readFileSync(file,'utf8');
 html=html.replace(/\s*<link rel="alternate"[^>]+>/g,'').replace('</head>',alternates(page)+'\n</head>');
 html=html.replace(/<nav class="language-switch"[\s\S]*?<\/nav>/,menu(lang,page,lang==='ko'?'언어':'Language'));
 html=html.replace(/((?:theme|language|function)\.js|style\.css)\?v=[^"\s]+/g,`$1?v=${version}`);
 html=html.replace('choose English or Korean','choose from the supported languages').replace('choose English or Korean','choose from the supported languages').replace('영어나 한국어','지원하는 언어').replace('한국어·영어 선택','12개 언어 선택').replace('브라우저 언어를 확인하여 한국어 또는 영어를 선택합니다.','기본 주소에서는 브라우저 언어에 맞는 지원 언어를 선택하며, 지원하지 않는 언어는 영어로 표시합니다. 언어별 주소로 직접 방문하면 해당 언어를 유지합니다.');
 fs.writeFileSync(file,html);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+Object.keys(names).flatMap(lang=>pages.map(page=>`<url><loc>https://decodex.fyi${url(lang,page)}</loc></url>`)).join('\n')+'\n</urlset>\n');
console.log('Updated 96 converter, information and existing guide pages.');

require('./build-guides.cjs');

require('./build-converter-help.cjs');
