// Localized article sources live in content/guides-*.json.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const names = {en:'English',ko:'한국어',es:'Español','pt-BR':'Português (Brasil)',de:'Deutsch',ja:'日本語','zh-CN':'简体中文',fr:'Français',it:'Italiano',nl:'Nederlands',hi:'हिन्दी',ru:'Русский'};
const order = ['en','ko','zh-CN','es','hi','ru','fr','pt-BR','de','ja','it','nl'];
const original = ['index.html','encode.html','about.html','privacy.html','contact.html','guides.html','base64-errors.html','base64-korean.html'];
const keys = ['base64url','base64-padding','javascript-base64'];
const labels = {
 en:['More Base64 guides','Try this example','Contents','Common questions','References','Written by','Updated','Format','Text','Padding'],
 ko:['더 알아보기','예제로 직접 변환하기','목차','자주 묻는 질문','참고 자료','작성','수정일','형식','텍스트','패딩'],
 es:['Más guías de Base64','Probar este ejemplo','Contenido','Preguntas frecuentes','Referencias','Autor','Actualizado','Formato','Texto','Relleno'],
 'pt-BR':['Mais guias de Base64','Testar este exemplo','Conteúdo','Perguntas frequentes','Referências','Autor','Atualizado','Formato','Texto','Preenchimento'],
 de:['Weitere Base64-Anleitungen','Beispiel ausprobieren','Inhalt','Häufige Fragen','Quellen','Autor','Aktualisiert','Format','Text','Padding'],
 ja:['Base64の関連ガイド','この例を変換する','目次','よくある質問','参考資料','著者','更新日','形式','テキスト','パディング'],
 'zh-CN':['更多Base64指南','转换此示例','目录','常见问题','参考资料','作者','更新日期','格式','文本','填充'],
 fr:['Autres guides Base64','Essayer cet exemple','Sommaire','Questions fréquentes','Références','Auteur','Mis à jour','Format','Texte','Remplissage'],
 it:['Altre guide Base64','Prova questo esempio','Indice','Domande frequenti','Riferimenti','Autore','Aggiornato','Formato','Testo','Padding'],
 nl:['Meer Base64-handleidingen','Probeer dit voorbeeld','Inhoud','Veelgestelde vragen','Bronnen','Auteur','Bijgewerkt','Formaat','Tekst','Padding'],
 hi:['अन्य Base64 गाइड','यह उदाहरण बदलें','विषय सूची','अक्सर पूछे जाने वाले प्रश्न','संदर्भ','लेखक','अपडेट','प्रारूप','टेक्स्ट','पैडिंग'],
 ru:['Другие руководства Base64','Проверить пример','Содержание','Частые вопросы','Источники','Автор','Обновлено','Формат','Текст','Заполнение']
};
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const folder = lang => lang === 'en' ? '' : lang.toLowerCase() + '/';
const url = (lang,page) => 'https://decodex.fyi/' + folder(lang) + (page === 'index.html' ? '' : page);
const snippet = fs.readFileSync(path.join(root,'content/unicode-example.js'),'utf8');
function resources(lang,articles,exclude) {
 return `<section class="guide-resources" data-new-guides><h2>${esc(labels[lang][0])}</h2><div class="guide-grid">${keys.filter(k=>k!==exclude).map(k=>`<a class="guide-card" href="${k}.html"><h3>${esc(articles[k].title)}</h3><p>${esc(articles[k].description)}</p></a>`).join('')}</div></section>`;
}
function table(headers,rows) {
 return `<div class="article-table"><table><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(cell=>`<td><code>${esc(cell)}</code></td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
for (const lang of Object.keys(names)) {
 const articles = JSON.parse(fs.readFileSync(path.join(root,'content',`guides-${lang}.json`),'utf8'));
 const L=labels[lang];
 const hub=fs.readFileSync(path.join(root,folder(lang),'guides.html'),'utf8');
 for(const key of keys) {
  const article=articles[key],page=key+'.html',canonical=url(lang,page);
  let head=hub.match(/<head>([\s\S]*?)<\/head>/)[1]
   .replace(/\s*<link rel="alternate"[^>]+>/g,'')
   .replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(article.title)} | Decodex</title>`)
   .replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*(">)/g,`$1${esc(article.description)}$2`)
   .replace(/(<meta property="og:title" content=")[^"]*(">)/,`$1${esc(article.title)} | Decodex$2`)
   .replace(/(<link rel="canonical" href=")[^"]*(">)/,`$1${canonical}$2`)
   .replace(/(<meta property="og:url" content=")[^"]*(">)/,`$1${canonical}$2`)
   .replace(/(<meta property="og:type" content=")[^"]*(">)/,'$1article$2')
   .replace(/(src|href)="(?:\.\.\/)?(theme.js|language.js|style.css)\?[^\"]+"/g,'$1="/$2?v=20261003p"');
  head += Object.keys(names).map(l=>`\n<link rel="alternate" hreflang="${l}" href="${url(l,page)}">`).join('')+`\n<link rel="alternate" hreflang="x-default" href="${url('en',page)}">`;
  const schema=[{'@context':'https://schema.org','@type':'Article',headline:article.title,description:article.description,inLanguage:lang,mainEntityOfPage:canonical,datePublished:'2026-10-03',dateModified:'2026-10-03',author:{'@type':'Person',name:'jinsu100',url:'https://github.com/jinsu100'},publisher:{'@type':'Organization',name:'Decodex',url:'https://decodex.fyi/'}}, {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Decodex',item:url(lang,'index.html')},{'@type':'ListItem',position:2,name:hub.match(/<h1[^>]*>([^<]*)<\/h1>/)[1],item:url(lang,'guides.html')},{'@type':'ListItem',position:3,name:article.title,item:canonical}]}];
  head+=`\n<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script>\n`;
  let header=hub.match(/<header[\s\S]*?<\/header>/)[0];
  header=header.replace(/href="\/(?:[a-z-]+\/)?guides.html"/g, m=>m.replace('guides.html',page));
  const footer=hub.match(/<footer[\s\S]*?<\/footer>/)[0];
  const demo=key==='javascript-base64'?'encode.html?example=unicode':key==='base64url'?'./?example=base64url':'./?example=padding';
  const example=key==='base64url'?table([L[7],L[8], 'Base64'],[['Base64','😀','8J+YgA=='],['Base64URL','😀','8J-YgA=='],['Base64URL (JWT)','😀','8J-YgA']]):key==='base64-padding'?table([L[8],'UTF-8 bytes','Base64',L[9]],[['f','1','Zg==','=='],['fo','2','Zm8=','='],['foo','3','Zm9v','—']]):`<pre class="article-code"><code>${esc(snippet)}</code></pre>`;
  const refs=key==='base64url'?[['RFC 4648 · Base64URL','https://www.rfc-editor.org/rfc/rfc4648#section-5'],['RFC 7515 · JWS','https://www.rfc-editor.org/rfc/rfc7515#section-2'],['MDN · URLSearchParams','https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams']]:key==='base64-padding'?[['RFC 4648 · Base64 padding','https://www.rfc-editor.org/rfc/rfc4648#section-3.2']]:[['MDN · btoa / Unicode','https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa'],['MDN · TextDecoder','https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder'],['Node.js · Buffer','https://nodejs.org/api/buffer.html']];
  const main=`<main class="info-page"><nav class="article-breadcrumb" aria-label="Decodex"><a href="./">Decodex</a> → <a href="guides.html">${hub.match(/<h1[^>]*>([^<]*)<\/h1>/)[1]}</a></nav><section class="intro"><p class="eyebrow">DECODEX · BASE64 · UTF-8</p><h1>${esc(article.title)}</h1><p class="description">${esc(article.description)}</p><p class="article-byline">${L[5]}: <a href="https://github.com/jinsu100">jinsu100 · Decodex</a> · ${L[6]}: <time datetime="2026-10-03">2026-10-03</time></p></section><article class="info-content"><p>${esc(article.intro)}</p><nav class="article-toc" aria-label="${L[2]}"><strong>${L[2]}</strong><ol>${article.sections.map(([h],i)=>`<li><a href="#section-${i+1}">${esc(h)}</a></li>`).join('')}<li><a href="#examples">${L[1]}</a></li></ol></nav>${article.sections.map(([h,p],i)=>`<section id="section-${i+1}"><h2>${esc(h)}</h2><p>${esc(p)}</p></section>`).join('')}<section id="examples"><h2>${L[1]}</h2>${example}<p><a class="primary-button article-example" href="${demo}">${L[1]} →</a></p><p><a href="./">Base64 → UTF-8</a> · <a href="encode.html">UTF-8 → Base64</a></p></section><section><h2>${L[3]}</h2>${article.faq.map(([q,a])=>`<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}</section><section class="article-references"><h2>${L[4]}</h2><ul>${refs.map(([name,href])=>`<li><a href="${href}">${esc(name)}</a></li>`).join('')}</ul></section>${resources(lang,articles,key)}</article></main>`;
  fs.writeFileSync(path.join(root,folder(lang),page),`<!DOCTYPE html>\n<html lang="${lang}"><head>${head}</head><body data-lang="${lang}">${header}${main}${footer}</body></html>\n`);
 }
 for(const page of ['index.html','encode.html','guides.html','base64-errors.html','base64-korean.html']) {
  const file=path.join(root,folder(lang),page);
  let html=fs.readFileSync(file,'utf8').replace(/\s*<section class="guide-resources" data-new-guides>[\s\S]*?<\/section>/g,'').replace(/^[ \t]+$/gm,'');
  html=html.replace('</main>',resources(lang,articles)+'\n</main>');
  if(page==='guides.html') {
   const description = keys.map(k=>articles[k].title).join(' · ');
   html=html.replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*(">)/g,`$1${esc(description)}$2`);
  }
  fs.writeFileSync(file,html);
 }
}
const pages=[...original,...keys.map(k=>k+'.html')];
fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+Object.keys(names).flatMap(l=>pages.map(p=>`<url><loc>${url(l,p)}</loc></url>`)).join('\n')+'\n</urlset>\n');
console.log('Generated 36 practical guides; sitemap now contains 132 URLs.');
