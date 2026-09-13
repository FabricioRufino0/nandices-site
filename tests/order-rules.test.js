import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyOrder,resizeOrder,toggleOrderFlavor,summarizeOrder,validOrderDraft} from '../src/lib/planning.js';
import {finalOrderMessage} from '../src/lib/orders.js';
import {sweets} from '../src/data/catalog.js';
import {CAKE,PRICES} from '../src/data/commerce.js';

for(const [quantity,count,cup] of [[50,1,'Branquinho'],[100,2,'Pistache'],[150,3,'Chocolate'],[200,2,'Chocolate'],[500,10,'Branquinho']]){
 test(`${quantity} doces, ${count} sabores, forminha ${cup}`,()=>{
  let order=resizeOrder(emptyOrder(),quantity);
  for(const p of sweets.slice(0,count))order=toggleOrderFlavor(order,p.id);
  order.cup=cup;
  const summary=summarizeOrder(order);
  assert.ok(summary.complete);assert.equal(summary.groups.length,count);
  assert.equal(summary.allocated,quantity);assert.ok(summary.groups.every(f=>f.quantity>=50&&f.quantity%50===0));
  assert.equal(summary.total,summary.groups.reduce((sum,f)=>sum+f.quantity/50*PRICES[f.category],0));
  const message=finalOrderMessage(order);assert.match(message,new RegExp(`Forminha: ${cup}`));assert.doesNotMatch(message,/frete|cep|undefined/i);
 });
}
test('redução preserva escolhas e exige corrigir excedentes antes de finalizar',()=>{
 let order=resizeOrder(emptyOrder(),200);
 for(const p of sweets.slice(0,4))order=toggleOrderFlavor(order,p.id);
 order.cup='Chocolate';const smaller=resizeOrder(order,100);
 assert.equal(smaller.flavors.length,4);assert.ok(smaller.flavors.every(f=>f.quantity===0));assert.throws(()=>finalOrderMessage(smaller));
 let corrected=toggleOrderFlavor(smaller,sweets[0].id);corrected=toggleOrderFlavor(corrected,sweets[1].id);
 assert.ok(summarizeOrder(corrected).complete);assert.deepEqual(corrected.flavors.map(f=>f.id),sweets.slice(2,4).map(f=>f.id));
});
test('validação central recusa frações, duplicados, ausência de forminha e somas incorretas',()=>{
 const order={quantity:100,cup:'Chocolate',flavors:[{id:'ninho',quantity:50},{id:'pistache',quantity:50}]};
 for(const invalid of [
  {...order,cup:''},{...order,cup:'Rosé'},{...order,quantity:75},
  {...order,flavors:[{id:'ninho',quantity:25},{id:'pistache',quantity:75}]},
  {...order,flavors:[{id:'ninho',quantity:50}]},
  {...order,flavors:[{id:'ninho',quantity:100},{id:'pistache',quantity:50}]},
  {...order,flavors:[{id:'ninho',quantity:50},{id:'ninho',quantity:50}]},
  {...order,flavors:[{id:'fake',quantity:100}]},
 ]){assert.equal(summarizeOrder(invalid).complete,false);assert.throws(()=>finalOrderMessage(invalid))}
 assert.ok(validOrderDraft(order));assert.equal(CAKE.perKg,9000);assert.equal(CAKE.minKg,1.5);
});
