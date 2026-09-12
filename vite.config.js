import {defineConfig,loadEnv} from 'vite';
import {PHONE} from './src/lib/orders.js';
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'SITE_URL');
 const value=env.SITE_URL?.trim() || 'https://nandicesconfeitaria.com.br';
 let origin;
 {const url=new URL(value);if(url.protocol!=='https:')throw new Error('SITE_URL deve usar HTTPS');origin=url.origin;}
 return {envPrefix:[],server:{proxy:{'/api':{target:'http://127.0.0.1:8787',changeOrigin:true,configure(proxy){
  proxy.on('proxyReq',(outgoing,incoming)=>{
   // Translate only same-origin browser requests; foreign origins stay rejected by the Worker.
   if(incoming.headers.origin===`http://${incoming.headers.host}`)outgoing.setHeader('Origin','http://127.0.0.1:8787');
  });
  proxy.on('error',(_error,_request,response)=>{if(!response.headersSent){response.writeHead(502,{'Content-Type':'application/json','Cache-Control':'no-store'});response.end(JSON.stringify({status:'unavailable',error:'Não conseguimos calcular automaticamente para este CEP. Fale com a Nanda para consultar a entrega.'}))}});
 }}}},plugins:[{name:'confirmed-site-seo',transformIndexHtml(html){const organization={'@context':'https://schema.org','@type':'Organization',name:'Nandices Confeitaria',telephone:`+${PHONE}`,sameAs:['https://www.instagram.com/nandices.confeitaria/'],...(origin?{url:origin+'/'}:{})};html=html.replace('</head>',`<script type="application/ld+json">${JSON.stringify(organization)}</script></head>`);if(!origin)return html;return html.replace('</head>',`<link rel="canonical" href="${origin}/"/><meta property="og:url" content="${origin}/"/></head>`).replace('content="/images/products/degustacao/caixa-degustacao-960.webp"',`content="${origin}/images/products/degustacao/caixa-degustacao-960.webp"`)},generateBundle(){if(origin)this.emitFile({type:'asset',fileName:'sitemap.xml',source:`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>`})}}]};
});
