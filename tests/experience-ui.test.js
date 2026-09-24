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
  await expect(page.locator('.tasting,.personal')).toHaveCount(0);
  assert.ok(await page.locator('.cakes').evaluate((cakes)=>cakes.compareDocumentPosition(document.querySelector('.about'))&Node.DOCUMENT_POSITION_FOLLOWING));
  const cakeCard=await page.locator('.cake-grid article').first().boundingBox();
  const cakePhoto=await page.locator('.cake-photo').first().boundingBox();
  assert.ok(Math.abs((cakePhoto.x-cakeCard.x)-(cakeCard.x+cakeCard.width-cakePhoto.x-cakePhoto.width))<2,'cake photo should have balanced side insets');
  assert.ok(Math.abs(cakePhoto.width/cakePhoto.height-0.8)<0.02,'mobile cake photo should preserve its portrait framing');
  assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));

  await page.goto(base+'/docinhos');
  const rail=page.locator('.catalog-rail');
  await expect(rail.getByRole('button',{name:'Tradicionais · 6'})).toBeVisible();
  await expect(rail.getByRole('button',{name:'Gourmet · 5'})).toBeVisible();
  await expect(rail.getByRole('button',{name:'Pistache · 1'})).toBeVisible();
  assert.equal(await rail.evaluate(element=>getComputedStyle(element).flexDirection),'row');
  assert.ok((await rail.boundingBox()).width>340);
  await expect(page.locator('.tasting,.personal')).toHaveCount(0);
  await page.setViewportSize({width:1440,height:900});
  const contactBox=await page.locator('.catalog-contact').boundingBox();
  await expect(page.locator('#quanto-pedir')).toHaveCount(0);
  await expect(page.getByRole('link',{name:/Calcular quantidade de docinhos/})).toHaveAttribute('href','/estimativa#quanto-pedir');
  assert.ok(contactBox.width>0);
  await page.goto(base+'/estimativa');
  await expect(page.getByRole('heading',{level:1,name:'Quanto pedir?'})).toBeVisible();
  await expect(page.locator('#navigation').getByRole('link',{name:'Quanto pedir?'})).toBeVisible();
  assert.deepEqual(await page.locator('#navigation > a:not(.nav-whatsapp)').allTextContents(),['Bolos','Docinhos','Caixa Degustação','Docinhos personalizados','Quanto pedir?','Entrega e frete']);
  const calculator=page.locator('#quanto-pedir');
  await expect(calculator).toBeVisible();
  await expect(page.locator('#calculadora-bolo')).toHaveCount(1);
  await expect(calculator.locator('input')).toHaveCount(1);
  await expect(calculator.locator('button[type="submit"]')).toHaveCount(1);
  await calculator.locator('input').fill('40');
  await calculator.locator('button[type="submit"]').click();
  await expect(calculator.locator('.planner-result')).toContainText('150 a 200 docinhos');
  await expect(calculator.locator('.planner-result')).toContainText('4 kg');
  await calculator.locator('input').fill('25');
  await calculator.locator('button[type="submit"]').click();
  await expect(calculator.locator('.planner-result')).toContainText('100 a 150 docinhos');
  await expect(calculator.locator('.planner-result')).toContainText('2,5 kg');
  await expect(calculator.locator('.planner-result')).toContainText('R$ 225,00');
  await calculator.getByLabel('Tipo de evento para os docinhos').selectOption('casamento');
  await expect(calculator.locator('.planner-result')).toHaveCount(0);
  await calculator.locator('button[type="submit"]').click();
  await expect(calculator.locator('.planner-result')).toContainText('150 a 200 docinhos');
  await expect(calculator.locator('.planner-result')).toContainText('2,5 kg');
  await expect(calculator.getByRole('link',{name:'Consultar docinhos'})).toHaveAttribute('href',/wa\.me/);
  await expect(calculator.getByRole('link',{name:'Consultar bolo'})).toHaveAttribute('href',/wa\.me/);
  await calculator.locator('input').fill('0');
  await calculator.locator('button[type="submit"]').click();
  await expect(calculator.getByRole('alert')).toContainText('quantidade inteira de convidados maior que zero');
  assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('#quanto-pedir input')).toBeVisible();
  assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  await page.goto(base);
  await expect(page.locator('#calculadora-bolo')).toHaveCount(0);
  await page.setViewportSize({width:390,height:844});
  assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));

  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Menu',exact:true}).click();
  await page.locator('#navigation').getByRole('link',{name:'Docinhos personalizados',exact:true}).click();
  await expect(page).toHaveURL(/\/personalizados$/);
  await expect(page.getByRole('heading',{level:1,name:'Docinhos personalizados'})).toBeVisible();
  await expect(page.locator('.special-feature__photo img')).toBeVisible();
  await expect(page.locator('.special-facts')).toContainText('50 unidades');
  await expect(page.locator('.special-facts')).toContainText('45 dias');
  await page.goto(base+'/docinhos');
  await page.getByRole('button',{name:'Menu',exact:true}).click();
  await page.locator('#navigation').getByRole('link',{name:'Caixa Degustação',exact:true}).click();
  await expect(page).toHaveURL(/\/caixa-degustacao$/);
  await expect(page.getByRole('heading',{level:1,name:'Caixa Degustação'})).toBeVisible();
  await expect(page.locator('.special-facts')).toContainText('R$ 65,00');
  await expect(page.locator('.special-facts')).toContainText('7 dias');
  assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  await page.goto(base+'/?section=degustacao');
  await expect(page).toHaveURL(/\/caixa-degustacao$/);
  await page.goto(base+'/?section=personalizados');
  await expect(page).toHaveURL(/\/personalizados$/);
  for(const [route,title,action,href] of [
   ['/', 'Quer confirmar sabores, quantidades ou entrega?', 'Falar com a Nanda', /wa\.me/],
   ['/docinhos', 'Gostou de algum docinho?', 'Falar com a Nanda', /wa\.me/],
   ['/estimativa', 'Escolha o que vai à mesa', 'Ver bolos e docinhos', '/'],
   ['/caixa-degustacao', 'Qual docinho chamou sua atenção?', 'Ver os 12 docinhos', '/docinhos'],
   ['/personalizados', 'Quer ver os sabores da Nandices?', 'Ver os docinhos', '/docinhos'],
   ['/frete', 'Agora escolha seus favoritos', 'Ver bolos e docinhos', '/']
  ]){
   await page.goto(base+route);
   const footer=page.locator('.site-footer');
   await expect(page.locator('.contact')).toHaveCount(1);
   await expect(footer.getByRole('heading',{level:2,name:title})).toBeVisible();
   await expect(footer.getByRole('link',{name:action})).toHaveAttribute('href',href);
   await expect(footer.getByRole('link',{name:'@nandices.confeitaria'})).toBeVisible();
   const gap=await page.evaluate(()=>document.querySelector('footer').getBoundingClientRect().top-document.querySelector('main').lastElementChild.getBoundingClientRect().bottom);
   assert.ok(Math.abs(gap-48)<2,`footer spacing on ${route}`);
   if(route==='/caixa-degustacao'){
    const frame=await page.locator('.special-feature').evaluate(element=>({left:element.getBoundingClientRect().left,radius:getComputedStyle(element).borderRadius}));
    assert.equal(frame.left,0);
    assert.equal(frame.radius,'0px');
   }
   assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
  }
 }finally{await browser?.close();await server.close()}
});
