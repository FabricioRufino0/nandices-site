import {createElement} from 'react';
import {renderToString} from 'react-dom/server';
import {createServer,defineConfig,loadEnv} from 'vite';
import {PHONE} from './src/lib/orders.js';
import {routeMetadata,pageMetadataHtml,sitemapXml} from './src/data/routes.js';
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),['SITE_URL','VITE_GA_MEASUREMENT_ID']);
 const value=env.SITE_URL?.trim() || 'https://nandicesconfeitaria.com.br';
 let origin;
 {const url=new URL(value);if(url.protocol!=='https:')throw new Error('SITE_URL deve usar HTTPS');origin=url.origin;}
 const sitemap=sitemapXml(origin);
 const robots=`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`;
 let prerenderedPages={};
  return {envPrefix:[],define:{'import.meta.env.VITE_GA_MEASUREMENT_ID':JSON.stringify(/^G-[A-Z0-9]+$/.test(env.VITE_GA_MEASUREMENT_ID?.trim()||'')?env.VITE_GA_MEASUREMENT_ID.trim():'')},server:{proxy:{'/api':{target:'http://127.0.0.1:8787',changeOrigin:true,configure(proxy){
  proxy.on('proxyReq',(outgoing,incoming)=>{
   // Translate only same-origin browser requests; foreign origins stay rejected by the Worker.
   if(incoming.headers.origin===`http://${incoming.headers.host}`)outgoing.setHeader('Origin','http://127.0.0.1:8787');
  });
  proxy.on('error',(_error,_request,response)=>{if(!response.headersSent){response.writeHead(502,{'Content-Type':'application/json','Cache-Control':'no-store'});response.end(JSON.stringify({status:'unavailable',error:'Não conseguimos calcular automaticamente para este CEP. Fale com a Nanda para consultar a entrega.'}))}});
  }}}},plugins:[{name:'confirmed-site-seo',enforce:'post',async buildStart(){const server=await createServer({configFile:false,root:process.cwd(),logLevel:'silent',appType:'custom',server:{middlewareMode:true}});try{const {default:App}=await server.ssrLoadModule('/src/App.jsx');prerenderedPages=Object.fromEntries(Object.keys(routeMetadata).map(path=>[path,renderToString(createElement(App,{pathname:path}))]));}finally{await server.close()}},configurePreviewServer(server){server.middlewares.use((request,response,next)=>{const [path,query]=request.url.split('?');if(path==='/encomenda'||path==='/encomenda/'){response.writeHead(301,{Location:'/docinhos'});response.end();return;}const route=path.replace(/\/$/,'');if(route&&Object.hasOwn(routeMetadata,route))request.url=route+'/index.html'+(query?'?'+query:'');next()})},configureServer(server){server.middlewares.use((request,response,next)=>{const path=request.url?.split('?')[0];if(path==='/encomenda'||path==='/encomenda/'){response.writeHead(301,{Location:'/docinhos'});response.end();return;}if(path!=='/sitemap.xml'&&path!=='/robots.txt')return next();response.setHeader('Content-Type',path==='/sitemap.xml'?'application/xml; charset=utf-8':'text/plain; charset=utf-8');response.end(path==='/sitemap.xml'?sitemap:robots)})},transformIndexHtml(html,context){const organization={'@context':'https://schema.org','@type':'Organization',name:'Nandices Confeitaria',telephone:`+${PHONE}`,sameAs:['https://www.instagram.com/nandices.confeitaria/'],...(origin?{url:origin+'/'}:{})};html=html.replace('</head>',`<script type="application/ld+json">${JSON.stringify(organization)}</script></head>`);if(!origin)return html;const page=html.replace('</head>',`<link rel="canonical" href="${origin}/"/><meta property="og:url" content="${origin}/"/></head>`);const path=(context.originalUrl||context.path||'/').split('?')[0].replace(/\/$/,'')||'/';return pageMetadataHtml(page,path,origin)},generateBundle(_options,bundle){if(origin){
 this.emitFile({type:'asset',fileName:'sitemap.xml',source:sitemap});
 this.emitFile({type:'asset',fileName:'robots.txt',source:robots});
  const index=bundle['index.html'];
  if(index){const template=String(index.source);const pageHtml=path=>pageMetadataHtml(template.replace('<div id="root"></div>',`<div id="root">${prerenderedPages[path]||''}</div>`),path,origin);index.source=pageHtml('/');for(const path of Object.keys(routeMetadata).filter(path=>path!=='/'))this.emitFile({type:'asset',fileName:path.slice(1)+'/index.html',source:pageHtml(path)});}
 }}}]};
});
