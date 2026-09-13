import {sweets} from '../data/catalog.js';
import {LOT_SIZE,QUANTITIES,CUPS,PRICES,EVENTS} from '../data/commerce.js';
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
 return {quantity:lots.length*LOT_SIZE,groups,total,filled,complete:filled===lots.length&&new Set(lots.map(lot=>lot.cup)).size===1};
}
export function planEvent(eventId,guests){
 const event=EVENTS.find(e=>e.id===eventId);
 if(!event||!Number.isSafeInteger(guests)||guests<1||!Number.isSafeInteger(guests*event.max))throw new RangeError('Informe uma quantidade inteira de convidados maior que zero.');
 const rawMin=guests*event.min,rawMax=guests*event.max;
 const round=value=>Math.max(LOT_SIZE,Math.ceil(value/LOT_SIZE)*LOT_SIZE);
 return {event:event.name,guests,cakeKg:guests/10,rawMin,rawMax,min:round(rawMin),max:round(rawMax)};
}

// Draft selections may exceed capacity, but a final order must pass summarizeOrder.
export const emptyOrder=()=>({quantity:50,flavors:[],cup:''});
export function validOrderDraft(order){
 return !!order&&QUANTITIES.includes(order.quantity)&&(order.cup===''||CUPS.includes(order.cup))&&
  Array.isArray(order.flavors)&&order.flavors.length<=sweets.length&&
  new Set(order.flavors.map(f=>f?.id)).size===order.flavors.length&&
  order.flavors.every(f=>f&&sweets.some(p=>p.id===f.id)&&Number.isInteger(f.quantity)&&f.quantity>=0&&f.quantity<=500&&f.quantity%LOT_SIZE===0);
}
export function resizeOrder(order,quantity){
 if(!validOrderDraft(order)||!QUANTITIES.includes(quantity))throw new RangeError('Quantidade inválida');
 const next={...order,quantity,flavors:order.flavors.map(f=>({...f}))};
 if(next.flavors.length>quantity/LOT_SIZE){next.flavors=next.flavors.map(f=>({...f,quantity:0}));return next}
 if(!next.flavors.length)return next;
 let total=next.flavors.reduce((sum,f)=>sum+f.quantity,0);
 if(total>quantity||next.flavors.some(f=>f.quantity===0)){
  next.flavors=next.flavors.map(f=>({...f,quantity:LOT_SIZE}));total=next.flavors.length*LOT_SIZE;
 }
 next.flavors[0].quantity+=quantity-total;
 return next;
}
export function toggleOrderFlavor(order,id){
 if(!validOrderDraft(order)||!sweets.some(p=>p.id===id))throw new RangeError('Sabor inválido');
 const flavors=order.flavors.some(f=>f.id===id)?order.flavors.filter(f=>f.id!==id):[...order.flavors,{id,quantity:0}];
 return resizeOrder({...order,flavors},order.quantity);
}
export function summarizeOrder(order){
 if(!validOrderDraft(order))return {complete:false,errors:['Revise os dados da encomenda.'],groups:[],total:0,allocated:0};
 const groups=order.flavors.map(f=>({...sweets.find(p=>p.id===f.id),quantity:f.quantity}));
 const allocated=groups.reduce((sum,f)=>sum+f.quantity,0),errors=[];
 if(!groups.length)errors.push('Escolha pelo menos um sabor.');
 if(groups.length>order.quantity/LOT_SIZE)errors.push(`Para ${order.quantity} doces, escolha até ${order.quantity/LOT_SIZE} sabores. Remova os excedentes ou aumente a quantidade.`);
 if(groups.some(f=>f.quantity<LOT_SIZE))errors.push('Cada sabor precisa de pelo menos 50 unidades.');
 if(allocated!==order.quantity)errors.push(`Distribua exatamente ${order.quantity} doces entre os sabores (atual: ${allocated}).`);
 if(!CUPS.includes(order.cup))errors.push('Escolha uma forminha para todo o pedido.');
 return {groups,allocated,total:groups.reduce((sum,f)=>sum+f.quantity/LOT_SIZE*PRICES[f.category],0),errors,complete:errors.length===0};
}
