const esbuild = require('esbuild');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
esbuild.buildSync({entryPoints:[path.join(__dirname,'codec-entry.cjs')],outfile:path.join(root,'vendor/legacy-encoder.js'),bundle:true,platform:'browser',format:'iife',minify:true,legalComments:'eof',target:['es2020']});
fs.writeFileSync(path.join(root,'vendor/LICENSES.txt'),['iconv-lite','buffer','safer-buffer','base64-js','ieee754','string_decoder'].map(name=>{
 const dir=path.join(root,'node_modules',name);
 const file=['LICENSE','LICENSE.md','LICENSE.txt'].find(f=>fs.existsSync(path.join(dir,f)));
 return `=== ${name} ===\n`+fs.readFileSync(path.join(dir,file),'utf8');
}).join('\n\n'));
console.log('Built lazy-loaded browser encoder.');
