const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const root=require('node:path').resolve(__dirname,'..')+'/';
(async()=>{
for(const lang of ['en','ko','es','pt-BR','de','ja','zh-CN','fr','it','nl','hi','ru'])for(const mode of ['encode','decode']){
const nodes={};function node(id){return nodes[id]??={value:'',textContent:'',disabled:false,attrs:{},listeners:{},classList:{toggle(){}},addEventListener(k,fn){this.listeners[k]=fn},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},focus(){},select(){this.selected=true}};}
let copied;const ctx={window:{},setTimeout,clearTimeout,TextEncoder,TextDecoder,Uint8Array,atob,btoa,navigator:{clipboard:{async writeText(s){copied=s}}},document:{body:{dataset:{mode,lang}},getElementById:node}};
vm.createContext(ctx);if(!['en','ko'].includes(lang))vm.runInContext(fs.readFileSync(root+'locales/'+lang+'.js','utf8'),ctx);vm.runInContext(fs.readFileSync(root+'function.js','utf8'),ctx);
const sample='Olá नमस्ते 你好 Привет 日本語 안녕하세요 😀';ctx.sample=sample;assert.equal(vm.runInContext('decodeText(encodeText(sample))',ctx),sample);
node('userInput').value=mode==='encode'?sample:Buffer.from(sample).toString('base64');node('userInput').listeners.input();await new Promise(r=>setTimeout(r,280));assert.equal(node('result').value,mode==='encode'?Buffer.from(sample).toString('base64'):sample);
await node('copy-button').listeners.click();assert.equal(copied,node('result').value);
node('auto-convert-button').listeners.click();assert.equal(node('auto-convert-button').attrs['aria-pressed'],'false');if(ctx.window.decodexLocale)assert.equal(node('auto-convert-button').textContent,ctx.window.decodexLocale.auto+': '+ctx.window.decodexLocale.off);
node('userInput').value='new';node('userInput').listeners.input();await new Promise(r=>setTimeout(r,280));assert.equal(node('result').value,'');
for(const s of ['!','A','Zg=','/w=='])assert.throws(()=>vm.runInContext('decodeText('+JSON.stringify(s)+')',ctx));
assert.equal(vm.runInContext("decodeText('8J-YgA')",ctx),'😀');assert.equal(vm.runInContext("decodeText('SGVs bG8\\n')",ctx),'Hello');
assert.throws(()=>vm.runInContext("encodeText('a'.repeat(5*1024*1024+1))",ctx));
node('clear-button').listeners.click();assert.equal(node('result').value,'');assert.equal(node('copy-button').disabled,true);
console.log('PASS',lang,mode);
}
function route({lang='en',path='/',saved=null,query='',blocked=false}={}){let destination=null;const ctx={URLSearchParams,navigator:{languages:[lang]},localStorage:{getItem(){if(blocked)throw Error();return saved}},window:{location:{pathname:path,search:query,hash:'',replace(v){destination=v}}},document:{addEventListener(){}}};vm.runInNewContext(fs.readFileSync(root+'language.js','utf8'),ctx);return destination;}
for(const [lang,folder] of [['es-MX','es'],['pt-PT','pt-br'],['de-DE','de'],['ja-JP','ja'],['zh-Hans','zh-cn'],['zh-SG','zh-cn'],['fr-CA','fr'],['it-IT','it'],['nl-NL','nl'],['hi-IN','hi'],['ru-RU','ru'],['ko-KR','ko']])assert.equal(route({lang}),'/'+folder+'/');
for(const lang of ['ar','zh-TW','zh-Hant','en-US'])assert.equal(route({lang}),null);
assert.equal(route({lang:'ko',path:'/ja/encode.html'}),null);assert.equal(route({lang:'ko',saved:'de',path:'/encode.html'}),'/de/encode.html');assert.equal(route({lang:'ko',saved:'en'}),null);assert.equal(route({lang:'es',blocked:true}),'/es/');assert.equal(route({path:'/de/',query:'?language=en'}),'/?language=en');
console.log('PASS browser language, manual preference, unsupported fallback, direct translated URL, blocked storage');
})().catch(e=>{console.error(e);process.exitCode=1});
