import {test} from 'node:test';
import {createServer} from 'vite';
import {chromium,expect} from '@playwright/test';
import {ADDRESS_REVIEW,FALLBACK} from '../worker/delivery.js';

test('navegador: estimativa válida, endereço inválido/ambíguo, falha e preço parcial',async()=>{
 const vite=await createServer({logLevel:'silent',server:{host:'127.0.0.1',port:0}});
 let browser;
 try{
  await vite.listen();browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();
  await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}`);
  const delivery=page.locator('#entrega');await delivery.getByRole('button',{name:'Entrega',exact:true}).click();
  await page.fill('#delivery-address','Rua de teste no DF');await page.fill('#delivery-number','12');
  const quote={status:'estimated',estimatedCents:1184,distanceKm:12.5,billableDistanceKm:27.5,tripMode:'round-trip',destination:'Destino fictício, DF'};
  let result={http:200,body:quote};
  await page.route('**/api/delivery',route=>route.fulfill({status:result.http,json:result.body}));
  const calculate=()=>delivery.getByRole('button',{name:'Calcular frete',exact:true}).click();
  await calculate();await expect(delivery.locator('.freight-result')).toContainText('11,84');
  await page.fill('#delivery-number','13');await expect(delivery.locator('.freight-result')).toHaveCount(0);
  for(const http of [400,422,200]){
   result={http,body:{...quote,status:'address_review_required',error:'texto não confiável'}};
   await calculate();await expect(delivery.locator('.freight-feedback')).toContainText(ADDRESS_REVIEW);await expect(delivery.locator('.freight-result')).toHaveCount(0);
  }
  result={http:502,body:{status:'unavailable',error:'erro privado do provedor'}};
  await calculate();await expect(delivery.locator('.freight-feedback')).toContainText(FALLBACK);
  await expect(delivery.getByRole('link',{name:'Consultar entrega pelo WhatsApp'})).toBeVisible();
 }finally{await browser?.close();await vite.close()}
});
