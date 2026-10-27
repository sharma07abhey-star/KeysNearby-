/**
 * src/utils/dates.js
 * Date helper for booking overlap detection.
 */

/**
 * Returns true if [startA, endA) overlaps [startB, endB).
 * Uses ISO date strings (YYYY-MM-DD). Dates are exclusive on the right
 * (e.g. a booking that ends on the 5th doesn't block the 5th for another booking).
 */
export function datesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

/**
 * Given an existing list of bookings and proposed dates, returns true if
 * any non-cancelled, non-declined booking blocks those dates.
 */
export function hasOverlap(existingBookings, proposedStart, proposedEnd) {
  return existingBookings.some(
    (b) =>
      b.status !== "Cancelled" &&
      b.status !== "Declined" &&
      datesOverlap(b.start, b.end, proposedStart, proposedEnd),
  );
}
