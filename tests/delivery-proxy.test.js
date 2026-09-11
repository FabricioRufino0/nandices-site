import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer as httpServer} from 'node:http';
import {createServer} from 'vite';
import {readFile,readdir} from 'node:fs/promises';
import {FALLBACK} from '../worker/delivery.js';

test('Vite encaminha somente ao Worker; preserva rejeição cross-origin e fallback',async()=>{
 const seen=[];
 const backend=httpServer((req,res)=>{seen.push({url:req.url,origin:req.headers.origin});res.setHeader('Content-Type','application/json');res.end(JSON.stringify({status:'unavailable',error:FALLBACK}))});
 await new Promise(resolve=>backend.listen(0,'127.0.0.1',resolve));
 const target=`http://127.0.0.1:${backend.address().port}`;
 const vite=await createServer({logLevel:'silent',server:{host:'127.0.0.1',port:0,proxy:{'/api':{target}}}});
 try{
  await vite.listen();const base=`http://127.0.0.1:${vite.httpServer.address().port}`;
  for(const origin of [base,'https://foreign.test']){
   const res=await fetch(`${base}/api/delivery`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}'});
   assert.deepEqual(await res.json(),{status:'unavailable',error:FALLBACK});
  }
  assert.equal(seen.length,2);assert.equal(seen[0].url,'/api/delivery');assert.equal(seen[0].origin,'http://127.0.0.1:8787');assert.equal(seen[1].origin,'https://foreign.test');
  await new Promise(resolve=>backend.close(resolve));
  const res=await fetch(`${base}/api/delivery`,{method:'POST'});assert.equal(res.status,502);assert.deepEqual(await res.json(),{status:'unavailable',error:FALLBACK});
 }finally{await vite.close();if(backend.listening)await new Promise(resolve=>backend.close(resolve))}
});
test('frontend e configuração Vite não importam nem consultam provider',async()=>{
 const worker=await readFile('worker/delivery.js','utf8');
 const host=new URL(worker.match(/const ORS_BASE = '([^']+)'/)[1]).host;
 const files=['vite.config.js',...(await readdir('src',{recursive:true})).filter(p=>/\.(js|jsx)$/.test(p)).map(p=>`src/${p}`)];
 for(const path of files){const source=await readFile(path,'utf8');assert.ok(!source.includes(host),path);assert.doesNotMatch(source,/import[^;]*worker\//,path);assert.doesNotMatch(source,/Authorization\s*:/,path)}
});
