import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer,build,preview} from 'vite';
import {mkdtemp,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {chromium,expect} from '@playwright/test';

test('GA4 opcional: pageviews únicos, History API e eventos sem dados pessoais',async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const id of ['', 'invalid', 'G-TEST12345']){
  const server=await createServer({logLevel:'silent',define:{'import.meta.env.VITE_GA_MEASUREMENT_ID':JSON.stringify(id)},server:{host:'127.0.0.1',port:0}});
  const page=await browser.newPage();const requests=[];
  await page.route('https://www.googletagmanager.com/**',route=>{requests.push(route.request().url());return route.fulfill({contentType:'application/javascript',body:''})});
  try{
   await server.listen();await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/?email=private@example.com#bolos`);
   await expect(page.locator('h1')).toHaveCount(1);
   await page.evaluate(async()=>{const {track}=await import('/src/lib/orders.js');track('whatsapp_personalizado',{cta_location:'personalizados',email:'private@example.com',cep:'12345678',message:'private'})});
   const commands=()=>page.evaluate(()=>Array.from(window.dataLayer||[]).filter(x=>typeof x[0]==='string').map(x=>Array.from(x)));
   if(id!=='G-TEST12345'){assert.equal(requests.length,0);assert.deepEqual(await commands(),[]);continue}
   await expect.poll(()=>requests.length).toBe(1);
   let events=await commands();assert.equal(events.filter(x=>x[1]==='page_view').length,1);
   assert.equal(events.find(x=>x[0]==='config')[2].send_page_view,false);
   assert.deepEqual(events.find(x=>x[1]==='whatsapp_personalizado')[2],{cta_location:'personalizados'});
   assert.ok(!JSON.stringify(events).includes('private'));assert.ok(!JSON.stringify(events).includes('12345678'));
   await page.evaluate(()=>{history.pushState({},'', '/docinhos?cep=12345678');history.replaceState({},'', '/docinhos#catalogo')});
   events=await commands();assert.equal(events.filter(x=>x[1]==='page_view').length,2);
   assert.ok(events.filter(x=>x[1]==='page_view')[1][2].page_location.endsWith('/docinhos'));
   await page.evaluate(()=>history.back());
   await expect.poll(async()=>(await commands()).filter(x=>x[1]==='page_view').length).toBe(3);
   await page.evaluate(async()=>{const {initAnalytics}=await import('/src/lib/analytics.js');initAnalytics('G-TEST12345')});
   assert.equal(requests.length,1);
   const verified=await page.evaluate(async()=>{
    const {track}=await import('/src/lib/orders.js');
    const {analyticsEvents}=await import('/src/lib/analytics.js');
    const before=window.dataLayer.length;
    for(const event of analyticsEvents)track(event,{cta_location:'test',cep:'12345678',message:'private'});
    return {names:[...analyticsEvents],items:window.dataLayer.slice(before).map(item=>item[0]?Array.from(item):item)};
   });
   for(const name of verified.names){
    assert.equal(verified.items.filter(item=>item.event===name).length,1,'preserva dataLayer '+name);
    const forwarded=verified.items.filter(item=>item[0]==='event'&&item[1]===name);
    assert.equal(forwarded.length,1,'encaminha uma vez '+name);
    assert.deepEqual(forwarded[0][2],{cta_location:'test'});
   }
  }finally{await page.close();await server.close()}
 }}finally{await browser.close()}
});

test('build GA4 com ID Cloudflare via env e sem ID; sem tráfego real de Analytics',async()=>{
 const saved=process.env.VITE_GA_MEASUREMENT_ID;
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const id of ['', 'G-TXLTKG7MEH']){
  process.env.VITE_GA_MEASUREMENT_ID=id;
  const outDir=await mkdtemp(join(tmpdir(),'nandices-ga4-build-'));
  const result=await build({logLevel:'silent',build:{outDir}});
  const js=result.output.filter(f=>f.type==='chunk').map(f=>f.code).join('\n');
  assert.equal(js.includes('G-TXLTKG7MEH'),Boolean(id));
  assert.match(await readFile(join(outDir,'robots.txt'),'utf8'),/Sitemap: https:\/\/nandicesconfeitaria.com.br\/sitemap.xml/);
  assert.equal(((await readFile(join(outDir,'sitemap.xml'),'utf8')).match(/<loc>/g)||[]).length,4);
  const server=await preview({logLevel:'silent',build:{outDir},preview:{host:'127.0.0.1',port:0}});
  const page=await browser.newPage();const requests=[];
  await page.route('https://www.googletagmanager.com/**',route=>{requests.push(route.request().url());return route.fulfill({contentType:'application/javascript',body:''})});
  try{
   await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/encomenda`);
   await expect(page.locator('h1')).toHaveCount(1);
   if(id){
    await expect.poll(()=>requests.length).toBe(1);
    assert.equal(requests[0],'https://www.googletagmanager.com/gtag/js?id='+id);
    const commands=await page.evaluate(()=>window.dataLayer.filter(x=>x[0]).map(x=>Array.from(x)));
    assert.equal(commands.filter(x=>x[0]==='config'&&x[1]===id).length,1);
    assert.equal(commands.filter(x=>x[1]==='page_view').length,1);
   }else{
    assert.equal(requests.length,0);
    await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(0);
   }
  }finally{await page.close();await new Promise(resolve=>server.httpServer.close(resolve))}
 }}finally{await browser.close();if(saved===undefined)delete process.env.VITE_GA_MEASUREMENT_ID;else process.env.VITE_GA_MEASUREMENT_ID=saved}
});
