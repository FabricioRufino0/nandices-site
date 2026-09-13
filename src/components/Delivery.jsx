import React,{useRef,useState,useEffect} from 'react';
import WA from './WhatsApp.jsx';
import {deliveryMessage,track} from '../lib/orders.js';
import {money,number} from '../data/commerce.js';
import {normalizeCep,FREIGHT_FALLBACK as FALLBACK} from '../lib/cep.js';
const ADDRESS_REVIEW=FALLBACK;
function failureKind(error){
 if(error?.name==='AbortError')return 'timeout';
 if(error?.kind)return error.kind;
 if(error instanceof TypeError)return 'network';
 return 'unexpected';
}
export default function Delivery({orderContext=''}){
 const messageFor=(mode,address,quote)=>[orderContext,deliveryMessage(mode,address,quote)].filter(Boolean).join('\n\n');
 const [mode,setMode]=useState('delivery'),[cep,setCep]=useState(''),[quote,setQuote]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 const pending=useRef(null);
 useEffect(()=>()=>pending.current?.abort(),[]);
 function invalidate(){pending.current?.abort();pending.current=null;setQuote(null);setError('');setLoading(false)}
 function change(value){invalidate();const digits=value.replace(/\D/g,'');setCep(normalizeCep(value)?`${digits.slice(0,5)}-${digits.slice(5)}`:value)}
 async function calculate(e){
  e.preventDefault();if(pending.current)return;invalidate();
  const normalizedCep=normalizeCep(cep);
  if(!normalizedCep){setError(ADDRESS_REVIEW);return}
  const controller=new AbortController();pending.current=controller;setLoading(true);
  const timeout=setTimeout(()=>controller.abort(),22000);
  try{
   const response=await fetch('/api/delivery',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cep:normalizedCep}),signal:controller.signal});
   let data;
   try{data=await response.json()}catch(parseError){if(controller.signal.aborted)throw parseError;const error=new Error(FALLBACK);error.kind='invalid_response';throw error}
   if(!data||typeof data!=='object'){const error=new Error(FALLBACK);error.kind='invalid_response';throw error}
   if(!response.ok||data.status!=='estimated'){
    const error=new Error(data.status==='address_review_required'?ADDRESS_REVIEW:FALLBACK);
    error.kind=data.status==='address_review_required'?'address_review':response.status>=500?'service_unavailable':response.ok?'invalid_response':'unexpected_http';
    throw error;
   }
   if(!Number.isSafeInteger(data.estimatedCents)||data.estimatedCents<0||!Number.isFinite(data.distanceKm)||data.distanceKm<0||!Number.isFinite(data.billableDistanceKm)||data.billableDistanceKm<data.distanceKm||typeof data.destination!=='string'||!data.destination.trim()){const error=new Error(FALLBACK);error.kind='invalid_response';throw error}
   if(pending.current!==controller)return;
   setQuote(data);track('freight_calculated',{estimated_value:data.estimatedCents/100,distance_km:data.distanceKm,trip_mode:data.tripMode});
  }catch(err){
   if(pending.current===controller){
    track('freight_calculation_failed',{failure_kind:failureKind(err)});
    setError(err.message===ADDRESS_REVIEW?ADDRESS_REVIEW:FALLBACK)
   }
  }
  finally{clearTimeout(timeout);if(pending.current===controller){pending.current=null;setLoading(false)}}
 }
 return <section className="section delivery-section" id="entrega" aria-labelledby="delivery-title"><div><p className="eyebrow">ENTREGA E RETIRADA</p><h2 id="delivery-title" tabIndex="-1">Como você prefere receber?</h2><p>Entregamos em todo o Distrito Federal. O transporte é realizado pela própria Nandices, com cuidado para preservar a apresentação e a qualidade dos produtos.</p><p>O frete é calculado separadamente e está sujeito à confirmação.</p></div><div><div className="choices delivery-choices" aria-label="Forma de recebimento">{[['pickup','Retirada'],['delivery','Entrega']].map(([value,label])=><button key={value} type="button" aria-pressed={mode===value} onClick={()=>{invalidate();setMode(value)}}>{label}</button>)}</div>{mode==='pickup'?<div className="pickup"><h3>Condomínio RK — Sobradinho/DF</h3><p>O endereço exato e o horário são informados pelo WhatsApp após a confirmação do pedido.</p><WA event="whatsapp_delivery" cta_location="retirada" message={messageFor(mode,{cep},null)}>Combinar retirada</WA></div>:<><form onSubmit={calculate} noValidate aria-busy={loading}><label className="field" htmlFor="delivery-cep">CEP<input id="delivery-cep" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" value={cep} required onChange={e=>change(e.target.value)}/></label><p className="estimate-note">O valor é uma estimativa com base no CEP informado. A entrega e o valor final são confirmados pela Nanda no WhatsApp.</p><button className="button" type="submit" disabled={loading}>{loading?'Calculando frete…':'Calcular frete'}</button></form><div className="freight-feedback" role="status">{error&&<p className="form-error">{error}</p>}{quote&&<div className="freight-result"><h3>Frete estimado: {money(quote.estimatedCents)}</h3><p>Distância aproximada: {number(quote.distanceKm)} km (ida).</p><p>{quote.destination}</p><small>Estimativa baseada no CEP. Valor sujeito à confirmação pela Nandices.</small></div>}</div><WA event="whatsapp_delivery" cta_location="entrega" message={messageFor(mode,{cep},quote)}>Consultar entrega pelo WhatsApp</WA></>}</div></section>;
}
