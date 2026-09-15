import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {sweets,cakes,personalizedExample} from './data/catalog';
import {initAnalytics} from './lib/analytics.js';
import {CAKE,TASTING,money,number} from './data/commerce.js';
import WA from './components/WhatsApp.jsx';
import BrandName from './components/BrandName.jsx';
import Delivery from './components/Delivery.jsx';
import SweetsCatalog from './components/SweetsCatalog.jsx';
import BrandHero from './components/BrandHero.jsx';
import ProductCard,{Photo,ProductDescription} from './components/ProductCard.jsx';
import {CakeCalculator} from './components/Planner.jsx';
import OrderGuide from './components/OrderGuide.jsx';
import {routeMetadata} from './data/routes.js';
import {track} from './lib/orders.js';
import './style.css';
import './refinements.css';
import './pages.css';
import './experience.css';

initAnalytics(import.meta.env.VITE_GA_MEASUREMENT_ID);

const Arrow=()=> <span aria-hidden="true">↗</span>;

function Heading({label,title,children}){
 return <div className="section-heading"><div><h2>{label}</h2><p className="section-tagline">{title}</p></div>{children&&<p>{children}</p>}</div>;
}

function About(){
 return <section className="about section"><div><p className="eyebrow">NOSSA HISTÓRIA</p><h2>Por trás da Nandices</h2><p className="section-tagline">Oi, eu sou a Nanda.</p><p>Maria Fernanda · Nandices Confeitaria</p></div><div><p>A Nandices nasceu da paixão pela confeitaria e da vontade de oferecer aquilo que eu mesma gosto de consumir.</p><p>Um bolo conquista pelo olhar, mas é o sabor que faz voltar. Por isso, cada ingrediente e receita é escolhido com cuidado.</p></div></section>;
}

function Cakes(){
 return <section className="section cakes"><Heading label="Bolos Artesanais" title="Celebrar tem um sabor especial.">Receitas equilibradas, recheios cheios de sabor e uma finalização que faz parte da experiência.</Heading><div className="cake-pricing"><strong>{money(CAKE.perKg)}/kg</strong><span>Peso mínimo: {number(CAKE.minKg)} kg</span></div><div className="cake-grid">{cakes.map((product,index)=><article key={product.id}><div className="cake-photo"><Photo product={product}/></div><div className="cake-number"><span>BOLO ARTESANAL</span><span>0{index+1}</span></div><h3>{product.name}</h3><ProductDescription text={product.description}/><WA className="text-link" event="whatsapp_bolo" product_name={product.name} product_category="bolo" cta_location="bolos" message={`Olá! Vim pelo site da Nandices e gostaria de consultar o bolo ${product.name}.`}>Consultar este bolo</WA></article>)}</div><CakeCalculator/><p className="cake-footnote">Nossos bolos não levam chantilly. Cada elemento deve contribuir para o sabor.</p></section>;
}

function HomeSweets(){
 const highlights=sweets.filter(product=>['brigadeiro-tradicional','beijinho','bicho-de-pe','pistache'].includes(product.id));
 return <section className="section sweets home-sweets"><Heading label="Doces & Brigadeiros" title="Pequenos. Inesquecíveis.">Uma seleção para começar. Conheça todos os 12 sabores no nosso catálogo.</Heading><div className="sweet-grid">{highlights.map(product=><ProductCard key={product.id} product={product}/>)}</div><a className="button all-sweets" href="/docinhos">Ver todos os docinhos <Arrow/></a></section>;
}

function Tasting(){
 return <section className="tasting" id="caixa-degustacao"><div className="tasting-photo"><img src="/images/products/degustacao/caixa-catalogo-azul.webp" loading="lazy" width="1448" height="1086" alt="Caixa Degustação Nandices com 12 brigadeiros variados"/></div><div className="tasting-copy"><p className="eyebrow">PROVE A COLEÇÃO</p><h2>Caixa Degustação</h2><p className="section-tagline">12 sabores. Uma descoberta.</p><p>Conheça todos os sabores da Nandices em uma caixa especial.</p><div className="tasting-price"><span>Caixa Degustação</span><strong>{money(TASTING.price)}</strong></div><small>12 unidades · encomende com antecedência mínima de 7 dias.</small><WA event="whatsapp_degustacao" cta_location="degustacao_home" product_name="Caixa Degustação" message="Olá! Vim pelo site da Nandices e gostaria de consultar a Caixa Degustação.">Consultar Caixa Degustação</WA></div></section>;
}

