import React from 'react';
import {sweets} from '../data/catalog.js';
import ProductCard from './ProductCard.jsx';
import BrandHero from './BrandHero.jsx';
import WA from './WhatsApp.jsx';
import {SweetsCalculator} from './Planner.jsx';

const categories=[['Tradicional','Tradicionais'],['Gourmet','Gourmet'],['Pistache','Pistache']];
const scrollTo=id=>document.getElementById(id)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});

export default function SweetsCatalog(){
 return <>
  <BrandHero docinhos/>
  <section className="section sweets catalog-page" aria-labelledby="catalog-title">
   <div className="section-heading"><div><h1 id="catalog-title">Nossos docinhos</h1><p className="section-tagline">Todos os sabores para descobrir e consultar.</p></div></div>
   <div className="catalog-shortcuts" aria-label="Categorias">{categories.map(([key,label])=><button type="button" key={key} onClick={()=>scrollTo(`categoria-${key.toLowerCase()}`)}>{label}</button>)}</div>
   {categories.map(([category,label])=><section className="catalog-category" id={`categoria-${category.toLowerCase()}`} key={category} aria-labelledby={`title-${category}`}><h2 id={`title-${category}`}>{label}</h2><div className="sweet-grid">{sweets.filter(product=>product.category===category).map(product=><ProductCard key={product.id} product={product}/>)}</div></section>)}
  </section>
  <SweetsCalculator/>
  <section className="section cups" aria-labelledby="cups-title"><div className="cups-intro"><p className="eyebrow">APRESENTAÇÃO</p><h2 id="cups-title">Forminhas para combinar com cada detalhe</h2><p>Os detalhes também fazem parte da apresentação. Por isso, você pode escolher entre nossas opções de forminhas para deixar os docinhos ainda mais alinhados ao estilo da sua comemoração. Atualmente trabalhamos com Branquinho, Pistache e Chocolate. A escolha pode ser confirmada com a Nanda no atendimento pelo WhatsApp.</p></div><div className="cup-catalog">{['Branquinho','Pistache','Chocolate'].map(cup=><figure key={cup}><img src={`/images/forminhas/${cup.toLowerCase()}.webp`} width="320" height="320" loading="lazy" alt={`Forminha ${cup}`}/><figcaption>{cup}</figcaption></figure>)}</div></section>
  <section className="tasting" id="caixa-degustacao"><div className="tasting-photo"><img src="/images/products/degustacao/caixa-catalogo-azul.webp" loading="lazy" width="1448" height="1086" alt="Caixa Degustação Nandices com 12 brigadeiros variados"/></div><div className="tasting-copy"><h2>Caixa Degustação</h2><p className="section-tagline">12 sabores. Uma descoberta.</p><p>Uma unidade de cada sabor do catálogo para você conhecer a Nandices.</p><WA event="whatsapp_degustacao" cta_location="degustacao_catalogo" product_name="Caixa Degustação" message="Olá! Vim pelo catálogo do site da Nandices e gostaria de consultar a Caixa Degustação.">Consultar Caixa Degustação</WA></div></section>
 </>;
}
