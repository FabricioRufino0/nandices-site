import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {chromium,expect} from '@playwright/test';

test('hero: responsive layout, accessible heading and working flavors link',async()=>{
 const vite=await createServer({logLevel:'silent',server:{host:'127.0.0.1',port:0}});let browser;
 try{
  await vite.listen();browser=await chromium.launch({channel:'msedge',headless:true});
  for(const [width,height] of [[390,844],[768,1024],[1280,720],[1440,900]]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}`);
   await page.evaluate(()=>document.fonts.ready);
   await expect(page.getByRole('heading',{level:1,name:'Nandices Confeitaria'})).toHaveCount(1);
   await expect(page.locator('.brand-hero__image')).toBeVisible();
   assert.ok(await page.locator('.brand-hero__image').evaluate(img=>img.complete&&img.naturalWidth>0));
   if(width<=600){const heading=await page.locator('.brand-hero h1').boundingBox(),image=await page.locator('.brand-hero__image').boundingBox();assert.ok(heading.y+heading.height<=image.y+1)}
   assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
   const cta=page.getByRole('link',{name:'Ver sabores'});
   await cta.click();await expect(page).toHaveURL(/#bolos$/);
   await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}`);await cta.focus();await page.keyboard.press('Enter');
   await expect(page).toHaveURL(/#bolos$/);
   const header=await page.locator('header').boundingBox(),cakes=await page.locator('#bolos').boundingBox();
   assert.ok(Math.abs(header.y)<1);assert.ok(cakes.y>=header.height-1&&cakes.y<height);
   if(width<=800){await page.getByRole('button',{name:'Menu',exact:true}).click();await expect(page.locator('#navigation')).toBeVisible();await page.locator('#navigation').getByRole('link',{name:'Docinhos',exact:true}).click();await expect(page).toHaveURL(/\/docinhos$/);await expect(page.locator('#navigation')).toBeHidden()}
   assert.deepEqual(errors,[]);await page.close();
  }
 }finally{await browser?.close();await vite.close()}
});
