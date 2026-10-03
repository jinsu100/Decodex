const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const ctx={window:{},TextEncoder,TextDecoder,Uint8Array,console};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'vendor/legacy-encoder.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'charsets.js'),'utf8'),ctx);
const codecs=ctx.window.decodexCharsets;
const golden=[['euc-kr','한글','c7d1b1db'],['shift_jis','あい','82a082a2'],['gbk','中国','d6d0b9fa'],['gb18030','😀','9439fc36'],['windows-1252','Café €','436166e92080'],['iso-8859-1','Café\u0080','436166e980'],['utf-16le','A한','41005cd5'],['utf-16be','A한','0041d55c']];
for(const [id,text,hex] of golden){const bytes=codecs.encode(text,id);assert.equal(Buffer.from(bytes).toString('hex'),hex,id);assert.equal(codecs.decode(bytes,id),text,id);}
for(const [id] of [...codecs.common,...codecs.other]){
 const bytes=codecs.encode('Hello 123',id);assert.equal(codecs.decode(bytes,id),'Hello 123',id);
}
for(const id of ['ascii','iso-8859-1','euc-kr','shift_jis','windows-1252'])assert.throws(()=>codecs.encode('한글 😀',id));
for(const [id,bytes] of [['utf-8',[255]],['euc-kr',[199]],['shift_jis',[130]],['utf-16le',[65]],['utf-16be',[0]],['ascii',[128]]])assert.throws(()=>codecs.decode(Uint8Array.from(bytes),id));
assert.throws(()=>codecs.decode(Uint8Array.of(65),'invalid'));
for(const [lang] of Object.entries(JSON.parse(fs.readFileSync(path.join(root,'content/charset-labels.json'),'utf8')))){
 for(const mode of ['encode','decode']){
  const file=path.join(root,lang==='en'?'':lang.toLowerCase(),mode==='encode'?'encode.html':'index.html');const html=fs.readFileSync(file,'utf8');
  assert.equal((html.match(/id="charset-select"/g)||[]).length,1);assert.equal((html.match(/id="copy-button"/g)||[]).length,1);
  assert.ok(/<option value="utf-8" selected>/.test(html));assert.equal((html.match(/<optgroup /g)||[]).length,2);
  assert.ok(html.indexOf('/charsets.js')<html.indexOf('function.js'));
  assert.ok(html.indexOf('class="output-actions"')<html.indexOf('id="copy-button"'));
  assert.ok(html.indexOf('id="result"')<html.indexOf('id="copy-button"'));
 }
}
(async()=>{
 const nodes={};const node=id=>nodes[id]??={value:'',textContent:'',disabled:false,listeners:{},classList:{toggle(){}},addEventListener(e,f){this.listeners[e]=f},setAttribute(){},removeAttribute(){},focus(){}};
 let release;
 const pending=new Promise(resolve=>release=resolve);
 const c={window:{decodexCharsets:{...codecs,loadEncoder:()=>pending}},TextEncoder,TextDecoder,Uint8Array,atob,btoa,setTimeout,clearTimeout,document:{body:{dataset:{lang:'en',mode:'encode'}},getElementById:node},navigator:{}};
 vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'function.js'),'utf8'),c);
 node('charset-select').value='euc-kr';node('userInput').value='한글';
 const old=vm.runInContext('convert()',c);
 node('charset-select').value='utf-8';node('userInput').value='😀';node('charset-select').listeners.change();
 release();await old;assert.equal(node('result').value,'');
 await new Promise(resolve=>setTimeout(resolve,280));assert.equal(node('result').value,'8J+YgA==');
 node('charset-select').value='euc-kr';node('userInput').value='한글';await vm.runInContext('convert()',c);assert.equal(node('result').value,'x9Gx2w==');
 node('userInput').value='😀';await vm.runInContext('convert()',c);assert.equal(node('result').value,'');assert.match(node('feedback').textContent,/cannot be represented/);assert.equal(node('copy-button').disabled,true);
 console.log('PASS: 36 encodings, independent byte fixtures, malformed input, unsupported characters, loading race, 24 selector/copy layouts');
})().catch(e=>{console.error(e);process.exitCode=1});
