import {createServer} from 'vite';
import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const server=await createServer({logLevel:'silent',server:{host:'127.0.0.1',port:0}});
let browser;
try{
 await server.listen();browser=await chromium.launch({channel:'msedge',headless:true});
 for(const width of [390,768,1280,1600]){
  const page=await browser.newPage({viewport:{width,height:1000}});
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}`);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>document.fonts.ready);
  assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  for(const img of await page.locator('main img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode())}
  await page.evaluate(()=>{window.scrollTo(0,0);document.activeElement?.blur()});
  await page.screenshot({path:`docs/consolidated-${width}.png`,fullPage:true});
  for(const category of ['Tradicionais','Gourmet','Pistache']){
   await page.getByRole('button',{name:category,exact:true}).click();
   const grid=page.locator('.sweet-grid');await grid.scrollIntoViewIfNeeded();
   for(const img of await grid.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode())}
   await grid.screenshot({path:`docs/products-${width}-${category}.png`});
   const sizes=await grid.locator('img').evaluateAll(imgs=>imgs.map(i=>({loaded:i.complete&&i.naturalWidth>0,fit:getComputedStyle(i).objectFit,ratio:i.naturalWidth/i.naturalHeight})));
   assert.ok(sizes.every(i=>i.loaded&&i.fit==='contain'&&i.ratio===1));
  }
  if(width===1280){
   await page.emulateMedia({reducedMotion:'no-preference'});
   const card=page.locator('.sweet-grid article').first();await card.hover();await page.waitForTimeout(300);
   assert.notEqual(await card.evaluate(e=>getComputedStyle(e).transform),'none');
  }
  console.log(JSON.stringify({width,overflow:false,images:'loaded, square, contain'}));await page.close();
 }
}finally{await browser?.close();await server.close()}
