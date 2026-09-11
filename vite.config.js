import {defineConfig,loadEnv} from 'vite';
import {handleDelivery} from './worker/delivery.js';
import {PHONE} from './src/lib/orders.js';
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'');
 const value=env.SITE_URL?.trim();
 let origin;
 if(value){const url=new URL(value);if(url.protocol!=='https:')throw new Error('SITE_URL deve usar HTTPS');origin=url.origin;}
 return {plugins:[{name:'local-delivery-api',configureServer(server){
  server.middlewares.use('/api/delivery',async(req,res)=>{
   try{
    let size=0;const chunks=[];
    for await(const chunk of req){size+=chunk.length;if(size>4096){res.writeHead(413,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Endereço muito longo.'}));return}chunks.push(chunk)}
    const method=req.method||'GET';
    const request=new Request(`http://${req.headers.host}/api/delivery`,{method,headers:req.headers,...(!['GET','HEAD'].includes(method)?{body:Buffer.concat(chunks)}:{})});
    const response=await handleDelivery(request,env);
    res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());
   }catch{res.writeHead(502,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Não conseguimos calcular o frete automaticamente. Consulte a entrega pelo WhatsApp.'}))}
  });
 }},{name:'confirmed-site-seo',transformIndexHtml(html){const organization={'@context':'https://schema.org','@type':'Organization',name:'Nandices Confeitaria',telephone:`+${PHONE}`,sameAs:['https://www.instagram.com/nandices.confeitaria/'],...(origin?{url:origin+'/'}:{})};html=html.replace('</head>',`<script type="application/ld+json">${JSON.stringify(organization)}</script></head>`);if(!origin)return html;return html.replace('</head>',`<link rel="canonical" href="${origin}/"/><meta property="og:url" content="${origin}/"/></head>`).replace('content="/images/products/degustacao/caixa-degustacao-960.webp"',`content="${origin}/images/products/degustacao/caixa-degustacao-960.webp"`)},generateBundle(){if(origin)this.emitFile({type:'asset',fileName:'sitemap.xml',source:`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>`})}}]};
});
