import React,{useState} from 'react';
import WA from './WhatsApp.jsx';
import ExpandableSection from './ExpandableSection.jsx';
import {EVENTS,money,number} from '../data/commerce.js';
import {estimateSweets,estimateCake,formatSweetsRange} from '../lib/planning.js';
import {sweetsEstimateMessage,cakeEstimateMessage,track} from '../lib/orders.js';

export default function EstimateCalculator(){
 const [open,setOpen]=useState(true);
 const [eventId,setEventId]=useState(EVENTS[0].id);
 const [guests,setGuests]=useState('');
 const [result,setResult]=useState(null);
 const [error,setError]=useState('');

 function calculate(event){
  event.preventDefault();
  try{
   const count=Number(guests);
   const sweets=estimateSweets(eventId,count);
   const cake=estimateCake(count);
   setResult({sweets,cake});
   setError('');
   track('sweets_estimate_completed',{event_type:sweets.event,guests:sweets.guests,quantity_min:sweets.min,quantity_max:sweets.max});
   track('cake_estimate_completed',{guests:cake.guests,cake_kg:cake.kg,estimated_value:cake.estimatedCents});
  }catch(err){setResult(null);setError(err.message)}
 }

 return <ExpandableSection id="quanto-pedir" titleId="calculadora-bolo" title="Calcule bolo e docinhos" label="ESTIMATIVA" className="planner combined-planner" open={open} onToggle={()=>setOpen(!open)}>
  <div><p>Informe os convidados e o tipo de evento. Os docinhos são estimados em lotes de 50; para o bolo, usamos 1 kg a cada 10 pessoas, com mínimo de 1,5 kg.</p></div>
  <div className="planner-workspace">
   <form onSubmit={calculate} noValidate>
    <div className="planner-fields">
     <label className="field">Quantidade de convidados<input type="number" min="1" step="1" inputMode="numeric" value={guests} onChange={event=>{setGuests(event.target.value);setResult(null);setError('')}} aria-invalid={!!error} aria-describedby={error?'planner-error':undefined} required/></label>
     <label className="field">Tipo de evento para os docinhos<select value={eventId} onChange={event=>{setEventId(event.target.value);setResult(null);setError('')}}>{EVENTS.map(event=><option key={event.id} value={event.id}>{event.name}</option>)}</select></label>
    </div>
    {error&&<p id="planner-error" className="form-error" role="alert">{error}</p>}
    <button className="button" type="submit">Calcular bolo e docinhos</button>
   </form>
  </div>
  {result&&<div className="planner-result" aria-live="polite">
    <h3>Para {result.sweets.guests} convidados</h3>
    <div className="planner-estimates">
     <div><h4>Docinhos</h4><p><strong>{formatSweetsRange(result.sweets)} docinhos</strong></p><p>Estimativa para {result.sweets.event}.</p><WA className="text-link" event="whatsapp_sweets_estimate" cta_location="calculadora_docinhos" message={sweetsEstimateMessage(result.sweets)}>Consultar docinhos</WA></div>
     <div><h4>Bolo</h4><p><strong>{number(result.cake.kg)} kg</strong></p><p>Valor estimado: <strong>{money(result.cake.estimatedCents)}</strong></p><WA className="text-link" event="whatsapp_cake_estimate" cta_location="calculadora_bolo" message={cakeEstimateMessage(result.cake)}>Consultar bolo</WA></div>
    </div>
    <p className="estimate-note">A Nanda confirma a quantidade, a disponibilidade e o valor final pelo WhatsApp.</p>
   </div>}
 </ExpandableSection>;
}
