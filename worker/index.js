import {handleDelivery} from './delivery.js';
export default {async fetch(request,env){
 const path=new URL(request.url).pathname;
 if(path==='/encomenda'||path==='/encomenda/')return Response.redirect(new URL('/docinhos',request.url),301);
 if(path==='/api/delivery')return handleDelivery(request,env);
 if(path.startsWith('/api/'))return Response.json({error:'Não encontrado.'},{status:404});
 return env.ASSETS.fetch(request);
}};
