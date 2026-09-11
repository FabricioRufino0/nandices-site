import {summarizeLots} from './planning.js';
import {money,number} from '../data/commerce.js';
export const PHONE = '5561993359461';
export const createWhatsAppLink = message => `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
export const orderMessage = 'Olá! Vim pelo site da Nandices e gostaria de fazer uma encomenda.';
export function configurationMessage(lots){
 const summary=summarizeLots(lots);
 if(!summary.complete)throw new Error('Preencha todos os lotes antes de consultar.');
 const lines=summary.groups.map(g=>`${g.quantity} ${g.name}\n${g.cups.map(c=>`- ${c.quantity} com forminha ${c.name}`).join('\n')}`);
 return `Olá! Vim pelo site da Nandices e gostaria de consultar este pedido:\n\nQuantidade: ${summary.quantity} doces\n\n${lines.join('\n\n')}\n\nValor calculado dos doces: ${money(summary.total)}\nFrete não incluído.\n\nGostaria de confirmar disponibilidade e os demais detalhes.`;
}
export const plannerMessage = p => `Olá! Vim pelo planejador do site da Nandices e gostaria de consultar uma encomenda para ${p.event}, com ${p.guests} convidados.\n\nEstimativa de bolo: ${number(p.cakeKg)} kg\nEstimativa de doces: ${p.min===p.max?p.min:`${p.min} a ${p.max}`} unidades\n\nGostaria de confirmar as quantidades, a disponibilidade e os demais detalhes.`;
export function deliveryMessage(mode,address,quote){
 if(mode==='pickup')return 'Olá! Vim pelo site da Nandices e gostaria de combinar a retirada de uma encomenda no Condomínio RK — Sobradinho/DF.';
 const destination=[address.address,address.number&&`nº ${address.number}`,address.complement].filter(Boolean).join(', ');
 return `Olá! Vim pela seção de entrega do site da Nandices e gostaria de consultar uma entrega${destination?` para: ${destination}`:'.'}\n${quote?`\nFrete estimado: ${money(quote.estimatedCents)}\nDistância aproximada de ida: ${number(quote.distanceKm)} km\n`:''}\nGostaria de confirmar o frete, a disponibilidade e os demais detalhes.`;
}
export function track(event, data = {}) {
 window.dataLayer = window.dataLayer || [];
 window.dataLayer.push({ event, ...data });
}
