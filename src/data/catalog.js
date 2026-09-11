import {PRICES} from './commerce.js';
const entries = [
 ['brigadeiro-tradicional','Brigadeiro Tradicional','Tradicional',true,'Cacau 50%, finalizado com granulado crocante Campi.'],
 ['beijinho','Beijinho','Tradicional',false,'Massa com coco, boleado no próprio coco e finalizado com pitanga de Leite Ninho.'],
 ['ninho','Ninho','Tradicional',false,'Leite Ninho, boleado no próprio Leite Ninho.'],
 ['casadinho','Casadinho','Tradicional',false,'Brigadeiro tradicional + brigadeiro de Ninho.'],
 ['bicho-de-pe','Bicho de Pé','Tradicional',false,'Nesquik, boleado no Leite Ninho.'],
 ['churros','Churros','Gourmet',true,'Doce de leite Itambé e canela, finalizado com pitanga de doce de leite Itambé.'],
 ['ferrero-rocher','Ferrero Rocher','Gourmet',false,'Brigadeiro tradicional, boleado no amendoim xerém e finalizado com pitanga de Nutella.'],
 ['maracuja','Maracujá','Gourmet',false,'Redução caseira de maracujá feita com a própria fruta, finalizado com pitanga de Leite Ninho e geleia caseira de maracujá.'],
 ['ninho-com-nutella','Ninho com Nutella','Gourmet',true,'Brigadeiro de Ninho, boleado no Leite Ninho e finalizado com pitanga de Nutella.'],
 ['creme-brulee','Crème Brûlée','Gourmet',false,'Essência de baunilha, sem gema de ovo, finalizado com açúcar cristal maçaricado.'],
 ['cajuzinho','Cajuzinho','Tradicional',false,'Amendoim xerém e cacau 50%, boleado no açúcar cristal.'],
 ['pistache','Pistache','Pistache',false,'Pistache em grãos, sem pastas ou cremes de pistache prontos.']
];
const studioPhotos = new Set(['ferrero-rocher','maracuja','creme-brulee','cajuzinho','pistache']);
export const sweets = entries.map(([id,name,category,featured,description]) => ({id,name,category,featured,description,composition:description,ingredients:[],highlightIngredients:[],priceGroup:category,available:null,image:`/images/products/brigadeiros/${id}${studioPhotos.has(id)?'-studio':''}`}));
export const cakes = [
 {id:'ninho-morango',name:'Ninho com Morango',featured:true,description:'Massa de pão de ló, molhada no leite, brigadeiro de Ninho feito com Leite Ninho e geleia caseira de morango. Finalização com morangos.',image:'/images/products/bolos/bolo-ninho-geleia-morango'},
 {id:'baba-de-moca',name:'Baba de Moça com Frutas Vermelhas',description:'Massa de pão de ló, molhada no leite, baba de moça feita com leite condensado e creme de leite e geleia caseira de frutas vermelhas. Finalização com frutas vermelhas.',image:'/images/products/bolos/bolo-frutas-vermelhas'},
 {id:'casadinho',name:'Chocolate Casadinho',description:'Massa de chocolate com cacau 50%, molhada no leite, brigadeiro de Ninho e brigadeiro tradicional. Finalização com brigadeiros boleados.',image:'/images/products/bolos/bolo-chocolate-casadinho'},
 {id:'doce-de-leite-amendoim',name:'Doce de Leite com Amendoim Crocante',description:'Massa de pão de ló, molhada no leite, recheio de doce de leite Itambé e amendoim caramelizado para trazer crocância. Finalização com brigadeiro de churros e doce de leite.',image:'/images/products/bolos/bolo-doce-de-leite-amendoim-crocante'},
];
export const personalizedExample = {name:'Docinhos personalizados com tema de futebol',image:'/images/products/personalizados/docinhos-personalizados-futebol'};
export const priceGroups = Object.entries(PRICES).map(([category,lotPrice])=>({name:category==='Tradicional'?'Tradicionais':category,lotPrice}));
