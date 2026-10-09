import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createElement} from 'react';
import {renderToString} from 'react-dom/server';
import {build,createServer} from 'vite';
import {pageMetadataHtml,routeMetadata,sitemapXml} from '../src/data/routes.js';

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
  assert.ok(page.includes('name="twitter:card" content="summary_large_image"'),path);
  assert.ok(page.includes(`name="twitter:title" content="${meta.title}"`),path);
  assert.ok(page.includes(`name="twitter:description" content="${meta.description}"`),path);
  assert.ok(page.includes(`name="twitter:image" content="${origin}${meta.image||routeMetadata['/'].image}"`),path);
 }
});

test('descrição da home fica abaixo do limite que gerou o aviso de largura',()=>{
 assert.ok(routeMetadata['/'].description.length<=150);
});

test('descrições de todas as rotas permanecem na faixa recomendada',()=>{
 for(const [path,meta] of Object.entries(routeMetadata))assert.ok(meta.description.length>=120&&meta.description.length<=160,`${path}: ${meta.description.length} caracteres`);
});

test('sitemap publica só as seis rotas canônicas com lastmod estável',()=>{
 const origin='https://nandicesconfeitaria.com.br';
 const expected=['/','/docinhos','/estimativa','/caixa-degustacao','/personalizados','/frete'];
 const xml=sitemapXml(origin);
 const locations=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([,location])=>location);
 assert.deepEqual(locations,expected.map(path=>`${origin}${path}`));
 assert.equal((xml.match(/<lastmod>2026-10-09<\/lastmod>/g)||[]).length,6);
});

test('arquivos públicos de descoberta referenciam as páginas canônicas',async()=>{
 const origin='https://nandicesconfeitaria.com.br';
 const [llms,agents]=await Promise.all([readFile('public/llms.txt','utf8'),readFile('public/AGENTS.md','utf8')]);
 for(const path of ['/','/docinhos','/estimativa','/caixa-degustacao','/personalizados','/frete']){
  assert.ok(llms.includes(`${origin}${path}`),`llms.txt deve referenciar ${path}`);
  assert.ok(agents.includes(`${origin}${path}`),`AGENTS.md deve referenciar ${path}`);
 }
});

test('o documento declara como encontrar o llms.txt',async()=>{
 const template=await readFile('index.html','utf8');
 assert.ok(template.includes('<link rel="llms" href="/llms.txt"/>'));
});

test('HTML inicial de cada página contém H1, conteúdo e links para as seis rotas',async()=>{
 const expected={
  '/':['Nandices Confeitaria','Bolos Artesanais'],
  '/docinhos':['Docinhos da Nandices Confeitaria','Conheça nossos sabores'],
  '/estimativa':['Quanto pedir?','Informe o número de convidados'],
  '/caixa-degustacao':['Caixa Degustação','Uma unidade de cada sabor'],
  '/personalizados':['Docinhos personalizados','Conte como você imagina os docinhos'],
  '/frete':['Consulte o frete','Informe o CEP para consultar a estimativa'],
 };
 const server=await createServer({root:process.cwd(),configFile:false,logLevel:'silent',appType:'custom',server:{middlewareMode:true}});
 try{
  const {default:App}=await server.ssrLoadModule('/src/App.jsx');
  for(const [path,[heading,intro]] of Object.entries(expected)){
   const html=renderToString(createElement(App,{pathname:path}));
   assert.ok(html.includes(`<h1`),`${path} deve ter H1`);
   assert.ok(html.includes(heading),`${path} deve identificar o título principal`);
   assert.ok(html.includes(intro),`${path} deve expor conteúdo principal`);
   if(path==='/estimativa'||path==='/frete')assert.ok(html.includes('<ul'),`${path} deve estruturar orientações em lista`);
   if(path==='/docinhos')assert.doesNotMatch(html,/<picture\b/,`${path} não deve usar picture sem source`);
   for(const linkedPath of Object.keys(expected))assert.ok(html.includes(`href="${linkedPath}"`),`${path} deve ligar para ${linkedPath}`);
  }
 }finally{
  await server.close();
 }
});

test('build gera conteúdo inicial específico em cada rota',async()=>{
 await build();
 const expected={
  '/':'Bolos Artesanais',
  '/docinhos':'Conheça nossos sabores e encontre os docinhos',
  '/estimativa':'Informe o número de convidados para estimar docinhos e bolo',
  '/caixa-degustacao':'Uma unidade de cada sabor para você provar antes de escolher',
  '/personalizados':'Conte como você imagina os docinhos da sua comemoração',
  '/frete':'Informe o CEP para consultar a estimativa de entrega',
 };
 for(const [path,intro] of Object.entries(expected)){
  const file=path==='/'?'dist/index.html':`dist${path}/index.html`;
  const html=await readFile(file,'utf8');
  assert.ok(html.includes('<h1'),`${path} deve incluir H1 no arquivo gerado`);
  assert.ok(html.includes(intro),`${path} deve conter seu próprio conteúdo inicial`);
  for(const linkedPath of Object.keys(expected))assert.ok(html.includes(`href="${linkedPath}"`),`${path} deve ligar para ${linkedPath}`);
 }
});
