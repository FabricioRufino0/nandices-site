import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'});
try{
 await page.goto('http://localhost:5173');await page.locator('img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));await page.waitForFunction(()=>Array.from(document.images).every(i=>i.complete));await page.evaluate(()=>document.fonts.ready);
 await page.locator('#bolos').scrollIntoViewIfNeeded();await page.evaluate(()=>document.querySelector('#bolos').scrollIntoView({block:'start'}));await page.screenshot({path:'docs/catalog-v4-desktop.png'});
 await page.locator('#doces').evaluate(e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:'docs/sweets-v4-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.locator('#bolos').evaluate(e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:'docs/catalog-v4-mobile.png'});
 console.log(await page.locator('.sweet-grid h3').first().evaluate(e=>getComputedStyle(e).fontFamily));
 console.log(await page.locator('.product-description').first().evaluate(e=>getComputedStyle(e).fontFamily));
}finally{await browser.close()}
