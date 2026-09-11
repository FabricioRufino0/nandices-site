const FALLBACK = 'Não conseguimos calcular o frete automaticamente. Consulte a entrega pelo WhatsApp.';
const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
class DeliveryError extends Error {constructor(message,status=422){super(message);this.status=status}}
function configuration(env){
 const efficiency=Number(env.VEHICLE_KM_PER_LITER),fuelPrice=Number(env.FUEL_PRICE);
 if(!env.GOOGLE_MAPS_API_KEY?.trim()||!env.DELIVERY_ORIGIN?.trim()||!Number.isFinite(efficiency)||efficiency<=0||!Number.isFinite(fuelPrice)||fuelPrice<=0||!['one-way','round-trip'].includes(env.DELIVERY_TRIP_MODE))throw new DeliveryError(FALLBACK,503);
 return {efficiency,fuelPrice,tripMode:env.DELIVERY_TRIP_MODE};
}
async function googleJson(fetcher,url,options,signal){
 const response=await fetcher(url,{...options,signal});
 if(!response.ok)throw new DeliveryError(FALLBACK,502);
 return response.json();
}
async function geocode(address,key,fetcher,signal){
 const url=new URL('https://maps.googleapis.com/maps/api/geocode/json');
 url.search=new URLSearchParams({address,key,components:'country:BR',language:'pt-BR'}).toString();
 const data=await googleJson(fetcher,url,{},signal);
 if(data.status==='ZERO_RESULTS')throw new DeliveryError('Endereço não encontrado. Confira o CEP ou informe o endereço completo.');
 if(data.status!=='OK')throw new DeliveryError(FALLBACK,502);
 if(data.results?.length!==1||data.results[0].partial_match)throw new DeliveryError('Não foi possível identificar um endereço único. Informe o endereço completo e o número.');
 const result=data.results[0];
 const component=type=>result.address_components?.find(c=>c.types.includes(type))?.short_name;
 if(component('country')!=='BR'||component('administrative_area_level_1')!=='DF')throw new DeliveryError('A entrega atende somente endereços no Distrito Federal. Consulte a Nandices pelo WhatsApp.');
 if(!result.place_id)throw new DeliveryError(FALLBACK,502);
 return result;
}
async function routeDistance(origin,destination,key,fetcher,signal){
 const data=await googleJson(fetcher,'https://routes.googleapis.com/directions/v2:computeRoutes',{
  method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':'routes.distanceMeters'},
  body:JSON.stringify({origin:{placeId:origin.place_id},destination:{placeId:destination.place_id},travelMode:'DRIVE',routingPreference:'TRAFFIC_UNAWARE',computeAlternativeRoutes:false,units:'METRIC'})
 },signal);
 const meters=data.routes?.[0]?.distanceMeters;
 if(!Number.isFinite(meters)||meters<0)throw new DeliveryError(FALLBACK,502);
 return meters;
}
export async function handleDelivery(request,env,fetcher=fetch){
 if(request.method!=='POST')return reply({error:'Método não permitido.'},405);
 const origin=request.headers.get('Origin');
 if(origin&&origin!==new URL(request.url).origin)return reply({error:'Origem não permitida.'},403);
 if(!request.headers.get('Content-Type')?.includes('application/json'))return reply({error:'Envie um endereço válido.'},415);
 try {
  const text=await request.text();
  if(text.length>4096)return reply({error:'Endereço muito longo.'},413);
  let body;try{body=JSON.parse(text)}catch{return reply({error:'Endereço inválido.'},400)}
  const address=typeof body?.address==='string'?body.address.trim():'';
  const number=typeof body?.number==='string'?body.number.trim():'';
  const complement=typeof body?.complement==='string'?body.complement.trim():'';
  if(address.length<5||address.length>300||!number||number.length>30||complement.length>150)return reply({error:'Informe um CEP ou endereço e o número. Use s/n se não houver número.'},400);
  const config=configuration(env);
  const signal=AbortSignal.timeout(18000);
  let destinationAddress=`${address}, ${number}`;
  // CEP sozinho é resolvido primeiro em logradouro; não usar o centro do CEP como destino.
  if(/^\d{5}-?\d{3}$/.test(address)){
   const postal=await geocode(address,env.GOOGLE_MAPS_API_KEY,fetcher,signal);
   const street=postal.address_components?.find(c=>c.types.includes('route'))?.long_name;
   if(!street)throw new DeliveryError('Esse CEP abrange uma área ampla. Informe o endereço completo com rua ou quadra e o número.');
   destinationAddress=`${street}, ${number}, ${address}, Distrito Federal, Brasil`;
  }
  const destination=await geocode(destinationAddress,env.GOOGLE_MAPS_API_KEY,fetcher,signal);
  if(!destination.types?.some(t=>['street_address','premise','subpremise'].includes(t)))throw new DeliveryError('Informe um endereço mais preciso, com rua ou quadra e número, para calcular a rota.');
  const source=await geocode(env.DELIVERY_ORIGIN,env.GOOGLE_MAPS_API_KEY,fetcher,signal);
  const outbound=await routeDistance(source,destination,env.GOOGLE_MAPS_API_KEY,fetcher,signal);
  const inbound=config.tripMode==='round-trip'?await routeDistance(destination,source,env.GOOGLE_MAPS_API_KEY,fetcher,signal):0;
  const distanceKm=outbound/1000,billableDistanceKm=(outbound+inbound)/1000;
  const estimatedCents=Math.round(billableDistanceKm/config.efficiency*config.fuelPrice*100);
  if(!Number.isSafeInteger(estimatedCents)||estimatedCents<0)throw new DeliveryError(FALLBACK,502);
  return reply({estimatedCents,distanceKm,billableDistanceKm,tripMode:config.tripMode,destination:destination.formatted_address});
 }catch(error){return reply({error:error instanceof DeliveryError?error.message:FALLBACK},error instanceof DeliveryError?error.status:502)}
}
export {FALLBACK};
