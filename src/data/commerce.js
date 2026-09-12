export const LOT_SIZE = 50;
export const MAX_SWEETS = 500;
export const QUANTITIES = Array.from({length:MAX_SWEETS / LOT_SIZE},(_,i)=>(i+1)*LOT_SIZE);
export const CUPS = ['Branquinho','Pistache','Chocolate'];
export const PRICES = {Tradicional:9500,Gourmet:11000,Pistache:13500}; // centavos por lote
export const CAKE = {perKg:9000,minKg:1.5};
export const TASTING = {price:6500,units:12,leadDays:7};
export const money = cents => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
export const number = value => new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(value);
export const EVENTS = [
 {id:'aniversario',name:'Aniversário',min:3,max:5},
 {id:'casamento',name:'Casamento',min:6,max:8},
 {id:'corporativo',name:'Evento corporativo',min:2,max:4},
 {id:'formatura',name:'Formatura',min:3,max:5},
 {id:'infantil',name:'Festa infantil',min:4,max:6},
 {id:'batizado',name:'Batizado / Chá de bebê',min:4,max:6},
 {id:'noivado',name:'Noivado / Chá de panela',min:4,max:6},
 {id:'confraternizacao',name:'Confraternização',min:3,max:5}
];
