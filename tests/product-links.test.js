import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {chromium,expect} from '@playwright/test';

test('catálogo mostra todos os produtos, navega por categoria e mantém CTAs contextuais',async()=>{
 const server=await createServer({logLevel:'silent',server:{host:'127.0.0.1',port:0}});let browser;
 try{
  await server.listen();browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const base=`http://127.0.0.1:${server.httpServer.address().port}`;
  await page.goto(`${base}/docinhos`);
  await expect(page.locator('.sweet-grid article')).toHaveCount(12);
  for(const [label,count,id] of [['Tradicionais',6,'tradicional'],['Gourmet',5,'gourmet'],['Pistache',1,'pistache']]){
   await expect(page.locator('.catalog-rail').getByRole('button',{name:new RegExp(`^${label} · ${count}$`)})).toBeVisible();
   await expect(page.locator(`#categoria-${id}`)).toHaveCount(1);
  }
  await page.locator('.catalog-rail').getByRole('button',{name:'Gourmet · 5'}).click();
  await expect(page).toHaveURL(/\/docinhos$/);
  await expect(page.locator('#categoria-gourmet h2')).toBeInViewport();
  await expect(page.locator('.sweet-grid article').first().getByRole('link',{name:'Consultar pelo WhatsApp'})).toHaveAttribute('href',/wa\.me/);
  await page.goto(base);
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});
   const contact=page.locator('.contact');await contact.scrollIntoViewIfNeeded();
   assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
   await expect(contact.getByRole('link',{name:'@nandices.confeitaria'})).toBeVisible();
  }
 }finally{await browser?.close();await server.close()}
});
