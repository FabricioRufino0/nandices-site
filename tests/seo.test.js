import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build,createServer,preview} from 'vite';
import {PRIVATE_BINDINGS} from '../worker/delivery.js';
import {readFile,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('SEO local e com domínio: canonical, sitemap, OG, JSON-LD e secrets fora do frontend',async()=>{
 const privateFields=[...PRIVATE_BINDINGS,...PRIVATE_BINDINGS.map(key=>`VITE_${key}`),'VITE_OTHER_PROVIDER_TOKEN'];
 const fields=['SITE_URL',...privateFields];
 const saved=Object.fromEntries(fields.map(key=>[key,process.env[key]]));
 try{
  for(const [index,key] of privateFields.entries())process.env[key]=`private-binding-marker-${index}`;
  const probe={name:'privacy-probe',resolveId(id){if(id==='/privacy-probe.js')return '\0privacy-probe'},load(id){if(id==='\0privacy-probe')return 'globalThis.__privacyProbe = import.meta.env;'},transformIndexHtml(html){return html.replace('</head>','<script type="module" src="/privacy-probe.js"></script></head>')}};
  const server=await createServer({logLevel:'silent',plugins:[probe]});
  try{const result=await server.transformRequest('/privacy-probe.js');for(const key of privateFields){assert.ok(!JSON.stringify(server.config.env).includes(process.env[key]));assert.ok(!result.code.includes(process.env[key]));}}finally{await server.close()}
  for(const domain of ['', 'https://nandicesconfeitaria.com.br', 'https://example.test']){
   process.env.SITE_URL=domain;
   const result=await build({logLevel:'silent',plugins:[probe],build:{write:false}});
   const output=result.output;const html=String(output.find(x=>x.fileName==='index.html').source);
   const sitemap=output.find(x=>x.fileName==='sitemap.xml');
   const robots=String(output.find(x=>x.fileName==='robots.txt').source);
   assert.equal(robots,`User-agent: *\nAllow: /\n\nSitemap: ${domain||'https://nandicesconfeitaria.com.br'}/sitemap.xml\n`);
   const expected=domain || 'https://nandicesconfeitaria.com.br';assert.ok(html.includes(`rel="canonical" href="${expected}/"`));assert.ok(html.includes(`content="${expected}/images/products/degustacao/caixa-degustacao-960.webp"`));
   const sitemapText=String(sitemap.source);assert.equal((sitemapText.match(/<loc>/g)||[]).length,4);assert.ok(sitemapText.includes(`<loc>${expected}/</loc>`));assert.match(sitemapText,/^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">[\s\S]*<\/urlset>\n$/);assert.doesNotMatch(sitemapText,/<html|localhost|#/i);
   for(const path of ['docinhos','encomenda','frete']){
    const page=String(output.find(x=>x.fileName===path+'/index.html').source);
    assert.ok(page.includes(`rel="canonical" href="${expected}/${path}"`));
    assert.ok(page.includes(`property="og:url" content="${expected}/${path}"`));
    assert.ok(sitemapText.includes(`<loc>${expected}/${path}</loc>`));
   }
   const organization=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
   assert.equal(organization.name,'Nandices Confeitaria');assert.equal(organization.telephone,'+5561993359461');assert.equal(organization.url,(domain || 'https://nandicesconfeitaria.com.br')+'/');assert.equal(organization.address,undefined);
   for(const file of output){const text=String(file.code||file.source);for(const key of privateFields)assert.ok(!text.includes(process.env[key]));assert.ok(!text.includes('api.heigit.org'))}
  }
  assert.equal((await readFile('public/robots.txt','utf8')).replace(/\r\n/g,'\n'),'User-agent: *\nAllow: /\n\nSitemap: https://nandicesconfeitaria.com.br/sitemap.xml\n');assert.match(await readFile('public/favicon.svg','utf8'),/<svg/);
 }finally{for(const key of fields){if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key]}}
});
test('build servido: rotas com canonical próprio e arquivos públicos reais',async()=>{
 const outDir=await mkdtemp(join(tmpdir(),'nandices-build-'));
 await build({logLevel:'silent',build:{outDir}});
 const server=await preview({logLevel:'silent',build:{outDir},preview:{host:'127.0.0.1',port:0}});
 try{
  const base=`http://127.0.0.1:${server.httpServer.address().port}`;
  for(const path of ['/','/docinhos','/encomenda','/frete']){
   const response=await fetch(base+path);assert.equal(response.status,200);
   const html=await response.text();
   assert.ok(html.includes(`rel="canonical" href="https://nandicesconfeitaria.com.br${path}"`));
   assert.doesNotMatch(html,/noindex/);
  }
  const sitemap=await fetch(base+'/sitemap.xml');assert.equal(sitemap.status,200);assert.match(sitemap.headers.get('content-type'),/xml/);assert.equal(((await sitemap.text()).match(/<loc>/g)||[]).length,4);
  const robots=await fetch(base+'/robots.txt');assert.equal(robots.status,200);assert.match(await robots.text(),/Sitemap: https:\/\/nandicesconfeitaria.com.br\/sitemap.xml/);
 }finally{await new Promise(resolve=>server.httpServer.close(resolve))}
});
