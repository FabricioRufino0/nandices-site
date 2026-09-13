import {readSession,saveSession,validLots} from './lib/session.js';
import React, {useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {sweets,cakes,personalizedExample} from './data/catalog';
import {track} from './lib/orders';
import {CAKE,TASTING,money,number} from './data/commerce.js';
import {resizeOrder,emptyOrder,validOrderDraft,toggleOrderFlavor} from './lib/planning.js';
import WA from './components/WhatsApp.jsx';
import Configurator from './components/Configurator.jsx';
import Planner from './components/Planner.jsx';
import BrandName from './components/BrandName.jsx';
import Delivery from './components/Delivery.jsx';
import SweetsCatalog from './components/SweetsCatalog.jsx';
import BrandHero from './components/BrandHero.jsx';
import ProductCard,{Photo,ProductDescription} from './components/ProductCard.jsx';
import {routeMetadata} from './data/routes.js';



import imageMetadata from './data/imageMetadata.json';
import './style.css';
import './refinements.css';
import './pages.css';
const Arrow = () => <span aria-hidden="true">↗</span>;
function Heading({label,title,children}) {return <div className="section-heading"><div><h2>{label}</h2><p className="section-tagline">{title}</p></div>{children && <p>{children}</p>}</div>}
function loadOrder(){
 const saved=readSession('order-v2',validOrderDraft,null);
 if(saved)return saved;
 const lots=readSession('lots',validLots,null);
 if(!lots)return emptyOrder();
 const flavors=[];
 for(const lot of lots){if(!lot.flavorId)continue;let flavor=flavors.find(f=>f.id===lot.flavorId);if(!flavor){flavor={id:lot.flavorId,quantity:0};flavors.push(flavor)}flavor.quantity+=50}
 return {quantity:lots.length*50,flavors,cup:''};
}
function App(){
 const path=window.location.pathname.replace(/\/$/,'')||'/';
 const isHome=path==='/';
 const [menu,setMenu]=useState(false),[order,updateOrder]=useState(loadOrder),[plannerOpen,setPlannerOpen]=useState(location.hash==='#quanto-pedir');
 function setOrder(change){updateOrder(previous=>{const next=typeof change==='function'?change(previous):change;saveSession('order-v2',next);return next})}
 function toggleFlavor(id){setOrder(previous=>toggleOrderFlavor(previous,id))}
 useEffect(()=>{
  const meta=routeMetadata[path]||routeMetadata['/'];
  document.title=meta.title;
  for(const [selector,value] of [['meta[name="description"]',meta.description],['meta[property="og:title"]',meta.title],['meta[property="og:description"]',meta.description]])document.querySelector(selector)?.setAttribute('content',value);
  const canonical=document.querySelector('link[rel="canonical"]');
  if(canonical){const url=new URL(path,canonical.href).href;canonical.href=url;document.querySelector('meta[property="og:url"]')?.setAttribute('content',url)}
 },[path]);
 useEffect(()=>{
  const destinations={'#configurador':'/encomenda#configurador','#quanto-pedir':'/encomenda#quanto-pedir','#entrega':'/frete'};
  function revealHash(){
   if(isHome&&destinations[location.hash]){location.replace(destinations[location.hash]);return}
   if(location.hash==='#quanto-pedir')setPlannerOpen(true);
   if(location.hash)requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant',block:'start'}));
  }
  let active=true;
  document.fonts.ready.then(()=>{if(active)revealHash()});
  window.addEventListener('hashchange',revealHash);
  return()=>{active=false;window.removeEventListener('hashchange',revealHash)};
 },[isHome]);
 function configure(quantity){setOrder(previous=>resizeOrder(previous,quantity));requestAnimationFrame(()=>{document.getElementById('config-title')?.focus({preventScroll:true});document.getElementById('configurador')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})})}
 return <><a className="skip" href="#conteudo">Pular para o conteúdo</a><header><a className="wordmark" href="/" aria-label="Nandices Confeitaria, início"><BrandName/><span>CONFEITARIA</span></a><nav id="navigation" className={menu?'open':''} aria-label="Navegação principal">{[['/','Início'],['/docinhos','Docinhos'],['/encomenda','Encomenda'],['/frete','Frete']].map(([href,label])=><a key={href} href={href} aria-current={path===href?'page':undefined} onClick={()=>setMenu(false)}>{label}</a>)}<WA className="nav-whatsapp" cta_location="menu">WhatsApp</WA></nav><WA className="button header-cta" cta_location="header"><span className="desktop-label">Pedir pelo WhatsApp</span><span className="mobile-label">Pedir</span></WA><a className="header-instagram" href="https://www.instagram.com/nandices.confeitaria/" target="_blank" rel="noopener noreferrer" aria-label="Instagram @nandices.confeitaria" onClick={()=>track('instagram_click',{cta_location:'header'})}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="currentColor" stroke="none"/></svg></a><button className="menu-button" aria-expanded={menu} aria-controls="navigation" onClick={()=>setMenu(!menu)} onKeyDown={e=>{if(e.key==='Escape')setMenu(false)}}>{menu?'Fechar':'Menu'}</button></header><main id="conteudo">{path==='/docinhos'?<SweetsCatalog order={order} onToggle={toggleFlavor}/>:path==='/encomenda'?<><section className="section page-intro"><p className="eyebrow">SUA ENCOMENDA</p><h1>Do seu jeito.</h1><p>Planeje seu evento, escolha os sabores e revise os detalhes com a Nanda.</p></section><Planner onConfigure={configure} open={plannerOpen} onToggle={()=>setPlannerOpen(value=>!value)}/><Configurator order={order} setOrder={setOrder}/></>:path==='/frete'?<><section className="section page-intro"><p className="eyebrow">ENTREGA NO DF</p><h1>Consulte o frete</h1><p>Informe o CEP para consultar a estimativa de entrega. Esta consulta é independente da sua encomenda.</p></section><Delivery/></>:!isHome?<section className="section page-intro"><h1>Página não encontrada</h1><a className="button" href="/">Voltar ao início</a></section>:<><BrandHero/>
<section id="sobre" className="about section"><div><h2>Por trás da Nandices</h2><p className="section-tagline">Oi, eu sou a Nanda.</p><p className="nanda-name">Maria Fernanda · Nandices Confeitaria</p></div><div><p>A Nandices nasceu da minha paixão pela confeitaria e da vontade de oferecer aquilo que eu mesma gosto de consumir.</p><p>O nome vem de Nanda, um apelido que sempre me acompanhou, trazendo para a marca proximidade e personalidade.</p><p>Acreditamos que confeitaria vai além da estética: um bolo pode conquistar pelo olhar, mas é o sabor que faz voltar. Por isso, escolhemos cada ingrediente com cuidado e buscamos receitas equilibradas, com sabores marcantes e na medida certa.</p></div></section>
<section id="bolos" className="section cakes"><Heading label="Bolos Artesanais" title="Celebrar tem um sabor especial.">Receitas equilibradas, recheios cheios de sabor e uma finalização que faz parte da experiência.</Heading><div className="cake-pricing"><strong>{money(CAKE.perKg)}/kg</strong><span>Peso mínimo: {number(CAKE.minKg)} kg</span></div><div className="cake-grid">{cakes.map((p,i)=><article key={p.id}><div className="cake-photo"><Photo product={p}/></div><div className="cake-number"><span>BOLO ARTESANAL</span><span>0{i+1}</span></div><h3>{p.name}</h3><ProductDescription text={p.description}/><WA className="text-link" event="whatsapp_bolo" product_name={p.name} product_category="bolo" cta_location="bolos" message={`Olá! Vim pelo site da Nandices e gostaria de consultar o bolo ${p.name}.`}>Consultar este bolo</WA></article>)}</div><p className="cake-footnote">Nossos bolos não levam chantilly. Cada elemento deve contribuir para o sabor.</p></section><section id="doces" className="section sweets home-sweets"><Heading label="Doces & Brigadeiros" title="Pequenos. Inesquecíveis.">Uma seleção para começar. Conheça todos os 12 sabores no nosso catálogo.</Heading><div className="sweet-grid">{sweets.filter(p=>['brigadeiro-tradicional','beijinho','bicho-de-pe','pistache'].includes(p.id)).map(p=><ProductCard key={p.id} product={p}/>)}</div><a className="button all-sweets" href="/docinhos">Ver todos os docinhos <Arrow/></a></section><section className="section order-teaser"><div><p className="eyebrow">DO SEU JEITO</p><h2>Monte sua encomenda</h2><p>Escolha a quantidade, seus sabores favoritos e a forminha que combina com sua ocasião.</p></div><a className="button" href="/encomenda">Montar minha encomenda <Arrow/></a></section><section className="tasting" id="degustacao"><div className="tasting-photo"><img src="/images/products/degustacao/caixa-catalogo-azul.webp" loading="lazy" width="1448" height="1086" alt="Caixa Degustação Nandices com 12 brigadeiros variados"/></div><div className="tasting-copy"><h2>Caixa Degustação</h2><p className="section-tagline">12 sabores. Uma descoberta.</p><p>Conheça todos os sabores da Nandices. Uma caixa com 12 brigadeiros, sendo uma unidade de cada sabor disponível em nosso cardápio.</p><div className="tasting-price">Caixa Degustação <strong>{money(TASTING.price)}</strong></div><WA event="whatsapp_degustacao" cta_location="degustacao" product_name="Caixa Degustação" message="Olá! Vim pelo site da Nandices e gostaria de pedir uma Caixa Degustação.">Pedir Caixa Degustação</WA><small>Tamanho único. Encomende com {TASTING.leadDays} dias de antecedência.</small></div></section><section className="personal section" id="personalizados"><div><h2>Bolos e doces personalizados.</h2><p className="section-tagline">Uma ideia sua. Um cuidado nosso.</p><figure className="personal-photo"><Photo product={personalizedExample}/><figcaption>Um exemplo de personalização feita pela Nandices.</figcaption></figure></div><div><p>Bolos, brigadeiros e outros doces. Cores, tema, decoração e apresentação: vamos conversar sobre uma encomenda com a sua personalidade. Para aniversários, casamentos, eventos empresariais e outras ocasiões.</p><div className="personal-rules"><h3>Doces personalizados</h3><p>Pedido mínimo de 50 unidades e antecedência mínima de 45 dias. Tema, cores, decoração, apresentação e embalagem são combinados previamente.</p></div><WA event="whatsapp_personalizado" cta_location="personalizados" message="Olá! Vim pelo site da Nandices e gostaria de solicitar uma encomenda personalizada. Minha ideia é:">Solicitar personalizado</WA></div></section><section className="contact" id="contato"><p className="eyebrow">FALE COM A NANDA</p><h2>Ficou com alguma dúvida?</h2><p>Fale diretamente com a Nanda para confirmar sabores, quantidades, disponibilidade, personalizados, entrega e outros detalhes.</p><WA cta_location="contato" message="Olá! Vim pelo site da Nandices e gostaria de tirar uma dúvida sobre uma encomenda.">Falar com a Nanda</WA><p><a href="https://www.instagram.com/nandices.confeitaria/" target="_blank" rel="noopener noreferrer" onClick={()=>track('instagram_click',{cta_location:'contato'})}>@nandices.confeitaria</a></p></section></>}</main><footer><a href="/" className="wordmark"><BrandName/><span>CONFEITARIA</span></a><a href="https://www.instagram.com/nandices.confeitaria/" target="_blank" rel="noopener noreferrer" onClick={()=>track('instagram_click',{cta_location:'footer'})}>Instagram <Arrow/></a><span>© {new Date().getFullYear()} Nandices Confeitaria</span></footer></>};
createRoot(document.getElementById('root')).render(<App/>);


