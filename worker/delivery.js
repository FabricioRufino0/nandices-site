import {normalizeCep,FREIGHT_FALLBACK} from '../src/lib/cep.js';
export const FALLBACK = FREIGHT_FALLBACK;
export const ADDRESS_REVIEW = FREIGHT_FALLBACK;
export const PRIVATE_BINDINGS = ['OPENROUTESERVICE_API_KEY', 'DELIVERY_ORIGIN'];
const ORS_BASE = 'https://api.heigit.org';
const reply = (body, status = 200) => Response.json(body, {status, headers: {'Cache-Control': 'no-store'}});
const failure = (httpStatus, review = false) => reply({status: review ? 'address_review_required' : 'unavailable', error: review ? ADDRESS_REVIEW : FALLBACK}, httpStatus);
class DeliveryError extends Error {
  constructor(status = 422, review = true, kind = 'location_review') { super('Delivery unavailable'); this.status = status; this.review = review; this.kind=kind; }
}
function configuration(env) {
  const efficiency = Number(env.VEHICLE_KM_PER_LITER), fuelPrice = Number(env.FUEL_PRICE);
  if (PRIVATE_BINDINGS.some(key => !env[key]?.trim()) || !Number.isFinite(efficiency) || efficiency <= 0 || !Number.isFinite(fuelPrice) || fuelPrice <= 0 || !['one-way', 'round-trip'].includes(env.DELIVERY_TRIP_MODE)) throw new DeliveryError(503, false);
  return {efficiency, fuelPrice, tripMode: env.DELIVERY_TRIP_MODE};
}
async function orsJson(fetcher, url, options, signal) {
  const response = await fetcher(url, {...options, signal});
  if (!response.ok) throw new DeliveryError(502, false, 'provider_http');
  try{return await response.json()}catch(error){if(signal.aborted)throw error;throw new DeliveryError(502,false,'invalid_response')}
}
async function geocode(text, key, fetcher, signal, cep) {
  const url = new URL(`${ORS_BASE}/pelias/v1/search`);
  url.search = new URLSearchParams({text, size: '5', 'boundary.country': 'BR', lang: 'pt-BR'}).toString();
  const data = await orsJson(fetcher, url, {headers: {Authorization: key, Accept: 'application/json'}}, signal);
  const features = data?.features;
  if (!Array.isArray(features)) throw new DeliveryError(502,false,'invalid_response');
  if (!features.length) throw new DeliveryError(422,true,cep?'cep_not_found':'origin_not_found');
  // Preserve provider ranking. Never discard a competing result to manufacture certainty.
  const best = features[0], p = best?.properties || {}, coordinates = best?.geometry?.coordinates;
  const validScore = score => typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 1;
  if (!validScore(p.confidence) || p.confidence < 0.9 || features.slice(1).some(f => !validScore(f?.properties?.confidence) || p.confidence - f.properties.confidence < 0.1 - Number.EPSILON)) throw new DeliveryError();
  if (p.country_a !== 'BRA' || !(['DF', 'BR-DF', 'Distrito Federal'].includes(p.region_a) || p.region === 'Distrito Federal')) throw new DeliveryError();
  if(cep){
    const returnedCep=normalizeCep(p.postalcode)||(p.layer==='postalcode'?normalizeCep(p.name):'');
    if(returnedCep!==cep||!['postalcode','address','venue','street'].includes(p.layer))throw new DeliveryError();
  }else if(!['address','venue'].includes(p.layer)||p.accuracy!=='point'||p.match_type!=='exact')throw new DeliveryError();
  if (best.geometry?.type !== 'Point' || !Array.isArray(coordinates) || coordinates.length !== 2 || !coordinates.every(Number.isFinite) || Math.abs(coordinates[0]) > 180 || Math.abs(coordinates[1]) > 90 || typeof p.label !== 'string' || !p.label.trim()) throw new DeliveryError();
  return {coordinates, label: p.label};
}
async function routeDistance(origin, destination, key, fetcher, signal) {
  const data = await orsJson(fetcher, `${ORS_BASE}/openrouteservice/v2/directions/driving-car/json`, {method: 'POST', headers: {Authorization: key, 'Content-Type': 'application/json', Accept: 'application/json'}, body: JSON.stringify({coordinates: [origin.coordinates, destination.coordinates], instructions: false, language: 'pt-br'})}, signal);
  const meters = data?.routes?.[0]?.summary?.distance;
  if (!Number.isFinite(meters) || meters < 0) throw new DeliveryError(502, false);
  return meters;
}
export async function handleDelivery(request, env, fetcher = fetch) {
  if (request.method !== 'POST') return failure(405);
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return failure(403);
  if (!request.headers.get('Content-Type')?.includes('application/json')) return failure(415, true);
  try {
    const text = await request.text();
    if (text.length > 4096) return failure(413, true);
    let body;
    try { body = JSON.parse(text); } catch { return failure(400, true); }
    const cep = normalizeCep(body?.cep);
    if (!cep) return failure(400, true);
    const config = configuration(env), signal = AbortSignal.timeout(18000);
    const destination = await geocode(`${cep.slice(0,5)}-${cep.slice(5)}, Brasil`, env.OPENROUTESERVICE_API_KEY, fetcher, signal, cep);
    const source = await geocode(env.DELIVERY_ORIGIN, env.OPENROUTESERVICE_API_KEY, fetcher, signal);
    if (PRIVATE_BINDINGS.some(key => destination.label.includes(env[key]))) throw new DeliveryError();
    const outbound = await routeDistance(source, destination, env.OPENROUTESERVICE_API_KEY, fetcher, signal);
    const inbound = config.tripMode === 'round-trip' ? await routeDistance(destination, source, env.OPENROUTESERVICE_API_KEY, fetcher, signal) : 0;
    const distanceKm = outbound / 1000, billableDistanceKm = (outbound + inbound) / 1000;
    const estimatedCents = Math.round(billableDistanceKm / config.efficiency * config.fuelPrice * 100);
    if (!Number.isSafeInteger(estimatedCents) || estimatedCents < 0) throw new DeliveryError(502, false);
    return reply({status: 'estimated', estimatedCents, distanceKm, billableDistanceKm, tripMode: config.tripMode, destination: `CEP ${cep.slice(0,5)}-${cep.slice(5)} · DF`, notice: 'Estimativa baseada no CEP, sujeita à confirmação pela Nandices.'});
  } catch (error) {
    console.warn('freight_failed', {kind:['AbortError','TimeoutError'].includes(error?.name)?'timeout':error instanceof DeliveryError?error.kind:error instanceof TypeError?'network':'unavailable'});
    return failure(error instanceof DeliveryError ? error.status : 502, error instanceof DeliveryError && error.review);
  }
}
