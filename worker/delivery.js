import {normalizeCep, FREIGHT_FALLBACK} from '../src/lib/cep.js';

export const FALLBACK = FREIGHT_FALLBACK;
export const ADDRESS_REVIEW = FREIGHT_FALLBACK;
export const PRIVATE_BINDINGS = ['MAPBOX_ACCESS_TOKEN', 'DELIVERY_ORIGIN'];

const MAPBOX_GEOCODING = 'https://api.mapbox.com/search/geocode/v6/forward';
const MAPBOX_DIRECTIONS = 'https://api.mapbox.com/directions/v5/mapbox/driving';
// Public RK reference; a geocoder can resolve the private origin to an unrelated part of Brasília.
const RK_REFERENCE = {coordinates:[-47.823308,-15.6891943]};
const reply = (body, status = 200) => Response.json(body, {status, headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}});
const failure = (httpStatus, review = false) => reply({status: review ? 'address_review_required' : 'unavailable', error: review ? ADDRESS_REVIEW : FALLBACK}, httpStatus);

class DeliveryError extends Error {
  constructor(status = 422, review = true, kind = 'location_review') {
    super('Delivery unavailable');
    this.status = status;
    this.review = review;
    this.kind = kind;
  }
}

function configuration(env) {
  const efficiency = Number(env.VEHICLE_KM_PER_LITER), fuelPrice = Number(env.FUEL_PRICE);
  if (PRIVATE_BINDINGS.some(key => !env[key]?.trim()) || !Number.isFinite(efficiency) || efficiency <= 0 || !Number.isFinite(fuelPrice) || fuelPrice <= 0 || !['one-way', 'round-trip'].includes(env.DELIVERY_TRIP_MODE)) {
    throw new DeliveryError(503, false, 'invalid_configuration');
  }
  return {efficiency, fuelPrice, tripMode: env.DELIVERY_TRIP_MODE};
}

async function providerJson(fetcher, url, options, signal) {
  let response;
  try {
    response = await fetcher(url, { ...options, signal });
  } catch (error) {
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') throw new DeliveryError(502, false, 'timeout');
    if (error instanceof TypeError) throw new DeliveryError(502, false, 'network');
    throw new DeliveryError(502, false, 'provider_http');
  }

  if (!response || !response.ok) throw new DeliveryError(502, false, 'provider_http');

  try {
    return await response.json();
  } catch (error) {
    if (signal.aborted) throw error;
    throw new DeliveryError(502, false, 'invalid_response');
  }
}

