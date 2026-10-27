/**
 * src/context/DemoContext.jsx
 *
 * Shared app data: auth, vehicles, bookings, messages, rides.
 * Redux Toolkit (src/store) handles interaction state (toasts, chat, feedback).
 * Page-only state (filters, form fields) stays local with useState.
 *
 * Security: passwords are NEVER stored in React state. The `user` object
 * only contains { id, name, email, phone, location, verification }.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import cretaImg from "../assets/car_hyundai_creta.jpg";
import cityImg from "../assets/car_honda_city.jpg";
import nexonImg from "../assets/car_tata_nexon.jpg";
import swiftImg from "../assets/car_maruti_swift.jpg";
import {
  createBooking,
  createConversation,
  createFavorite,
  createHostRequest,
  createRide,
  createRideBooking,
  deleteBooking,
  deleteFavorite,
  deleteRideBooking,
  deleteVehicle,
  getBookings,
  getConversations,
  getEarningsHistory,
  getFavorites,
  getHostRequests,
  getRide,
  getRideBookings,
  getRides,
  getUserById,
  getVehicles,
  updateBooking,
  updateConversation,
  updateHostRequest,
  updateRide,
  updateUser,
  updateVehicle as patchVehicle,
  createVehicle as postVehicle,
} from "../services/api";
import { pushToast } from "../store/uiSlice";
import { initials } from "../utils/format";
import { hasOverlap } from "../utils/dates";
import { DemoContext } from "./demoStore";

export { DemoContext } from "./demoStore";

// ── Image map ─────────────────────────────────────────────────────────────────
// Filename strings stored in db.json → Vite-imported asset URLs.
// Vehicles without a recognised filename get null (VehicleArt silhouette).
const IMAGE_MAP = {
  "car_hyundai_creta.jpg": cretaImg,
  "car_honda_city.jpg": cityImg,
  "car_tata_nexon.jpg": nexonImg,
  "car_maruti_swift.jpg": swiftImg,
};

function resolveImage(value) {
  if (!value) return null;
  // Already a blob/data URL (freshly uploaded photo) — pass through
  if (value.startsWith("blob:") || value.startsWith("data:")) return value;
  return IMAGE_MAP[value] ?? null;
}

// ── Session ───────────────────────────────────────────────────────────────────
// Only the user id is stored in localStorage.
function readStoredUserId() {
  return localStorage.getItem("knUserId") || null;
}

// Strip the password field before putting a user into state
function sanitize(u) {
  if (!u) return null;
  // eslint-disable-next-line no-unused-vars
  const { password: _pw, ...safe } = u;
  return safe;
}

// ── Canvas photo downscaler ───────────────────────────────────────────────────
// Requirement 12: downscale listing photos to max 800px JPEG (quality 0.7)
async function downscalePhoto(file) {
  return new Promise((resolve, reject) => {
    const MAX = 800;
    const img = new Image();
    const blobUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error(`Could not read photo: ${file.name}`));
    };
    img.src = blobUrl;
  });
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function DemoProvider({ children }) {
  const dispatch = useDispatch();

  // Convenience: dispatch a toast without needing { toast } passed around
  const toast = useCallback(
    (options) => dispatch(pushToast(options)),
    [dispatch],
  );

  // ── Auth state ─────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);       // never contains password
  const [userId, setUserId] = useState(null);
  const [authReady, setAuthReady] = useState(false); // true once session restored

  const [mode, setModeState] = useState(
    () => localStorage.getItem("knMode") || "renter",
  );
  const [verification, setVerification] = useState({
    email: true, phone: false, identity: false, licence: false,
  });

  // ── Data state ─────────────────────────────────────────────────────────────
  const [vehicles, setVehicles] = useState([]);
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");

  const [bookings, setBookings] = useState([]);
  const [hostRequests, setHostRequests] = useState([]);
  const [favorites, setFavorites] = useState([]);     // vehicleId strings
  const [favRecords, setFavRecords] = useState([]);   // full DB records
  const [conversations, setConversations] = useState([]);
  const [rides, setRides] = useState([]);
  const [rideBookings, setRideBookings] = useState([]);
  const [earningsHistory, setEarningsHistory] = useState([3200, 4100, 5200, 4800, 6400]);

  // Keep a stable ref to userId for callbacks
  const userIdRef = useRef(userId);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  // Keep a stable ref to conversations so appendMessage can read latest without stale closure
  const conversationsRef = useRef([]);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  // ── Session restore on mount ───────────────────────────────────────────────
  // Requirement 1: fetch user from API if knUserId is in localStorage.
  useEffect(() => {
    const stored = readStoredUserId();
    if (!stored) {
      setAuthReady(true);
      // Still load public data (vehicles, rides) even when not signed in
      loadPublicData();
      return;
    }
    getUserById(stored)
      .then((dbUser) => {
        const safe = sanitize(dbUser);
        setUser(safe);
        setUserId(safe.id);
        userIdRef.current = safe.id;
        // Restore verification from the user record
        if (dbUser.verification) setVerification(dbUser.verification);
        setAuthReady(true);
        loadAll(safe.id);
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          // User truly doesn't exist in the DB — clear the stale id
          localStorage.removeItem("knUserId");
          setAuthReady(true);
          loadPublicData();
        } else {
          // Network error — keep the id so the user can retry; show error state
          setStatus("error");
          setLoadError(err?.message || "Couldn't reach the server");
          setAuthReady(true);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Public data (no auth needed) ──────────────────────────────────────────
  async function loadPublicData() {
    setStatus("loading");
    setLoadError("");
    try {
      const [vRes, rRes] = await Promise.all([getVehicles(), getRides()]);
      setVehicles(
        vRes.data.map((v) => ({
          ...v,
          image: resolveImage(v.image),
          mine: false, // no logged-in user
        })),
      );
      setRides(rRes.data);
      setStatus("ready");
    } catch (err) {
      setLoadError(err.message);
      setStatus("error");
    }
  }

  // ── Full data load (signed-in user) ───────────────────────────────────────
  // Requirement 9: only fetch user-scoped data when signed in.
  const loadAll = useCallback(async (uid) => {
    // Guard: AsyncState may pass a click Event as onRetry argument — ignore non-strings
    const currentUid = typeof uid === "string" ? uid : userIdRef.current;
    setStatus("loading");
    setLoadError("");
    try {
      // Always fetch vehicles + rides (public)
      const [vRes, rRes] = await Promise.all([getVehicles(), getRides()]);

      const fetchedVehicles = vRes.data;
      const fetchedRides = rRes.data;

      let fetchedBookings = [];
      let fetchedRequests = [];
      let fetchedConvos = [];
      let fetchedRideBookings = [];
      let fetchedFavs = [];
      let fetchedEarnings = [3200, 4100, 5200, 4800, 6400];

      if (currentUid) {
        [
          { data: fetchedBookings },
          { data: fetchedRequests },
          { data: fetchedConvos },
          { data: fetchedRideBookings },
          { data: fetchedFavs },
          fetchedEarnings,
        ] = await Promise.all([
          getBookings({ userId: currentUid }),
          getHostRequests({ ownerId: currentUid }),
          getConversations({ userId: currentUid }),
          getRideBookings({ userId: currentUid }),
          getFavorites({ userId: currentUid }),
          getEarningsHistory(currentUid),
        ]);
      }

      // Requirement 2: compute mine = (ownerId === currentUid)
      setVehicles(
        fetchedVehicles.map((v) => ({
          ...v,
          image: resolveImage(v.image),
          mine: String(v.ownerId) === String(currentUid),
        })),
      );
      setRides(
        fetchedRides.map((r) => ({
          ...r,
          mine: String(r.driverId) === String(currentUid),
        })),
      );
      setBookings(fetchedBookings);
      setHostRequests(fetchedRequests);
      setConversations(fetchedConvos);
      setRideBookings(fetchedRideBookings);
      setFavRecords(fetchedFavs);
      setFavorites(fetchedFavs.map((f) => f.vehicleId));
      setEarningsHistory(fetchedEarnings);
      setStatus("ready");
    } catch (err) {
      setLoadError(err.message);
      setStatus("error");
    }
  }, []);

  // Expose as loadVehicles for backward compat with FindVehicle/AsyncState
  const loadVehicles = loadAll;

  // ── Auth ──────────────────────────────────────────────────────────────────
  // signIn receives a safe (no password) user object from Login.jsx
  function signIn(safeUser) {
    localStorage.setItem("knUserId", safeUser.id);
    setUserId(safeUser.id);
    userIdRef.current = safeUser.id;
    setUser(sanitize(safeUser));
    if (safeUser.verification) setVerification(safeUser.verification);
    loadAll(safeUser.id);
  }

  // Requirement 9: signOut resets everything including verification and mode
  function signOut() {
    localStorage.removeItem("knUserId");
    localStorage.removeItem("knMode");
    setUserId(null);
    userIdRef.current = null;
    setUser(null);
    setMode("renter");
    setVerification({ email: true, phone: false, identity: false, licence: false });
    setBookings([]);
    setHostRequests([]);
    setConversations([]);
    setRideBookings([]);
    setFavRecords([]);
    setFavorites([]);
    // Reload public data
    loadPublicData();
  }

  // Requirement 9: strip password before saving to state
  async function updateProfile(patch) {
    if (!userId) return;
    try {
      const updated = await updateUser(userId, patch);
      setUser(sanitize(updated));
    } catch (err) {
      toast({ type: "error", title: "Couldn't save profile", message: err.message });
    }
  }

  // Requirement 10: persist verification on the user record
  async function verify(key) {
    const next = { ...verification, [key]: true };
    setVerification(next);
    if (userId) {
      updateUser(userId, { verification: next }).catch(() => {});
    }
  }

  function setMode(next) {
    localStorage.setItem("knMode", next);
    setModeState(next);
  }

  // ── Vehicles / favourites ─────────────────────────────────────────────────
  // Requirement 11: toast dispatched internally, no { toast } param needed
  async function toggleFavorite(vehicleId) {
    const existing = favRecords.find((f) => f.vehicleId === vehicleId);
    if (existing) {
      setFavRecords((r) => r.filter((f) => f.id !== existing.id));
      setFavorites((f) => f.filter((id) => id !== vehicleId));
      try {
        await deleteFavorite(existing.id);
      } catch (err) {
        setFavRecords((r) => [...r, existing]);
        setFavorites((f) => [...f, vehicleId]);
        toast({ type: "error", title: "Couldn't unsave", message: err.message });
      }
    } else {
      // Requirement 3: client-generated id
      const tempId = `fav-${crypto.randomUUID()}`;
      const record = { id: tempId, userId, vehicleId };
      setFavRecords((r) => [...r, record]);
      setFavorites((f) => [...f, vehicleId]);
      try {
        const created = await createFavorite({ userId, vehicleId });
        setFavRecords((r) => r.map((f) => (f.id === tempId ? created : f)));
      } catch (err) {
        setFavRecords((r) => r.filter((f) => f.id !== tempId));
        setFavorites((f) => f.filter((id) => id !== vehicleId));
        toast({ type: "error", title: "Couldn't save", message: err.message });
      }
    }
  }

  // Requirement 12: accept a File object and downscale it before storing
  async function processPhoto(file) {
    if (!file) return null;
    if (typeof file === "string") return file; // already a URL
    try {
      return await downscalePhoto(file);
    } catch (err) {
      toast({ type: "error", title: "Photo upload failed", message: err.message });
      return null;
    }
  }

  // Requirement 2: no "mine" flag stored in DB; ownerId drives it
  async function addVehicle(vehicle) {
    const imageData = vehicle._photoFile
      ? await processPhoto(vehicle._photoFile)
      : vehicle.image || null;

    const id = `veh-${crypto.randomUUID()}`;
    const ownerDisplayName = user?.name || "You";
    const payload = {
      id,
      ...vehicle,
      _photoFile: undefined, // don't send File object to API
      name: `${vehicle.brand} ${vehicle.model}`.trim(),
      rating: 0,
      trips: 0,
      distance: 0.3,
      color: "blue",
      image: imageData,
      owner: ownerDisplayName,     // used by FindVehicle search haystack
      ownerName: ownerDisplayName, // used by RentVehicle / ensureConversation
      ownerId: userId,
      available: true,
      pos: { x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 },
    };
    try {
      const created = await postVehicle(payload);
      setVehicles((current) => [
        { ...created, image: resolveImage(created.image), mine: true },
        ...current,
      ]);
      return created;
    } catch (err) {
      toast({ type: "error", title: "Couldn't list vehicle", message: err.message });
      return null;
    }
  }

  async function updateVehicleAction(vehicleId, patch) {
    setVehicles((current) =>
      current.map((v) => (v.id === vehicleId ? { ...v, ...patch } : v)),
    );
    try {
      await patchVehicle(vehicleId, patch);
    } catch (err) {
      // Rollback
      const { data: fresh } = await getVehicles().catch(() => ({ data: null }));
      if (fresh) {
        setVehicles(
          fresh.map((v) => ({
            ...v,
            image: resolveImage(v.image),
            mine: String(v.ownerId) === String(userId),
          })),
        );
      }
      toast({ type: "error", title: "Couldn't update vehicle", message: err.message });
    }
  }

  async function removeVehicle(vehicleId) {
    setVehicles((current) => current.filter((v) => v.id !== vehicleId));
    try {
      await deleteVehicle(vehicleId);
    } catch (err) {
      const { data: fresh } = await getVehicles().catch(() => ({ data: null }));
      if (fresh) {
        setVehicles(
          fresh.map((v) => ({
            ...v,
            image: resolveImage(v.image),
            mine: String(v.ownerId) === String(userId),
          })),
        );
      }
      toast({ type: "error", title: "Couldn't remove vehicle", message: err.message });
    }
  }

  // ── Bookings (renter side) ────────────────────────────────────────────────
  // Requirements 5 + 6: double-booking check, Pending status, linked hostRequest
  async function addBooking(booking) {
    // Guard: vehicle must have an ownerId to receive host requests
    const vehicle = vehicles.find((v) => String(v.id) === String(booking.vehicleId));
    if (!vehicle?.ownerId) {
      toast({ type: "error", title: "Can't book this vehicle", message: "This vehicle can't take bookings yet." });
      return null;
    }

    // Check for overlapping bookings
    try {
      const { data: existing } = await getBookings({ vehicleId: booking.vehicleId });
      if (hasOverlap(existing, booking.start, booking.end)) {
        toast({ type: "error", title: "Not available for those dates.", message: "Choose different dates." });
        return null;
      }
    } catch (err) {
      toast({ type: "error", title: "Couldn't verify availability", message: err.message });
      return null;
    }

    // Requirement 3: client-generated id; new booking starts as Pending
    const id = `bk-${crypto.randomUUID()}`;
    const payload = { ...booking, id, status: "Pending", userId };

    let created;
    try {
      created = await createBooking(payload);
      setBookings((current) => [created, ...current]);
    } catch (err) {
      toast({ type: "error", title: "Couldn't confirm booking", message: err.message });
      return null;
    }

    // Create a linked host request. If it fails, roll back the booking.
    const reqId = `req-${crypto.randomUUID()}`;
    // Payout = Math.round(base * (1 - SERVICE_FEE_RATE))
    const hostPayout = Math.round(vehicle.price * booking.days * (1 - 0.05));
    const reqPayload = {
      id: reqId,
      vehicleId: booking.vehicleId,
      vehicle: booking.vehicle,
      renter: user?.name || "Renter",
      renterId: userId,
      bookingId: created.id,
      start: booking.start,
      end: booking.end,
      days: booking.days,
      payout: hostPayout,
      status: "Pending",
      ownerId: vehicle.ownerId,
    };
    try {
      const req = await createHostRequest(reqPayload);
      setHostRequests((current) => [req, ...current]);
    } catch (err) {
      // Roll back the booking so the DB stays consistent
      await deleteBooking(created.id).catch(() => {});
      setBookings((current) => current.filter((b) => b.id !== created.id));
      toast({ type: "error", title: "Booking cancelled", message: "Couldn't notify the owner. Please try again." });
      return null;
    }

    return created;
  }

  // cancelBooking: updates booking status, then looks up the linked host request
  // on the SERVER (not from local state) and patches it to Cancelled.
  async function cancelBooking(bookingId) {
    setBookings((current) =>
      current.map((b) => (b.id === bookingId ? { ...b, status: "Cancelled" } : b)),
    );
    try {
      await updateBooking(bookingId, { status: "Cancelled" });

      // Look up the linked host request directly from the server
      const { data: serverReqs } = await getHostRequests({ bookingId }).catch(() => ({ data: [] }));
      const linkedReq = serverReqs[0];
      if (linkedReq) {
        try {
          await updateHostRequest(linkedReq.id, { status: "Cancelled" });
          setHostRequests((current) =>
            current.map((r) => (r.id === linkedReq.id ? { ...r, status: "Cancelled" } : r)),
          );
        } catch (err) {
          toast({ type: "error", title: "Host request not updated", message: err.message });
        }
      }
    } catch (err) {
      // Rollback the optimistic update
      const { data: fresh } = await getBookings({ userId }).catch(() => ({ data: null }));
      if (fresh) setBookings(fresh);
      toast({ type: "error", title: "Couldn't cancel booking", message: err.message });
    }
  }

  // ── Host requests ─────────────────────────────────────────────────────────
  // Requirement 5: accept/decline updates BOTH the request AND the booking
  async function respondToRequest(requestId, accept) {
    const newStatus = accept ? "Accepted" : "Declined";
    const bookingStatus = accept ? "Confirmed" : "Declined";

    setHostRequests((current) =>
      current.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r)),
    );

    try {
      const updatedReq = await updateHostRequest(requestId, { status: newStatus });

      // Update the linked booking
      if (updatedReq.bookingId) {
        await updateBooking(updatedReq.bookingId, { status: bookingStatus });
        // Update local booking state
        setBookings((current) =>
          current.map((b) =>
            b.id === updatedReq.bookingId ? { ...b, status: bookingStatus } : b,
          ),
        );
      }
    } catch (err) {
      const { data: fresh } = await getHostRequests({ ownerId: userId }).catch(() => ({ data: null }));
      if (fresh) setHostRequests(fresh);
      toast({ type: "error", title: "Couldn't respond to request", message: err.message });
    }
  }

  // ── Messages ──────────────────────────────────────────────────────────────
  // Messages: use conversationsRef so we read latest state without stale closure.
  // No side effects inside setState updaters.
  function sendMessage(conversationId, text) {
    appendMessage(conversationId, { from: "me", text, time: "Now" }, true);
  }

  function receiveMessage(conversationId, text) {
    appendMessage(conversationId, { from: "them", text, time: "Now" }, false);
  }

  function appendMessage(conversationId, message, clearUnread) {
    const current = conversationsRef.current;
    const convo = current.find((c) => c.id === conversationId);
    if (!convo) return;

    const newMessages = [...convo.messages, message];
    const newUnread = clearUnread ? 0 : convo.unread;
    const updated = current.map((c) =>
      c.id === conversationId ? { ...c, messages: newMessages, unread: newUnread } : c,
    );

    // Sync state and API in the correct order: state first, then API
    setConversations(updated);
    updateConversation(conversationId, { messages: newMessages, unread: newUnread }).catch((err) => {
      toast({ type: "error", title: "Message not saved", message: err.message });
    });
  }

  // ensureConversation: guard against missing ownerName (vehicle listed without owner)
  async function ensureConversation(ownerName, vehicleName) {
    if (!ownerName) {
      toast({ type: "error", title: "Can't start chat", message: "Owner name is missing for this vehicle." });
      return null;
    }

    const existing = conversations.find((c) => c.name === ownerName && c.userId === userId);
    if (existing) return existing.id;

    // id includes userId so two users chatting with the same owner never collide
    const id = `chat-${userId}-${ownerName.toLowerCase().replace(/\s+/g, "-")}`;
    const payload = {
      id,
      name: ownerName,
      initials: initials(ownerName),
      vehicle: vehicleName,
      unread: 0,
      userId,
      messages: [],
    };
    setConversations((current) => [payload, ...current]);
    try {
      await createConversation(payload);
    } catch (err) {
      toast({ type: "error", title: "Couldn't start conversation", message: err.message });
    }
    return id;
  }

  function markRead(conversationId) {
    setConversations((current) =>
      current.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)),
    );
    updateConversation(conversationId, { unread: 0 }).catch(() => {});
  }

  // ── Ride pooling ──────────────────────────────────────────────────────────
  // Requirement 2: no "mine" stored in DB — driverId drives it
  async function addRide(ride) {
    const id = `ride-${crypto.randomUUID()}`;
    const payload = {
      ...ride,
      id,
      rating: 5,
      trips: 0,
      verified: verification.identity,
      driverName: user?.name || ride.driver,
      driverId: userId,
    };
    try {
      const created = await createRide(payload);
      setRides((current) => [{ ...created, mine: true }, ...current]);
      return created;
    } catch (err) {
      toast({ type: "error", title: "Couldn't publish ride", message: err.message });
      return null;
    }
  }

  // Requirement 7: create booking first, then PATCH seats from fresh server read.
  // If PATCH fails, delete the booking to keep consistency.
  async function joinRide(rideId, seatCount = 1) {
    // Read the ride fresh from the server
    let freshRide;
    try {
      freshRide = await getRide(rideId);
    } catch (err) {
      toast({ type: "error", title: "Couldn't load ride", message: err.message });
      return null;
    }

    if (freshRide.seats < seatCount) {
      toast({ type: "error", title: "Not enough seats", message: "Someone just took the last seats." });
      return null;
    }

    const id = `rb-${crypto.randomUUID()}`;
    const bookingPayload = {
      id,
      rideId,
      seatCount,
      total: freshRide.price * seatCount,
      ride: { ...freshRide },
      userId,
    };

    // Step 1: create the booking
    let created;
    try {
      created = await createRideBooking(bookingPayload);
      setRideBookings((current) => [created, ...current]);
    } catch (err) {
      toast({ type: "error", title: "Couldn't book seat", message: err.message });
      return null;
    }

    // Step 2: PATCH ride seats using fresh count
    const newSeats = freshRide.seats - seatCount;
    try {
      await updateRide(rideId, { seats: newSeats });
      setRides((current) =>
        current.map((r) => (String(r.id) === String(rideId) ? { ...r, seats: newSeats } : r)),
      );
    } catch (err) {
      // Seat update failed — delete the booking for consistency
      deleteRideBooking(created.id).catch(() => {});
      setRideBookings((current) => current.filter((b) => b.id !== created.id));
      toast({ type: "error", title: "Booking reversed — seats couldn't be updated", message: err.message });
      return null;
    }

    return created;
  }

  // Requirement 7: same care for cancellation
  async function cancelRideBooking(bookingId) {
    const booking = rideBookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // Step 1: delete the booking
    try {
      await deleteRideBooking(bookingId);
      setRideBookings((current) => current.filter((b) => b.id !== bookingId));
    } catch (err) {
      toast({ type: "error", title: "Couldn't cancel ride", message: err.message });
      return;
    }

    // Step 2: restore seats using fresh server read
    try {
      const freshRide = await getRide(booking.rideId);
      const restoredSeats = freshRide.seats + booking.seatCount;
      await updateRide(booking.rideId, { seats: restoredSeats });
      setRides((current) =>
        current.map((r) =>
          String(r.id) === String(booking.rideId) ? { ...r, seats: restoredSeats } : r,
        ),
      );
    } catch (err) {
      // Seats couldn't be restored — log a toast but the booking is already deleted
      toast({ type: "error", title: "Seats may not be fully restored", message: err.message });
    }
  }

  // ── Context value ─────────────────────────────────────────────────────────
  const value = {
    user,
    userId,
    userInitials: initials(user?.name),
    authReady,
    mode,
    verification,
    vehicles,
    status,
    loadError,
    bookings,
    hostRequests,
    favorites,
    conversations,
    rides,
    rideBookings,
    earningsHistory,
    loadAll,
    loadVehicles,
    signIn,
    signOut,
    updateProfile,
    verify,
    setMode,
    toggleFavorite,
    addVehicle,
    updateVehicle: updateVehicleAction,
    removeVehicle,
    addBooking,
    cancelBooking,
    respondToRequest,
    sendMessage,
    receiveMessage,
    markRead,
    ensureConversation,
    addRide,
    joinRide,
    cancelRideBooking,
    processPhoto,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
