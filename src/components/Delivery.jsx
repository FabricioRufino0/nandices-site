import React,{useRef,useState,useEffect} from 'react';
import WA from './WhatsApp.jsx';
import {deliveryMessage,track} from '../lib/orders.js';
import {money,number} from '../data/commerce.js';
const FALLBACK='Não conseguimos calcular o frete automaticamente. Consulte a entrega pelo WhatsApp.';
export default function Delivery(){
 const [mode,setMode]=useState('pickup'),[address,setAddress]=useState({address:'',number:'',complement:''}),[quote,setQuote]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 const pending=useRef(null);
 useEffect(()=>()=>pending.current?.abort(),[]);
 function invalidate(){pending.current?.abort();pending.current=null;setQuote(null);setError('');setLoading(false)}
 function change(field,value){invalidate();setAddress(previous=>({...previous,[field]:value}))}
 async function calculate(e){
  e.preventDefault();invalidate();
  if(address.address.trim().length<5||!address.number.trim()){setError('Informe um CEP ou endereço e o número. Use s/n se não houver número.');return}
  const controller=new AbortController();pending.current=controller;setLoading(true);
  const timeout=setTimeout(()=>controller.abort(),22000);
  try{
   const response=await fetch('/api/delivery',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(address),signal:controller.signal});
   const data=await response.json();
   if(!response.ok)throw new Error(response.status===400||response.status===422?data.error:FALLBACK);
   if(!Number.isSafeInteger(data.estimatedCents)||data.estimatedCents<0||!Number.isFinite(data.distanceKm)||data.distanceKm<0)throw new Error(FALLBACK);
   if(pending.current!==controller)return;
   setQuote(data);track('freight_calculated',{estimated_value:data.estimatedCents/100,distance_km:data.distanceKm,trip_mode:data.tripMode});
  }catch(err){if(pending.current===controller)setError(err.name==='AbortError'?FALLBACK:err.message||FALLBACK)}
  finally{clearTimeout(timeout);if(pending.current===controller){pending.current=null;setLoading(false)}}
 }
 return <section className="section delivery-section" id="entrega" aria-labelledby="delivery-title"><div><p className="eyebrow">ENTREGA E RETIRADA</p><h2 id="delivery-title">Como você prefere receber?</h2><p>Entregamos em todo o Distrito Federal. O transporte é realizado pela própria Nandices, com cuidado para preservar a apresentação e a qualidade dos produtos.</p><p>O frete é calculado separadamente e está sujeito à confirmação.</p></div><div><div className="choices delivery-choices" aria-label="Forma de recebimento">{[['pickup','Retirada'],['delivery','Entrega']].map(([value,label])=><button key={value} type="button" aria-pressed={mode===value} onClick={()=>{invalidate();setMode(value)}}>{label}</button>)}</div>{mode==='pickup'?<div className="pickup"><h3>Condomínio RK — Sobradinho/DF</h3><p>O endereço exato e o horário são informados pelo WhatsApp após a confirmação do pedido.</p><WA event="whatsapp_delivery" cta_location="retirada" message={deliveryMessage(mode,address,null)}>Combinar retirada</WA></div>:<><form onSubmit={calculate} noValidate aria-busy={loading}><label className="field" htmlFor="delivery-address">CEP ou endereço<input id="delivery-address" autoComplete="street-address" value={address.address} maxLength={300} required onChange={e=>change('address',e.target.value)}/></label><div className="address-fields"><label className="field" htmlFor="delivery-number">Número<input id="delivery-number" value={address.number} maxLength={30} required onChange={e=>change('number',e.target.value)}/></label><label className="field" htmlFor="delivery-complement">Complemento (opcional)<input id="delivery-complement" value={address.complement} maxLength={150} onChange={e=>change('complement',e.target.value)}/></label></div><p className="estimate-note">Use s/n se não houver número. O endereço é usado para consultar a rota de entrega.</p><button className="button" type="submit" disabled={loading}>{loading?'Calculando frete…':'Calcular frete'}</button></form><div className="freight-feedback" role="status">{error&&<p className="form-error">{error}</p>}{quote&&<div className="freight-result"><h3>Frete estimado: {money(quote.estimatedCents)}</h3><p>Distância aproximada: {number(quote.distanceKm)} km (ida).</p><p>{quote.destination}</p><small>Valor sujeito à confirmação pela Nandices.</small></div>}</div><WA event="whatsapp_delivery" cta_location="entrega" message={deliveryMessage(mode,address,quote)}>Consultar entrega pelo WhatsApp</WA></>}</div></section>;
}
