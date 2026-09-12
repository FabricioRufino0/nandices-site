import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCep} from '../src/lib/cep.js';
import {handleDelivery, FALLBACK} from '../worker/delivery.js';
import worker from '../worker/index.js';

const env={OPENROUTESERVICE_API_KEY:'ors-test-secret',DELIVERY_ORIGIN:'Condomínio RK, Sobradinho - DF',VEHICLE_KM_PER_LITER:'14.4',FUEL_PRICE:'6.20',DELIVERY_TRIP_MODE:'round-trip'};
const address={cep:'70000000'};
const request=(body=address)=>new Request('https://example.test/api/delivery',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});

function fakeORS({meters=[12500,15000],features=[{type:'Feature',geometry:{type:'Point',coordinates:[-47.8,-15.7]},properties:{id:'destination',label:'Rua de teste, Brasília, DF, Brasil',confidence:.95,country_a:'BRA',region_a:'DF',layer:'address',accuracy:'point',match_type:'exact',postalcode:'70000-000'}}]}={}){
  const calls=[];
  const fetcher=async(url,options)=>{
    calls.push({url:String(url),options});
    if(String(url).startsWith('https://viacep.com.br/ws/')){
      const cep=String(url).match(/viacep\.com\.br\/ws\/([^/]+)\/json/)[1];
      return Response.json({cep:cep.length===8?`${cep.slice(0,5)}-${cep.slice(5)}`:cep,uf:'DF',logradouro:'Rua de teste',bairro:'Centro',localidade:'Brasília',erro:false});
    }
    if(String(url).includes('/pelias/v1/search')){
      const text=new URL(url).searchParams.get('text');
      return Response.json({features:features.length?(text.startsWith('Condomínio')?[{type:'Feature',geometry:{type:'Point',coordinates:[-47.9,-15.8]},properties:{id:'origin',label:'Condomínio RK, Sobradinho - DF',confidence:.95,country_a:'BRA',region_a:'DF',layer:'venue',accuracy:'point',match_type:'exact',postalcode:'70000-000'}}]:[features[0]]):[]});
    }
    return Response.json({routes:[{summary:{distance:meters.shift()}}]});
  };
  return {calls,fetcher};
}

test('worker validates environment and returns fallback public envelope', async()=>{
  let called=false;
  const res=await handleDelivery(request(),{},async()=>{called=true});
  assert.equal(res.status,503);
  assert.deepEqual(await res.json(),{status:'unavailable',error:FALLBACK});
  assert.equal(called,false);
});

test('destination is resolved through ViaCEP in the worker before Pelias sees an address string', async()=>{
  const {fetcher,calls}=fakeORS();
  const res=await handleDelivery(request({cep:'70000-000'}),env,fetcher);
  assert.equal(res.status,200);
  assert.equal(calls[0].url.startsWith('https://viacep.com.br/ws/70000000/json/'),true);
  assert.equal(calls[1].url.startsWith('https://api.heigit.org/pelias/v1/search'),true);
  const data=await res.json();
  assert.equal(data.status,'estimated');
  assert.ok(!JSON.stringify(data).includes(env.OPENROUTESERVICE_API_KEY));
  assert.ok(!JSON.stringify(data).includes(env.DELIVERY_ORIGIN));
});

test('non-DF ViaCEP response is rejected without sending the route to ORS', async()=>{
  const fetcher=async(url)=>{
    if(String(url).startsWith('https://viacep.com.br/ws/'))return Response.json({cep:'71000-000',uf:'SP',logradouro:'Rua fora',bairro:'Centro',localidade:'São Paulo',erro:false});
    throw new Error('should-not-call-ors');
  };
  const res=await handleDelivery(request({cep:'71000000'}),env,fetcher);
  assert.equal(res.status,422);
  assert.deepEqual(await res.json(),{status:'unavailable',error:FALLBACK});
});

test('full 71540-035 delivery route reaches ORS and produces estimated freight', async()=>{
  const env={OPENROUTESERVICE_API_KEY:'ors-test-secret',DELIVERY_ORIGIN:'Condomínio RK, Sobradinho - DF',VEHICLE_KM_PER_LITER:'12.0',FUEL_PRICE:'4.19',DELIVERY_TRIP_MODE:'round-trip'};
  const meters=[12000,8400];
  const calls=[];

  const fetcher=async(url,options)=>{
    calls.push({url:String(url),options});

    if(String(url).startsWith('https://viacep.com.br/ws/')){
      const cepMatch=String(url).match(/viacep\.com\.br\/ws\/([^/]+)\/json/);
      assert.ok(cepMatch);
      assert.equal(cepMatch[1], '71540035');
      return Response.json({cep:'71540-035',uf:'DF',logradouro:'Rua das Flores',bairro:'Águas Claras',localidade:'Brasília',erro:false});
    }

    if(String(url).includes('/pelias/v1/search')){
      const text=new URL(url).searchParams.get('text');
      if(text.startsWith('Condomínio')){
        return Response.json({features:[{type:'Feature',geometry:{type:'Point',coordinates:[-47.9,-15.8]},properties:{id:'origin',label:'Condomínio RK, Sobradinho - DF',confidence:.95,country_a:'BRA',region_a:'DF',region:'Distrito Federal',layer:'venue',accuracy:'point',match_type:'exact',postalcode:'70000-000'}}]});
      }
      return Response.json({features:[{type:'Feature',geometry:{type:'Point',coordinates:[-47.8,-15.7]},properties:{id:'destination',label:'Rua das Flores, Águas Claras, Brasília - DF, 71540-035, Brasil',confidence:.95,country_a:'BRA',region_a:'DF',region:'Distrito Federal',layer:'address',accuracy:'point',match_type:'exact',postalcode:'71540-035'}}]});
    }

    return Response.json({routes:[{summary:{distance:meters.shift()}}]});
  };

  assert.equal(normalizeCep('71540-035'), '71540035');

  const res=await handleDelivery(request({cep:'71540035'}),env,fetcher);
  assert.equal(res.status,200);

  const body=await res.json();
  assert.equal(body.status,'estimated');
  assert.equal(body.tripMode,'round-trip');
  assert.equal(body.destination,'CEP 71540-035 · DF');
  assert.ok(Number.isFinite(body.estimatedCents));
  assert.ok(Number.isFinite(body.distanceKm));
  assert.ok(Number.isFinite(body.billableDistanceKm));
  assert.equal(body.distanceKm, 12);
  assert.equal(body.billableDistanceKm, 20.4);
  assert.equal(body.estimatedCents, Math.round((body.billableDistanceKm / 12.0) * 4.19 * 100));

  assert.equal(calls[0].url.startsWith('https://viacep.com.br/ws/71540035/json/'), true);
  assert.equal(calls[1].url.startsWith('https://api.heigit.org/pelias/v1/search'), true);
  assert.equal(calls[2].url.startsWith('https://api.heigit.org/pelias/v1/search'), true);
  assert.equal(calls[3].url.startsWith('https://api.heigit.org/openrouteservice/v2/directions/driving-car/json'), true);
  assert.equal(calls[4].url.startsWith('https://api.heigit.org/openrouteservice/v2/directions/driving-car/json'), true);
});

test('worker keeps assets and unknown API separate', async()=>{
  assert.equal((await worker.fetch(new Request('https://example.test/api/nope'),{})).status,404);
  const res=await worker.fetch(new Request('https://example.test/'),{ASSETS:{fetch:async()=>new Response('asset')}});
  assert.equal(await res.text(),'asset');
});
