import { diffDays } from "./format.js";

export const PROTECTION_PER_DAY = 149;
export const SERVICE_FEE_RATE = 0.05;
export const WEEKLY_DISCOUNT_RATE = 0.1;

// One place for the maths so the booking page, the chatbot and the
// history screen always agree on a price.
export function quote(vehicle, startISO, endISO, { protection = false } = {}) {
  const days = Math.max(1, diffDays(startISO, endISO) || 1);
  const base = vehicle.price * days;
  const discount = days >= 7 ? Math.round(base * WEEKLY_DISCOUNT_RATE) : 0;
  const protectionFee = protection ? PROTECTION_PER_DAY * days : 0;
  const serviceFee = Math.round((base - discount) * SERVICE_FEE_RATE);
  const total = base - discount + protectionFee + serviceFee;
  const deposit = ["Bike", "Scooter"].includes(vehicle.type) ? 1000 : 3000;
  return { days, base, discount, protectionFee, serviceFee, total, deposit };
}

// Rough monthly earning potential for a host, used by the listing form
// and the assistant. Assumes the vehicle is booked about 40% of the month.
export function estimateMonthly(price, utilisation = 0.4) {
  return Math.round(price * 30 * utilisation * (1 - SERVICE_FEE_RATE));
}

const SUGGESTED = {
  Hatchback: [1000, 1500],
  Sedan: [1300, 1900],
  SUV: [1600, 2600],
  MPV: [2200, 3200],
  Bike: [600, 1100],
  Scooter: [350, 600],
};

export function suggestedRange(type) {
  return SUGGESTED[type] || SUGGESTED.Hatchback;
}
