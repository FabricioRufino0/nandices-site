import React,{useState} from 'react';
import {sweets,priceGroups} from '../data/catalog.js';
import {money} from '../data/commerce.js';
import ProductCard from './ProductCard.jsx';
import BrandHero from './BrandHero.jsx';

export function Prices(){return <div className="prices">{priceGroups.map(g=><div key={g.name}><span>{g.name}</span><strong>{money(g.lotPrice*2)}<small> / o cento</small></strong><span>{money(g.lotPrice)} / 50 unidades</span></div>)}<p>Pedido mínimo de 50 unidades.<br/>Cada sabor é escolhido em múltiplos de 50.</p></div>}
export default function SweetsCatalog({order,onToggle}){
 const [filter,setFilter]=useState('Tradicional');
 const filtered=sweets.filter(p=>p.category===filter);
 return <>
  <BrandHero docinhos/>
  <section className="section sweets catalog-page" id="catalogo" aria-labelledby="catalog-title">
   <div className="section-heading"><div><h2 id="catalog-title">Nossos docinhos</h2><p className="section-tagline">Escolha sua combinação.</p></div><a className="text-link" href="/encomenda">Monte sua encomenda <span aria-hidden="true">↗</span></a></div>
   <div className="catalog-toolbar"><div className="filters" aria-label="Filtrar brigadeiros">{[...new Set(sweets.map(p=>p.category))].map(f=><button key={f} aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f==='Tradicional'?'Tradicionais':f}</button>)}</div><span className="catalog-count" role="status">{filtered.length} {filtered.length===1?'sabor':'sabores'}</span></div>
   <div className="sweet-grid">{filtered.map(p=><ProductCard key={p.id} product={p} selected={order.flavors.some(f=>f.id===p.id)} onToggle={onToggle}/>)}</div>
   <Prices/>
  </section>
  <section className="section selection-panel" aria-labelledby="selection-title"><div><p className="eyebrow">SUA SELEÇÃO</p><h2 id="selection-title">{order.flavors.length?`${order.flavors.length} sabores na encomenda`:'Quais sabores combinam com você?'}</h2><p>Na próxima etapa, escolha a quantidade, distribua os doces e escolha uma forminha para o pedido.</p></div><div>{order.flavors.length>0&&<ul className="selected-flavors">{order.flavors.map(f=><li key={f.id}><span>{sweets.find(p=>p.id===f.id).name}</span><button type="button" aria-label={`Remover ${sweets.find(p=>p.id===f.id).name} da seleção`} onClick={()=>onToggle(f.id)}>Remover</button></li>)}</ul>}<a className="button" href="/encomenda">Continuar encomenda <span aria-hidden="true">↗</span></a>{order.flavors.length>10&&<p role="status">Até 500 doces permitem 10 sabores. Você poderá escolher quais manter na próxima etapa.</p>}</div></section>
 </>;
}
