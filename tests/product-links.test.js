import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {chromium,expect} from '@playwright/test';
test('catálogo: filtros, seleção, remoção e contato da Home',async()=>{
 const server=await createServer({logLevel:'silent',server:{host:'127.0.0.1',port:0}});let browser;
 try{
  await server.listen();browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const base=`http://127.0.0.1:${server.httpServer.address().port}`;
  await page.goto(base+'/docinhos');
  await expect(page.locator('.filters').getByRole('button',{name:'Todos',exact:true})).toHaveCount(0);
  for(const [category,count] of [['Tradicionais',6],['Gourmet',5],['Pistache',1]]){
   await page.locator('.filters').getByRole('button',{name:category,exact:true}).click();
   await expect(page.locator('.sweet-grid article')).toHaveCount(count);
   for(const card of await page.locator('.sweet-grid article').all())await card.locator('button').click();
  }
  await expect(page.locator('.select-sweet[aria-pressed=true]')).toHaveCount(1);
  await expect(page.locator('.selected-flavors li')).toHaveCount(12);
  await page.locator('.selected-flavors li').first().getByRole('button',{name:/Remover/}).click();
  await expect(page.locator('.selected-flavors li')).toHaveCount(11);
  await page.reload();await expect(page.locator('.selected-flavors li')).toHaveCount(11);
  await page.goto(base);
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});
   const contact=page.locator('#contato');await contact.scrollIntoViewIfNeeded();
   assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
   const button=await contact.locator('.button').boundingBox();assert.ok(Math.abs(button.x+button.width/2-width/2)<2);
   await expect(contact.getByRole('link',{name:'@nandices.confeitaria'})).toBeVisible();
  }
 }finally{await browser?.close();await server.close()}
});
