import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {chromium,expect} from '@playwright/test';

for(const width of [390,1440])test(`fluxo de encomenda e blocos expansíveis em ${width}px`,async()=>{
 const vite=await createServer({logLevel:'silent',server:{host:'127.0.0.1',port:0}});let browser;
 try{
  await vite.listen();browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}`);
  await expect(page.locator('.gallery')).toHaveCount(0);await expect(page.getByText('Dá vontade de provar.')).toHaveCount(0);
  await expect(page.locator('.header-instagram')).toHaveAttribute('href','https://www.instagram.com/nandices.confeitaria/');
  await expect(page.locator('.custom-highlight,.catalog-help,.faq,.instagram-feature,#como-encomendar')).toHaveCount(0);
  await expect(page.locator('.cake-grid article')).toHaveCount(4);
  await expect(page.locator('.wordmark svg')).toHaveCount(3);
  await expect(page.locator('#personalizados h2')).toHaveText('Docinhos personalizados.');
  await expect(page.locator('#personalizados img')).toHaveCount(1);
  assert.doesNotMatch(await page.locator('body').innerText(),/bolos personalizados|bolos e doces personalizados/i);
  const customUrl=new URL(await page.locator('#personalizados .button').getAttribute('href'));
  assert.match(customUrl.searchParams.get('text'),/docinhos personalizados/);
  await expect(page.locator('#entrega').getByRole('button',{name:'Retirada',exact:true})).toBeVisible();
  await expect(page.locator('#entrega').getByRole('button',{name:'Entrega',exact:true})).toBeVisible();
  const planner=page.locator('#quanto-pedir'),config=page.locator('#configurador');
  const plannerToggle=planner.locator('.expandable-toggle'),configToggle=config.locator('.expandable-toggle');
  for(const section of [planner,config]){await expect(section.locator('.expandable-toggle')).toHaveAttribute('aria-expanded','false');await expect(section.locator('.expandable-panel')).toBeHidden()}
  await plannerToggle.click();await page.fill('#guests','40');await planner.getByRole('button',{name:'Calcular quantidades',exact:true}).click();
  await plannerToggle.click();await expect(planner.locator('.expandable-panel')).toBeHidden();
  await plannerToggle.focus();await page.keyboard.press('Enter');await expect(page.locator('#guests')).toHaveValue('40');
  await planner.getByRole('button',{name:'Montar pedido com 150 doces',exact:true}).click();
  await expect(configToggle).toHaveAttribute('aria-expanded','true');await expect(page.locator('#quantity')).toHaveValue('150');
  for(let i=0;i<3;i++)await page.selectOption(`#flavor-${i}`,'churros');
  await configToggle.click();await expect(config.locator('.expandable-panel')).toBeHidden();
  await configToggle.focus();await page.keyboard.press('Space');await expect(page.locator('#flavor-0')).toHaveValue('churros');
  await config.getByRole('button',{name:'Consultar minha encomenda'}).click();
  await expect(page.locator('#delivery-title')).toBeFocused();
  await expect.poll(async()=>{const box=await page.locator('#entrega').boundingBox();return Math.round(box.y)}).toBeLessThan(150);
  const header=await page.locator('header').boundingBox(),delivery=await page.locator('#entrega').boundingBox();assert.ok(delivery.y>=header.height);
  assert.equal(browser.contexts()[0].pages().length,1);
  const message=new URL(await page.getByRole('link',{name:'Combinar retirada'}).getAttribute('href')).searchParams.get('text');
  assert.match(message,/150 Churros/);assert.match(message,/forminha Branquinho/);assert.match(message,/330,00/);
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await planner.locator('.expandable-panel').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  assert.deepEqual(await page.locator('#sobre,#como-encomendar,#bolos,#doces,#quanto-pedir,#configurador,#degustacao,#personalizados,#entrega').evaluateAll(elements=>elements.map(e=>e.id)),['sobre','bolos','doces','quanto-pedir','configurador','degustacao','personalizados','entrega']);
  const photos=await page.locator('.sweet-grid img').evaluateAll(imgs=>imgs.map(img=>({fit:getComputedStyle(img).objectFit,position:getComputedStyle(img).objectPosition,ratio:img.width/img.height})));
  assert.equal(photos.length,6);assert.ok(photos.every(p=>p.fit==='contain'&&p.position==='50% 50%'&&Math.abs(p.ratio-1)<.01));
  for(const [category,count] of [['Gourmet',5],['Pistache',1],['Tradicionais',6]]){await page.getByRole('button',{name:category,exact:true}).click();await expect(page.locator('.sweet-grid article')).toHaveCount(count)}
  await expect(page.locator('.cake-pricing')).toContainText('90,00');
  const cakeLink=page.locator('#bolos .text-link').first();
  const [popup]=await Promise.all([page.waitForEvent('popup'),cakeLink.click()]);await popup.close();
  await page.reload();await configToggle.click();await expect(page.locator('#quantity')).toHaveValue('150');await expect(page.locator('#flavor-0')).toHaveValue('churros');
  await plannerToggle.click();await expect(page.locator('#guests')).toHaveValue('40');
  await planner.scrollIntoViewIfNeeded();await page.screenshot({path:`docs/order-flow-${width}.png`});
  assert.deepEqual(errors,[]);
 }finally{await browser?.close();await vite.close()}
});
