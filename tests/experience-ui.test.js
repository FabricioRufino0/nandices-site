import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {chromium,expect} from '@playwright/test';

test('experiência orienta a escolha e mantém o catálogo confortável em mobile',async()=>{
 const server=await createServer({logLevel:'silent',server:{host:'127.0.0.1',port:0}});let browser;
 try{
  await server.listen();
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const base=`http://127.0.0.1:${server.httpServer.address().port}`;

  await page.goto(base);
  await expect(page.getByText('Confeitaria artesanal em Sobradinho, DF',{exact:true})).toBeVisible();
  await expect(page.locator('.order-guide li')).toHaveCount(3);
  assert.ok(await page.locator('.cakes').evaluate((cakes)=>cakes.compareDocumentPosition(document.querySelector('.about'))&Node.DOCUMENT_POSITION_FOLLOWING));
  assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));

  await page.goto(base+'/docinhos');
  const rail=page.locator('.catalog-rail');
  await expect(rail.getByRole('button',{name:'Tradicionais · 6'})).toBeVisible();
  await expect(rail.getByRole('button',{name:'Gourmet · 5'})).toBeVisible();
  await expect(rail.getByRole('button',{name:'Pistache · 1'})).toBeVisible();
  assert.equal(await rail.evaluate(element=>getComputedStyle(element).flexDirection),'row');
  assert.ok((await rail.boundingBox()).width>340);
  await expect(page.locator('.personalized-catalog .personal-photo img')).toBeVisible();
  await expect(page.locator('#caixa-degustacao')).toContainText('R$ 65,00');
  await expect(page.locator('#caixa-degustacao')).toContainText('7 dias');
  await page.setViewportSize({width:1440,height:900});
  const contactBox=await page.locator('.catalog-contact').boundingBox();
  const plannerBox=await page.locator('#quanto-pedir').boundingBox();
  assert.ok(Math.abs(contactBox.width-plannerBox.width)<2,'catalog contact and estimator should share the same width');
  await page.setViewportSize({width:390,height:844});
  assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));

  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Menu',exact:true}).click();
  await page.locator('#navigation').getByRole('link',{name:'Personalizados',exact:true}).click();
  await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$/);
  await expect(page.locator('.personal')).toBeInViewport();
  await page.goto(base+'/docinhos');
  await page.getByRole('button',{name:'Menu',exact:true}).click();
  await page.locator('#navigation').getByRole('link',{name:'Caixa Degustação',exact:true}).click();
  await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$/);
  await expect(page.locator('#caixa-degustacao')).toBeInViewport();
 }finally{await browser?.close();await server.close()}
});
