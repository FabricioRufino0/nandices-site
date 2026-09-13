import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'vite';
import {chromium,expect} from '@playwright/test';
test('Home e docinhos compartilham hero, header e CTA em quatro viewports',async()=>{
 const shots=await mkdtemp(join(tmpdir(),'nandices-review-'));console.log('Capturas temporárias:',shots);
 const server=await createServer({logLevel:'silent',server:{host:'127.0.0.1',port:0}});let browser;
 try{
  await server.listen();browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  const base=`http://127.0.0.1:${server.httpServer.address().port}`;
  const sitemap=await fetch(base+'/sitemap.xml');assert.match(sitemap.headers.get('content-type'),/application\/xml/);assert.match(await sitemap.text(),/<loc>https:\/\/nandicesconfeitaria.com.br\/docinhos<\/loc>/);
  const robots=await fetch(base+'/robots.txt');assert.match(robots.headers.get('content-type'),/text\/plain/);assert.match(await robots.text(),/Sitemap: https:\/\/nandicesconfeitaria.com.br\/sitemap.xml/);
  for(const [width,height] of [[390,844],[768,1024],[1280,720],[1440,900]]){
   const metrics=[];
   for(const route of ['/','/docinhos']){
    await page.setViewportSize({width,height});await page.goto(base+route);
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(async()=>{const images=[...document.images];images.forEach(i=>i.loading='eager');await Promise.all(images.map(i=>i.decode()))});
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('#navigation').getByRole('link',{name:'Bolos',exact:true})).toHaveCount(0);
    assert.deepEqual(await page.locator('#navigation a:not(.nav-whatsapp)').evaluateAll(links=>links.map(a=>a.getAttribute('href'))),['/','/docinhos','/encomenda','/frete']);
    assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
    const photo=await page.locator('.brand-hero__image').boundingBox();
    const cta=await page.locator('.brand-hero__actions').boundingBox();
    assert.ok(cta.y>=photo.y+photo.height-1);
    metrics.push({photo,cta,header:await page.locator('header').boundingBox()});
    if(route==='/docinhos')await expect(page.locator('.brand-hero__image')).toHaveAttribute('src','/images/docinhos/docinhos-hero.webp');
    await page.screenshot({path:join(shots,`${route==='/'?'home':'docinhos'}-${width}.png`)});
    await page.screenshot({path:join(shots,`${route==='/'?'home':'docinhos'}-full-${width}.png`),fullPage:true});
    await page.locator('.brand-hero__actions a').click();
    await expect(page.locator(route==='/'?'#bolos':'#catalogo')).toBeInViewport();
   }
   assert.deepEqual(metrics[0],metrics[1]);
  }
  for(const route of ['/','/encomenda','/frete']){
   await page.goto(base+route);await expect(page.locator('img[src="/images/docinhos/docinhos-hero.webp"]')).toHaveCount(0);
  }
  await page.goto(base+'/encomenda');
  await expect(page.locator('.optional-freight').getByRole('link',{name:/Calcular frete/})).toHaveAttribute('href','/frete');
  await page.goto(base);await expect(page.locator('.home-sweets article')).toHaveCount(4);
  assert.deepEqual(errors,[]);
 }finally{await browser?.close();await server.close()}
});
