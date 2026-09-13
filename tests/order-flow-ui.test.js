import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {chromium,expect} from '@playwright/test';
import {sweets} from '../src/data/catalog.js';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('rotas, seleção, revisão e WhatsApp nas encomendas A–H', {timeout:120000},async()=>{
 const vite=await createServer({logLevel:'silent',server:{host:'127.0.0.1',port:0}});let browser;
 try{
  await vite.listen();browser=await chromium.launch({channel:'msedge',headless:true});
  const base=`http://127.0.0.1:${vite.httpServer.address().port}`;
  const page=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(base);
  await expect(page.locator('.sweet-grid article')).toHaveCount(4);
  await expect(page.locator('.cake-grid article')).toHaveCount(4);
  await expect(page.locator('#configurador,#quanto-pedir,#entrega')).toHaveCount(0);
  await expect(page.locator('.cake-pricing')).toContainText('90,00');
  await expect(page.locator('#personalizados')).toContainText('Doces personalizados');
  await expect(page.locator('#personalizados')).not.toContainText(/bolos/i);
  const custom=page.locator('#personalizados').getByRole('link',{name:/Solicitar doces personalizados/});
  assert.match(decodeURIComponent(await custom.getAttribute('href')),/solicitar doces personalizados/);
  await page.getByRole('link',{name:'Ver todos os docinhos',exact:true}).click();
  await expect(page).toHaveURL(/\/docinhos$/);
  await expect(page.locator('.sweet-grid article')).toHaveCount(6);
  for(const p of sweets.slice(0,4))await page.getByRole('button',{name:`Adicionar ${p.name} à encomenda`,exact:true}).click();
  await page.getByRole('link',{name:'Continuar encomenda',exact:true}).click();
  await expect(page).toHaveURL(/\/encomenda$/);
  await expect(page.locator('.order-flavors [aria-pressed=true]')).toHaveCount(4);
  await page.locator('.quantity-options button').filter({hasText:/^100/}).click();
  await expect(page.getByRole('alert')).toContainText('mantenha até 2');
  await expect(page.getByRole('button',{name:'Finalizar pelo WhatsApp',exact:true})).toBeDisabled();
  for(const p of sweets.slice(2,4))await page.locator('.order-flavors').getByRole('button',{name:p.name,exact:true}).click();
  await expect(page.locator('.order-flavors [aria-pressed=true]')).toHaveCount(2);
  await page.locator('.cup-options').getByRole('button',{name:/Branquinho/}).click();
  await expect(page.getByRole('link',{name:'Finalizar pelo WhatsApp'})).toBeVisible();
  await page.reload();
  await expect(page.locator('.order-flavors [aria-pressed=true]')).toHaveCount(2);
  await expect(page.locator('.cup-options [aria-pressed=true]')).toContainText('Branquinho');
  for(const [quantity,count,cup] of [[50,1,'Branquinho'],[100,2,'Pistache'],[150,3,'Chocolate'],[200,2,'Chocolate'],[500,10,'Pistache']]){
   await page.evaluate(()=>sessionStorage.clear());await page.goto(base+'/encomenda');
   await page.locator('.quantity-options button').filter({hasText:new RegExp('^'+quantity+'doces$')}).click();
   for(const p of sweets.slice(0,count))await page.locator('.order-flavors').getByRole('button',{name:p.name,exact:true}).click();
   await expect(page.getByRole('button',{name:'Finalizar pelo WhatsApp',exact:true})).toBeDisabled();
   await page.locator('.cup-options').getByRole('button',{name:new RegExp(cup)}).click();
   const finish=page.getByRole('link',{name:'Finalizar pelo WhatsApp'});
   await expect(finish).toBeVisible();
   const url=new URL(await finish.getAttribute('href')),message=url.searchParams.get('text');
   assert.equal(url.pathname,'/5561993359461');assert.match(message,new RegExp('Quantidade: '+quantity+' doces'));assert.match(message,new RegExp('Forminha: '+cup));assert.doesNotMatch(message,/frete|cep|retirada|undefined/i);
   await expect(page.locator('#entrega,#delivery-cep')).toHaveCount(0);
   if(quantity===200){
    await page.selectOption('#distribution-brigadeiro-tradicional','100');
    await expect(page.getByRole('button',{name:'Finalizar pelo WhatsApp',exact:true})).toBeDisabled();
    await page.selectOption('#distribution-beijinho','100');
    const updated=new URL(await finish.getAttribute('href')).searchParams.get('text');
    assert.match(updated,/100 Brigadeiro Tradicional/);assert.match(updated,/100 Beijinho/);
    await page.locator('.cup-options').getByRole('button',{name:/Branquinho/}).click();
    assert.match(new URL(await finish.getAttribute('href')).searchParams.get('text'),/Forminha: Branquinho/);
    await page.context().route('https://wa.me/**',route=>route.fulfill({body:'WhatsApp destination verified',contentType:'text/plain'}));
    const [popup]=await Promise.all([page.waitForEvent('popup'),finish.click()]);await popup.waitForLoadState();
    assert.match(popup.url(),/^https:\/\/wa.me\/5561993359461/);await popup.close();
   }
  }
  await page.getByRole('button',{name:'Calculadora para seu evento'}).click();
  await page.fill('#guests','40');await page.getByRole('button',{name:'Calcular quantidades',exact:true}).click();
  await expect(page.locator('.planner-result')).toContainText('150');await expect(page.locator('.planner-result')).toContainText('200');
  await page.getByRole('button',{name:'Montar pedido com 150 doces',exact:true}).click();
  await expect(page.locator('.quantity-options [aria-pressed=true]')).toContainText('150');
  await expect(page.locator('#config-title')).toBeFocused();
  assert.deepEqual(errors,[]);
 }finally{await browser?.close();await vite.close()}
});

