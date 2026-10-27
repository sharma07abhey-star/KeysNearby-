// Approximate road distances (km) between some Punjab / Chandigarh towns.
// Used to suggest a fair cost-share price when someone offers a ride.
const KM = {
  "rajpura-chandigarh": 45,
  "patiala-chandigarh": 65,
  "rajpura-patiala": 27,
  "ambala-rajpura": 30,
  "ambala-chandigarh": 45,
  "mohali-rajpura": 40,
  "ludhiana-chandigarh": 100,
  "patiala-ludhiana": 65,
};

const key = (a, b) => [a, b].map((s) => s.trim().toLowerCase()).sort().join("-");
const lookup = Object.fromEntries(
  Object.entries(KM).map(([k, v]) => [k.split("-").sort().join("-"), v]),
);

export function routeKm(from, to) {
  return lookup[key(from, to)] || null;
}

// Cost sharing, not profit: the app suggests at most ₹3.5 per km per seat.
export const COST_PER_KM = 3.5;
export const maxFare = (km) => Math.round((km * COST_PER_KM) / 5) * 5;

export const cities = ["Rajpura", "Patiala", "Chandigarh", "Ambala", "Mohali", "Ludhiana"];
