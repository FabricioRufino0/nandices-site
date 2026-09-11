import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build,createServer} from 'vite';
import {PRIVATE_BINDINGS} from '../worker/delivery.js';
import {readFile} from 'node:fs/promises';
test('SEO local e com domínio: canonical, sitemap, OG, JSON-LD e secrets fora do frontend',async()=>{
 const privateFields=[...PRIVATE_BINDINGS,...PRIVATE_BINDINGS.map(key=>`VITE_${key}`),'VITE_OTHER_PROVIDER_TOKEN'];
 const fields=['SITE_URL',...privateFields];
 const saved=Object.fromEntries(fields.map(key=>[key,process.env[key]]));
 try{
  for(const [index,key] of privateFields.entries())process.env[key]=`private-binding-marker-${index}`;
  const probe={name:'privacy-probe',resolveId(id){if(id==='/privacy-probe.js')return '\0privacy-probe'},load(id){if(id==='\0privacy-probe')return 'globalThis.__privacyProbe = import.meta.env;'},transformIndexHtml(html){return html.replace('</head>','<script type="module" src="/privacy-probe.js"></script></head>')}};
  const server=await createServer({logLevel:'silent',plugins:[probe]});
  try{const result=await server.transformRequest('/privacy-probe.js');for(const key of privateFields){assert.ok(!JSON.stringify(server.config.env).includes(process.env[key]));assert.ok(!result.code.includes(process.env[key]));}}finally{await server.close()}
  for(const domain of ['', 'https://nandices.example']){
   process.env.SITE_URL=domain;
   const result=await build({logLevel:'silent',plugins:[probe],build:{write:false}});
   const output=result.output;const html=String(output.find(x=>x.fileName==='index.html').source);
   const sitemap=output.find(x=>x.fileName==='sitemap.xml');
   if(domain){assert.ok(html.includes(`rel="canonical" href="${domain}/"`));assert.ok(html.includes(`content="${domain}/images/products/degustacao/caixa-degustacao-960.webp"`));assert.ok(String(sitemap.source).includes(`${domain}/`))}
   else {assert.ok(!html.includes('rel="canonical"'));assert.equal(sitemap,undefined)}
   const organization=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
   assert.equal(organization.name,'Nandices Confeitaria');assert.equal(organization.telephone,'+5561993359461');assert.equal(organization.url,domain?domain+'/':undefined);assert.equal(organization.address,undefined);
   for(const file of output){const text=String(file.code||file.source);for(const key of privateFields)assert.ok(!text.includes(process.env[key]));assert.ok(!text.includes('api.heigit.org'))}
  }
  assert.match(await readFile('public/robots.txt','utf8'),/Allow: \//);assert.match(await readFile('public/favicon.svg','utf8'),/<svg/);
 }finally{for(const key of fields){if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key]}}
});
