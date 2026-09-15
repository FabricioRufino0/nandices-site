import React,{useEffect,useRef,useState} from 'react';
import {sweets} from '../data/catalog.js';
import ProductCard from './ProductCard.jsx';
import BrandHero from './BrandHero.jsx';
import WA from './WhatsApp.jsx';
import {SweetsCalculator} from './Planner.jsx';

const categories=[['Tradicional','Tradicionais'],['Gourmet','Gourmet'],['Pistache','Pistache']];
const scrollTo=id=>document.getElementById(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});

export default function SweetsCatalog(){
 const [active,setActive]=useState('Tradicional');
 const categoryIds=useRef(categories.map(([key])=>`categoria-${key.toLowerCase()}`));
 useEffect(()=>{
  const observer=new IntersectionObserver(entries=>{
   const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
   if(visible)setActive(categories.find(([key])=>`categoria-${key.toLowerCase()}`===visible.target.id)?.[0]||'Tradicional');
  },{rootMargin:'-120px 0px -42% 0px',threshold:[0,.15,.45]});
  categoryIds.current.forEach(id=>{const section=document.getElementById(id);if(section)observer.observe(section)});
  return()=>observer.disconnect();
 },[]);
 return <>
  <BrandHero docinhos/>
  <section className="section sweets catalog-page" aria-labelledby="catalog-title">
   <div className="section-heading catalog-heading"><div><p className="eyebrow">NANDICES CONFEITARIA</p><h1 id="catalog-title">Nosso catálogo de docinhos</h1><p className="section-tagline">Conheça nossos sabores e encontre os docinhos que mais combinam com a sua comemoração.</p></div></div>
   <div className="catalog-body">
    <nav className="catalog-rail" aria-label="Navegação pelo catálogo">{categories.map(([key,label])=><button key={key} type="button" aria-current={active===key?'true':undefined} onClick={()=>scrollTo(`categoria-${key.toLowerCase()}`)}>{label}</button>)}</nav>
    <div className="catalog-categories">{categories.map(([category,label])=><section className="catalog-category" id={`categoria-${category.toLowerCase()}`} key={category} aria-labelledby={`title-${category}`}><h2 id={`title-${category}`}>{label}</h2><div className="sweet-grid">{sweets.filter(product=>product.category===category).map(product=><ProductCard key={product.id} product={product}/>)}</div></section>)}</div>
   </div>
  </section>
  <SweetsCalculator/>
  <section className="section cups" aria-labelledby="cups-title"><div className="cups-intro"><p className="eyebrow">APRESENTAÇÃO</p><h2 id="cups-title">Forminhas para combinar com cada detalhe</h2><p>Os detalhes também fazem parte da apresentação. Por isso, você pode escolher entre nossas opções de forminhas para deixar os docinhos ainda mais alinhados ao estilo da sua comemoração. Atualmente trabalhamos com Branquinho, Pistache e Chocolate. A escolha pode ser confirmada com a Nanda no momento do atendimento pelo WhatsApp.</p></div><div className="cup-catalog">{['Branquinho','Pistache','Chocolate'].map(cup=><figure key={cup}><img src={`/images/forminhas/${cup.toLowerCase()}.webp`} width="320" height="320" loading="lazy" alt={`Forminha ${cup}`}/><figcaption>{cup}</figcaption></figure>)}</div></section>
  <section className="tasting" id="caixa-degustacao"><div className="tasting-photo"><img src="/images/products/degustacao/caixa-catalogo-azul.webp" loading="lazy" width="1448" height="1086" alt="Caixa Degustação Nandices com 12 brigadeiros variados"/></div><div className="tasting-copy"><h2>Caixa Degustação</h2><p className="section-tagline">12 sabores. Uma descoberta.</p><p>Uma unidade de cada sabor do catálogo para você conhecer a Nandices.</p><WA event="whatsapp_degustacao" cta_location="degustacao_catalogo" product_name="Caixa Degustação" message="Olá! Vim pelo catálogo do site da Nandices e gostaria de consultar a Caixa Degustação.">Consultar Caixa Degustação</WA></div></section>
 </>;
}
