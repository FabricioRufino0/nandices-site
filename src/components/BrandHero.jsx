import React from 'react';
import BrandName from './BrandName.jsx';

export default function BrandHero({docinhos=false}){
 const scrollTo = selector => {
  const options={behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'};
  const target=document.querySelector(selector);
  target?.scrollIntoView(options);
  // Re-align after lazy imagery below the fold has claimed its final layout space.
  window.setTimeout(()=>document.querySelector(selector)?.scrollIntoView(options),450);
 };
 return <section className="hero brand-hero" aria-label={docinhos?'Docinhos da Nandices Confeitaria':'Nandices Confeitaria'}>
  <h1 className="wordmark" aria-label={docinhos?'Docinhos da Nandices Confeitaria':'Nandices Confeitaria'}><BrandName/><span>CONFEITARIA</span></h1>
  <picture>
   {!docinhos&&<source type="image/webp" srcSet="/images/brand/hero-nandices-768.webp 768w, /images/brand/hero-nandices-1280.webp 1280w, /images/brand/hero-nandices-2048.webp 2048w" sizes="100vw"/>}
   <img className="brand-hero__image" src={docinhos?'/images/docinhos/docinhos-hero.webp':'/images/brand/hero-nandices.png'} width="2172" height="724" loading="eager" fetchPriority="high" decoding="async" alt={docinhos?'Caixinha de brigadeiros variados da Nandices Confeitaria':'Bolo da Nandices Confeitaria'}/>
  </picture>
  <div className="brand-hero__actions">
   <button type="button" className="button" onClick={()=>scrollTo(docinhos?'#catalog-title':'.cakes')}>Ver sabores <span aria-hidden="true">↗</span></button>
   {docinhos?<button type="button" className="button button-secondary" onClick={()=>scrollTo('#caixa-degustacao')}>Caixa Degustação <span aria-hidden="true">↗</span></button>:<a className="button button-secondary" href="/docinhos">Ver docinhos <span aria-hidden="true">↗</span></a>}
  </div>
 </section>;
}
