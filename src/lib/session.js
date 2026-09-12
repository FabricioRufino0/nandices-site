import {QUANTITIES,CUPS,EVENTS} from '../data/commerce.js';
import {sweets} from '../data/catalog.js';
export function readSession(key,validate,fallback){
 try{const value=JSON.parse(sessionStorage.getItem(`nandices:v1:${key}`));return validate(value)?value:fallback}catch{return fallback}
}
export function saveSession(key,value){try{sessionStorage.setItem(`nandices:v1:${key}`,JSON.stringify(value))}catch{/* Storage may be unavailable; the form remains usable. */}}
export const validLots=value=>Array.isArray(value)&&QUANTITIES.includes(value.length*50)&&value.every(lot=>lot&&Object.keys(lot).every(k=>['flavorId','cup'].includes(k))&&CUPS.includes(lot.cup)&&(lot.flavorId===''||sweets.some(p=>p.id===lot.flavorId)));
export const validPlanner=value=>value&&EVENTS.some(e=>e.id===value.eventId)&&typeof value.guests==='string'&&(value.guests===''||(/^\d{1,6}$/.test(value.guests)&&Number(value.guests)>0));
