import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {sweets,cakes} from './data/catalog';
import {initAnalytics} from './lib/analytics.js';
import {CAKE,money,number} from './data/commerce.js';
import WA from './components/WhatsApp.jsx';
import BrandName from './components/BrandName.jsx';
import Delivery from './components/Delivery.jsx';
import SweetsCatalog from './components/SweetsCatalog.jsx';
import BrandHero from './components/BrandHero.jsx';
import ProductCard,{Photo,ProductDescription} from './components/ProductCard.jsx';
import EstimateCalculator from './components/Planner.jsx';
import OrderGuide from './components/OrderGuide.jsx';
import Footer from './components/Footer.jsx';
import {TastingPage,PersonalizedPage} from './components/SpecialPages.jsx';
import {routeMetadata} from './data/routes.js';
import {track} from './lib/orders.js';
import './style.css';
import './refinements.css';
import './pages.css';
import './experience.css';
import './special-pages.css';

initAnalytics(import.meta.env.VITE_GA_MEASUREMENT_ID);

const Arrow=()=> <span aria-hidden="true">↗</span>;

function Heading({label,title,children}){
 return <div className="section-heading"><div><h2>{label}</h2><p className="section-tagline">{title}</p></div>{children&&<p>{children}</p>}</div>;
}

function About(){
 return <section className="about section"><div><p className="eyebrow">NOSSA HISTÓRIA</p><h2>Por trás da Nandices</h2><p className="section-tagline">Oi, eu sou a Nanda.</p><p>Maria Fernanda · Nandices Confeitaria</p></div><div><p>Criei a Nandices para oferecer os bolos e docinhos que eu mesma gosto de comer.</p><p>Gosto que o bolo seja bonito, mas o sabor precisa acompanhar. Por isso, escolho com cuidado cada ingrediente e cada receita.</p></div></section>;
}

function Cakes(){
 return <section className="section cakes"><Heading label="Bolos Artesanais" title="Escolha o bolo para a sua comemoração.">Quatro combinações de massa, recheio e finalização feitas sob encomenda.</Heading><div className="cake-pricing"><strong>{money(CAKE.perKg)}/kg</strong><span>Peso mínimo: {number(CAKE.minKg)} kg</span></div><div className="cake-grid">{cakes.map((product,index)=><article key={product.id}><div className="cake-photo"><Photo product={product}/></div><div className="cake-number"><span>BOLO ARTESANAL</span><span>0{index+1}</span></div><h3>{product.name}</h3><ProductDescription text={product.description}/><WA className="text-link" event="whatsapp_bolo" product_name={product.name} product_category="bolo" cta_location="bolos" message={`Olá! Vim pelo site da Nandices e gostaria de consultar o bolo ${product.name}.`}>Consultar este bolo</WA></article>)}</div><a className="text-link" href="/estimativa#calculadora-bolo">Calcular quantidade de bolo <Arrow/></a><p className="cake-footnote">Nossos bolos não levam chantilly. Cada elemento deve contribuir para o sabor.</p></section>;
}

function EstimatePage(){
 return <><section className="section page-intro"><p className="eyebrow">PLANEJE SUA COMEMORAÇÃO</p><h1>Quanto pedir?</h1><p>Informe o número de convidados para estimar docinhos e bolo. A Nanda confirma as quantidades e os detalhes finais pelo WhatsApp.</p></section><EstimateCalculator/></>;
}

function HomeSweets(){
 const highlights=sweets.filter(product=>['brigadeiro-tradicional','beijinho','bicho-de-pe','pistache'].includes(product.id));
 return <section className="section sweets home-sweets"><Heading label="Doces & Brigadeiros" title="Quatro sabores para começar.">Conheça os 12 sabores no nosso catálogo.</Heading><div className="sweet-grid">{highlights.map(product=><ProductCard key={product.id} product={product}/>)}</div><a className="button all-sweets" href="/docinhos">Ver nossos docinhos <Arrow/></a></section>;
}

function Home(){
 return <><BrandHero/><Cakes/><HomeSweets/><OrderGuide/><About/></>;
}

function App(){
 const path=window.location.pathname.replace(/\/$/,'')||'/';
 const [menu,setMenu]=useState(false);
 useEffect(()=>{const meta=routeMetadata[path]||routeMetadata['/'];document.title=meta.title;document.querySelector('meta[name="description"]')?.setAttribute('content',meta.description)},[path]);
 useEffect(()=>{if(path!=='/')return;const section=new URLSearchParams(window.location.search).get('section');const destination={personalizados:'/personalizados',degustacao:'/caixa-degustacao'}[section];if(destination)window.location.replace(destination)},[path]);
 const nav=[
  {href:'/',label:'Bolos',target:'.cakes'},
  {href:'/docinhos',label:'Docinhos',target:'#catalog-title'},
  {href:'/caixa-degustacao',label:'Caixa Degustação'},
  {href:'/personalizados',label:'Docinhos personalizados'},
  {href:'/estimativa',label:'Quanto pedir?'},
  {href:'/frete',label:'Entrega e frete'}
 ];
 const navigateTo=item=>event=>{
  setMenu(false);
  if(path!==item.href||!item.target)return;
  event.preventDefault();
  document.querySelector(item.target)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 };
 return <><a className="skip" href="#conteudo">Pular para o conteúdo</a><header><a className="wordmark" href="/" aria-label="Nandices Confeitaria, início"><BrandName/><span>CONFEITARIA</span></a><nav id="navigation" className={menu?'open':''} aria-label="Navegação principal">{nav.map(item=><a key={item.label} href={item.href} aria-current={path===item.href?'page':undefined} onClick={navigateTo(item)}>{item.label}</a>)}<WA className="nav-whatsapp" cta_location="menu">Pedir pelo WhatsApp</WA></nav><WA className="button header-cta" cta_location="header"><span className="desktop-label">Pedir pelo WhatsApp</span><span className="mobile-label">Pedir</span></WA><a className="header-instagram" href="https://www.instagram.com/nandices.confeitaria/" target="_blank" rel="noopener noreferrer" aria-label="Instagram da Nandices (abre em nova aba)" onClick={()=>track('instagram_click',{cta_location:'header'})}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a><button className="menu-button" aria-expanded={menu} aria-controls="navigation" onClick={()=>setMenu(!menu)}>{menu?'Fechar':'Menu'}</button></header><main id="conteudo">{path==='/docinhos'?<SweetsCatalog/>:path==='/estimativa'?<EstimatePage/>:path==='/caixa-degustacao'?<TastingPage/>:path==='/personalizados'?<PersonalizedPage/>:path==='/frete'?<><section className="section page-intro"><p className="eyebrow">ENTREGA NO DF</p><h1>Consulte o frete</h1><p>Informe o CEP para consultar a estimativa de entrega.</p></section><Delivery/></>:path==='/'?<Home/>:<section className="section page-intro"><h1>Página não encontrada</h1><a className="button" href="/">Voltar ao início</a></section>}</main><Footer path={path}/></>;
}

createRoot(document.getElementById('root')).render(<App/>);