test('navegação direta, refresh, imagens e layout de 320 a 1440 px',{timeout:120000},async()=>{
 const shots=await mkdtemp(join(tmpdir(),'nandices-routes-'));
 const vite=await createServer({logLevel:'silent',server:{host:'127.0.0.1',port:0}});let browser;
 try{
  await vite.listen();browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];
  const base=`http://127.0.0.1:${vite.httpServer.address().port}`;
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  for(const width of [320,360,390,430,768,1440]){
   await page.setViewportSize({width,height:900});
   for(const path of ['/','/docinhos','/encomenda','/frete']){
    const response=await page.goto(base+path);assert.equal(response.status(),200);await page.reload();
    await page.evaluate(()=>document.fonts.ready);
    await expect(page.locator('h1')).toHaveCount(1);
    assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),`overflow ${width} ${path}`);
    assert.ok(!(await page.locator('body').innerText()).includes('Quanto pedir'));
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://nandicesconfeitaria.com.br'+path);
    if(width<=430){
     await page.getByRole('button',{name:'Menu',exact:true}).click();
     for(const label of ['Início','Docinhos','Encomenda','Frete','WhatsApp'])await expect(page.locator('#navigation').getByRole('link',{name:label,exact:label!=='WhatsApp'})).toBeVisible();
     await page.getByRole('button',{name:'Fechar',exact:true}).click();
    }
    if([390,1440].includes(width)){
     await page.locator('img').evaluateAll(imgs=>imgs.forEach(img=>img.loading='eager'));
     await expect.poll(()=>page.locator('img').evaluateAll(imgs=>imgs.every(img=>img.complete&&img.naturalWidth>0))).toBe(true);
     await page.screenshot({path:join(shots,`restructure-${path==='/'?'home':path.slice(1)}-${width}.png`),fullPage:true});
    }
   }
  }
  await page.goto(base+'/encomenda');
  await page.locator('#navigation').getByRole('link',{name:'Início',exact:true}).click();
  await expect(page).toHaveURL(base+'/');
  await page.getByRole('link',{name:'Ver sabores',exact:true}).click();
  await expect(page).toHaveURL(/\/#bolos$/);await expect(page.locator('#bolos')).toBeInViewport();
  assert.deepEqual(errors,[]);
 }finally{await browser?.close();await vite.close()}
});