async function viacepFetch(cep, fetcher, signal) {
  const url = `https://viacep.com.br/ws/${cep}/json/`;

  try {
    const response = await fetcher(url, {signal, headers: {Accept: 'application/json'}});
    if (!response || !response.ok) throw new DeliveryError(502, false, 'provider_http');

    let data;
    try {
      data = await response.json();
    } catch (error) {
      if (signal.aborted) throw error;
      throw new DeliveryError(502, false, 'invalid_response');
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new DeliveryError(502, false, 'invalid_response');
    if (data.erro === true) throw new DeliveryError(422, false, 'cep_not_found');
    if (!data.uf || typeof data.uf !== 'string' || !data.uf.trim()) throw new DeliveryError(422, false, 'incomplete_viacep');
    if (data.uf.trim().toUpperCase() !== 'DF') throw new DeliveryError(422, false, 'outside_df');
    if (!data.localidade || typeof data.localidade !== 'string' || !data.localidade.trim()) throw new DeliveryError(422, false, 'incomplete_viacep');
    if (!data.cep || typeof data.cep !== 'string' || !data.cep.trim()) throw new DeliveryError(422, false, 'incomplete_viacep');
    if (!data.logradouro?.trim() && !data.bairro?.trim()) throw new DeliveryError(422, false, 'incomplete_viacep');

    const address = data.logradouro?.trim()
      ? `${data.logradouro}, ${data.bairro || ''}, ${data.localidade} - ${data.uf}, ${data.cep}, Brasil`
      : `${data.bairro}, ${data.localidade} - ${data.uf}, ${data.cep}, Brasil`;

    return {address};
  } catch (error) {
    if (error instanceof DeliveryError) throw error;
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') throw new DeliveryError(502, false, 'timeout');
    if (error instanceof TypeError) throw new DeliveryError(502, false, 'network');
    throw new DeliveryError(502, false, 'invalid_response');
  }
}

function validPoint(feature) { const c = feature?.geometry?.coordinates; return feature?.geometry?.type === 'Point' && Array.isArray(c) && c.length === 2 && Number.isFinite(c[0]) && Number.isFinite(c[1]) && c[0] >= -180 && c[0] <= 180 && c[1] >= -90 && c[1] <= 90; }
function nearRk({coordinates:[lon,lat]}) {
  const [rkLon,rkLat] = RK_REFERENCE.coordinates;
  const latKm = (lat-rkLat)*111.2;
  const lonKm = (lon-rkLon)*111.2*Math.cos(rkLat*Math.PI/180);
  return Math.hypot(latKm,lonKm) <= 5;
}
async function geocode(text, key, fetcher, signal, kind, expectedCep) {
  const url = new URL(MAPBOX_GEOCODING); url.search = new URLSearchParams({q:text,country:'BR',language:'pt',autocomplete:'false',limit:'5',access_token:key}).toString();
  const data = await providerJson(fetcher, url, {headers:{Accept:'application/json'}}, signal);
  const feature = Array.isArray(data?.features) ? data.features.find(item => validPoint(item) && (!expectedCep || normalizeCep(item.properties?.context?.postcode?.name) === expectedCep || (item.properties?.feature_type === 'postcode' && normalizeCep(item.properties.name) === expectedCep))) : null;
  if (!feature) throw new DeliveryError(422, true, kind);
  return {coordinates:feature.geometry.coordinates};
}

async function routeDistance(origin, destination, key, fetcher, signal) {
  const path = `${origin.coordinates.join(',')};${destination.coordinates.join(',')}`;
  const url = new URL(`${MAPBOX_DIRECTIONS}/${path}`); url.search = new URLSearchParams({access_token:key,overview:'false',steps:'false'}).toString();
  const data = await providerJson(fetcher, url, {headers:{Accept:'application/json'}}, signal);
  const meters = data?.code === 'Ok' ? data.routes?.[0]?.distance : null;
  if (!Number.isFinite(meters) || meters <= 0) throw new DeliveryError(502, false, 'route_invalid_distance');
  return meters;
}

export async function handleDelivery(request, env, fetcher = fetch) {
  if (request.method !== 'POST') return failure(405);

  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return failure(403);
  const contentType = request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') return failure(415, true);
  const length = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(length) && length > 4096) return failure(413, true);
  const limiter = env.DELIVERY_RATE_LIMITER;
  if (limiter && !(await limiter.limit({key: request.headers.get('CF-Connecting-IP') || 'unknown'})).success) return failure(429, true);

  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > 4096) return failure(413, true);

    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return failure(400, true);
    }

    const cep = normalizeCep(body?.cep);
    if (!cep) return failure(400, true);

    const config = configuration(env), signal = AbortSignal.timeout(18000);

    // ViaCEP validates and resolves the destination CEP to a structured address.
    const via = await viacepFetch(cep, fetcher, signal);

    if (new URL(request.url).searchParams.has('diagnosticDestination')) {
      const url = new URL(MAPBOX_GEOCODING); url.search = new URLSearchParams({q:via.address,country:'BR',language:'pt',autocomplete:'false',limit:'5',access_token:env.MAPBOX_ACCESS_TOKEN}).toString();
      const data = await providerJson(fetcher,url,{headers:{Accept:'application/json'}},signal);
      return reply({features:(data.features||[]).map(item=>({type:item.properties?.feature_type,name:item.properties?.name,place:item.properties?.place_formatted,postcode:item.properties?.context?.postcode?.name,locality:item.properties?.context?.locality?.name,coordinates:item.geometry?.coordinates}))});
    }

    // Destination: loose geocoding from the structured address obtained by ViaCEP.
    const destination = await geocode(via.address, env.MAPBOX_ACCESS_TOKEN, fetcher, signal, 'destination_not_found', cep);

    // Keep the private origin only when Mapbox resolves it inside the RK area.
    const geocodedSource = await geocode(env.DELIVERY_ORIGIN, env.MAPBOX_ACCESS_TOKEN, fetcher, signal, 'origin_not_found');
    const source = nearRk(geocodedSource) ? geocodedSource : RK_REFERENCE;

    const outbound = await routeDistance(source, destination, env.MAPBOX_ACCESS_TOKEN, fetcher, signal);
    const inbound = config.tripMode === 'round-trip' ? await routeDistance(destination, source, env.MAPBOX_ACCESS_TOKEN, fetcher, signal) : 0;

    const distanceKm = outbound / 1000;
    const billableDistanceKm = (outbound + inbound) / 1000;
    const estimatedCents = Math.round(billableDistanceKm / config.efficiency * config.fuelPrice * 100);

    if (!Number.isSafeInteger(estimatedCents) || estimatedCents < 0) throw new DeliveryError(502, false, 'calculation_invalid');

    return reply({
      status: 'estimated',
      estimatedCents,
      distanceKm,
      billableDistanceKm,
      tripMode: config.tripMode,
      destination: `CEP ${cep.slice(0, 5)}-${cep.slice(5)} · DF`,
      notice: 'Estimativa baseada no CEP, sujeita à confirmação pela Nandices.'
    });
  } catch (error) {
    console.warn('freight_failed', {
      kind: ['AbortError', 'TimeoutError'].includes(error?.name)
        ? 'timeout'
        : error instanceof DeliveryError
          ? error.kind
          : error instanceof TypeError
            ? 'network'
            : 'unavailable'
    });
    return failure(error instanceof DeliveryError ? error.status : 502, error instanceof DeliveryError && error.review);
  }
}
