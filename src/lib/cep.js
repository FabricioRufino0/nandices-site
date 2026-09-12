export const FREIGHT_FALLBACK='Não conseguimos calcular automaticamente para este CEP. Fale com a Nanda para consultar a entrega.';
export function normalizeCep(value){
 if(typeof value!=='string'||!/^\d{5}-?\d{3}$/.test(value.trim()))return '';
 const cep=value.replace(/\D/g,'');
 return /^(\d)\1{7}$/.test(cep)?'':cep;
}
