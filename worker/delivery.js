import {normalizeCep, FREIGHT_FALLBACK} from '../src/lib/cep.js';

export const FALLBACK = FREIGHT_FALLBACK;
export const ADDRESS_REVIEW = FREIGHT_FALLBACK;
export const PRIVATE_BINDINGS = ['OPENROUTESERVICE_API_KEY', 'DELIVERY_ORIGIN'];

const ORS_BASE = 'https://api.heigit.org';
const reply = (body, status = 200) => Response.json(body, {status, headers: {'Cache-Control': 'no-store'}});
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

async function orsJson(fetcher, url, options, signal) {
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

function isBrazilDF(properties) {
  return properties?.country_a === 'BRA' && (['DF', 'BR-DF', 'Distrito Federal'].includes(properties.region_a) || properties.region === 'Distrito Federal');
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function destinationMatchesViaCEP(features, viaAddress) {
  const seen = [];
  const viaParts = normalizeText(viaAddress).split(' ');
  for (const feature of features) {
    const p = feature?.properties || {};
    const label = normalizeText(p.label || '');
    const coord = feature?.geometry?.coordinates;

    if (!Array.isArray(coord) || coord.length < 2 || !Number.isFinite(coord[0]) || !Number.isFinite(coord[1])) continue;
    if (!isBrazilDF(p)) continue;

    let score = 0;
    for (const token of viaParts) {
      if (!token) continue;
      if (label.includes(token)) score += 1;
    }

    seen.push({feature, score});
  }

  if (!seen.length) throw new DeliveryError(422, true, 'cep_not_found');

  const winner = seen.sort((a, b) => b.score - a.score)[0];
  if (winner.score < 2) throw new DeliveryError(422, true, 'cep_not_found');
  return winner.feature;
}

async function geocodeOrigin(text, key, fetcher, signal) {
  const url = new URL(`${ORS_BASE}/pelias/v1/search`);
  url.search = new URLSearchParams({text, size: '5', 'boundary.country': 'BR', lang: 'pt-BR'}).toString();

  const data = await orsJson(fetcher, url, {headers: {Authorization: key, Accept: 'application/json'}}, signal);
  const features = data?.features;
  if (!Array.isArray(features)) throw new DeliveryError(502, false, 'invalid_response');
  if (!features.length) throw new DeliveryError(422, true, 'origin_not_found');

  const best = features[0], p = best?.properties || {}, coordinates = best?.geometry?.coordinates;
  const validScore = score => typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 1;

  if (!validScore(p.confidence) || p.confidence < 0.9 || features.slice(1).some(f => !validScore(f?.properties?.confidence) || p.confidence - f.properties.confidence < 0.1 - Number.EPSILON)) throw new DeliveryError(422, true, 'origin_confidence');
  if (!isBrazilDF(p)) {
    throw new DeliveryError(422, true, 'origin_region');
  }
  if (!['address', 'venue'].includes(p.layer) || p.accuracy !== 'point' || p.match_type !== 'exact') throw new DeliveryError(422, true, 'origin_precision');
  if (best.geometry?.type !== 'Point' || !Array.isArray(coordinates) || coordinates.length !== 2 || !coordinates.every(Number.isFinite) || Math.abs(coordinates[0]) > 180 || Math.abs(coordinates[1]) > 90 || typeof p.label !== 'string' || !p.label.trim()) throw new DeliveryError(422, true, 'origin_geometry');

  return {coordinates, label: p.label};
}

async function geocodeDestination(text, key, fetcher, signal, viaAddress) {
  const url = new URL(`${ORS_BASE}/pelias/v1/search`);
  url.search = new URLSearchParams({text, size: '5', 'boundary.country': 'BR', lang: 'pt-BR'}).toString();

  const data = await orsJson(fetcher, url, {headers: {Authorization: key, Accept: 'application/json'}}, signal);
  const features = data?.features;
  if (!Array.isArray(features)) throw new DeliveryError(502, false, 'invalid_response');
  if (!features.length) throw new DeliveryError(422, true, 'cep_not_found');

  const chosen = destinationMatchesViaCEP(features, viaAddress);
  const p = chosen?.properties || {};
  const coordinates = chosen?.geometry?.coordinates;

  if (!isBrazilDF(p)) {
    throw new DeliveryError(422, true, 'destination_region');
  }
  if (!Array.isArray(coordinates) || coordinates.length !== 2 || !coordinates.every(Number.isFinite) || Math.abs(coordinates[0]) > 180 || Math.abs(coordinates[1]) > 90 || typeof p.label !== 'string' || !p.label.trim()) throw new DeliveryError(422, true, 'destination_geometry');

  return {coordinates, label: p.label};
}

async function routeDistance(origin, destination, key, fetcher, signal) {
  const data = await orsJson(fetcher, `${ORS_BASE}/openrouteservice/v2/directions/driving-car/json`, {
    method: 'POST',
    headers: {Authorization: key, 'Content-Type': 'application/json', Accept: 'application/json'},
    body: JSON.stringify({coordinates: [origin.coordinates, destination.coordinates], instructions: false, language: 'pt-br'})
  }, signal);

  const meters = data?.routes?.[0]?.summary?.distance;
  if (!Number.isFinite(meters) || meters < 0) throw new DeliveryError(502, false, 'route_invalid_distance');
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

    // Destination: loose geocoding from the structured address obtained by ViaCEP.
    const destination = await geocodeDestination(via.address, env.OPENROUTESERVICE_API_KEY, fetcher, signal, via.address);

    // Origin: the private environment address stays under strict origin validation.
    const source = await geocodeOrigin(env.DELIVERY_ORIGIN, env.OPENROUTESERVICE_API_KEY, fetcher, signal);

    if (PRIVATE_BINDINGS.some(key => destination.label.includes(env[key]))) {
      throw new DeliveryError(422, true, 'destination_private_match');
    }

    const outbound = await routeDistance(source, destination, env.OPENROUTESERVICE_API_KEY, fetcher, signal);
    const inbound = config.tripMode === 'round-trip' ? await routeDistance(destination, source, env.OPENROUTESERVICE_API_KEY, fetcher, signal) : 0;

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
