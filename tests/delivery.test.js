import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handleDelivery,FALLBACK,ADDRESS_REVIEW,PRIVATE_BINDINGS} from '../worker/delivery.js';
import worker from '../worker/index.js';
const env={OPENROUTESERVICE_API_KEY:'ors-test-secret',DELIVERY_ORIGIN:'Condomínio RK, Sobradinho - DF',VEHICLE_KM_PER_LITER:'14.4',FUEL_PRICE:'6.20',DELIVERY_TRIP_MODE:'round-trip'};
const address={cep:'70000000'};
const request=(body=address,headers={})=>new Request('https://example.test/api/delivery',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
const feature=(id,label='Rua de teste, DF',confidence=.9,state='Distrito Federal')=>({type:'Feature',geometry:{type:'Point',coordinates:id==='origin'?[-47.9,-15.8]:[-47.8,-15.7]},properties:{id,label,confidence,country_a:'BRA',region_a:state,layer:'address',accuracy:'point',match_type:'exact',postalcode:'70000-000'}});
function fakeORS({meters=[12500,15000],features=[feature('destination'),feature('origin','Condomínio RK, Sobradinho - DF')]}={}){const calls=[];const fetcher=async(url,options)=>{calls.push({url:String(url),options});if(String(url).includes('/pelias/v1/search')){const text=new URL(url).searchParams.get('text');return Response.json({features:features.length?(text.startsWith('Condomínio')?[features[1]]:[features[0]]):[]})}return Response.json({routes:[{summary:{distance:meters.shift()}}]})};return {calls,fetcher}}
test('sem credencial ou origem não chama o provedor',async()=>{let called=false;const res=await handleDelivery(request(),{},async()=>{called=true});assert.equal(res.status,503);assert.deepEqual(await res.json(),{status:'unavailable',error:FALLBACK});assert.equal(called,false)});
for(const field of ['OPENROUTESERVICE_API_KEY','DELIVERY_ORIGIN','VEHICLE_KM_PER_LITER','FUEL_PRICE','DELIVERY_TRIP_MODE'])test(`frete exige ${field}`,async()=>assert.equal((await handleDelivery(request(),{...env,[field]:''})).status,503));
test('usa Pelias + Directions HeiGIT e calcula ida + volta sem arredondamento comercial',async()=>{const {fetcher,calls}=fakeORS();const res=await handleDelivery(request(),env,fetcher);assert.equal(res.status,200);const data=await res.json();assert.equal(data.distanceKm,12.5);assert.equal(data.billableDistanceKm,27.5);assert.equal(data.estimatedCents,1184);assert.equal(data.tripMode,'round-trip');assert.equal(calls.length,4);assert.ok(calls.every(call=>call.url.startsWith('https://api.heigit.org/')));const body=JSON.parse(calls[2].options.body);assert.deepEqual(body.coordinates,[[-47.9,-15.8],[-47.8,-15.7]]);assert.equal(calls[2].options.headers.Authorization,env.OPENROUTESERVICE_API_KEY);assert.ok(!JSON.stringify(data).includes(env.OPENROUTESERVICE_API_KEY));assert.ok(!JSON.stringify(data).includes(env.DELIVERY_ORIGIN));});
test('one-way continua suportado pela configuração do Worker',async()=>{const {fetcher}=fakeORS({meters:[14400]});const data=await (await handleDelivery(request(),{...env,DELIVERY_TRIP_MODE:'one-way'},fetcher)).json();assert.equal(data.billableDistanceKm,14.4);assert.equal(data.estimatedCents,620)});
for(const scenario of [{features:[]},{features:[feature('destination','Rua, GO',.9,'Goiás')]},{features:[feature('destination','Rua, DF',.4)]}])test('endereço inválido, fora do DF ou ambíguo usa fallback',async()=>assert.equal((await handleDelivery(request(),env,fakeORS(scenario).fetcher)).status,422));
test('quota, indisponibilidade e rota sem distância usam fallback',async()=>{const brokenRoute=fakeORS().fetcher;const routeWithoutDistance=async(url,options)=>String(url).includes('/pelias/v1/search')?brokenRoute(url,options):Response.json({routes:[{summary:{}}]});for(const fetcher of [async()=>{throw new Error('private')},async()=>new Response('',{status:429}),routeWithoutDistance])assert.equal((await handleDelivery(request(),env,fetcher)).status,502)});
test('entrada, método e origem são validados',async()=>{assert.equal((await handleDelivery(request({}),env)).status,400);assert.equal((await handleDelivery(new Request('https://example.test/api/delivery'),env)).status,405);assert.equal((await handleDelivery(request(address,{Origin:'https://other.test'}),env)).status,403)});
test('Worker mantém assets e API desconhecida separada',async()=>{assert.equal((await worker.fetch(new Request('https://example.test/api/nope'),{})).status,404);const res=await worker.fetch(new Request('https://example.test/'),{ASSETS:{fetch:async()=>new Response('asset')}});assert.equal(await res.text(),'asset')});

const uncertainCases = {
 'baixa confiança': f=>{f.properties.confidence=.89},
 'confiança ausente': f=>{delete f.properties.confidence},
 'centroide': f=>{f.properties.accuracy='centroid'},
 'bairro': f=>{f.properties.layer='locality'},
 'logradouro': f=>{f.properties.layer='street'},
 'CEP': f=>{f.properties.layer='postalcode'},
 'interpolação': f=>{f.properties.match_type='interpolated'},
 'match ausente': f=>{delete f.properties.match_type},
 'fora do DF apesar do rótulo': f=>{f.properties.region_a='GO'},
 'coordenadas inválidas': f=>{f.geometry.coordinates=[181,-15]},
};
for(const side of ['destination','origin'])for(const [name,mutate] of Object.entries(uncertainCases).filter(([name])=>side==='origin'||!['centroide','logradouro','CEP','interpolação','match ausente'].includes(name)))test(`${side}: rejeita ${name} antes de consultar rotas`,async()=>{
 const features=[feature('destination'),feature('origin','Ponto privado')];mutate(features[side==='destination'?0:1]);
 const mock=fakeORS({features});const res=await handleDelivery(request(),env,mock.fetcher);
 assert.equal(res.status,422);assert.deepEqual(await res.json(),{status:'address_review_required',error:ADDRESS_REVIEW});
 assert.ok(mock.calls.every(c=>c.url.includes('/pelias/')));
});
for(const side of ['destination','origin'])for(const score of [.95,.91,1])test(`${side}: concorrente ${score} impede cálculo`,async()=>{
 let routes=0;
 const res=await handleDelivery(request(),env,async(url)=>{
  if(!String(url).includes('/pelias/')){routes++;throw Error('Não deveria consultar rota')}
  const current=new URL(url).searchParams.get('text').startsWith('Condomínio')?'origin':'destination';
  return Response.json({features:current===side?[feature(current,'Local A',.95),feature('other','Local B',score)]:[feature(current)]});
 });
 assert.equal(res.status,422);assert.equal(routes,0);assert.deepEqual(await res.json(),{status:'address_review_required',error:ADDRESS_REVIEW});
});
test('CEP normalizado não exige número de imóvel',async()=>{const data=await (await handleDelivery(request({cep:'70000-000'}),env,fakeORS().fetcher)).json();assert.equal(data.status,'estimated')});
test('falhas têm envelope consistente e nunca dados parciais ou privados',async()=>{
 const sensitive=PRIVATE_BINDINGS.map(k=>env[k]).join(' ');
 const partial=fakeORS();
 const cases=[handleDelivery(request({}),env),handleDelivery(request(),env,async()=>Response.json({features:[]})),handleDelivery(request(),env,async()=>{throw Error(sensitive)}),handleDelivery(request(),env,async()=>new Response(sensitive,{status:429})),handleDelivery(request(),env,async(url,options)=>{if(partial.calls.length===3)throw Error(sensitive);return partial.fetcher(url,options)})];
 for(const pending of cases){const res=await pending;const body=await res.json();assert.deepEqual(Object.keys(body).sort(),['error','status']);assert.equal(body.error,FALLBACK);for(const value of PRIVATE_BINDINGS.map(k=>env[k]))assert.ok(!JSON.stringify(body).includes(value));}
});
test('sucesso expõe somente contrato público e confirma volta independente',async()=>{
 const mock=fakeORS();const data=await(await handleDelivery(request(),env,mock.fetcher)).json();
 assert.deepEqual(Object.keys(data).sort(),['status','estimatedCents','distanceKm','billableDistanceKm','tripMode','destination','notice'].sort());
 assert.equal(data.status,'estimated');assert.match(data.notice,/confirmação/);
 assert.deepEqual(JSON.parse(mock.calls[3].options.body).coordinates,[[-47.8,-15.7],[-47.9,-15.8]]);
 assert.equal(data.estimatedCents,Math.round((12.5+15)/14.4*6.2*100));
});
test('CEP representativo aceita centroide e dispensa precisão de imóvel',async()=>{
 const destination=feature('destination');Object.assign(destination.properties,{layer:'postalcode',accuracy:'centroid'});delete destination.properties.match_type;
 const mock=fakeORS({features:[destination,feature('origin')]});
 const response=await handleDelivery(request(),env,mock.fetcher);
 assert.equal(response.status,200);assert.equal((await response.json()).destination,'CEP 70000-000 · DF');
});
for(const cep of ['', '123', '700000000','abc70000000','00000000','11111111'])test('CEP inválido: '+cep,async()=>{
 let calls=0;assert.equal((await handleDelivery(request({cep}),env,async()=>{calls++})).status,400);assert.equal(calls,0);
});
test('CEP divergente ou ausente no resultado não gera rota',async()=>{
 for(const postalcode of ['71000000',undefined]){
 const destination=feature('destination');destination.properties.postalcode=postalcode;
 const mock=fakeORS({features:[destination,feature('origin')]});
 assert.equal((await handleDelivery(request(),env,mock.fetcher)).status,422);assert.equal(mock.calls.length,1);
 }
});
