import React from 'react';

const steps=[
 ['01','Escolha o que combina','Veja bolos, docinhos, Caixa Degustação ou uma criação personalizada.'],
 ['02','Conte sobre a ocasião','No WhatsApp, compartilhe data, quantidade e os detalhes que você imaginou.'],
 ['03','Combine com a Nanda','Confirme disponibilidade, valor e a melhor opção de entrega ou retirada.']
];

export default function OrderGuide(){
 return <section className="order-guide section" aria-labelledby="order-guide-title">
  <div className="order-guide__intro">
   <p className="eyebrow">COMO ENCOMENDAR</p>
   <h2 id="order-guide-title">Seu pedido, do seu jeito e sem complicação.</h2>
   <p>O site ajuda você a conhecer as opções. A Nanda cuida pessoalmente dos detalhes pelo WhatsApp.</p>
  </div>
  <ol>{steps.map(([number,title,description])=><li key={number}><span aria-hidden="true">{number}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
 </section>;
}
