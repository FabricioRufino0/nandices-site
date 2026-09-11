import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handleDelivery,FALLBACK} from '../worker/delivery.js';
import worker from '../worker/index.js';
// Valores sintéticos usados somente nestes testes; não são configuração comercial.
const env={GOOGLE_MAPS_API_KEY:'test-secret',DELIVERY_ORIGIN:'Origem privada de teste',VEHICLE_KM_PER_LITER:'10',FUEL_PRICE:'6',DELIVERY_TRIP_MODE:'one-way'};
const address={address:'Rua de teste no DF',number:'12',complement:'Bloco A'};
const request=(body=address,headers={})=>new Request('https://example.test/api/delivery',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
const location=(id='destination',state='DF')=>({place_id:id,formatted_address:'Destino de teste no DF',types:['street_address'],address_components:[{types:['country'],short_name:'BR'},{types:['administrative_area_level_1'],short_name:state},{types:['route'],long_name:'Rua de teste'}]});
function fakeGoogle({meters=[12500,15000],state='DF',status='OK',partial=false,types=['street_address']}={}){
 const calls=[];
 const fetcher=async(url,options)=>{calls.push({url:String(url),options});
  if(String(url).includes('/geocode/')){const isOrigin=new URL(url).searchParams.get('address')===env.DELIVERY_ORIGIN;return Response.json({status,results:[{...location(isOrigin?'origin':'destination',state),partial_match:partial,types}]})}
  return Response.json({routes:[{distanceMeters:meters.shift()}]});
 };
 return {calls,fetcher};
}
test('frete sem parâmetros não chama Google nem inventa preço',async()=>{let called=false;const res=await handleDelivery(request(),{},async()=>{called=true});assert.equal(res.status,503);assert.deepEqual(await res.json(),{error:FALLBACK});assert.equal(called,false)});
for(const field of Object.keys(env))test(`frete exige ${field}`,async()=>{const res=await handleDelivery(request(),{...env,[field]:''});assert.equal(res.status,503)});
test('rota de ida real e fórmula de combustível; origem e chave privadas',async()=>{
 const {fetcher,calls}=fakeGoogle();const res=await handleDelivery(request(),env,fetcher);assert.equal(res.status,200);const data=await res.json();
 assert.equal(data.distanceKm,12.5);assert.equal(data.estimatedCents,750);assert.equal(data.tripMode,'one-way');assert.equal(calls.length,3);
 const route=JSON.parse(calls[2].options.body);assert.equal(route.origin.placeId,'origin');assert.equal(route.destination.placeId,'destination');assert.equal(calls[2].options.headers['X-Goog-FieldMask'],'routes.distanceMeters');
 assert.ok(!JSON.stringify(data).includes(env.GOOGLE_MAPS_API_KEY));assert.ok(!JSON.stringify(data).includes(env.DELIVERY_ORIGIN));assert.equal(res.headers.get('Cache-Control'),'no-store');
});
test('ida + volta usa ambas as rotas e não dobra distância arbitrariamente',async()=>{const {fetcher,calls}=fakeGoogle();const res=await handleDelivery(request(),{...env,DELIVERY_TRIP_MODE:'round-trip'},fetcher);const data=await res.json();assert.equal(data.billableDistanceKm,27.5);assert.equal(data.estimatedCents,1650);const back=JSON.parse(calls[3].options.body);assert.equal(back.origin.placeId,'destination');assert.equal(back.destination.placeId,'origin')});
test('CEP é resolvido em rua + número antes de calcular',async()=>{const {fetcher,calls}=fakeGoogle();const res=await handleDelivery(request({...address,address:'70000-000'}),env,fetcher);assert.equal(res.status,200);assert.ok(new URL(calls[1].url).searchParams.get('address').includes('Rua de teste, 12'));assert.equal(calls.length,4)});
for(const scenario of [{state:'GO'},{status:'ZERO_RESULTS'},{partial:true},{types:['postal_code']}])test(`endereço impreciso ou fora do DF: ${JSON.stringify(scenario)}`,async()=>{const {fetcher,calls}=fakeGoogle(scenario);const res=await handleDelivery(request(),env,fetcher);assert.equal(res.status,422);assert.equal(calls.length,1)});
test('falhas Google, quota e rota inexistente retornam fallback',async()=>{
 for(const fetcher of [async()=>{throw new Error('private details')},async()=>new Response('',{status:429}),async()=>Response.json({status:'REQUEST_DENIED'}),fakeGoogle({meters:[]}).fetcher]){
  const res=await handleDelivery(request(),env,fetcher);assert.equal(res.status,502);assert.equal((await res.json()).error,FALLBACK);
 }
});
test('parâmetros numéricos inválidos não geram frete',async()=>{for(const overrides of [{FUEL_PRICE:'0'},{VEHICLE_KM_PER_LITER:'-1'},{FUEL_PRICE:'NaN'},{DELIVERY_TRIP_MODE:'unknown'}])assert.equal((await handleDelivery(request(),{...env,...overrides})).status,503)});
test('valida JSON, endereço, método e origem sem consumir API',async()=>{
 assert.equal((await handleDelivery(request({}),env)).status,400);
 assert.equal((await handleDelivery(new Request('https://example.test/api/delivery'),env)).status,405);
 assert.equal((await handleDelivery(request(address,{Origin:'https://other.test'}),env)).status,403);
 assert.equal((await handleDelivery(new Request('https://example.test/api/delivery',{method:'POST',headers:{'Content-Type':'application/json'},body:'invalid'}),env)).status,400);
});
test('Worker mantém assets e não devolve HTML para API desconhecida',async()=>{const res=await worker.fetch(new Request('https://example.test/api/unknown'),{});assert.equal(res.status,404);const asset=await worker.fetch(new Request('https://example.test/'),{ASSETS:{fetch:async()=>new Response('asset')}});assert.equal(await asset.text(),'asset')});
