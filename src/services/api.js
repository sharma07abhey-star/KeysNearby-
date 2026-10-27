/**
 * src/services/api.js
 *
 * All REST calls to json-server (http://localhost:3001).
 * Every function returns a Promise that resolves to the response data,
 * or rejects with a friendly Error (handled by the http.js interceptor).
 *
 * The kn_fail demo switch is handled in http.js (request interceptor).
 *
 * List functions accept an optional AbortSignal via { signal } and expose
 * the X-Total-Count header as `total` for future pagination.
 */

import http from "./http";

// Helper: extract data + total from a list response
function list(res) {
  return {
    data: res.data,
    total: Number(res.headers["x-total-count"] ?? res.data.length),
  };
}

// ── Vehicles ─────────────────────────────────────────────────────────────────

export async function getVehicles(params = {}, { signal } = {}) {
  const res = await http.get("/vehicles", { params, signal });
  return list(res);
}

export async function getVehicle(id) {
  const res = await http.get(`/vehicles/${id}`);
  return res.data;
}

export async function createVehicle(vehicle) {
  const res = await http.post("/vehicles", vehicle);
  return res.data;
}

export async function updateVehicle(id, patch) {
  const res = await http.patch(`/vehicles/${id}`, patch);
  return res.data;
}

export async function deleteVehicle(id) {
  await http.delete(`/vehicles/${id}`);
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export async function getBookings(params = {}, { signal } = {}) {
  const res = await http.get("/bookings", { params, signal });
  return list(res);
}

export async function getBooking(id) {
  const res = await http.get(`/bookings/${id}`);
  return res.data;
}

export async function createBooking(booking) {
  const res = await http.post("/bookings", booking);
  return res.data;
}

export async function updateBooking(id, patch) {
  const res = await http.patch(`/bookings/${id}`, patch);
  return res.data;
}

export async function deleteBooking(id) {
  await http.delete(`/bookings/${id}`);
}

// ── Host requests ─────────────────────────────────────────────────────────────

export async function getHostRequests(params = {}, { signal } = {}) {
  const res = await http.get("/hostRequests", { params, signal });
  return list(res);
}

export async function createHostRequest(request) {
  const res = await http.post("/hostRequests", request);
  return res.data;
}

export async function updateHostRequest(id, patch) {
  const res = await http.patch(`/hostRequests/${id}`, patch);
  return res.data;
}

// ── Conversations ─────────────────────────────────────────────────────────────

export async function getConversations(params = {}, { signal } = {}) {
  const res = await http.get("/conversations", { params, signal });
  return list(res);
}

export async function createConversation(convo) {
  const res = await http.post("/conversations", convo);
  return res.data;
}

export async function updateConversation(id, patch) {
  const res = await http.patch(`/conversations/${id}`, patch);
  return res.data;
}

// ── Rides ─────────────────────────────────────────────────────────────────────

export async function getRides(params = {}, { signal } = {}) {
  const res = await http.get("/rides", { params, signal });
  return list(res);
}

export async function getRide(id) {
  const res = await http.get(`/rides/${id}`);
  return res.data;
}

export async function createRide(ride) {
  const res = await http.post("/rides", ride);
  return res.data;
}

export async function updateRide(id, patch) {
  const res = await http.patch(`/rides/${id}`, patch);
  return res.data;
}

// ── Ride bookings ─────────────────────────────────────────────────────────────

export async function getRideBookings(params = {}, { signal } = {}) {
  const res = await http.get("/rideBookings", { params, signal });
  return list(res);
}

export async function createRideBooking(booking) {
  const res = await http.post("/rideBookings", booking);
  return res.data;
}

export async function deleteRideBooking(id) {
  await http.delete(`/rideBookings/${id}`);
}

// ── Favorites ─────────────────────────────────────────────────────────────────

export async function getFavorites(params = {}, { signal } = {}) {
  const res = await http.get("/favorites", { params, signal });
  return list(res);
}

export async function createFavorite(fav) {
  const res = await http.post("/favorites", fav);
  return res.data;
}

export async function deleteFavorite(id) {
  await http.delete(`/favorites/${id}`);
}

// ── Users (auth) ──────────────────────────────────────────────────────────────

/**
 * Lookup by email (case-insensitive via lowercase normalisation).
 * Returns the raw user record (including password) — caller must strip it.
 */
export async function getUserByEmail(rawEmail) {
  const email = rawEmail.trim().toLowerCase();
  const res = await http.get("/users", { params: { email } });
  return res.data[0] || null;
}

/**
 * Returns user without password field for security.
 */
export async function getUserById(id) {
  const res = await http.get(`/users/${id}`);
  // eslint-disable-next-line no-unused-vars
  const { password: _pw, ...safe } = res.data;
  return safe;
}

export async function createUser(user) {
  // Normalise email to lowercase before persisting
  const payload = { ...user, email: user.email.trim().toLowerCase() };
  const res = await http.post("/users", payload);
  // eslint-disable-next-line no-unused-vars
  const { password: _pw, ...safe } = res.data;
  return safe;
}

export async function updateUser(id, patch) {
  const res = await http.patch(`/users/${id}`, patch);
  // eslint-disable-next-line no-unused-vars
  const { password: _pw, ...safe } = res.data;
  return safe;
}

// ── Earnings history ──────────────────────────────────────────────────────────

export async function getEarningsHistory(userId) {
  const res = await http.get("/earningsHistory", { params: { userId } });
  return res.data[0]?.data || [3200, 4100, 5200, 4800, 6400];
}
