import React from 'react';
import {personalizedExample} from '../data/catalog.js';
import {TASTING,money} from '../data/commerce.js';
import {Photo} from './ProductCard.jsx';
import WA from './WhatsApp.jsx';

export function TastingPage(){
 return <div className="special-page special-page--tasting">
  <section className="section special-intro" aria-labelledby="tasting-title"><p className="eyebrow">PROVE A COLEÇÃO</p><h1 id="tasting-title">Caixa Degustação</h1><p>Uma unidade de cada sabor para você provar antes de escolher.</p></section>
  <section className="special-feature" aria-label="Detalhes da Caixa Degustação">
   <figure className="special-feature__photo"><img src="/images/products/degustacao/caixa-catalogo-azul.webp" width="1448" height="1086" alt="Caixa Degustação Nandices com 12 brigadeiros variados"/></figure>
   <div className="special-feature__copy"><p className="eyebrow">PARA DESCOBRIR</p><h2>Os 12 sabores em uma caixa</h2><p>A Caixa Degustação reúne os 12 sabores da Nandices, com uma unidade de cada.</p><dl className="special-facts"><div><dt>Caixa com</dt><dd>{TASTING.units} unidades</dd></div><div><dt>Valor</dt><dd>{money(TASTING.price)}</dd></div><div><dt>Antecedência mínima</dt><dd>{TASTING.leadDays} dias</dd></div></dl><p className="special-feature__note">A Nanda confirma disponibilidade e combina os detalhes com você pelo WhatsApp.</p><WA event="whatsapp_degustacao" cta_location="degustacao_pagina" product_name="Caixa Degustação" message="Olá! Vim pela página da Caixa Degustação da Nandices e gostaria de consultar uma caixa.">Consultar Caixa Degustação</WA></div>
  </section>
 </div>;
}

export function PersonalizedPage(){
 return <div className="special-page special-page--personalized">
  <section className="section special-intro" aria-labelledby="personalized-title"><p className="eyebrow">FEITO PARA O SEU EVENTO</p><h1 id="personalized-title">Docinhos personalizados</h1><p>Conte como você imagina os docinhos da sua comemoração.</p></section>
  <section className="special-feature" aria-label="Detalhes dos docinhos personalizados">
   <figure className="special-feature__photo"><Photo product={personalizedExample} hero/><figcaption>Um exemplo de personalização feita pela Nandices.</figcaption></figure>
   <div className="special-feature__copy"><p className="eyebrow">PARA COMBINAR COM A SUA COMEMORAÇÃO</p><h2>Detalhes do seu jeito</h2><p>Brigadeiros e outros doces com tema, cores, decoração, apresentação e embalagem combinados com você.</p><dl className="special-facts"><div><dt>Pedido mínimo</dt><dd>50 unidades</dd></div><div><dt>Antecedência mínima</dt><dd>45 dias</dd></div></dl><p className="special-feature__note">Conte sua ideia à Nanda pelo WhatsApp para consultar disponibilidade e combinar os detalhes.</p><WA event="whatsapp_personalizado" cta_location="personalizados_pagina" message="Olá! Vim pela página de docinhos personalizados da Nandices e gostaria de contar minha ideia:">Solicitar docinhos personalizados</WA></div>
  </section>
 </div>;
}
