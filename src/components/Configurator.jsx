import React,{useState} from 'react';
import WA from './WhatsApp.jsx';
import {finalOrderMessage} from '../lib/orders.js';
import {sweets} from '../data/catalog.js';
import {QUANTITIES,CUPS,money} from '../data/commerce.js';
import {resizeOrder,summarizeOrder,toggleOrderFlavor} from '../lib/planning.js';
import {Prices} from './SweetsCatalog.jsx';

export default function Configurator({order,setOrder}){
 const [notice,setNotice]=useState('');
 const summary=summarizeOrder(order),capacity=order.quantity/50;
 const overCapacity=order.flavors.length>capacity;
 function resize(quantity){
  setNotice(quantity<order.quantity?'Quantidade reduzida. Confira os sabores e a distribuição antes de finalizar.':'Quantidade atualizada. Confira a distribuição dos sabores.');
  setOrder(previous=>resizeOrder(previous,quantity));
 }
 function toggle(id){setOrder(previous=>toggleOrderFlavor(previous,id));setNotice('Seleção atualizada. Confira a distribuição abaixo.')}
 function distribute(id,quantity){setOrder(previous=>({...previous,flavors:previous.flavors.map(f=>f.id===id?{...f,quantity}:f)}))}
 return <section className="section order-config" id="configurador" aria-labelledby="config-title">
  <div className="section-heading"><div><p className="eyebrow">DO SEU JEITO</p><h2 id="config-title" tabIndex="-1">Monte sua encomenda</h2><p className="section-tagline">Uma escolha de cada vez.</p></div><p>De 50 a 500 doces. Para quantidades maiores, <WA className="text-link" cta_location="quantidade-maior">fale com a Nanda</WA>.</p></div>
  <div className="order-layout"><div className="order-steps">
   <fieldset className="order-step"><legend><span className="step-number">1</span> Escolha a quantidade</legend>
    <div className="quantity-options" aria-label="Quantidade de doces">{QUANTITIES.map(q=><button type="button" key={q} aria-pressed={q===order.quantity} onClick={()=>resize(q)}>{q}<span>doces</span></button>)}</div>
    <p>Até <strong>{capacity} {capacity===1?'sabor':'sabores'}</strong>, em múltiplos de 50 unidades por sabor.</p><Prices/>
   </fieldset>
   <fieldset className="order-step"><legend><span className="step-number">2</span> Escolha os sabores</legend>
    <p>Você pode usar menos sabores que o máximo e repetir a quantidade de um sabor.</p>
    <p className="selection-status" role="status">{notice}</p>
    {overCapacity&&<p className="form-error" role="alert">Você selecionou {order.flavors.length} sabores. Para {order.quantity} doces, mantenha até {capacity}. Remova os excedentes abaixo ou aumente a quantidade.</p>}
    <div className="order-flavors">{sweets.map(p=>{const selected=order.flavors.some(f=>f.id===p.id);return <button key={p.id} type="button" aria-pressed={selected} disabled={!selected&&order.flavors.length>=capacity} onClick={()=>toggle(p.id)}><span>{p.name}</span><span aria-hidden="true">{selected?'✓':'+'}</span></button>})}</div>
    {order.flavors.length>0&&<div className="flavor-distribution"><h3>Distribua os doces</h3>{order.flavors.map(f=><div className="distribution-row" key={f.id}><label className="field" htmlFor={`distribution-${f.id}`}>{sweets.find(p=>p.id===f.id).name}<select id={`distribution-${f.id}`} value={f.quantity} disabled={overCapacity} onChange={e=>distribute(f.id,Number(e.target.value))}>{f.quantity===0&&<option value="0">Ajuste a seleção</option>}{QUANTITIES.filter(q=>q<=order.quantity).map(q=><option key={q} value={q}>{q} unidades</option>)}</select></label><button type="button" className="remove-flavor" aria-label={`Remover ${sweets.find(p=>p.id===f.id).name}`} onClick={()=>toggle(f.id)}>Remover</button></div>)}<p role="status" className={summary.allocated!==order.quantity?'form-error':'distribution-status'}>{summary.allocated} de {order.quantity} doces distribuídos</p></div>}
   </fieldset>
   <fieldset className="order-step"><legend><span className="step-number">3</span> Escolha a forminha</legend><p>Uma única cor para todos os docinhos da encomenda.</p>
    <div className="cup-options">{CUPS.map(cup=><button type="button" key={cup} aria-pressed={order.cup===cup} onClick={()=>setOrder(previous=>({...previous,cup}))}><img src={`/images/forminhas/${cup.toLowerCase()}.webp`} width="320" height="320" alt={`Forminha ${cup}`} loading="lazy"/><span>{cup}</span><small>{order.cup===cup?'✓ Selecionada':'Selecionar'}</small></button>)}</div>
    <p className="estimate-note">Imagens ilustrativas baseadas na referência das forminhas. As cores podem variar na tela.</p>
   </fieldset>
  </div>
  <aside className="order-review" aria-labelledby="review-title"><h3 id="review-title"><span className="step-number">4</span> Revise o pedido</h3>
   <dl><div><dt>Quantidade</dt><dd>{order.quantity} doces</dd></div><div><dt>Sabores</dt><dd>{order.flavors.length} {order.flavors.length===1?'opção':'opções'}</dd></div><div><dt>Forminha</dt><dd>{order.cup||'Escolha uma cor'}</dd></div></dl>
   {summary.groups.length>0&&<ul className="review-flavors">{summary.groups.map(f=><li key={f.id}><span>{f.name}</span><strong>{f.quantity} un.</strong></li>)}</ul>}
   <p className="order-total">{summary.allocated===order.quantity?'Valor estimado':'Subtotal distribuído'}<strong>{money(summary.total)}</strong></p>
   {summary.complete?<WA className="button config-finish" event="whatsapp_order" cta_location="configurador" message={finalOrderMessage(order)}>Finalizar pelo WhatsApp</WA>:<><button className="button config-finish" disabled>Finalizar pelo WhatsApp</button><ul className="order-errors" aria-live="polite">{summary.errors.map(error=><li key={error}>{error}</li>)}</ul></>}
   <p className="estimate-note">Confira os detalhes acima. A disponibilidade e o valor são confirmados pela Nanda no atendimento.</p>
  </aside></div>
  <div className="optional-freight"><div><h3>Deseja calcular o frete?</h3><p>Se quiser, consulte uma estimativa de entrega antes de combinar os detalhes com a Nanda.</p></div><a className="text-link" href="/frete">Calcular frete <span aria-hidden="true">→</span></a></div>
 </section>;
}
