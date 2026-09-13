import React from 'react';
import BrandName from './BrandName.jsx';

export default function BrandHero({docinhos=false}){
 return <section className="hero brand-hero" aria-label={docinhos?'Docinhos da Nandices Confeitaria':'Nandices Confeitaria'}>
  <h1 className="wordmark" aria-label={docinhos?'Docinhos da Nandices Confeitaria':'Nandices Confeitaria'}><BrandName/><span>CONFEITARIA</span></h1>
  <picture>
   {!docinhos&&<source type="image/webp" srcSet="/images/brand/hero-nandices-768.webp 768w, /images/brand/hero-nandices-1280.webp 1280w, /images/brand/hero-nandices-2048.webp 2048w" sizes="100vw"/>}
   <img className="brand-hero__image" src={docinhos?'/images/docinhos/docinhos-hero.webp':'/images/brand/hero-nandices.png'} width={docinhos?1024:2172} height={docinhos?341:724} loading="eager" fetchPriority="high" decoding="async" alt={docinhos?'Caixinha de brigadeiros variados da Nandices Confeitaria':'Bolo da Nandices Confeitaria'}/>
  </picture>
  <div className="brand-hero__actions"><a className="button" href={docinhos?'#catalogo':'#bolos'}>Ver sabores <span aria-hidden="true">↗</span></a></div>
 </section>;
}
