import React from 'react';
import BrandName from './BrandName.jsx';
import WA from './WhatsApp.jsx';

const content={
 '/':{eyebrow:'FALE COM A NANDA',title:'Quer confirmar sabores, quantidades ou entrega?',description:'Pelo WhatsApp, a Nanda confirma disponibilidade e combina os detalhes com você.',label:'Falar com a Nanda',message:'Olá! Vim pelo site da Nandices e gostaria de tirar uma dúvida.'},
 '/docinhos':{eyebrow:'FALE COM A NANDA',title:'Gostou de algum docinho?',description:'Fale com a Nanda para confirmar sabores, quantidade e disponibilidade.',label:'Falar com a Nanda',message:'Olá! Vim pelo catálogo de docinhos da Nandices e gostaria de tirar uma dúvida.'},
 '/caixa-degustacao':{eyebrow:'CONHEÇA OS SABORES',title:'Qual docinho chamou sua atenção?',description:'Veja os 12 sabores do catálogo antes de decidir.',label:'Ver os 12 docinhos',href:'/docinhos'},
 '/personalizados':{eyebrow:'MAIS IDEIAS PARA A FESTA',title:'Quer ver os sabores da Nandices?',description:'Conheça o catálogo de docinhos enquanto pensa nos detalhes da sua encomenda.',label:'Ver os docinhos',href:'/docinhos'},
 '/estimativa':{eyebrow:'CONTINUE PLANEJANDO',title:'Escolha o que vai à mesa',description:'Veja os bolos e docinhos da Nandices para seguir com o pedido.',label:'Ver bolos e docinhos',href:'/'},
 '/frete':{eyebrow:'CONTINUE EXPLORANDO',title:'Agora escolha seus favoritos',description:'Veja os bolos e docinhos da Nandices para a sua comemoração.',label:'Ver bolos e docinhos',href:'/'}
};

export default function Footer({path}){
 const {eyebrow,title,description,label,href,message}=content[path]||content['/'];
 return <footer className="contact site-footer">
  <p className="eyebrow">{eyebrow}</p>
  <h2>{title}</h2>
  <p>{description}</p>
  {href?<a className="button" href={href}>{label} <span aria-hidden="true">↗</span></a>:<WA cta_location="footer" message={message}>{label}</WA>}
  <div className="site-footer__base"><a href="/" className="wordmark" aria-label="Nandices Confeitaria, início"><BrandName/><span>CONFEITARIA</span></a><a className="text-link" href="https://www.instagram.com/nandices.confeitaria/" target="_blank" rel="noopener noreferrer">@nandices.confeitaria <span aria-hidden="true">↗</span></a><small>© {new Date().getFullYear()} Nandices Confeitaria</small></div>
 </footer>;
}
