import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1440,height:900}});
try{await page.goto('http://localhost:5173');
 for(const [section,name] of [['#bolos','Consultar este bolo'],['#doces','Consultar sabor']]){
  await page.locator(section).scrollIntoViewIfNeeded();await page.getByRole('link',{name,exact:true}).first().click();await page.waitForTimeout(2000);
  const top=await page.locator('#entrega').boundingBox();const scroll=await page.evaluate(()=>scrollY);if(!top||Math.abs(top.y)>140)throw Error(`${section} não navegou para entrega: y=${top?.y} scroll=${scroll}`);
 }
 console.log('PASS: CTAs de bolo e brigadeiro navegam para retirada/entrega sem abrir WhatsApp');
}finally{await browser.close()}


