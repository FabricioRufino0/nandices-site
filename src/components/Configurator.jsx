import React,{useState} from 'react';
import WA from './WhatsApp.jsx';
import {sweets} from '../data/catalog.js';
import {QUANTITIES,CUPS,LOT_SIZE,PRICES,money} from '../data/commerce.js';
import {resizeLots,summarizeLots} from '../lib/planning.js';
import {configurationMessage} from '../lib/orders.js';
export default function Configurator({lots,setLots}){
 const [notice,setNotice]=useState('');
 const summary=summarizeLots(lots);
 function update(index,field,value){setLots(previous=>previous.map((lot,i)=>i===index?{...lot,[field]:value}:lot))}
 function resize(quantity){setNotice(quantity<summary.quantity?'Quantidade reduzida. Os primeiros lotes foram mantidos; os excedentes foram removidos.':'');setLots(previous=>resizeLots(previous,quantity))}
 return <section className="config section" id="configurador" aria-labelledby="config-title">
  <div className="config-intro"><p className="eyebrow">DO SEU JEITO</p><h2 id="config-title" tabIndex="-1">Monte sua encomenda.</h2><p>De 50 a 500 doces, em lotes de 50. Escolha um sabor e uma forminha para cada lote.</p><div className="rules"><span><strong>{summary.quantity} doces</strong>Até {lots.length} {lots.length===1?'sabor':'sabores'}</span></div><p>Você pode repetir sabores e forminhas. Cada sabor escolhido terá pelo menos 50 unidades.</p><small>O valor é dos doces. Frete e demais detalhes são combinados pelo WhatsApp. O pedido só é confirmado no atendimento.</small></div>
  <div className="config-form"><label className="field" htmlFor="quantity">Quantidade de doces<select id="quantity" value={summary.quantity} onChange={e=>resize(Number(e.target.value))}>{QUANTITIES.map(q=><option key={q} value={q}>{q} unidades</option>)}</select></label><p className="selection-status" role="status">{notice}</p>
  <div className="lot-list">{lots.map((lot,i)=>{const product=sweets.find(p=>p.id===lot.flavorId);return <fieldset className="lot" key={i}><legend>Lote {i+1} · {LOT_SIZE} doces</legend><div className="lot-fields"><label className="field" htmlFor={`flavor-${i}`}>Sabor do lote {i+1}<select id={`flavor-${i}`} value={lot.flavorId} onChange={e=>update(i,'flavorId',e.target.value)}><option value="">Selecione o sabor</option>{sweets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="field" htmlFor={`cup-${i}`}>Forminha do lote {i+1}<select id={`cup-${i}`} value={lot.cup} onChange={e=>update(i,'cup',e.target.value)}>{CUPS.map(c=><option key={c}>{c}</option>)}</select></label></div><p className="lot-price">{product?`${product.category} · ${money(PRICES[product.category])} por lote`:'Escolha o sabor para ver a categoria e o valor.'}</p></fieldset>})}</div>
  <div className="order-summary" aria-live="polite" aria-atomic="true"><h3>Resumo · {summary.quantity} doces</h3>{summary.groups.map(g=><div className="summary-flavor" key={g.id}><strong>{g.quantity} {g.name}</strong><ul>{g.cups.map(c=><li key={c.name}>{c.quantity} — Forminha {c.name}</li>)}</ul></div>)}<p>{summary.filled} de {lots.length} lotes preenchidos</p><p className="order-total">{summary.complete?'Total dos doces':'Subtotal dos lotes preenchidos'}: <strong>{money(summary.total)}</strong></p></div>
  {summary.complete?<WA event="whatsapp_configurador" quantity={summary.quantity} product_name={summary.groups.map(g=>g.name).join(', ')} product_category="doces" cta_location="configurador" message={configurationMessage(lots)}>Consultar minha encomenda</WA>:<button className="button" disabled>Selecione o sabor de todos os lotes</button>}<small>Valor calculado dos doces, sem frete. Sujeito à confirmação pela Nandices.</small></div>
 </section>;
}
