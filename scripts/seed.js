/**
 * scripts/seed.js  ->  npm run reset-db
 *
 * Writes a fresh db.json for json-server (the mock REST API).
 *  - json-server 0.17 refuses to start if db.json has a top-level string key
 *    (such as "_comment"), so notes live here, not in the data
 *  - passwords are plain text on purpose (mock data); a real backend would hash them
 *  - every date is relative to today, so the demo never goes stale
 *  - totals and payouts come from the app's own pricing code (utils/pricing.js)
 *  - every vehicle has an owner who is a real user, so you can sign in as the
 *    owner and accept a renter's request (the peer-to-peer flow)
 *  - there is no "mine" flag: the app works it out from ownerId / driverId
 *
 * Demo logins (password for all of them: demo123)
 *   abhey@example.com  - the main demo user (renter + host)
 *   arjun@example.com, priya@example.com, rahul@example.com, kabir@example.com,
 *   neha@example.com, suresh@example.com, ananya@example.com - other hosts
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { addDaysISO, todayISO } from "../src/utils/format.js";
import { SERVICE_FEE_RATE, quote } from "../src/utils/pricing.js";
 
const today = todayISO();
const d = (n) => addDaysISO(today, n);
const slug = (name) => name.toLowerCase().replace(/\s+/g, "-");
 
// ── Users ────────────────────────────────────────────────────────────────────
const PASSWORD = "demo123"; // plain text on purpose: mock data only
const person = (id, name, location, verified = true) => ({
  id: `user-${id}`,
  name,
  email: `${id}@example.com`, // always lowercase (the app lowercases on lookup)
  password: PASSWORD,
  phone: "",
  location,
  verification: { email: true, phone: verified, identity: verified, licence: verified },
});
 
const users = [
  { ...person("demo", "Abhey Sharma", "Koramangala, Bengaluru", false), email: "abhey@example.com" },
  person("arjun", "Arjun Mehta", "Koramangala, Bengaluru"),
  person("priya", "Priya Sharma", "Indiranagar, Bengaluru"),
  person("rahul", "Rahul Verma", "HSR Layout, Bengaluru"),
  person("kabir", "Kabir Singh", "Domlur, Bengaluru"),
  person("neha", "Neha Kapoor", "Whitefield, Bengaluru"),
  person("suresh", "Suresh Iyer", "Jayanagar, Bengaluru"),
  person("ananya", "Ananya Rao", "BTM Layout, Bengaluru"),
];
users[0].id = "user-demo";
const userByName = Object.fromEntries(users.map((u) => [u.name, u]));
 
// ── Vehicles ─────────────────────────────────────────────────────────────────
const vehicle = (v) => {
  const owner = userByName[v.ownerName];
  return {
    ...v,
    name: `${v.brand} ${v.model}`,
    ownerId: owner.id,
    owner: owner.name, // older pages read vehicle.owner, newer code uses ownerName
    available: v.available ?? true,
  };
};
 
const vehicles = [
  vehicle({ id: "creta", brand: "Hyundai", model: "Creta", type: "SUV", fuel: "Petrol", transmission: "Automatic", seats: 5, year: 2023, price: 1800, rating: 4.9, trips: 42, location: "Koramangala, Bengaluru", distance: 1.2, color: "blue", image: "car_hyundai_creta.jpg", ownerName: "Arjun Mehta", features: ["Sunroof", "Bluetooth", "Rear camera"], pos: { x: 30, y: 44 } }),
  vehicle({ id: "city", brand: "Honda", model: "City", type: "Sedan", fuel: "Petrol", transmission: "Manual", seats: 5, year: 2022, price: 1600, rating: 4.8, trips: 31, location: "Indiranagar, Bengaluru", distance: 2.1, color: "violet", image: "car_honda_city.jpg", ownerName: "Priya Sharma", features: ["Cruise control", "Bluetooth", "Airbags"], pos: { x: 48, y: 66 } }),
  vehicle({ id: "nexon", brand: "Tata", model: "Nexon EV", type: "SUV", fuel: "Electric", transmission: "Automatic", seats: 5, year: 2024, price: 1500, rating: 4.7, trips: 28, location: "HSR Layout, Bengaluru", distance: 2.8, color: "cyan", image: "car_tata_nexon.jpg", ownerName: "Rahul Verma", features: ["300 km range", "Fast charging", "Rear camera"], pos: { x: 68, y: 38 } }),
  vehicle({ id: "swift", brand: "Maruti", model: "Swift", type: "Hatchback", fuel: "Petrol", transmission: "Manual", seats: 5, year: 2021, price: 1300, rating: 4.8, trips: 55, location: "Domlur, Bengaluru", distance: 3.4, color: "orange", image: "car_maruti_swift.jpg", ownerName: "Kabir Singh", features: ["Great mileage", "Bluetooth", "Easy parking"], pos: { x: 58, y: 20 } }),
  vehicle({ id: "thar", brand: "Mahindra", model: "Thar", type: "SUV", fuel: "Diesel", transmission: "Manual", seats: 4, year: 2023, price: 2400, rating: 4.9, trips: 19, location: "Whitefield, Bengaluru", distance: 5.2, color: "orange", image: null, ownerName: "Neha Kapoor", features: ["4x4", "Soft top", "Weekend favourite"], pos: { x: 82, y: 58 } }),
  vehicle({ id: "innova", brand: "Toyota", model: "Innova Crysta", type: "MPV", fuel: "Diesel", transmission: "Manual", seats: 7, year: 2022, price: 2800, rating: 4.8, trips: 37, location: "Jayanagar, Bengaluru", distance: 4.1, color: "violet", image: null, ownerName: "Suresh Iyer", features: ["7 seats", "Roof AC vents", "Big boot"], pos: { x: 22, y: 72 } }),
  vehicle({ id: "activa", brand: "Honda", model: "Activa 6G", type: "Scooter", fuel: "Petrol", transmission: "Automatic", seats: 2, year: 2023, price: 450, rating: 4.6, trips: 64, location: "BTM Layout, Bengaluru", distance: 1.9, color: "cyan", image: null, ownerName: "Ananya Rao", features: ["Helmet included", "Under-seat storage"], pos: { x: 40, y: 82 } }),
  vehicle({ id: "my-i20", brand: "Hyundai", model: "i20", type: "Hatchback", fuel: "Petrol", transmission: "Manual", seats: 5, year: 2022, price: 1400, rating: 4.8, trips: 12, location: "Koramangala, Bengaluru", distance: 0.3, color: "blue", image: null, ownerName: "Abhey Sharma", features: ["Bluetooth", "Rear camera"], pos: { x: 36, y: 50 } }),
  vehicle({ id: "my-re350", brand: "Royal Enfield", model: "Classic 350", type: "Bike", fuel: "Petrol", transmission: "Manual", seats: 2, year: 2021, price: 900, rating: 4.9, trips: 9, location: "Koramangala, Bengaluru", distance: 0.3, color: "orange", image: null, ownerName: "Abhey Sharma", available: false, features: ["Two helmets", "Saddle bags"], pos: { x: 34, y: 54 } }),
];
const vehicleById = Object.fromEntries(vehicles.map((v) => [v.id, v]));
 
// ── Bookings + the host request that goes with each one ──────────────────────
const bookings = [];
const hostRequests = [];
const payoutFor = (v, days) => Math.round(v.price * days * (1 - SERVICE_FEE_RATE));
 
// A renter's booking and the owner's request are created together and linked
// by bookingId, exactly like the app does at runtime.
function booking(id, renter, vehicleId, start, end, bookingStatus, requestStatus) {
  const v = vehicleById[vehicleId];
  const q = quote(v, start, end);
  bookings.push({
    id, vehicleId, vehicle: v.name, location: v.location, start, end,
    days: q.days, total: q.total, status: bookingStatus, protection: false, userId: renter.id,
  });
  hostRequests.push({
    id: `req-${id}`, vehicleId, vehicle: v.name, renter: renter.name, renterId: renter.id,
    bookingId: id, start, end, days: q.days, payout: payoutFor(v, q.days),
    status: requestStatus, ownerId: v.ownerId,
  });
}
 
const demo = users[0];
booking("booking-1", demo, "creta", d(-60), d(-58), "Completed", "Accepted");
booking("booking-2", demo, "city", d(-90), d(-89), "Completed", "Accepted");
booking("booking-4", demo, "swift", d(7), d(9), "Confirmed", "Accepted");  // already accepted by Kabir
booking("booking-3", demo, "nexon", d(3), d(5), "Pending", "Pending");     // waiting: sign in as rahul@example.com to accept
 
// Requests on the demo user's own vehicles (the renters are not app users, so there is
// no renterId/bookingId. Never store null in a field ending in "Id": json-server
// crashes on every DELETE when it finds one.).
function incoming(id, renter, vehicleId, start, end, status) {
  const v = vehicleById[vehicleId];
  const days = Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000));
  hostRequests.push({
    id, vehicleId, vehicle: v.name, renter,
    start, end, days, payout: payoutFor(v, days), status, ownerId: v.ownerId,
  });
}
incoming("req-1", "Rohit Nair", "my-i20", d(2), d(4), "Pending");
incoming("req-2", "Meera Joshi", "my-re350", d(6), d(7), "Pending");
incoming("req-3", "Vikram Rao", "my-i20", d(-12), d(-10), "Accepted");
incoming("req-4", "Sana Qureshi", "my-re350", d(-20), d(-18), "Accepted");
 
// ── Conversations (the logged-in demo user's inbox) ──────────────────────────
const convo = (ownerName, vehicleName, unread, messages) => ({
  id: `chat-${demo.id}-${slug(ownerName)}`,
  name: ownerName,
  initials: ownerName.split(" ").map((p) => p[0]).join(""),
  vehicle: vehicleName,
  unread,
  userId: demo.id,
  messages,
});
const conversations = [
  convo("Arjun Mehta", "Hyundai Creta", 2, [
    { from: "them", text: "Hi! Is the car available for tomorrow?", time: "10:40 AM" },
    { from: "me", text: "Yes, it is available. What time would you like to pick it up?", time: "10:41 AM" },
  ]),
  convo("Priya Sharma", "Honda City", 0, [{ from: "them", text: "Thanks! I will pick it up at 9 AM.", time: "Yesterday" }]),
  convo("Rahul Verma", "Tata Nexon EV", 1, [{ from: "them", text: "Can we extend the booking by one day?", time: "Yesterday" }]),
];
 
// ── Ride pooling ─────────────────────────────────────────────────────────────
const ride = (id, driver, rating, trips, verified, from, to, day, time, durationMin, seats, price, vehicleName, womenOnly, prefs) => ({
  id, driver, rating, trips, verified, from, to, date: d(day), time, durationMin, seats, price,
  vehicle: vehicleName, womenOnly, prefs,
});
const rides = [
  ride("ride-1", "Aarav Sharma", 4.9, 128, true, "Rajpura", "Chandigarh", 1, "09:00", 60, 3, 150, "Maruti Swift", false, ["No smoking", "Music"]),
  ride("ride-2", "Priya Verma", 5.0, 86, true, "Patiala", "Chandigarh", 2, "10:30", 85, 2, 120, "Hyundai i20", true, ["Women only", "No smoking"]),
  ride("ride-3", "Kabir Singh", 4.7, 54, true, "Rajpura", "Patiala", 1, "08:15", 40, 2, 80, "Honda City", false, ["Quiet ride"]),
  ride("ride-4", "Simran Kaur", 4.8, 71, true, "Chandigarh", "Rajpura", 1, "18:30", 60, 3, 140, "Tata Nexon", false, ["Music", "Pets ok"]),
  ride("ride-5", "Harpreet Gill", 4.6, 40, false, "Ludhiana", "Chandigarh", 3, "07:45", 120, 4, 300, "Toyota Innova", false, ["No smoking"]),
];
 
// ── Write db.json ────────────────────────────────────────────────────────────
const db = {
  users,
  vehicles,
  bookings,
  hostRequests,
  conversations,
  rides,
  rideBookings: [],
  favorites: [{ id: "fav-1", userId: demo.id, vehicleId: "creta" }],
  earningsHistory: [{ id: "eh-1", userId: demo.id, data: [3200, 4100, 5200, 4800, 6400] }],
};
 
const target = resolve(dirname(fileURLToPath(import.meta.url)), "../db.json");
writeFileSync(target, JSON.stringify(db, null, 2) + "\n");
console.log(`db.json written for ${today}: ${users.length} users, ${vehicles.length} vehicles, ${bookings.length} bookings, ${hostRequests.length} host requests.`);