function Personalized(){
 return <section className="personal section"><div><p className="eyebrow">FEITO PARA O SEU EVENTO</p><h2>Doces Personalizados</h2><p className="section-tagline">Uma ideia sua. Um cuidado nosso.</p><figure className="personal-photo"><Photo product={personalizedExample}/><figcaption>Um exemplo de personalização feita pela Nandices.</figcaption></figure></div><div><p>Brigadeiros e outros doces, com tema, cores, decoração, apresentação e embalagem combinados com você.</p><div className="personal-rules"><h3>Para planejar</h3><p>Pedido mínimo de <strong>50 unidades</strong> e antecedência mínima de <strong>45 dias</strong>.</p></div><WA event="whatsapp_personalizado" cta_location="personalizados" message="Olá! Vim pelo site da Nandices e gostaria de solicitar doces personalizados. Minha ideia é:">Solicitar doces personalizados</WA></div></section>;
}

function Home(){
 return <><BrandHero/><Cakes/><HomeSweets/><OrderGuide/><Tasting/><Personalized/><About/><section className="contact"><p className="eyebrow">FALE COM A NANDA</p><h2>Ficou com alguma dúvida?</h2><p>Fale diretamente com a Nanda para confirmar sabores, quantidades, disponibilidade, doces personalizados, entrega e outros detalhes.</p><WA cta_location="contato" message="Olá! Vim pelo site da Nandices e gostaria de tirar uma dúvida.">Falar com a Nanda</WA><p><a href="https://www.instagram.com/nandices.confeitaria/" target="_blank" rel="noopener noreferrer" onClick={()=>track('instagram_click',{cta_location:'contato'})}>@nandices.confeitaria</a></p></section></>;
}

function App(){
 const path=window.location.pathname.replace(/\/$/,'')||'/';
 const [menu,setMenu]=useState(false);
 useEffect(()=>{const meta=routeMetadata[path]||routeMetadata['/'];document.title=meta.title;document.querySelector('meta[name="description"]')?.setAttribute('content',meta.description)},[path]);
 useEffect(()=>{const section=new URLSearchParams(window.location.search).get('section');if(path!=='/'||!['personalizados','degustacao'].includes(section))return;const behavior=matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';window.setTimeout(()=>{document.querySelector(section==='personalizados'?'.personal':'#caixa-degustacao')?.scrollIntoView({behavior,block:'start'});window.history.replaceState(null,'','/');},0)},[path]);
 const nav=[
  {href:'/',label:'Bolos',target:'.cakes'},
  {href:'/docinhos',label:'Docinhos',target:'#catalog-title'},
  {href:'/',label:'Caixa Degustação',target:'#caixa-degustacao',crossTarget:'/?section=degustacao'},
  {href:'/',label:'Personalizados',target:'.personal',crossTarget:'/?section=personalizados'},
  {href:'/frete',label:'Entrega e frete'}
 ];
 const navigateTo=item=>event=>{
  setMenu(false);
  if(path!==item.href&&item.crossTarget){event.preventDefault();window.location.assign(item.crossTarget);return;}
  if(path!==item.href||!item.target)return;
  event.preventDefault();
  document.querySelector(item.target)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 };
 const isCurrent=item=>path==='/docinhos'?item.label==='Docinhos':path==='/frete'?item.label==='Entrega e frete':item.label==='Bolos';
 const navLink=item=>path!==item.href&&item.crossTarget?item.crossTarget:item.href;
 return <><a className="skip" href="#conteudo">Pular para o conteúdo</a><header><a className="wordmark" href="/" aria-label="Nandices Confeitaria, início"><BrandName/><span>CONFEITARIA</span></a><nav id="navigation" className={menu?'open':''} aria-label="Navegação principal">{nav.map(item=><a key={item.label} href={navLink(item)} aria-current={isCurrent(item)?'page':undefined} onClick={navigateTo(item)}>{item.label}</a>)}<WA className="nav-whatsapp" cta_location="menu">Pedir pelo WhatsApp</WA></nav><WA className="button header-cta" cta_location="header"><span className="desktop-label">Pedir pelo WhatsApp</span><span className="mobile-label">Pedir</span></WA><button className="menu-button" aria-expanded={menu} aria-controls="navigation" onClick={()=>setMenu(!menu)}>{menu?'Fechar':'Menu'}</button></header><main id="conteudo">{path==='/docinhos'?<SweetsCatalog/>:path==='/frete'?<><section className="section page-intro"><p className="eyebrow">ENTREGA NO DF</p><h1>Consulte o frete</h1><p>Informe o CEP para consultar a estimativa de entrega.</p></section><Delivery/></>:path==='/'?<Home/>:<section className="section page-intro"><h1>Página não encontrada</h1><a className="button" href="/">Voltar ao início</a></section>}</main><footer><a href="/" className="wordmark"><BrandName/><span>CONFEITARIA</span></a><a href="https://www.instagram.com/nandices.confeitaria/" target="_blank" rel="noopener noreferrer">Instagram <Arrow/></a><span>© {new Date().getFullYear()} Nandices Confeitaria</span></footer></>;
}

createRoot(document.getElementById('root')).render(<App/>);
