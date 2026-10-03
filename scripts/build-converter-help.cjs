// Keep mode-specific, crawlable help on the converter pages themselves.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const content=JSON.parse(fs.readFileSync(path.join(root,'content/converter-help.json'),'utf8'));
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const shared={
 en:{step2:'Conversion is automatic as you type or paste. Turn off Auto convert to use the button or Ctrl+Enter (⌘+Enter on Mac).',step3:'Use Copy result to copy the output. The UTF-8 input or decoded data limit is 5 MB (5 × 1024 × 1024 bytes).',input:'Input',output:'Result',local:'Conversion runs in your browser; your text and result are not sent to a conversion server. Google Analytics measures site visits and feature use.',security:'Base64 is a reversible representation of data, not encryption. It does not protect passwords or other secrets.',securityQ:'Does Base64 protect my text?',decode:'Base64 Decoder',encode:'Base64 Encoder',more:'Related explanations',try:'Try the Unicode example',unicode:'Decodex encodes text as UTF-8 before Base64 conversion, so Korean, accents and emoji can be restored by a UTF-8 decoder. The receiving system must read the decoded bytes as UTF-8. This encoder does not produce EUC-KR or Shift_JIS.'},
 ko:{step2:'입력하거나 붙여넣으면 자동으로 변환됩니다. 자동 변환을 끄면 변환 버튼이나 Ctrl+Enter(맥은 ⌘+Enter)를 사용하세요.',step3:'결과 복사 버튼으로 출력 값을 복사하세요. UTF-8 입력 또는 복원한 데이터의 한도는 5 MB(5 × 1024 × 1024바이트)입니다.',input:'입력',output:'결과',local:'변환은 브라우저에서 실행되며 입력과 결과는 변환 서버에 전송하지 않습니다. Google Analytics로 방문과 기능 사용을 측정합니다.',security:'Base64는 데이터를 되돌릴 수 있는 문자 형태로 표현하며 암호화가 아닙니다. 비밀번호나 비밀 정보를 보호하지 않습니다.',securityQ:'Base64 인코딩으로 내용을 안전하게 숨길 수 있나요?',decode:'Base64 디코딩',encode:'Base64 인코딩',more:'관련 설명 더 읽기',try:'한글·이모지 예제 직접 변환',unicode:'한글·이모지는 문자 그대로 btoa()에 넣으면 오류가 날 수 있지만, 이 인코더는 먼저 TextEncoder로 UTF-8 바이트를 만든 뒤 Base64로 변환합니다. 다시 읽는 시스템도 복원한 바이트를 UTF-8로 해석해야 한글이 올바르게 표시됩니다. EUC-KR이나 Shift_JIS로 인코딩하는 기능은 제공하지 않습니다.'}
};
const extra={es:['¿Base64 protege mi texto?','Más información','Probar el ejemplo Unicode'], 'pt-BR':['Base64 protege meu texto?','Saiba mais','Testar o exemplo Unicode'],de:['Schützt Base64 meinen Text?','Weitere Erklärungen','Unicode-Beispiel ausprobieren'],ja:['Base64で内容を保護できますか？','詳しい説明','Unicodeの例を試す'],'zh-CN':['Base64能保护文本吗？','更多说明','转换Unicode示例'],fr:['Base64 protège-t-il mon texte ?','Pour en savoir plus','Essayer l’exemple Unicode'],it:['Base64 protegge il mio testo?','Altre spiegazioni','Prova l’esempio Unicode'],nl:['Beschermt Base64 mijn tekst?','Meer uitleg','Probeer het Unicode-voorbeeld'],hi:['क्या Base64 मेरा टेक्स्ट सुरक्षित रखता है?','अन्य जानकारी','Unicode उदाहरण बदलें'],ru:['Защищает ли Base64 мой текст?','Подробнее','Проверить пример Unicode']};
const native={en:'Hello 😀',ko:'한글',es:'¡Hola!','pt-BR':'Olá',de:'Grüße',ja:'こんにちは','zh-CN':'你好',fr:'Bonjour ☕',it:'Caffè',nl:'hé',hi:'नमस्ते',ru:'Привет'};
for(const [lang,data] of Object.entries(content)){
 const folder=lang==='en'?'':lang.toLowerCase()+'/';
 const articles=JSON.parse(fs.readFileSync(path.join(root,'content',`guides-${lang}.json`),'utf8'));
 const locale=shared[lang]||(()=>{const d=JSON.parse(fs.readFileSync(path.join(root,'locales',lang+'.json'),'utf8'));return {step2:d.step2,step3:d.step3,input:d.input,output:d.output,local:d.local,security:d.security,securityQ:extra[lang][0],decode:d.decode,encode:d.encode,more:extra[lang][1],try:extra[lang][2],unicode:d.utf8Text};})();
 for(const mode of ['decode','encode']){
  const page=mode==='decode'?'index.html':'encode.html';
  const file=path.join(root,folder,page);let html=fs.readFileSync(file,'utf8');
  const help=data[mode],faq=[...help.faq];
  if(mode==='decode')faq.push(articles['base64-padding'].faq[0]);
  faq.push([locale.securityQ,locale.security]);
  const examples=['Hello',native[lang],'안녕하세요 😀'];
  const table=`<div class="article-table"><table><thead><tr><th scope="col">${escape(locale.input)}</th><th scope="col">${escape(locale.output)}</th></tr></thead><tbody>${examples.map(text=>{const encoded=Buffer.from(text,'utf8').toString('base64');return `<tr data-example-text="${escape(text)}"><td><code>${escape(mode==='encode'?text:encoded)}</code></td><td><code>${escape(mode==='encode'?encoded:text)}</code></td></tr>`;}).join('')}</tbody></table></div>`;
  const formats=mode==='encode'?`<p>${escape(help.formatText)}</p>`:`<p>${escape(articles.base64url.sections[0][1])}</p><p>${escape(articles['base64-padding'].sections[0][1])}</p><p><code>Zg</code> → <code>f</code>; <code>Zg==</code> → <code>f</code>; <code>8J-YgA</code> → <code>😀</code>.</p>`;
  const errors=shared[lang]?mode==='decode'?(lang==='ko'?'공백·줄바꿈은 무시하고 누락된 패딩은 복원하지만, 잘못된 위치의 =나 일부만 붙은 패딩은 거부합니다. Zg는 f로 변환되지만 Zg=, A=AA, Zg===는 오류입니다. 공백을 제외한 길이를 4로 나눈 나머지가 1이면 올바른 Base64 길이가 아닙니다. URL에서 +가 공백으로 바뀌었거나 원문 일부가 잘렸다면 원본을 다시 확인하세요.':'Whitespace and line breaks are ignored, and omitted padding is restored. Misplaced or partially supplied padding is rejected: Zg decodes to f, but Zg=, A=AA and Zg=== fail. A whitespace-free length with remainder 1 when divided by 4 is invalid. If a URL changed + to a space, or part of the value was truncated, check the original source.'):'':JSON.parse(fs.readFileSync(path.join(root,'locales',lang+'.json'),'utf8')).errorsText;
  const section=`<section class="guide converter-help" id="converter-help" data-converter-help="${mode}"><h2>${escape(help.heading)}</h2><p>${escape(help.intro)}</p><ol><li>${escape(help.firstStep)}</li><li>${escape(locale.step2)}</li><li>${escape(locale.step3)}</li></ol><h2>${escape(data.examplesHeading)}</h2><p>${escape(data.examplesText)}</p>${table}<p><a href="?example=unicode#converter">${escape(locale.try)} →</a></p><h2>${escape(help.formatHeading)}</h2>${formats}<h2>${escape(mode==='decode'?help.errorsHeading:data.unicodeHeading)}</h2><p>${escape(mode==='decode'?errors:locale.unicode)}</p><h2>${escape(help.faqHeading)}</h2>${faq.map(([q,a])=>`<details><summary>${escape(q)}</summary><p>${escape(a)}</p></details>`).join('')}<p><a href="${mode==='decode'?'encode.html':'./'}">${escape(mode==='decode'?locale.encode:locale.decode)} →</a></p><p>${escape(locale.local)}</p></section>`;
  // Replace the previous short guide rather than stacking duplicate introductions.
  html=html.replace(/\s*<section class="guide(?: converter-help)?"[\s\S]*?<\/section>/g,'');
  html=html.replace(/\s*<section class="guide-resources(?: converter-related)?"[\s\S]*?<\/section>/g,'');
  const links=mode==='decode'?['base64-errors','base64-padding','base64url','base64-korean']:['base64-korean','base64-padding','javascript-base64'];
  const legacy=shared[lang]?lang==='ko'?{errors:'Base64 디코딩 오류 해결',utf8:'한글·이모지 Base64 변환'}:{errors:'Fix Base64 decoding errors',utf8:'Convert Korean and emoji with UTF-8'}:JSON.parse(fs.readFileSync(path.join(root,'locales',lang+'.json'),'utf8'));
  const related=`<section class="guide-resources converter-related"><h2>${escape(locale.more)}</h2><ul>${links.map(key=>`<li><a href="${key}.html">${escape(articles[key]?.title||(key==='base64-errors'?legacy.errors:legacy.utf8))}</a></li>`).join('')}</ul></section>`;
  html=html.replace(/\s*<\/main>/,`\n${section}\n${related}\n</main>`);
  fs.writeFileSync(file,html);
 }
 // Give readers of detailed articles an explicit route to the tools.
 for(const page of ['base64-errors.html','base64-korean.html','base64url.html','base64-padding.html','javascript-base64.html']){
  const file=path.join(root,folder,page);let html=fs.readFileSync(file,'utf8');
  html=html.replace(/\s*<nav class="article-tool-links"[\s\S]*?<\/nav>/g,'');
  const links=`<nav class="article-tool-links" aria-label="Decodex"><a href="./">${escape(locale.decode)} →</a><a href="encode.html">${escape(locale.encode)} →</a></nav>`;
  html=html.replace('<article class="info-content">','<article class="info-content">'+links);
  fs.writeFileSync(file,html);
 }
}
console.log('Updated mode-specific help and examples on 24 converter pages; linked detailed articles back to the tools.');
