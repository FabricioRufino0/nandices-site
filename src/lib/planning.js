import {sweets} from '../data/catalog.js';
import {LOT_SIZE,QUANTITIES,CUPS,PRICES,EVENTS,CAKE} from '../data/commerce.js';
export function resizeLots(lots,quantity){
 if(!QUANTITIES.includes(quantity))throw new RangeError('Quantidade inválida');
 return Array.from({length:quantity/LOT_SIZE},(_,i)=>lots[i]?{...lots[i]}:{flavorId:'',cup:CUPS[0]});
}
export function summarizeLots(lots){
 const groups=[];let total=0;let filled=0;
 if(!QUANTITIES.includes(lots.length*LOT_SIZE))throw new RangeError('Quantidade inválida');
 for(const lot of lots){
  const product=sweets.find(p=>p.id===lot.flavorId);
  if(!product||!CUPS.includes(lot.cup))continue;
  filled++;total+=PRICES[product.category];
  let group=groups.find(g=>g.id===product.id);
  if(!group){group={id:product.id,name:product.name,category:product.category,quantity:0,cups:[]};groups.push(group)}
  group.quantity+=LOT_SIZE;
  let cup=group.cups.find(c=>c.name===lot.cup);
  if(!cup){cup={name:lot.cup,quantity:0};group.cups.push(cup)}
  cup.quantity+=LOT_SIZE;
 }
 return {quantity:lots.length*LOT_SIZE,groups,total,filled,complete:filled===lots.length};
}
export function planEvent(eventId,guests){
 const event=EVENTS.find(e=>e.id===eventId);
 if(!event||!Number.isSafeInteger(guests)||guests<1||!Number.isSafeInteger(guests*event.max))throw new RangeError('Informe uma quantidade inteira de convidados maior que zero.');
 const rawMin=guests*event.min,rawMax=guests*event.max;
 const round=value=>Math.max(LOT_SIZE,Math.ceil(value/LOT_SIZE)*LOT_SIZE);
 return {event:event.name,guests,cakeKg:Math.max(CAKE.minKg,guests/10),rawMin,rawMax,min:round(rawMin),max:round(rawMax)};
}
