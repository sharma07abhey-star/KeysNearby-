import { useDemo } from "./useDemo";
import { inr, prettyDate } from "../utils/format";

// One list that mixes everything the user did: trips they booked, requests
// on their own vehicles and shared rides. Sorted newest first.
export function useActivity() {
  const { bookings, hostRequests, rideBookings } = useDemo();

  const trips = bookings.map((b) => ({
    id: b.id,
    kind: "booking",
    title: b.vehicle,
    detail: `Booked · ${b.days} day${b.days > 1 ? "s" : ""} · ${prettyDate(b.start)} → ${prettyDate(b.end)}`,
    amount: inr(b.total),
    status: b.status,  // Pending | Confirmed | Completed | Cancelled
    sort: b.start,
    booking: b,
  }));

  const hosting = hostRequests
    .filter((r) => r.status !== "Declined")
    .map((r) => ({
      id: r.id,
      kind: "listing",
      title: r.vehicle,
      detail: `${r.renter} · ${r.days} day${r.days > 1 ? "s" : ""} · ${prettyDate(r.start)}`,
      amount: `+${inr(r.payout)}`,
      status: r.status,
      sort: r.start,
    }));

  const rides = rideBookings.map((rb) => ({
    id: rb.id,
    kind: "ride",
    title: `${rb.ride.from} → ${rb.ride.to}`,
    detail: `Ride with ${rb.ride.driver} · ${rb.seatCount} seat${rb.seatCount > 1 ? "s" : ""} · ${prettyDate(rb.ride.date)}`,
    amount: inr(rb.total),
    status: "Confirmed",
    sort: rb.ride.date,
    rideBooking: rb,
  }));

  return [...trips, ...hosting, ...rides].sort((a, b) => b.sort.localeCompare(a.sort));
}
