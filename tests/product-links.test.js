import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {chromium,expect} from '@playwright/test';
test('todos os 12 sabores abrem WhatsApp diretamente; contato responsivo',async()=>{
 const server=await createServer({logLevel:'silent',server:{host:'127.0.0.1',port:0}});let browser;
 try{
  await server.listen();browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  await page.context().route('https://wa.me/**',r=>r.fulfill({body:'WhatsApp link verified',contentType:'text/plain'}));
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}`);
  await expect(page.locator('#bolos .badge')).toHaveCount(0);
  assert.ok(!(await page.locator('body').innerText()).includes('Do clássico que abraça ao sabor que surpreende.'));
  const names=[];
  for(const category of ['Tradicionais','Gourmet','Pistache']){
   await page.getByRole('button',{name:category,exact:true}).click();
   for(const card of await page.locator('.sweet-grid article').all()){
    const name=await card.locator('h3').innerText();names.push(name);
    const link=card.getByRole('link',{name:'Consultar sabor'});await link.scrollIntoViewIfNeeded();
    const before=await page.evaluate(()=>scrollY);
    const [popup]=await Promise.all([page.waitForEvent('popup'),link.click()]);await popup.waitForLoadState();
    const url=new URL(popup.url());assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/5561993359461');
    assert.equal(url.searchParams.get('text'),`Olá! Vim pelo site da Nandices e tenho interesse no brigadeiro ${name}. Gostaria de mais informações.`);
    assert.equal(await page.evaluate(()=>scrollY),before);await popup.close();
   }
  }
  assert.equal(new Set(names).size,12);
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);
   const contact=page.locator('#contato');await contact.scrollIntoViewIfNeeded();
   assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
   const button=await contact.locator('.button').boundingBox();assert.ok(Math.abs(button.x+button.width/2-width/2)<2);
   await expect(contact.getByRole('link',{name:'@nandices.confeitaria'})).toBeVisible();
   await contact.screenshot({path:`${process.env.TEMP}/nandices-contact-${width}.png`});
  }
 }finally{await browser?.close();await server.close()}
});
