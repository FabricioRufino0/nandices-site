import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handleDelivery} from '../worker/delivery.js';
const env={MAPBOX_ACCESS_TOKEN:'mapbox-test-secret',DELIVERY_ORIGIN:'Condomínio RK, Sobradinho - DF',VEHICLE_KM_PER_LITER:'12',FUEL_PRICE:'4.19',DELIVERY_TRIP_MODE:'round-trip'};
const request=(body={cep:'71540035'},headers={})=>new Request('https://example.test/api/delivery',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
function fake({meters=[12000,8400],features=true}={}){const calls=[];let geocodes=0;const fetcher=async url=>{const u=String(url);calls.push(u);if(u.startsWith('https://viacep.com.br'))return Response.json({cep:'71540-035',uf:'DF',logradouro:'Rua das Flores',bairro:'Águas Claras',localidade:'Brasília'});if(u.startsWith('https://api.mapbox.com/search/geocode/v6/forward'))return Response.json({features:features?[{type:'Feature',geometry:{type:'Point',coordinates:geocodes++===0?[-47.8,-15.7]:[-47.823,-15.689]},properties:{context:{postcode:{name:'71540-035'}}}}]:[]});if(u.startsWith('https://api.mapbox.com/directions/v5/mapbox/driving/'))return Response.json({code:'Ok',routes:[{distance:meters.shift()}]});throw new Error('unexpected provider')};return {calls,fetcher}}
test('Mapbox flow calculates round-trip without exposing private data',async()=>{const {calls,fetcher}=fake();const res=await handleDelivery(request(),env,fetcher);const body=await res.json();assert.equal(res.status,200);assert.equal(body.status,'estimated');assert.equal(body.distanceKm,12);assert.equal(body.billableDistanceKm,20.4);assert.equal(body.estimatedCents,800);assert.equal(calls.filter(x=>x.includes('/search/geocode/v6/forward')).length,2);assert.equal(calls.filter(x=>x.includes('/directions/v5/mapbox/driving/')).length,2);assert.match(calls.find(x=>x.includes('/directions/v5/mapbox/driving/')),/-47\.823,-15\.689;-47\.8,-15\.7/);assert.ok(!JSON.stringify(body).includes('Condomínio'));assert.ok(!JSON.stringify(body).includes('mapbox-test-secret'));});
test('freight rounds fractional reais up and preserves whole reais',async()=>{
 for(const [meters,expectedCents] of [[12230,1300],[12000,1200]]){
  const {fetcher}=fake({meters:[meters]});
  const response=await handleDelivery(request(),{...env,VEHICLE_KM_PER_LITER:'1',FUEL_PRICE:'1',DELIVERY_TRIP_MODE:'one-way'},fetcher);
  assert.equal(response.status,200);
  assert.equal((await response.json()).estimatedCents,expectedCents);
 }
});
test('invalid CEP is rejected before providers',async()=>{let calls=0;const res=await handleDelivery(request({cep:'bad'}),env,async()=>{calls++});assert.equal(res.status,400);assert.equal(calls,0);});
test('strict content type, body limit and same origin',async()=>{assert.equal((await handleDelivery(request({}, {'Content-Type':'application/jsonish'}),env)).status,415);assert.equal((await handleDelivery(request({}, {'Content-Length':'4097'}),env)).status,413);assert.equal((await handleDelivery(request({}, {Origin:'https://foreign.test'}),env)).status,403);});
test('rate limit blocks before providers',async()=>{let called=false;const res=await handleDelivery(request(),{...env,DELIVERY_RATE_LIMITER:{limit:async()=>({success:false})}},async()=>{called=true});assert.equal(res.status,429);assert.equal(called,false);});
test('origin geocoded near Asa Norte uses RK reference for the route',async()=>{
 const routes=[];
 const fetcher=async url=>{
  const u=String(url);
  if(u.startsWith('https://viacep.com.br'))return Response.json({cep:'70735-060',uf:'DF',logradouro:'SQN 303 Bloco F',bairro:'Asa Norte',localidade:'Brasília'});
  if(u.includes('/search/geocode/v6/forward'))return Response.json({features:[{geometry:{type:'Point',coordinates:[-47.8857,-15.7792]},properties:{context:{postcode:{name:'70735-060'}}}}]});
  if(u.includes('/directions/v5/mapbox/driving/')){routes.push(u);return Response.json({code:'Ok',routes:[{distance:routes.length===1?18700:18490}]});}
  throw new Error('unexpected provider');
 };
 const res=await handleDelivery(request({cep:'70735-060'}),env,fetcher);
 const body=await res.json();
 assert.equal(res.status,200);
 assert.equal(body.distanceKm,18.7);
 assert.equal(body.billableDistanceKm,37.19);
 assert.equal(body.estimatedCents,1300);
 assert.match(routes[0],/-47\.823308,-15\.6891943;-47\.8857,-15\.7792/);
});
test('destination without the requested CEP does not produce a freight quote',async()=>{
 let routes=0;
 const fetcher=async url=>{
  const u=String(url);
  if(u.startsWith('https://viacep.com.br'))return Response.json({cep:'72405-610',uf:'DF',logradouro:'Área Especial 1',bairro:'Setor Central (Gama)',localidade:'Brasília'});
  if(u.includes('/search/geocode/v6/forward'))return Response.json({features:[{geometry:{type:'Point',coordinates:[-47.88,-15.75]},properties:{context:{postcode:{name:'70735-060'}}}}]});
  if(u.includes('/directions/v5/mapbox/driving/')){routes++;return Response.json({code:'Ok',routes:[{distance:9790}]});}
  throw new Error('unexpected provider');
 };
 const response=await handleDelivery(request({cep:'72405-610'}),env,fetcher);
 assert.equal(response.status,422);
 assert.equal((await response.json()).status,'address_review_required');
 assert.equal(routes,0);
});
test('destination chooses a later Mapbox result with the requested CEP',async()=>{
 let geocodes=0, route;
 const fetcher=async url=>{
  const u=String(url);
  if(u.startsWith('https://viacep.com.br'))return Response.json({cep:'72405-610',uf:'DF',logradouro:'Área Especial 1',bairro:'Setor Central (Gama)',localidade:'Brasília'});
  if(u.includes('/search/geocode/v6/forward'))return Response.json({features:geocodes++===0?[
   {geometry:{type:'Point',coordinates:[-47.88,-15.75]},properties:{context:{postcode:{name:'70735-060'}}}},
   {geometry:{type:'Point',coordinates:[-48.0675,-16.0204]},properties:{feature_type:'street',context:{postcode:{name:'72405-135'}}}}
  ]:[{geometry:{type:'Point',coordinates:[-47.823,-15.689]},properties:{}}]});
  if(u.includes('/directions/v5/mapbox/driving/')){route??=u;return Response.json({code:'Ok',routes:[{distance:51400}]});}
  throw new Error('unexpected provider');
 };
 const response=await handleDelivery(request({cep:'72405-610'}),env,fetcher);
 assert.equal(response.status,200);
 assert.match(route,/-47\.823,-15\.689;-48\.0675,-16\.0204/);
});
test('destination retries by CEP when address results belong to another postal sector',async()=>{
 const searches=[];
 const fetcher=async url=>{
  const u=new URL(url);
  if(u.hostname==='viacep.com.br')return Response.json({cep:'71503-502',uf:'DF',logradouro:'Quadra CA 2',bairro:'Setor de Habitações Individuais Norte',localidade:'Brasília'});
  if(u.pathname==='/search/geocode/v6/forward'){
   searches.push(u.searchParams.get('q'));
   return Response.json({features:[{geometry:{type:'Point',coordinates:searches.length===1?[-47.88,-15.75]:[-47.86,-15.73]},properties:{feature_type:'postcode',name:searches.length===1?'70735':'71503'}}]});
  }
  if(u.pathname.startsWith('/directions/v5/mapbox/driving/'))return Response.json({code:'Ok',routes:[{distance:16000}]});
  throw new Error('unexpected provider');
 };
 const response=await handleDelivery(request({cep:'71503-502'}),env,fetcher);
 assert.equal(response.status,200);
 assert.equal((await response.json()).distanceKm,16);
 assert.equal(searches.length,3);
 assert.equal(searches[1],'71503502');
});
