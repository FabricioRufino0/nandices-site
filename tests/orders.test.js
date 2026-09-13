import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWhatsAppLink,configurationMessage,plannerMessage,deliveryMessage} from '../src/lib/orders.js';
import {resizeLots,summarizeLots,planEvent} from '../src/lib/planning.js';
import {QUANTITIES,CUPS} from '../src/data/commerce.js';
import {sweets,cakes} from '../src/data/catalog.js';
const lot=(flavorId,cup='Branquinho')=>({flavorId,cup});
test('catálogo confirmado: 4 bolos, 12 doces e Cajuzinho tradicional',()=>{assert.equal(cakes.length,4);assert.equal(sweets.length,12);assert.equal(sweets.find(p=>p.id==='cajuzinho').category,'Tradicional');assert.ok(sweets.every(p=>p.description));assert.equal(sweets.filter(p=>p.featured).length,3);const cake=cakes.find(p=>p.id==='doce-de-leite-amendoim');assert.equal(cake.name,'Doce de Leite com Amendoim Crocante');for(const ingredient of ['pão de ló','molhada no leite','doce de leite Itambé','amendoim caramelizado','brigadeiro de churros'])assert.ok(cake.description.includes(ingredient))});
for(const quantity of QUANTITIES)test(`${quantity} doces: lotes, repetição, categorias e forminhas`,()=>{
 const lots=resizeLots([],quantity).map((_,i)=>lot(['ninho','churros','pistache'][i%3],CUPS[quantity/50%3]));
 const result=summarizeLots(lots);
 assert.equal(result.quantity,quantity);assert.ok(result.complete);
 const expected=lots.reduce((sum,_,i)=>sum+[9500,11000,13500][i%3],0);
 assert.equal(result.total,expected);assert.ok(result.groups.length<=quantity/50);
 assert.equal(result.groups.reduce((sum,g)=>sum+g.quantity,0),quantity);
 assert.ok(result.groups.every(g=>g.quantity>=50));
 assert.equal(summarizeLots(lots.map(()=>lot('ninho'))).groups.length,1);
 assert.equal(summarizeLots(lots.map(()=>lot('ninho'))).total,quantity/50*9500);
 for(const [flavorId,price] of [['ninho',9500],['churros',11000],['pistache',13500]])assert.equal(summarizeLots(lots.map(()=>lot(flavorId))).total,price*quantity/50);
});
test('misturas calculadas em centavos: 205, 300 e 315 reais',()=>{
 assert.equal(summarizeLots([lot('ninho'),lot('churros')]).total,20500);
 assert.equal(summarizeLots([lot('ninho'),lot('ninho'),lot('churros')]).total,30000);
 const result=summarizeLots([lot('ninho-com-nutella','Pistache'),lot('ninho-com-nutella','Chocolate'),lot('brigadeiro-tradicional')]);
 assert.equal(result.total,31500);assert.equal(result.groups[0].quantity,100);assert.deepEqual(result.groups[0].cups,[{name:'Pistache',quantity:50},{name:'Chocolate',quantity:50}]);
});
test('agrupa forminhas iguais sem misturar sabores',()=>{const s=summarizeLots([lot('ninho','Pistache'),lot('ninho','Pistache'),lot('churros','Pistache')]);assert.equal(s.groups[0].cups[0].quantity,100);assert.equal(s.groups[1].cups[0].quantity,50)});
test('reduzir preserva somente os primeiros lotes; ampliar cria lotes vazios',()=>{const initial=[lot('ninho','Chocolate'),lot('churros','Pistache')];assert.deepEqual(resizeLots(initial,50),[initial[0]]);assert.equal(resizeLots(initial,150)[2].flavorId,'');assert.deepEqual(initial[1],lot('churros','Pistache'))});
test('configuração incompleta ou forminha inválida não gera pedido',()=>{for(const lots of [resizeLots([],50),[lot('ninho','inexistente')],[lot('fake')]]){assert.equal(summarizeLots(lots).complete,false);assert.throws(()=>configurationMessage(lots))}for(const q of [0,25,550,75,NaN])assert.throws(()=>resizeLots([],q))});
test('mensagem WhatsApp mantém nomes, distribuição, forminha única e total',()=>{
 const message=configurationMessage([lot('ninho-com-nutella','Chocolate'),lot('ninho-com-nutella','Chocolate'),lot('brigadeiro-tradicional','Chocolate')]);
 for(const expected of ['Quantidade: 150 doces','100 Ninho com Nutella','Forminha: Chocolate','50 Brigadeiro Tradicional','315,00','confirmar disponibilidade'])assert.ok(message.includes(expected),expected);
 assert.doesNotMatch(message,/frete|cep|retirada/i);
 assert.throws(()=>configurationMessage([lot('ninho','Pistache'),lot('ninho','Chocolate')]));
 const url=new URL(createWhatsAppLink(message));assert.equal(url.pathname,'/5561993359461');assert.equal(url.searchParams.get('text'),message);
});
const references=[['aniversario',3,5],['casamento',6,8],['corporativo',2,4],['formatura',3,5],['infantil',4,6],['batizado',4,6],['noivado',4,6],['confraternizacao',3,5]];
for(const [id,min,max] of references)test(`planejador ${id}: referências e arredondamento`,()=>{
 for(const guests of [1,10,20,40,50,67,200,1000]){
  const result=planEvent(id,guests);
  assert.equal(result.cakeKg,guests/10);assert.equal(result.rawMin,guests*min);assert.equal(result.rawMax,guests*max);
  assert.equal(result.min,Math.ceil(guests*min/50)*50);assert.equal(result.max,Math.ceil(guests*max/50)*50);
  for(const q of [result.min,result.max])if(q<=500)assert.equal(resizeLots([],q).length,q/50);
 }
});
test('exemplo 40 convidados e entradas inválidas',()=>{assert.deepEqual(planEvent('aniversario',40),{event:'Aniversário',guests:40,cakeKg:4,rawMin:120,rawMax:200,min:150,max:200});for(const n of [0,-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER])assert.throws(()=>planEvent('aniversario',n));assert.throws(()=>planEvent('fake',40))});
test('mensagens do planejador e entrega mantêm contexto',()=>{assert.match(plannerMessage(planEvent('aniversario',40)),/150 a 200/);const text=deliveryMessage('delivery',{cep:'70000-000'},{distanceKm:12,estimatedCents:1200});assert.match(text,/70000-000/);assert.match(text,/12,00/);assert.match(text,/confirmar/);assert.doesNotMatch(deliveryMessage('pickup',{},null),/undefined/)});
