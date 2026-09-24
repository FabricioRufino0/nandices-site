import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pageMetadataHtml,routeMetadata} from '../src/data/routes.js';

test('cada página compartilha título, descrição, imagem e URL correspondentes',async()=>{
 const template=await readFile('index.html','utf8');
 const origin='https://nandicesconfeitaria.com.br';
 const html=template.replace('</head>',`<link rel="canonical" href="${origin}/"/><meta property="og:url" content="${origin}/"/></head>`);
 for(const [path,meta] of Object.entries(routeMetadata)){
  const page=pageMetadataHtml(html,path,origin);
  assert.ok(page.includes(`<title>${meta.title}</title>`),path);
  assert.ok(page.includes(`property="og:description" content="${meta.description}"`),path);
  assert.ok(page.includes(`property="og:image" content="${origin}${meta.image||routeMetadata['/'].image}"`),path);
  assert.ok(page.includes(`rel="canonical" href="${origin}${path}"`),path);
  assert.ok(page.includes(`property="og:url" content="${origin}${path}"`),path);
 }
});
