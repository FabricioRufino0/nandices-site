import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handleDelivery,FALLBACK} from '../worker/delivery.js';

const env={MAPBOX_ACCESS_TOKEN:'private-token-marker',DELIVERY_ORIGIN:'private-origin-marker',VEHICLE_KM_PER_LITER:'12',FUEL_PRICE:'4.19',DELIVERY_TRIP_MODE:'round-trip'};
const address={cep:'71540-035',uf:'DF',logradouro:'private-street-marker',bairro:'private-neighborhood-marker',localidade:'Brasília'};
const stages=['viacep','destination','origin','outbound','inbound'];
const point={type:'Feature',geometry:{type:'Point',coordinates:[-47.812345,-15.712345]},properties:{context:{postcode:{name:'71540-035'}}}};
const privateData=[env.MAPBOX_ACCESS_TOKEN,env.DELIVERY_ORIGIN,address.logradouro,address.bairro,'-47.812345','-15.712345','access_token','coordinates','longitude','latitude'];
const sensitiveMessage=privateData.join(' ');
const request=(body={cep:'71540-035'},headers={})=>new Request('https://example.test/api/delivery',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});

function provider(overrides={}){
 const calls=[];
 return {calls,fetcher:async(url,options)=>{
  const stage=stages[calls.length];calls.push(stage);
  const endpoint=new URL(url);
  if(stage==='viacep')assert.equal(endpoint.origin,'https://viacep.com.br');
  else {
   assert.equal(endpoint.origin,'https://api.mapbox.com');
   if(['destination','origin'].includes(stage))assert.equal(endpoint.pathname,'/search/geocode/v6/forward');
   else assert.ok(endpoint.pathname.startsWith('/directions/v5/mapbox/driving/'));
  }
  if(overrides[stage])return overrides[stage](options);
  if(stage==='viacep')return Response.json(address);
  if(['destination','origin'].includes(stage))return Response.json({type:'FeatureCollection',features:[point]});
  return Response.json({code:'Ok',routes:[{distance:12000}]});
 }};
}

async function verify(t,{overrides={},req=request(),http=502,status='unavailable',kind,expectedCalls}){
 const logs=[];
 for(const method of ['warn','error','log','info','debug'])t.mock.method(console,method,(...args)=>logs.push(args));
 const {calls,fetcher}=provider(overrides);
 const response=await handleDelivery(req,env,fetcher);
 const body=await response.json();
 assert.equal(response.status,http);
 assert.deepEqual(body,{status,error:FALLBACK});
 assert.deepEqual(calls,expectedCalls);
 assert.deepEqual(logs,kind?[['freight_failed',{kind}]]:[]);
 const publicText=JSON.stringify({body,logs});
 for(const value of privateData)assert.ok(!publicText.includes(value),'private field leaked');
 for(const cep of ['71540035','71540-035'])assert.ok(!JSON.stringify(logs).includes(cep),'CEP leaked in logs');
 assert.equal(response.headers.get('Cache-Control'),'no-store');
 assert.equal(response.headers.get('X-Content-Type-Options'),'nosniff');
}

for(const stage of stages.slice(1)){
 test(`Mapbox timeout at ${stage}: fallback and private logs`,async t=>{
  const nativeTimeout=AbortSignal.timeout.bind(AbortSignal);
  t.mock.method(AbortSignal,'timeout',()=>nativeTimeout(5));
  await verify(t,{overrides:{[stage]:({signal})=>new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>resolve(Response.json({})),1000);
   const abort=()=>{clearTimeout(timer);reject(new DOMException(sensitiveMessage,'TimeoutError'))};
   if(signal.aborted)abort();else signal.addEventListener('abort',abort,{once:true});
  })},kind:'timeout',expectedCalls:stages.slice(0,stages.indexOf(stage)+1)});
 });
 test(`Mapbox HTTP error at ${stage}: fallback and private logs`,async t=>{
  await verify(t,{overrides:{[stage]:()=>new Response(sensitiveMessage,{status:503})},kind:'provider_http',expectedCalls:stages.slice(0,stages.indexOf(stage)+1)});
 });
}
for(const stage of ['destination','origin'])test(`empty ${stage} geocoding: address review fallback`,async t=>{
 await verify(t,{overrides:{[stage]:()=>Response.json({type:'FeatureCollection',features:[]})},http:422,status:'address_review_required',kind:`${stage}_not_found`,expectedCalls:stages.slice(0,stages.indexOf(stage)+1)});
});
for(const stage of ['outbound','inbound']){
 for(const code of ['Ok','NoRoute'])test(`${stage} Directions without route (${code})`,async t=>{
  await verify(t,{overrides:{[stage]:()=>Response.json({code,routes:[]})},kind:'route_invalid_distance',expectedCalls:stages.slice(0,stages.indexOf(stage)+1)});
 });
 for(const [label,distance] of [['missing',undefined],['string','12000'],['null',null],['negative',-1],['zero',0],['NaN',NaN],['infinite',Infinity]])test(`${stage} Directions invalid distance: ${label}`,async t=>{
  // NaN/Infinity cannot be encoded in JSON; inject the parsed value to test the finite-number guard itself.
  await verify(t,{overrides:{[stage]:()=>({ok:true,json:async()=>({code:'Ok',routes:[{distance}]})})},kind:'route_invalid_distance',expectedCalls:stages.slice(0,stages.indexOf(stage)+1)});
 });
}
test('outside DF: fallback before any Mapbox call',async t=>{
 await verify(t,{overrides:{viacep:()=>Response.json({...address,uf:'SP'})},http:422,kind:'outside_df',expectedCalls:['viacep']});
});
for(const headers of [{},{'Content-Length':'1'}])test(`real body exceeds 4096 bytes with ${headers['Content-Length']?'false':'absent'} Content-Length`,async t=>{
 const body={cep:'71540-035',padding:'é'.repeat(2100)};
 assert.ok(JSON.stringify(body).length<4096);
 assert.ok(new TextEncoder().encode(JSON.stringify(body)).byteLength>4096);
 await verify(t,{req:request(body,headers),http:413,status:'address_review_required',expectedCalls:[]});
});
test('successful response and logs also exclude provider private fields',async t=>{
 const logs=[];for(const method of ['warn','error','log','info','debug'])t.mock.method(console,method,(...args)=>logs.push(args));
 const {fetcher}=provider();const response=await handleDelivery(request(),env,fetcher);const body=await response.json();
 assert.equal(body.status,'estimated');assert.equal(body.destination,'CEP 71540-035 · DF');assert.deepEqual(logs,[]);
 for(const value of privateData)assert.ok(!JSON.stringify({body,logs}).includes(value),'private field leaked');
});
