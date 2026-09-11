import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];const consoleErrors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',msg=>{if(msg.type()==='error'&&!msg.text().includes('503')&&!msg.text().includes('502'))consoleErrors.push(msg.text())});
const recordClick=async locator=>locator.evaluate(el=>{el.addEventListener('click',e=>e.preventDefault(),{once:true});el.click()});
try{
 await page.goto('http://localhost:5173');
 await expect(page.locator('h1')).toHaveCount(1);
 await expect(page.locator('.brand-hero img')).toHaveCount(0);
 assert.deepEqual(await page.locator('main > section').evaluateAll(sections=>sections.slice(0,5).map(e=>e.id||e.className)),['hero brand-hero','sobre','bolos','doces','quanto-pedir']);
 assert.ok(!await page.locator('body').innerText().then(t=>t.includes('Se está no bolo')||t.includes('Bonito é importante')));
 await expect(page.locator('.cake-grid article')).toHaveCount(3);
 await expect(page.locator('.cake-grid img')).toHaveCount(3);
 await expect(page.locator('#bolos')).not.toContainText('Doce de Leite com Amendoim');
 await expect(page.locator('.cake-pricing')).toContainText('1,5 kg');
 await expect(page.locator('.cake-pricing')).toContainText('85,00');
 await expect(page.locator('.sweet-grid article')).toHaveCount(12);
 const config=page.locator('#configurador');
 for(let q=50;q<=500;q+=50){
  await page.selectOption('#quantity',String(q));
  await expect(config.locator('.lot')).toHaveCount(q/50);
  for(let i=0;i<q/50;i++){
   await page.selectOption(`#flavor-${i}`,['ninho','churros','pistache'][i%3]);
   await page.selectOption(`#cup-${i}`,['Branquinho','Pistache','Chocolate'][i%3]);
  }
  const total=Array.from({length:q/50},(_,i)=>[95,110,135][i%3]).reduce((a,b)=>a+b,0);
  await expect(config.locator('.order-total')).toContainText(new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(total));
  const message=new URL(await config.getByRole('link',{name:'Consultar minha encomenda'}).getAttribute('href')).searchParams.get('text');
  assert.ok(message.includes(`Quantidade: ${q} doces`));
 }
 await page.selectOption('#quantity','150');
 for(let i=0;i<3;i++)await page.selectOption(`#flavor-${i}`,i===2?'brigadeiro-tradicional':'ninho-com-nutella');
 for(const [i,c] of ['Pistache','Chocolate','Branquinho'].entries())await page.selectOption(`#cup-${i}`,c);
 await expect(config.locator('.order-total')).toContainText('315,00');
 await expect(config.locator('.summary-flavor')).toHaveCount(2);
 let message=new URL(await config.getByRole('link',{name:'Consultar minha encomenda'}).getAttribute('href')).searchParams.get('text');
 for(const text of ['100 Ninho com Nutella','50 com forminha Pistache','50 com forminha Chocolate','50 Brigadeiro Tradicional','315,00'])assert.ok(message.includes(text),text);
 await recordClick(config.getByRole('link',{name:'Consultar minha encomenda'}));
 await page.selectOption('#quantity','50');
 await expect(page.locator('#flavor-0')).toHaveValue('ninho-com-nutella');
 await expect(config.locator('.order-total')).toContainText('110,00');
 await page.selectOption('#quantity','100');
 await expect(page.locator('#flavor-1')).toHaveValue('');
 await expect(config.getByRole('link',{name:'Consultar minha encomenda'})).toHaveCount(0);
 const planner=page.locator('#quanto-pedir');
 for(const [id,min,max] of [['aniversario',150,200],['casamento',250,350],['corporativo',100,200],['formatura',150,200],['infantil',200,250],['batizado',200,250],['noivado',200,250],['confraternizacao',150,200]]){
  await page.selectOption('#event-type',id);await page.fill('#guests','40');await planner.getByRole('button',{name:'Calcular quantidades'}).click();
  await expect(planner.locator('.planner-result')).toContainText('4 kg');
  for(const q of [min,max]){
   await planner.getByRole('button',{name:`Montar pedido com ${q} doces`,exact:true}).click();
   await expect(page.locator('#quantity')).toHaveValue(String(q));
   await expect(page.locator('#config-title')).toBeFocused();
  }
 }
 await page.fill('#guests','1000');await planner.getByRole('button',{name:'Calcular quantidades'}).click();
 await expect(planner.locator('.planner-actions button')).toHaveCount(0);
 await expect(planner.locator('.planner-result')).toContainText('acima de 500');
 await page.fill('#guests','0');await planner.getByRole('button',{name:'Calcular quantidades'}).click();await expect(page.locator('#planner-error')).toBeVisible();
 await page.fill('#guests','10');await planner.getByRole('button',{name:'Calcular quantidades'}).click();await expect(planner.locator('.planner-result')).toContainText('1,5 kg');
 const delivery=page.locator('#entrega');
 await delivery.getByRole('button',{name:'Entrega',exact:true}).click();
 await page.fill('#delivery-address','Rua de teste no DF');await page.fill('#delivery-number','12');
 await delivery.getByRole('button',{name:'Calcular frete',exact:true}).click();
 await expect(delivery.locator('.freight-feedback')).toContainText('Não conseguimos calcular o frete automaticamente');
 await expect(delivery.getByRole('link',{name:'Consultar entrega pelo WhatsApp'})).toBeVisible();
 await page.route('**/api/delivery',route=>route.fulfill({json:{estimatedCents:750,distanceKm:12.5,billableDistanceKm:12.5,tripMode:'one-way',destination:'Destino de teste no DF'}}));
 await delivery.getByRole('button',{name:'Calcular frete',exact:true}).click();
 await expect(delivery.locator('.freight-result')).toContainText('7,50');await expect(delivery.locator('.freight-result')).toContainText('12,5 km');
 message=new URL(await delivery.getByRole('link',{name:'Consultar entrega pelo WhatsApp'}).getAttribute('href')).searchParams.get('text');assert.ok(message.includes('7,50'));
 await recordClick(delivery.getByRole('link',{name:'Consultar entrega pelo WhatsApp'}));
 await page.fill('#delivery-number','13');await expect(delivery.locator('.freight-result')).toHaveCount(0);
 await delivery.getByRole('button',{name:'Retirada',exact:true}).click();await expect(delivery.locator('form')).toHaveCount(0);
 await page.getByRole('button',{name:'Mais pedidos',exact:true}).click();await expect(page.locator('.sweet-grid article')).toHaveCount(3);
 await page.getByRole('button',{name:'Tradicional',exact:true}).click();await expect(page.locator('.sweet-grid article')).toHaveCount(6);await expect(page.locator('.sweet-grid')).toContainText('Cajuzinho');
 await page.getByRole('button',{name:'Todos',exact:true}).click();
 await page.locator('.faq summary').first().click();assert.notEqual(await page.locator('.faq details').first().getAttribute('open'),null);
 for(const width of [360,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});await page.evaluate(()=>window.scrollTo(0,0));
  assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),`overflow ${width}`);
  const header=page.locator('header');assert.equal(await header.evaluate(el=>getComputedStyle(el).position),'sticky');
  if(width<=1100)await page.getByRole('button',{name:'Menu',exact:true}).click();
  await page.locator('nav').getByRole('link',{name:'Quanto pedir?',exact:true}).click();
  const bounds=await planner.boundingBox(),head=await header.boundingBox();assert.ok(bounds.y>=head.height,`anchor behind header ${width}`);
  assert.ok(Math.abs(head.y)<1,`sticky ${width}`);
 }
 const events=await page.evaluate(()=>window.dataLayer.map(e=>e.event));
 for(const event of ['planner_completed','planner_to_configurator','whatsapp_configurador','freight_calculated','whatsapp_delivery'])assert.ok(events.includes(event),event);
 await page.locator('img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));
 await page.waitForFunction(()=>Array.from(document.images).every(i=>i.complete));
 assert.deepEqual(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>i.naturalWidth===0).map(i=>i.src)),[]);
 // Capturas da interface real, sem os dados simulados de frete.
 await page.goto('http://localhost:5173/');await page.evaluate(()=>window.scrollTo(0,0));await page.locator('img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));
 await page.waitForFunction(()=>Array.from(document.images).every(i=>i.complete));
 await page.screenshot({path:'docs/desktop.png',fullPage:true});await page.screenshot({path:'docs/hero.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'docs/mobile.png',fullPage:true});
 await page.selectOption('#quantity','150');for(let i=0;i<3;i++)await page.selectOption(`#flavor-${i}`,i===2?'brigadeiro-tradicional':'ninho-com-nutella');
 await page.selectOption('#cup-0','Pistache');await page.selectOption('#cup-1','Chocolate');await config.locator('.order-summary').scrollIntoViewIfNeeded();await page.screenshot({path:'docs/configurator-mobile.png'});
 assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);
 console.log('PASS: 50–500, preços mistos, repetição, forminhas por lote, 8 eventos, transferência, mensagens, analytics, fallback/resultado frete, 5 larguras, âncoras, sticky, imagens e console.');
}finally{await browser.close()}
