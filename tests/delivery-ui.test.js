import {test} from 'node:test';
import {createServer} from 'vite';
import {chromium,expect} from '@playwright/test';
import {ADDRESS_REVIEW,FALLBACK} from '../worker/delivery.js';
import assert from 'node:assert/strict';

test('navegador: estimativa válida, endereço inválido/ambíguo, falha e preço parcial',async()=>{
 const vite=await createServer({logLevel:'silent',server:{host:'127.0.0.1',port:0}});
 let browser;
 try{
  await vite.listen();browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();
  await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}`);
  const delivery=page.locator('#entrega');await delivery.getByRole('button',{name:'Entrega',exact:true}).click();
  await page.fill('#delivery-cep','70000-000');
  const quote={status:'estimated',estimatedCents:1184,distanceKm:12.5,billableDistanceKm:27.5,tripMode:'round-trip',destination:'Destino fictício, DF'};
  let result={http:200,body:quote},requests=[];
  await page.route('**/api/delivery',route=>{requests.push(route.request().postDataJSON());return route.fulfill({status:result.http,json:result.body})});
  const calculate=()=>delivery.getByRole('button',{name:'Calcular frete',exact:true}).click();
  await calculate();await expect(delivery.locator('.freight-result')).toContainText('11,84');
  assert.deepEqual(requests,[{cep:'70000000'}]);
  for(const invalid of ['', '123','700000000','abc70000000','00000000']){await page.fill('#delivery-cep',invalid);await calculate();assert.equal(requests.length,1)}
  await page.fill('#delivery-cep','70000-001');await expect(delivery.locator('.freight-result')).toHaveCount(0);
  for(const http of [400,422,200]){
   result={http,body:{...quote,status:'address_review_required',error:'texto não confiável'}};
   await calculate();await expect(delivery.locator('.freight-feedback')).toContainText(ADDRESS_REVIEW);await expect(delivery.locator('.freight-result')).toHaveCount(0);
  }
  result={http:502,body:{status:'unavailable',error:'erro privado do provedor'}};
  await calculate();await expect(delivery.locator('.freight-feedback')).toContainText(FALLBACK);
  await expect(delivery.getByRole('link',{name:'Consultar entrega pelo WhatsApp'})).toBeVisible();
  await page.unroute('**/api/delivery');
  let release;let count=0;
  await page.route('**/api/delivery',async route=>{count++;await new Promise(resolve=>release=resolve);await route.fulfill({json:quote}).catch(()=>{})});
  await calculate();await expect(delivery.getByRole('button',{name:'Calculando frete…'})).toBeDisabled();
  await page.locator('#entrega form').evaluate(form=>{form.requestSubmit();form.requestSubmit()});assert.equal(count,1);
  await page.fill('#delivery-cep','71000-000');release();await expect(delivery.locator('.freight-result')).toHaveCount(0);
  await page.unroute('**/api/delivery');await page.route('**/api/delivery',r=>r.abort('failed'));
  await calculate();await expect(delivery.locator('.freight-feedback')).toContainText(FALLBACK);
  await page.unroute('**/api/delivery');await page.route('**/api/delivery',r=>r.fulfill({body:'null',contentType:'application/json'}));
  await calculate();await expect.poll(()=>page.evaluate(()=>window.dataLayer.at(-1)?.failure_kind)).toBe('invalid_response');
  await page.unroute('**/api/delivery');let timeoutRelease;
  await page.route('**/api/delivery',async r=>{await new Promise(resolve=>timeoutRelease=resolve);await r.abort().catch(()=>{})});
  await page.clock.install();await calculate();await page.clock.fastForward(23000);
  await expect.poll(()=>page.evaluate(()=>window.dataLayer.at(-1)?.failure_kind)).toBe('timeout');timeoutRelease();
 }finally{await browser?.close();await vite.close()}
});
