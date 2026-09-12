import {preview} from 'vite';
import {chromium} from '@playwright/test';
const server=await preview({preview:{host:'127.0.0.1',port:0}});let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true});
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.addInitScript(()=>{
   window.metrics={cls:0,lcp:0};
   new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.metrics.cls+=e.value}).observe({type:'layout-shift',buffered:true});
   new PerformanceObserver(list=>{for(const e of list.getEntries())window.metrics.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});
  });
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}`);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1000);
  console.log(JSON.stringify({width,...await page.evaluate(()=>({...window.metrics,resources:performance.getEntriesByType('resource').length,transferBytes:performance.getEntriesByType('resource').reduce((n,r)=>n+r.transferSize,0)}))}));await page.close();
 }
}finally{await browser?.close();await new Promise(resolve=>server.httpServer.close(resolve))}
