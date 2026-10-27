import { addDaysISO, todayISO } from "../utils/format";
import { quote } from "../utils/pricing";
import { initialVehicles } from "./vehicles";

const find = (id) => initialVehicles.find((v) => v.id === id);

// Starter data is generated relative to today's date so the demo always
// shows realistic "upcoming" trips instead of stale dates.
export function buildSeed() {
  const today = todayISO();
  const d = (n) => addDaysISO(today, n);

  const mk = (id, vehicleId, start, end, status) => {
    const v = find(vehicleId);
    const q = quote(v, start, end);
    return {
      id, vehicleId, vehicle: v.name, location: v.location,
      start, end, days: q.days, total: q.total, status, protection: false,
    };
  };

  const bookings = [
    mk("booking-3", "nexon", d(3), d(5), "Confirmed"),
    mk("booking-1", "creta", "2026-08-12", "2026-08-14", "Completed"),
    mk("booking-2", "city", "2026-07-28", "2026-07-29", "Completed"),
  ];

  const payout = (vehicleId, days) => Math.round(find(vehicleId).price * days * 0.95);
  const hostRequests = [
    { id: "req-1", vehicleId: "my-i20", vehicle: "Hyundai i20", renter: "Rohit Nair", start: d(2), end: d(4), days: 2, payout: payout("my-i20", 2), status: "Pending" },
    { id: "req-2", vehicleId: "my-re350", vehicle: "Royal Enfield Classic 350", renter: "Meera Joshi", start: d(6), end: d(7), days: 1, payout: payout("my-re350", 1), status: "Pending" },
    { id: "req-3", vehicleId: "my-i20", vehicle: "Hyundai i20", renter: "Vikram Rao", start: d(-12), end: d(-10), days: 2, payout: payout("my-i20", 2), status: "Accepted" },
    { id: "req-4", vehicleId: "my-re350", vehicle: "Royal Enfield Classic 350", renter: "Sana Qureshi", start: d(-20), end: d(-18), days: 2, payout: payout("my-re350", 2), status: "Accepted" },
  ];

  // last five months of host earnings (₹); the current month is added live
  const earningsHistory = [3200, 4100, 5200, 4800, 6400];

  const conversations = [
    {
      id: "arjun", name: "Arjun Mehta", initials: "AM", vehicle: "Hyundai Creta", unread: 2,
      messages: [
        { from: "them", text: "Hi! Is the car available for tomorrow?", time: "10:40 AM" },
        { from: "me", text: "Yes, it is available. What time would you like to pick it up?", time: "10:41 AM" },
      ],
    },
    {
      id: "priya", name: "Priya Sharma", initials: "PS", vehicle: "Honda City", unread: 0,
      messages: [{ from: "them", text: "Thanks! I will pick it up at 9 AM.", time: "Yesterday" }],
    },
    {
      id: "rahul", name: "Rahul Verma", initials: "RV", vehicle: "Tata Nexon EV", unread: 1,
      messages: [{ from: "them", text: "Can we extend the booking by one day?", time: "Yesterday" }],
    },
  ];

  const rides = [
    { id: "ride-1", driver: "Aarav Sharma", rating: 4.9, trips: 128, verified: true, from: "Rajpura", to: "Chandigarh", date: d(1), time: "09:00", durationMin: 60, seats: 3, price: 150, vehicle: "Maruti Swift", womenOnly: false, prefs: ["No smoking", "Music"] },
    { id: "ride-2", driver: "Priya Verma", rating: 5.0, trips: 86, verified: true, from: "Patiala", to: "Chandigarh", date: d(2), time: "10:30", durationMin: 85, seats: 2, price: 120, vehicle: "Hyundai i20", womenOnly: true, prefs: ["Women only", "No smoking"] },
    { id: "ride-3", driver: "Kabir Singh", rating: 4.7, trips: 54, verified: true, from: "Rajpura", to: "Patiala", date: d(1), time: "08:15", durationMin: 40, seats: 2, price: 80, vehicle: "Honda City", womenOnly: false, prefs: ["Quiet ride"] },
    { id: "ride-4", driver: "Simran Kaur", rating: 4.8, trips: 71, verified: true, from: "Chandigarh", to: "Rajpura", date: d(1), time: "18:30", durationMin: 60, seats: 3, price: 140, vehicle: "Tata Nexon", womenOnly: false, prefs: ["Music", "Pets ok"] },
    { id: "ride-5", driver: "Harpreet Gill", rating: 4.6, trips: 40, verified: false, from: "Ludhiana", to: "Chandigarh", date: d(3), time: "07:45", durationMin: 120, seats: 4, price: 300, vehicle: "Toyota Innova", womenOnly: false, prefs: ["No smoking"] },
  ];

  return { bookings, hostRequests, earningsHistory, conversations, rides };
}
