import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'vite';
import {readFile} from 'node:fs/promises';
test('SEO local e com domínio: canonical, sitemap, OG, JSON-LD e secrets fora do frontend',async()=>{
 const fields=['SITE_URL','GOOGLE_MAPS_API_KEY','DELIVERY_ORIGIN'];
 const saved=Object.fromEntries(fields.map(key=>[key,process.env[key]]));
 try{
  process.env.GOOGLE_MAPS_API_KEY='server-secret-test-marker';process.env.DELIVERY_ORIGIN='private-origin-test-marker';
  for(const domain of ['', 'https://nandices.example']){
   process.env.SITE_URL=domain;
   const result=await build({logLevel:'silent',build:{write:false}});
   const output=result.output;const html=String(output.find(x=>x.fileName==='index.html').source);
   const sitemap=output.find(x=>x.fileName==='sitemap.xml');
   if(domain){assert.ok(html.includes(`rel="canonical" href="${domain}/"`));assert.ok(html.includes(`content="${domain}/images/products/degustacao/caixa-degustacao-960.webp"`));assert.ok(String(sitemap.source).includes(`${domain}/`))}
   else {assert.ok(!html.includes('rel="canonical"'));assert.equal(sitemap,undefined)}
   const organization=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
   assert.equal(organization.name,'Nandices Confeitaria');assert.equal(organization.telephone,'+5561993359461');assert.equal(organization.url,domain?domain+'/':undefined);assert.equal(organization.address,undefined);
   for(const file of output){const text=String(file.code||file.source);assert.ok(!text.includes('server-secret-test-marker'));assert.ok(!text.includes('private-origin-test-marker'));assert.ok(!text.includes('maps.googleapis.com/maps/api/geocode'))}
  }
  assert.match(await readFile('public/robots.txt','utf8'),/Allow: \//);assert.match(await readFile('public/favicon.svg','utf8'),/<svg/);
 }finally{for(const key of fields){if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key]}}
});
