import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import worker from '../worker/index.js';

test('respostas do Worker para redirect e erro de API incluem headers de segurança',async()=>{
 const redirect=await worker.fetch(new Request('https://nandicesconfeitaria.com.br/encomenda'),{});
 const missingApi=await worker.fetch(new Request('https://nandicesconfeitaria.com.br/api/missing'),{});
 assert.equal(redirect.status,301);
 assert.equal(redirect.headers.get('location'),'https://nandicesconfeitaria.com.br/docinhos');
 assert.equal(missingApi.status,404);
 for(const response of [redirect,missingApi]){
  assert.equal(response.headers.get('strict-transport-security'),'max-age=31536000');
  assert.equal(response.headers.get('content-security-policy'),"default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://www.googletagmanager.com https://static.cloudflareinsights.com; style-src 'self'; img-src 'self' https://www.googletagmanager.com https://*.google-analytics.com; font-src 'self'; connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com; frame-src https://www.googletagmanager.com");
  assert.equal(response.headers.get('cross-origin-opener-policy'),'same-origin');
  assert.equal(response.headers.get('x-frame-options'),'DENY');
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');
 }
});

test('CSP permite o beacon do Cloudflare Web Analytics sem afrouxar a origem de conexão',async()=>{
 const staticHeaders=await readFile('public/_headers','utf8');
 const response=await worker.fetch(new Request('https://nandicesconfeitaria.com.br/api/missing'),{});
 const csp=response.headers.get('content-security-policy');
 assert.match(staticHeaders,/Content-Security-Policy:.*script-src[^;]*https:\/\/static\.cloudflareinsights\.com/);
 assert.match(csp,/script-src[^;]*https:\/\/static\.cloudflareinsights\.com/);
 assert.match(csp,/connect-src[^;]*'self'/);
});

test('a página 404 oferece navegação e orientação para continuar no site',async()=>{
 const page=await readFile('public/404.html','utf8');
 assert.match(page,/<nav\b/i);
 assert.match(page,/<h1[^>]*>[^<]*(?:não foi encontrada|não encontrada)/i);
 assert.match(page,/<a href="\/">/);
 assert.match(page,/<a href="\/docinhos">/);
 assert.match(page,/endereço|URL/i);
});
