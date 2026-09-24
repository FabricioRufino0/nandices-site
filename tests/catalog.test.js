import {test} from 'node:test';
import assert from 'node:assert/strict';
import {estimateCake,estimateSweets,formatSweetsRange} from '../src/lib/planning.js';
import {sweets} from '../src/data/catalog.js';
import {routeMetadata} from '../src/data/routes.js';
import {cakeEstimateMessage,sweetsEstimateMessage} from '../src/lib/orders.js';
import {readFile} from 'node:fs/promises';

test('catálogo mantém as três categorias e os 12 docinhos simultaneamente',()=>{
 assert.equal(sweets.length,12);
 assert.deepEqual(sweets.reduce((total,item)=>({...total,[item.category]:(total[item.category]||0)+1}),{}),{Tradicional:6,Gourmet:5,Pistache:1});
 assert.deepEqual(Object.keys(routeMetadata),['/','/docinhos','/estimativa','/caixa-degustacao','/personalizados','/frete']);
});
test('estimativa de docinhos usa faixas comerciais de 50',()=>{
 assert.deepEqual(estimateSweets('aniversario',40),{event:'Aniversário',guests:40,min:150,max:200});
 assert.throws(()=>estimateSweets('aniversario',0));assert.throws(()=>estimateSweets('aniversario',2.5));
 const message=sweetsEstimateMessage(estimateSweets('aniversario',40));assert.match(message,/150 a 200/);assert.doesNotMatch(message,/pedido é/i);
 assert.equal(formatSweetsRange({min:100,max:100}),'100');
 assert.equal(formatSweetsRange({min:150,max:200}),'150 a 200');
});
test('estimativa de bolo respeita mínimo e preço em centavos',()=>{
 for(const [guests,kg,cents] of [[5,1.5,13500],[10,1.5,13500],[20,2,18000],[23,2.3,20700],[25,2.5,22500],[35,3.5,31500]])assert.deepEqual(estimateCake(guests),{guests,kg,estimatedCents:cents});
 assert.throws(()=>estimateCake(0));assert.throws(()=>estimateCake(2.5));
 assert.match(cakeEstimateMessage(estimateCake(25)),/R\$ 225,00/);
});
test('CTAs e apresentação das forminhas mantêm a navegação interna sem hash público',async()=>{
 const hero=await readFile('src/components/BrandHero.jsx','utf8');
 const catalog=await readFile('src/components/SweetsCatalog.jsx','utf8');
 assert.match(hero,/scrollTo\(docinhos\?'#catalog-title':'.cakes'\)/);
 assert.match(hero,/Ver nossos docinhos/);assert.match(hero,/href="\/">Ver nossos bolos/);assert.match(hero,/Ver catálogo/);
 assert.doesNotMatch(hero,/home-explore|Explore a Nandices|scrollTo\('#caixa-degustacao'\)/);
 assert.match(catalog,/Forminhas para combinar com cada detalhe/);
 assert.match(catalog,/Nosso catálogo de docinhos/);assert.match(catalog,/IntersectionObserver/);assert.match(catalog,/catalog-rail/);
 assert.match(catalog,/Branquinho, Pistache e Chocolate/);
 assert.doesNotMatch(catalog,/selectedCup|sessionStorage|Selecionar/);
});
test('pedidos personalizados mantêm foto e contato direto pelo WhatsApp',async()=>{
 const [styles,whatsapp]=await Promise.all([
  readFile('src/style.css','utf8'),
  readFile('src/components/WhatsApp.jsx','utf8')
 ]);
 assert.doesNotMatch(styles,/\.personal:not\(\.personalized-catalog\) \.personal-photo\{display:none\}/);
 assert.doesNotMatch(whatsapp,/cta_location==='personalizados'/);
 assert.match(whatsapp,/createWhatsAppLink\(message\)/);
});
