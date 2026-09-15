import {money, number} from '../data/commerce.js';
import {forwardAnalytics} from './analytics.js';
import {formatSweetsRange} from './planning.js';
export const PHONE = '5561993359461';
export const createWhatsAppLink = message => `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
export const orderMessage = 'Olá! Vim pelo site da Nandices e gostaria de consultar uma encomenda.';
export const sweetsEstimateMessage = value => `Olá! Vim pela calculadora do site da Nandices. Para ${value.guests} convidados em ${value.event}, a calculadora indicou aproximadamente ${formatSweetsRange(value)} docinhos. Gostaria de confirmar disponibilidade, quantidade final e os detalhes.`;
export const cakeEstimateMessage = value => `Olá! Vim pela calculadora do site da Nandices. Para ${value.guests} convidados, ela indicou aproximadamente ${number(value.kg)} kg de bolo, com estimativa de ${money(value.estimatedCents)}. Gostaria de confirmar disponibilidade, peso final, valor final e os detalhes.`;
export function deliveryMessage(mode,address,quote){if(mode==='pickup')return 'Olá! Vim pelo site da Nandices e gostaria de combinar a retirada de uma encomenda no Condomínio RK — Sobradinho/DF.';return `Olá! Vim pela seção de entrega do site da Nandices e gostaria de consultar uma entrega para o CEP ${address.cep||'informado no site'}.\n${quote?`\nFrete estimado: ${money(quote.estimatedCents)}\nDistância aproximada de ida: ${number(quote.distanceKm)} km\n`:''}\nGostaria de confirmar o frete, a disponibilidade e os demais detalhes.`;}
export function track(event,data={}){if(typeof window==='undefined')return;window.dataLayer=window.dataLayer||[];window.dataLayer.push({event,...data});forwardAnalytics(event,data);}
