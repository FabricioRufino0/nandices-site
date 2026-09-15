import {EVENTS, LOT_SIZE, CAKE} from '../data/commerce.js';

const validGuests = guests => Number.isSafeInteger(guests) && guests >= 1;
const commercial = value => Math.max(LOT_SIZE, Math.ceil(value / LOT_SIZE) * LOT_SIZE);

export function estimateSweets(eventId, guests) {
  const event = EVENTS.find(item => item.id === eventId);
  if (!event || !validGuests(guests)) throw new RangeError('Informe uma quantidade inteira de convidados maior que zero.');
  return {event: event.name, guests, min: commercial(guests * event.min), max: commercial(guests * event.max)};
}

export function estimateCake(guests) {
  if (!validGuests(guests)) throw new RangeError('Informe uma quantidade inteira de convidados maior que zero.');
  const kg = Math.max(CAKE.minKg, guests / 10);
  return {guests, kg, estimatedCents: Math.round(kg * CAKE.perKg)};
}
