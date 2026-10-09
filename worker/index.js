import {handleDelivery} from './delivery.js';

const securityHeaders={
 'Strict-Transport-Security':'max-age=31536000',
 'Content-Security-Policy':"default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self'; img-src 'self' https://www.googletagmanager.com https://*.google-analytics.com; font-src 'self'; connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com; frame-src https://www.googletagmanager.com",
 'Cross-Origin-Opener-Policy':'same-origin',
 'X-Frame-Options':'DENY',
 'X-Content-Type-Options':'nosniff',
};

function secureResponse(response){
 const headers=new Headers(response.headers);
 for(const [name,value] of Object.entries(securityHeaders))headers.set(name,value);
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

export default {async fetch(request,env){
 const path=new URL(request.url).pathname;
 if(path==='/encomenda'||path==='/encomenda/')return secureResponse(Response.redirect(new URL('/docinhos',request.url),301));
 if(path==='/api/delivery')return secureResponse(await handleDelivery(request,env));
 if(path.startsWith('/api/'))return secureResponse(Response.json({error:'Não encontrado.'},{status:404}));
 return secureResponse(await env.ASSETS.fetch(request));
}};
