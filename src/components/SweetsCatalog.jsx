import React,{useEffect,useRef,useState} from 'react';
import {sweets} from '../data/catalog.js';
import {CUPS} from '../data/commerce.js';
import ProductCard from './ProductCard.jsx';
import BrandHero from './BrandHero.jsx';
import WA from './WhatsApp.jsx';
import OrderGuide from './OrderGuide.jsx';

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
   <div className="section-heading catalog-heading"><div><p className="eyebrow">NANDICES CONFEITARIA</p><h2 id="catalog-title">Nosso catálogo de docinhos</h2><p className="section-tagline">Conheça nossos sabores e encontre os docinhos que mais combinam com a sua comemoração.</p></div></div>
   <div className="catalog-body">
    <nav className="catalog-rail" aria-label="Navegação pelo catálogo">{categories.map(([key,label])=>{const count=sweets.filter(product=>product.category===key).length;return <button key={key} type="button" aria-label={`${label} · ${count}`} aria-current={active===key?'true':undefined} onClick={()=>scrollTo(`categoria-${key.toLowerCase()}`)}><span>{label}</span><small>{count}</small></button>})}</nav>
   <div className="catalog-categories">{categories.map(([category,label])=><section className="catalog-category" id={`categoria-${category.toLowerCase()}`} key={category} aria-labelledby={`title-${category}`}><h2 id={`title-${category}`}>{label}</h2><div className="sweet-grid">{sweets.filter(product=>product.category===category).map(product=><ProductCard key={product.id} product={product}/>)}</div></section>)}</div>
   </div>
  </section>
  <section className="catalog-contact" aria-labelledby="catalog-contact-title"><div><p className="eyebrow">SEUS FAVORITOS</p><h2 id="catalog-contact-title">Encontrou seu favorito?</h2><p>Fale com a Nanda pelo WhatsApp para tirar dúvidas, consultar disponibilidade e combinar os detalhes.</p></div><WA event="whatsapp_catalog" cta_location="pos_catalogo" className="button" message="Olá! Vim pelo catálogo do site da Nandices e gostaria de consultar alguns docinhos.">Chamar no WhatsApp</WA></section>
  <div className="section catalog-estimate"><a className="text-link" href="/estimativa#quanto-pedir">Calcular quantidade de docinhos <span aria-hidden="true">↗</span></a></div>
  <section className="section cups" aria-labelledby="cups-title"><div className="cups-intro"><p className="eyebrow">APRESENTAÇÃO</p><h2 id="cups-title">Forminhas para combinar com cada detalhe</h2><p>Escolha entre Branquinho, Pistache e Chocolate para deixar a apresentação dos seus docinhos alinhada ao estilo da comemoração. A opção pode ser confirmada com a Nanda pelo WhatsApp.</p></div><div className="cup-catalog">{CUPS.map(cup=><figure key={cup}><img src={`/images/forminhas/${cup.toLowerCase()}.webp`} width="320" height="320" loading="lazy" alt={`Forminha ${cup}`}/><figcaption>{cup}</figcaption></figure>)}</div></section>
  <OrderGuide/>
 </>;
}
